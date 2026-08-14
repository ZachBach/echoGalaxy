/**
 * check-frozen — the determinism gate. Renders each rung TWICE in two
 * independent browsers and requires the two frames to be identical.
 *
 * The claim being tested is the one the capture rig rests on: given the same
 * inputs, this app draws the same pixels. Galaxy and cluster populations are
 * seeded (mulberry32) rather than random, the volume bakes are pure functions
 * of their fields, and `?freeze` pins spin, orbits and camera drift. If any of
 * that quietly acquires a dependency on wall time, machine state, or draw
 * order, a frame set rendered over two hours stops being one coherent take —
 * and you find out by watching the assembled cut, which is the worst possible
 * moment.
 *
 * Independent browsers, separate user-data-dirs, sequential launches: a second
 * navigation inside one browser would share a warm renderer and a populated
 * cache, which is a much weaker claim than the one being made here.
 *
 * Not a substitute for check-parity — this compares a backend against itself.
 *
 * Run:
 *   node scripts/check-frozen.mjs
 *   node scripts/check-frozen.mjs --rungs galaxy,cluster --backend webgpu
 */

import { startVite, openBrowser, renderRung, shoot, diff, contentStats, parseArgs, RUNGS } from './harness-cdp.mjs'

// A blank frame equals another blank frame. Without a content floor, a rung
// that regressed to black would report a perfect 0/255 and read as the
// strongest possible pass. These are deliberately loose — they catch "nothing
// rendered", not "rendered differently".
const MIN_LUM = 1.0
const MIN_DISTINCT = 24

const { rungs, backend: only, frames } = parseArgs(process.argv.slice(2))
const backends = only ? [only] : ['webgpu', 'webgl']

const bad = rungs.filter((r) => !RUNGS.includes(r))
if (bad.length) {
  console.error(`check-frozen: unknown rung(s): ${bad.join(', ')}\n  known: ${RUNGS.join(', ')}`)
  process.exit(1)
}

let vite
let failures = 0
const rows = []

try {
  vite = await startVite()

  for (const backend of backends) {
    for (const rung of rungs) {
      // Two independent browsers. The profile name differs so neither run can
      // read the other's cache, and the CDP ports differ so they never collide.
      const shots = []
      let badge = null
      for (const pass of [0, 1]) {
        const port = 9820 + pass + (backend === 'webgl' ? 2 : 0)
        const page = await openBrowser({ port, profile: `frozen-${backend}-${rung}-${pass}` })
        try {
          badge = await renderRung(page, vite.url, { rung, backend, frames })
          shots.push(await shoot(page))
        } finally {
          page.close()
        }
      }

      // Diff in a throwaway page so neither render's context is involved.
      const judge = await openBrowser({ port: 9829, profile: 'frozen-judge' })
      let d, stats
      try {
        d = await diff(judge, shots[0], shots[1])
        stats = await contentStats(judge, shots[0])
      } finally {
        judge.close()
      }

      const blank = stats.meanLum < MIN_LUM || stats.distinct < MIN_DISTINCT
      const ok = d.max === 0 && !blank
      if (!ok) failures++
      rows.push({ rung, backend, badge, ...d, ...stats, ok, blank })
      console.log(
        `  ${ok ? '✓' : '✗'} ${rung.padEnd(8)} ${String(badge).padEnd(7)} ` +
        `max=${String(d.max).padStart(3)}/255  mean=${d.mean}  differing=${d.differing}/${d.pixels}` +
        `  lum=${stats.meanLum} colors=${stats.distinct}${blank ? '  ← BLANK, identical proves nothing' : ''}`,
      )
    }
  }

  console.log('')
  if (failures) {
    console.error(`check-frozen: ${failures}/${rows.length} rung-backend pairs are NOT deterministic`)
    console.error('  A non-zero max means two identical inputs drew different pixels. Suspects, in order:')
    console.error('  an unseeded random in a population, a bake reading wall time, or a material')
    console.error('  sampling TSL.time outside the pinned clock.')
  } else {
    console.log(`check-frozen ok — ${rows.length} rung-backend pairs byte-identical across independent runs (0/255)`)
  }
} catch (e) {
  console.error('check-frozen: ' + (e?.message ?? e))
  failures ||= 1
} finally {
  vite?.stop()
}

process.exit(failures ? 1 : 0)