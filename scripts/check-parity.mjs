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
 *      byte-identical. The content-scale signal is two different rungs on the
 *      same backend: 38.9–100.2/255. So 1.5 sits 3.3x above the worst noise
 *      and ~26x below the smallest measured content difference. Nothing about
 *      rasteriser AA gets you there; a body that is missing, unlit,
 *      differently coloured or differently placed does.
 *
 *      An earlier draft of this header also cited "the same scene five virtual
 *      seconds apart (5.82/255 on system, 26.14 on galaxy)" as the lower edge
 *      of that gap. That number does not reproduce under this gate's own
 *      protocol and has been removed. Re-measured with ?freeze and the pinned
 *      clock — frame 120 against frame 420, same rung, same backend — the
 *      answer is 0/255 on every rung tried: under freeze these scenes are
 *      TIME-INVARIANT, so "five seconds later" is the same picture. The 5.82
 *      figure can only have come from a run without ?freeze, which is neither
 *      what this gate runs nor what docs/parity-bars.json records. The
 *      threshold is unchanged, because the rung-vs-rung calibration above is
 *      the one that actually bounds it — but a gate about instruments that
 *      flatter themselves does not get to keep an unreproducible number in
 *      its own justification.
 *
 *      That same time-invariance is why renderRung overshooting its frame
 *      target slightly (it breaks the poll at n >= frames and the page keeps
 *      rAF-ing through the badge read) does not contaminate the comparison:
 *      the two sides may settle on different frame numbers, but under freeze
 *      those frames depict the same instant.
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
 * DIFFERENT rung on the SAME backend — the instrument proving its own dynamic
 * range inside the very run whose result you are reading, cheap because the
 * screenshots are already in hand.
 *
 * That control is checked TWO ways, and the second one is here because the
 * first was not enough. A ratio alone (control >= 20x parity) inverts exactly
 * when it is needed most: `mean` is quantised to four decimals, so a parity
 * mean that rounds to 0.0000 makes the test `control < 0`, which is never
 * true. The check switched itself off precisely in the blank-frame case it
 * exists to catch, and the IMPOSSIBLE guard below did not cover it either
 * because that one also requires max === 0 — one stray pixel of value 1
 * defeats it. So the control must ALSO clear an absolute floor, and the floor
 * is the structural ceiling itself: if two entirely different rungs differ by
 * less than the amount this gate calls "content, not precision", the
 * instrument demonstrably cannot resolve content and no number it produced
 * this run means anything. Measured controls run 38.9–100.2, so that floor
 * sits 26–67x below the real signal and will not fire on an honest run.
 *
 * And the frames themselves are checked for content directly, via the rig's
 * contentStats — the same MIN_LUM / MIN_DISTINCT floor check-frozen has always
 * applied. Two blank frames agree perfectly; that agreement is now a failure
 * with a reason attached rather than a green tick.
 *
 * A single-rung run (--rungs cluster) has no second frame to reach for, so it
 * renders one extra: a different rung on WebGPU, used only as the control.
 * That is one extra render to keep the defence alive on the invocation people
 * actually reach for when they are debugging — which is exactly when a silent
 * pass costs the most.
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

const { startVite, openBrowser, renderRung, shoot, diff, contentStats, parseArgs, RUNGS, ROOT, sleep } = rig

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
// ...and at least this much in absolute terms, because the ratio alone reads
// as satisfied whenever the parity mean rounds to zero. Deliberately the same
// number as the structural ceiling: a control below it means the instrument
// cannot resolve what this gate calls content. See the CONTROL note above.
const CONTROL_MIN = STRUCTURAL_MEAN
// Is anything on screen at all? A blank frame is byte-identical to another
// blank frame. Same floor check-frozen uses, and deliberately loose: these
// catch "nothing rendered", not "rendered differently".
const MIN_LUM = 1.0
const MIN_DISTINCT = 24

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

