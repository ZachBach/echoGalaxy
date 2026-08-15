/**
 * check-parity — the cross-backend gate. Renders each rung on WebGPU and on
 * WebGL2, in two independent browsers, and measures how far apart the two
 * frames are.
 *
 * This is the gate CLAUDE.md admitted did not exist. `check-frozen` compares a
 * backend against ITSELF across two runs and legitimately demands 0/255.
 * That question is not this question. Two different GPU backends compile
 * different shader languages through different drivers, resolve MSAA
 * differently and round differently in the last mantissa bits, so they will
 * never agree to the byte — and a gate that demands they do is a gate someone
 * disables the first week. What can be demanded is that the disagreement stays
 * a NOISE FLOOR rather than becoming a DIFFERENCE OF CONTENT.
 *
 * So the bar is two-tier, and the tiers answer different questions:
 *
 *   1. STRUCTURAL (hardware-independent, always enforced). mean <= 1.5/255.
 *      Sited in a gap that was measured, not guessed. The noise floor on the
 *      recording machine runs 0.0011/255 (cluster) to 0.4600/255 (system) —
 *      and inspecting the difference map shows it is entirely EDGE pixels:
 *      body silhouettes, orbit rings, constellation lines. Interiors are
 *      byte-identical. The nearest thing to a content-scale signal that was
 *      measured is the SAME scene five virtual seconds apart (5.82/255 on
 *      system, 26.14 on galaxy), and two different rungs run 38.9–100.2. So
 *      1.5 is 3.3x above the worst noise and 3.9x below the smallest real
 *      signal — near the geometric centre of a 12x gap. Nothing about
 *      rasteriser AA gets you there; a body that is missing, unlit,
 *      differently coloured or differently placed does.
 *
 *      Be clear about the sensitivity this tier buys: it is COARSE. One small
 *      body diverging on one backend might land near 1/255 and slip under it.
 *      Tier 1 is the claim that survives unfamiliar silicon, not the sharp
 *      instrument. The sharp instrument is tier 2, and it needs bars recorded
 *      on the machine you are running.
 *
 *   2. RECORDED BAR (hardware-specific, enforced only when the GPU fingerprint
 *      matches the recording). mean <= bar + max(0.02, 25% of bar). This is
 *      the regression tier, and it is sharp because the measurement turned
 *      out to be perfectly repeatable: four full runs of this gate, in fresh
 *      browsers on fresh profiles against fresh Vite servers, agreed to
 *      +0.0000 on all six rungs — identical mean, identical max, identical
 *      differing-pixel count. Run-to-run variance on the recording
 *      machine is therefore not "small", it is zero, and the whole tolerance
 *      is an allowance for a Chrome or driver update moving the rasteriser
 *      under us. On a different GPU the recorded number carries no authority
 *      at all, so the gate says so out loud and stops enforcing it rather
 *      than either failing honest hardware or quietly passing everything.
 *
 * What this gate does NOT prove. It is a centre crop of one framing per rung
 * at one virtual instant: a backend difference confined to a corner, to a
 * camera angle nobody photographs, or to an object that is off-screen at the
 * default framing is invisible here. It compares a render against a render,
 * so a shared bug that hits both backends identically reads as perfect
 * parity. And "mean" is an average over the whole crop — mostly black sky on
 * several rungs — so it is diluted; a small bright object going wrong moves
 * it far less than the eye would expect. The control diff below is the
 * defence against the worst version of that.
 *
 * The CONTROL. A parity number is meaningless without evidence that the
 * instrument can see anything at all: two black frames diff to 0.0000 and
 * print a beautiful pass. So every run also diffs each rung against a
 * DIFFERENT rung on the SAME backend, and requires that number to be at least
 * 20x the parity number. That is the instrument proving its own dynamic range
 * inside the very run whose result you are reading, which is cheap because
 * the screenshots are already in hand.
 *
 * Run:
 *   node scripts/check-parity.mjs
 *   node scripts/check-parity.mjs --rungs galaxy,cluster
 *   node scripts/check-parity.mjs --record        # rewrite the bars on disk
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createServer } from 'node:net'
import path from 'node:path'

import * as rig from './harness-cdp.mjs'

const { startVite, openBrowser, renderRung, shoot, diff, parseArgs, RUNGS, ROOT, sleep } = rig

const BARS_PATH = path.join(ROOT, 'docs', 'parity-bars.json')

// ---------------------------------------------------------------- bars ----
// Tier 1: the claim that travels. See the header for how 1.5 was sited.
const STRUCTURAL_MEAN = 1.5
// Tier 2: slack around a recorded bar. The absolute floor comes first because
// a 25% window around cluster's 0.0011 is 0.0003 — finer than any driver will
// hold still for, and finer than the digit the number is quoted to. The
// relative term takes over above a bar of 0.08.
const TOL_ABS = 0.02
const TOL_REL = 0.25
// The instrument must see a real difference at least this many times larger
// than the parity difference, in this same run, or the run proves nothing.
const CONTROL_RATIO = 20

// ------------------------------------------------------------- helpers ----
/**
 * An OS-assigned free port for the CDP endpoint. check-frozen hard-codes
 * 9820-9829; this repo currently gets worked by more than one session at a
 * time, and a second browser answering on the port you expected hands you
 * someone else's page target — which is a wrong ANSWER, not an error.
 */