/**
 * The verdict for one rung, as a pure function of its measurement and its bar.
 * Pure and separate on purpose: the failure paths of a gate are the part
 * nobody exercises, because reaching them for real means making the app
 * genuinely broken first. Keeping the decision here lets --selftest drive the
 * REAL logic with synthetic rows rather than a copy of it that can drift.
 */
export function judgeRow(r, bar, { frames, gl = null, fallbackGl = null } = {}) {
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
  // Checked directly rather than inferred from the diff. A rung that went
  // black on both backends produces two frames that agree perfectly, and
  // every other test in this block would applaud it.
  if (r.blank) {
    ok = false
    notes.push(`BLANK: lum=${r.lum} colors=${r.distinct} — nothing rendered, so agreement proves nothing`)
  }
  // Absolute floor BEFORE the ratio. The ratio is scaled by r.mean, and
  // mean is quantised to four decimals upstream, so a parity mean that
  // rounds to 0.0000 turns the ratio test into `control < 0` — never true.
  // It disabled itself in the blank case it was written to catch.
  if (r.control !== null && r.control < CONTROL_MIN) {
    ok = false
    notes.push(`UNCALIBRATED: ${r.controlRung} differs by only ${fmt(r.control).trim()}, under the ` +
      `${CONTROL_MIN}/255 content floor — the instrument cannot resolve content this run`)
  } else if (r.control !== null && r.control < r.mean * CONTROL_RATIO) {
    ok = false
    notes.push(`UNCALIBRATED: ${r.controlRung} differs by only ${fmt(r.control).trim()} vs parity ${fmt(r.mean).trim()} ` +
      `(<${CONTROL_RATIO}x) — a real difference barely outreads a noise one`)
  }
  if (r.control === null) {
    ok = false
    notes.push('NO CONTROL: dynamic range unverified — passing here would be an assertion, not a measurement')
  }

  if (!bar) {
    notes.push('no recorded bar — run --record')
    ok = false
  } else {
    const slack = Math.max(TOL_ABS, bar.mean * TOL_REL)
    const allow = bar.mean + slack
    const delta = r.mean - bar.mean
    notes.push(`bar ${fmt(bar.mean).trim()} (${delta >= 0 ? '+' : ''}${delta.toFixed(4)})`)
    // Per-bar, not per-file: a partial --record can leave bars from more
    // than one machine or frame count in the same file, and tier 2 is only
    // meaningful against the conditions its own number was measured under.
    // Falls back to the top-level block for bars recorded before those
    // fields existed.
    const barGl = bar.gl ?? fallbackGl
    const barSameHw = barGl === gl
    if (bar.frames != null && bar.frames !== frames) {
      notes.push(`bar measured at frame ${bar.frames}, this run at frame ${frames} — not comparable`)
    }
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
      if (barSameHw) {
        ok = false
        notes.push(`REGRESSION: over ${allow.toFixed(4)} on the hardware that recorded it`)
      } else {
        notes.push(`over ${allow.toFixed(4)} — advisory, different GPU`)
      }
    }
  }

  return { ok, notes }
}

// ------------------------------------------------------------ selftest ----
// The failure paths of a gate are the part nobody exercises, because reaching
// them for real means making the app genuinely broken first — so they are the
// paths most likely to be quietly wrong. One of them WAS: the control check
// used to be scaled by the parity mean, which made it vacuous in exactly the
// blank-frame case it existed to catch. This drives the real judgeRow (not a
// copy that can drift from it) through the cases that matter, in a second.
if (process.argv.includes('--selftest')) {
  const GL = 'ANGLE (TestCorp, TestGPU Direct3D11)'
  const ctx = { frames: 120, gl: GL, fallbackGl: GL }
  const healthyBar = { mean: 0.0011, frames: 120, gl: GL }
  const row = (o) => ({ rung: 'cluster', mean: 0.0011, max: 2, differing: 180, pixels: 176400,
    control: 94.82, controlRung: 'planet', blank: false, lum: 20.36, distinct: 900, ...o })

  const cases = [
    ['healthy run passes', row({}), healthyBar, true],
    ['blank frames, mean rounds to 0.0000, control also 0 — the F1 regression',
      row({ mean: 0, max: 2, control: 0, blank: true, lum: 0.0, distinct: 1 }), healthyBar, false],
    ['near-blind instrument: control under the absolute floor',
      row({ mean: 0.0002, control: 0.01 }), healthyBar, false],
    ['no control at all', row({ control: null, controlRung: null }), healthyBar, false],
    ['structural: content-scale disagreement', row({ mean: 2.0 }), healthyBar, false],
    ['byte-identical across backends is impossible', row({ mean: 0, max: 0 }), healthyBar, false],
    ['regression against the bar on the recording hardware', row({ mean: 1.0 }), healthyBar, false],
    ['same delta on different silicon is advisory, not a failure',
      row({ mean: 1.0 }), { mean: 0.0011, frames: 120, gl: 'ANGLE (OtherCorp, OtherGPU)' }, true],
    ['a bar measured at another frame count is called out',
      row({}), { mean: 0.0011, frames: 30, gl: GL }, true],
  ]

  let bad = 0
  for (const [name, r, bar, want] of cases) {
    const { ok, notes } = judgeRow(r, bar, ctx)
    if (ok !== want) bad++
    console.log(`  ${ok === want ? '✓' : '✗'} ${name}\n      → ${ok ? 'PASS' : 'FAIL'} (want ${want ? 'PASS' : 'FAIL'}); ${notes.join('; ')}`)
  }
  console.log(bad ? `\ncheck-parity selftest: ${bad}/${cases.length} case(s) wrong` : `\ncheck-parity selftest ok — ${cases.length}/${cases.length}`)
  process.exit(bad ? 1 : 0)
}

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
const badges = {}  // rung -> { webgpu, webgl } as reported by .backend-badge
let fingerprint = null