function freePort() {
  return new Promise((res, rej) => {
    const s = createServer()
    s.on('error', rej)
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address()
      s.close(() => res(port))
    })
  })
}

// Belt and braces on the overlay. renderRung hides the HUD itself, but this
// gate's numbers are only meaningful if it definitely happened: HUD text is
// identical on both backends by construction, so every pixel of it that
// survives into the crop drags the parity mean toward zero and flatters the
// result. Cheap, idempotent, and it keeps the recorded bars valid no matter
// what the shared rig does with its own copy.
const HIDE_CHROME = `(() => {
  const canvas = document.querySelector('canvas');
  const root = document.querySelector('.app') || document.body;
  let visible = 0;
  for (const el of root.children) {
    if (el.contains(canvas)) continue;
    el.style.setProperty('display', 'none', 'important');
    if (getComputedStyle(el).display !== 'none') visible++;
  }
  return visible;
})()`

// Identity of the silicon the bars were measured on. Read on a real localhost
// origin, never about:blank — navigator.gpu is undefined there (not a secure
// context) and the answer would be a confident lie.
const FINGERPRINT = `(async () => {
  const out = {};
  try {
    const a = await navigator.gpu?.requestAdapter();
    out.adapter = a ? [a.info?.vendor, a.info?.architecture, a.info?.device, a.info?.description]
      .filter(Boolean).join(' ') : 'none';
  } catch (e) { out.adapter = 'error: ' + e.message }
  try {
    const g = document.createElement('canvas').getContext('webgl2');
    const d = g.getExtension('WEBGL_debug_renderer_info');
    out.gl = d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER);
  } catch { out.gl = 'unknown' }
  out.ua = navigator.userAgentData?.brands?.map((b) => b.brand + ' ' + b.version).join(', ')
    ?? navigator.userAgent;
  return out;
})()`

const fmt = (n, w = 6) => n.toFixed(4).padStart(w)

// ---------------------------------------------------------------- main ----
const { rungs, frames, record, backend } = parseArgs(process.argv.slice(2))

// --backend is check-frozen's flag and means nothing here: this gate IS the
// comparison of the two backends. Refusing it is better than accepting it and
// running both anyway, which would leave someone believing they narrowed a run.
if (backend) {
  console.error('check-parity: --backend does not apply — parity is WebGPU vs WebGL2 by definition.')
  console.error('  Narrow with --rungs instead. (--backend is check-frozen\'s flag.)')
  process.exit(1)
}

const unknown = rungs.filter((r) => !RUNGS.includes(r))
if (unknown.length) {
  console.error(`check-parity: unknown rung(s): ${unknown.join(', ')}\n  known: ${RUNGS.join(', ')}`)
  process.exit(1)
}

const bars = existsSync(BARS_PATH) ? JSON.parse(readFileSync(BARS_PATH, 'utf8')) : null
if (!bars && !record) {
  console.error(`check-parity: no recorded bars at ${path.relative(ROOT, BARS_PATH)}`)
  console.error('  Record them on known-good code with: node scripts/check-parity.mjs --record')
  process.exit(1)
}

let vite
let failures = 0
const rows = []
const shots = {}   // rung -> { webgpu, webgl }
let fingerprint = null