try {
  vite = await startVite()
  console.log(`check-parity: ${rungs.length} rung(s), WebGPU vs WebGL2, frame ${frames}, ${vite.url}`)

  // renderRung asserts .backend-badge for us and THROWS on a mismatch: a run
  // that silently fell back to WebGL2 and then "proved parity" against WebGL2
  // is worse than no gate at all, and is exactly what --use-angle=swiftshader
  // produces. That flag is not passed anywhere in this rig. The badge comes
  // back here so the report can PRINT which backends actually ran — an
  // assertion nobody can see is one the reader has to take on trust, in a
  // gate whose entire subject is runs that misreport their own backend.
  const capture = async (rung, backend) => {
    const page = await openBrowser({ port: await freePort(), profile: `parity-${backend}-${rung}` })
    try {
      const badge = await renderRung(page, vite.url, { rung, backend, frames })
      const stillVisible = await page.ev(HIDE_CHROME)
      if (stillVisible) throw new Error(`${rung}/${backend}: ${stillVisible} overlay element(s) refused to hide`)
      await sleep(120)
      const shot = await shoot(page)
      if (page.errors.length) {
        console.log(`    note ${rung}/${backend}: ${page.errors.length} console error(s), first: ${page.errors[0].slice(0, 120)}`)
      }
      if (!fingerprint) fingerprint = await page.ev(FINGERPRINT)
      return { shot, badge }
    } finally {
      page.close()
    }
  }

  // ---- render every rung on both backends, in its own browser -----------
  for (const rung of rungs) {
    shots[rung] = {}
    for (const backend of ['webgpu', 'webgl']) {
      const { shot, badge } = await capture(rung, backend)
      shots[rung][backend] = shot
      badges[rung] = { ...badges[rung], [backend]: badge }
    }
  }

  // One rung selected means no second frame to prove the instrument can see,
  // so render one purely as the control. Costs a single extra render and keeps
  // --rungs <one> from being the quiet hole in the defence.
  let soloControl = null
  if (rungs.length === 1) {
    soloControl = RUNGS.find((r) => r !== rungs[0])
    if (soloControl) {
      const { shot } = await capture(soloControl, 'webgpu')
      shots[soloControl] = { ...shots[soloControl], webgpu: shot }
    }
  }

  // ---- judge: diff in a browser that rendered neither side --------------
  const judge = await openBrowser({ port: await freePort(), profile: 'parity-judge' })
  try {
    for (let i = 0; i < rungs.length; i++) {
      const rung = rungs[i]
      const d = await diff(judge, shots[rung].webgpu, shots[rung].webgl)

      // Content floor, on BOTH sides. A rung that regressed to black renders
      // a frame that agrees with the other blank frame perfectly — without
      // this, that reads as the strongest possible pass in the file.
      const sGpu = await contentStats(judge, shots[rung].webgpu)
      const sGl = await contentStats(judge, shots[rung].webgl)
      const blank = [sGpu, sGl].some((s) => s.meanLum < MIN_LUM || s.distinct < MIN_DISTINCT)

      // Same backend, different rung: what a REAL difference measures on this
      // exact instrument, this run. Multi-rung runs borrow their neighbour;
      // a single-rung run rendered one above for exactly this purpose.
      const other = rungs.length > 1 ? rungs[(i + 1) % rungs.length] : soloControl
      const control = other && shots[other]?.webgpu
        ? (await diff(judge, shots[rung].webgpu, shots[other].webgpu)).mean
        : null
      rows.push({
        rung, ...d, control, controlRung: other ?? null, blank,
        lum: sGpu.meanLum, distinct: sGpu.distinct,
      })
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
    // Migrate provenance off the OLD top-level block before this run's values
    // replace it. Without this the gating-side fallback (bar.gl ?? top-level)
    // hands every un-recorded bar the CURRENT machine's identity the moment
    // anyone runs a partial --record on different silicon — quietly claiming
    // bars were measured somewhere they were not. Cheap, and it fixes bars
    // files written before these fields existed rather than only new ones.
    for (const [name, b] of Object.entries(next.rungs)) {
      if (b.gl == null && bars?.environment?.gl) b.gl = bars.environment.gl
      if (b.frames == null && bars?.conditions?.frames != null) b.frames = bars.conditions.frames
      next.rungs[name] = b
    }
    // Every bar carries the frame count and the GPU it was measured on. The
    // top-level environment/conditions describe the MOST RECENT record, and a
    // partial `--record --rungs cluster --frames 30` would otherwise stamp
    // those onto five bars it never touched — silently relabelling the exact
    // two fields tier 2 and every human reader trust.
    for (const r of rows) {
      next.rungs[r.rung] = {
        mean: r.mean,
        max: r.max,
        differingPct: +((100 * r.differing) / r.pixels).toFixed(2),
        control: r.control,
        frames,
        gl: fingerprint?.gl ?? null,
      }
    }
    const stale = Object.entries(next.rungs).filter(([k, v]) => !rows.some((r) => r.rung === k) && (v.frames ?? frames) !== frames)
    if (stale.length) {
      console.log(`\n  ! kept ${stale.length} bar(s) measured at a different frame count: ` +
        stale.map(([k, v]) => `${k}@${v.frames ?? '?'}`).join(', '))
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
      const { ok, notes } = judgeRow(r, bar, {
        frames,
        gl: fingerprint?.gl ?? null,
        fallbackGl: bars.environment?.gl ?? null,
      })

      if (!ok) failures++
      r.ok = ok
      const pair = `${badges[r.rung]?.webgpu ?? '?'}|${badges[r.rung]?.webgl ?? '?'}`
      console.log(
        `  ${ok ? '✓' : '✗'} ${r.rung.padEnd(8)} ${pair.padEnd(14)} mean=${fmt(r.mean)}/255  max=${String(r.max).padStart(3)}  ` +
        `differing=${((100 * r.differing) / r.pixels).toFixed(1).padStart(5)}%  ` +
        `lum=${String(r.lum).padStart(6)}  ` +
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