try {
  vite = await startVite()
  console.log(`check-parity: ${rungs.length} rung(s), WebGPU vs WebGL2, frame ${frames}, ${vite.url}`)

  // ---- render every rung on both backends, in its own browser -----------
  for (const rung of rungs) {
    shots[rung] = {}
    for (const backend of ['webgpu', 'webgl']) {
      const page = await openBrowser({ port: await freePort(), profile: `parity-${backend}-${rung}` })
      try {
        // renderRung asserts .backend-badge for us: a run that silently fell
        // back to WebGL2 and then "proved parity" against WebGL2 is worse
        // than no gate at all, and is exactly what --use-angle=swiftshader
        // produces. That flag is not passed anywhere in this rig.
        await renderRung(page, vite.url, { rung, backend, frames })
        const stillVisible = await page.ev(HIDE_CHROME)
        if (stillVisible) throw new Error(`${rung}/${backend}: ${stillVisible} overlay element(s) refused to hide`)
        await sleep(120)
        shots[rung][backend] = await shoot(page)
        if (page.errors.length) {
          console.log(`    note ${rung}/${backend}: ${page.errors.length} console error(s), first: ${page.errors[0].slice(0, 120)}`)
        }
        if (!fingerprint) fingerprint = await page.ev(FINGERPRINT)
      } finally {
        page.close()
      }
    }
  }

  // ---- judge: diff in a browser that rendered neither side --------------
  const judge = await openBrowser({ port: await freePort(), profile: 'parity-judge' })
  try {
    for (let i = 0; i < rungs.length; i++) {
      const rung = rungs[i]
      const d = await diff(judge, shots[rung].webgpu, shots[rung].webgl)

      // Same backend, different rung: what a REAL difference measures on this
      // exact instrument, this run. With one rung selected there is no other
      // frame to reach for, and the run is reported as uncalibrated.
      let control = null
      if (rungs.length > 1) {
        const other = rungs[(i + 1) % rungs.length]
        control = await diff(judge, shots[rung].webgpu, shots[other].webgpu)
      }
      rows.push({ rung, ...d, control: control?.mean ?? null })
    }
  } finally {
    judge.close()
  }

  // ---- record, or gate -------------------------------------------------
  if (record) {
    const next = {
      note: 'Cross-backend parity bars: WebGPU vs WebGL2, mean absolute per-pixel channel delta in x/255. Recorded by scripts/check-parity.mjs --record. Hardware-specific: the tier-2 comparison only applies when environment.gl matches.',
      recorded: new Date().toISOString(),
      conditions: {
        url: '?scale=<rung>&freeze[&backend=webgl]',
        frames,
        crop: '420x420 centre crop of the canvas, HUD hidden',
        window: '900x700',
        clock: 'harness-cdp pinned virtual clock, 1000/60 ms per animation frame',
      },
      environment: fingerprint,
      thresholds: {
        structuralMean: STRUCTURAL_MEAN,
        tolAbs: TOL_ABS,
        tolRel: TOL_REL,
        controlRatio: CONTROL_RATIO,
      },
      rungs: { ...(bars?.rungs ?? {}) },
    }
    for (const r of rows) {
      next.rungs[r.rung] = {
        mean: r.mean,
        max: r.max,
        differingPct: +((100 * r.differing) / r.pixels).toFixed(2),
        control: r.control,
      }
    }
    mkdirSync(path.dirname(BARS_PATH), { recursive: true })
    writeFileSync(BARS_PATH, JSON.stringify(next, null, 2) + '\n')
    console.log('')
    for (const r of rows) {
      console.log(`  · ${r.rung.padEnd(8)} mean=${fmt(r.mean)}/255  max=${String(r.max).padStart(3)}  ` +
        `differing=${((100 * r.differing) / r.pixels).toFixed(1)}%  control=${r.control === null ? 'n/a' : fmt(r.control)}`)
    }
    console.log(`\ncheck-parity: recorded ${rows.length} bar(s) to ${path.relative(ROOT, BARS_PATH)}`)
    console.log(`  on ${fingerprint?.gl ?? 'unknown GPU'}`)
    console.log('  Record only from code you believe is correct — this file is the memory of what "correct" looked like.')
  } else {
    // The thresholds live in this script, not in the bars file — tier 1 is a
    // claim about the app, not a per-machine recording. The file keeps a copy
    // for anyone reading it cold, and a copy is a thing that drifts, so say so
    // when it has.
    const recordedT = bars.thresholds ?? {}
    const liveT = { structuralMean: STRUCTURAL_MEAN, tolAbs: TOL_ABS, tolRel: TOL_REL, controlRatio: CONTROL_RATIO }
    const drifted = Object.keys(liveT).filter((k) => recordedT[k] !== liveT[k])
    if (drifted.length) {
      console.log(`\n  ! bars were recorded under different thresholds (${drifted.join(', ')}) — file says ` +
        `${JSON.stringify(recordedT)}, script says ${JSON.stringify(liveT)}. The script wins; re-record to resync.`)
    }

    const sameHardware = bars.environment?.gl === fingerprint?.gl
    if (!sameHardware) {
      console.log('')
      console.log('  ! different GPU than the recorded bars:')
      console.log(`      recorded on  ${bars.environment?.gl ?? 'unknown'}`)
      console.log(`      running on   ${fingerprint?.gl ?? 'unknown'}`)
      console.log('    Tier 2 (regression vs the recorded number) is ADVISORY here — a delta on')
      console.log('    unfamiliar silicon is not evidence the code changed. Tier 1 still applies.')
    }
    console.log('')
    for (const r of rows) {
      const bar = bars.rungs?.[r.rung]
      const notes = []
      let ok = true

      if (r.mean > STRUCTURAL_MEAN) {
        ok = false
        notes.push(`STRUCTURAL: ${fmt(r.mean).trim()} over the ${STRUCTURAL_MEAN}/255 ceiling — this is content, not precision`)
      }
      // Exactly zero is a failure, not a triumph. Two different rasterisers do
      // not agree to the byte on a scene with edges in it; a clean 0.0000 says
      // the run measured one backend against itself. That is the precise shape
      // of the --use-angle=swiftshader trap, which reports a full green pass
      // while proving nothing. The badge assert should have caught it upstream;
      // this is the second lock on the same door.
      if (r.mean === 0 && r.max === 0) {
        ok = false
        notes.push('IMPOSSIBLE: byte-identical across backends — one of these is not the backend it claims')
      }
      if (r.control !== null && r.control < r.mean * CONTROL_RATIO) {
        ok = false
        notes.push(`UNCALIBRATED: a different rung differs by only ${fmt(r.control)} vs parity ${fmt(r.mean)} ` +
          `(<${CONTROL_RATIO}x) — the instrument cannot see, or a frame is blank`)
      }
      if (r.control === null) notes.push('no control (single rung) — dynamic range unverified')

      if (!bar) {
        notes.push('no recorded bar — run --record')
        ok = false
      } else {
        const slack = Math.max(TOL_ABS, bar.mean * TOL_REL)
        const allow = bar.mean + slack
        const delta = r.mean - bar.mean
        notes.push(`bar ${fmt(bar.mean).trim()} (${delta >= 0 ? '+' : ''}${delta.toFixed(4)})`)
        // A big DROP is not a pass to celebrate. Either parity genuinely
        // improved (re-record, so the bar keeps its teeth) or the frame lost
        // content that both backends were disagreeing about — a body that
        // stopped rendering on BOTH backends makes this number better while
        // making the app worse. Warned, not failed: the gate cannot tell those
        // apart, and only a human looking at the frame can.
        if (delta < -slack) {
          notes.push('DROPPED well under the bar — parity improved, or the frame lost content; look, then re-record')
        }
        if (r.mean > allow) {
          if (sameHardware) {
            ok = false
            notes.push(`REGRESSION: over ${allow.toFixed(4)} on the hardware that recorded it`)
          } else {
            notes.push(`over ${allow.toFixed(4)} — advisory, different GPU`)
          }
        }
      }

      if (!ok) failures++
      r.ok = ok
      console.log(
        `  ${ok ? '✓' : '✗'} ${r.rung.padEnd(8)} mean=${fmt(r.mean)}/255  max=${String(r.max).padStart(3)}  ` +
        `differing=${((100 * r.differing) / r.pixels).toFixed(1).padStart(5)}%  ` +
        `control=${r.control === null ? '  n/a ' : fmt(r.control)}  ${notes.join('; ')}`,
      )
    }

    console.log('')
    if (failures) {
      console.error(`check-parity: ${failures}/${rows.length} rung(s) failed`)
      console.error('  A structural failure means the two backends are drawing different content: look for a')
      console.error('  node with no WebGL2 path, a texture format that silently differs, or a compute pass')
      console.error('  that only one backend runs. A regression against the bar with the control healthy')
      console.error('  means the code moved — check what changed since docs/parity-bars.json was recorded.')
    } else {
      const worst = rows.reduce((a, b) => (b.mean > a.mean ? b : a))
      console.log(`check-parity ok — ${rows.length} rung(s) agree across backends; worst ${worst.rung} at ` +
        `${worst.mean}/255 (ceiling ${STRUCTURAL_MEAN})`)
      if (!sameHardware) console.log('  (tier 2 advisory: bars were recorded on other hardware)')
    }
  }
} catch (e) {
  console.error('check-parity: ' + (e?.message ?? e))
  failures ||= 1
} finally {
  vite?.stop()
}

process.exit(failures ? 1 : 0)
