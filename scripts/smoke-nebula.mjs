/**
 * smoke-nebula — browser gate for the nebula rung's CYCLE.
 *
 *   node scripts/smoke-nebula.mjs [--backend webgpu|webgl]
 *
 * The gap this closes. Every existing browser gate reaches a rung through
 * `?scale=`, which lands on that rung's DEFAULT cycle index and nothing else.
 * For the nebula rung that is the Pillars, always — so check:frozen and
 * check:parity have never rendered the Crab, and would not have rendered
 * Sh 2-80 either. Three raymarched volumes, one of them covered.
 *
 * That matters more here than on other rungs. These are the only objects in
 * the app whose geometry comes out of a baked HalfFloat atlas, so a TSL
 * member that moved, a worley adapter that is missing on one backend, or a
 * pow() of a negative base fails at SHADER COMPILE time — invisible to the
 * node smokes, which build the graph and never compile it.
 *
 * So this walks the three of them through their dev lab routes, on both
 * backends, and asks the only three questions worth asking of a volume that
 * has never been drawn: did the backend you asked for actually arrive, did
 * anything reach the screen, and did the page log an error doing it.
 *
 * It is NOT a determinism or parity gate — no frames are compared. Those
 * remain check:frozen and check:parity, which measure different things and
 * are documented in CLAUDE.md.
 */

import { startVite, openBrowser, shoot, contentStats, sleep } from './harness-cdp.mjs'

// The nebula rung, in cycle order. `flag` is the dev route in main.jsx;
// `index` is the position in App.jsx's nebulaList, recorded so a future
// reorder shows up here as prose that disagrees with the app.
const SUBJECTS = [
  { flag: 'pillars', index: 0, name: 'Pillars of Creation' },
  { flag: 'wr', index: 1, name: 'Sh 2-80' },
  { flag: 'crab', index: 2, name: 'The Crab Nebula' },
]

// Same floors as check-frozen, and for the same reason: they catch "nothing
// rendered", not "rendered differently". A volume that fails to compile
// leaves the skybox behind it, which is dim but not black — so the distinct
// floor does more work here than the luminance one.
const MIN_LUM = 1.0
const MIN_DISTINCT = 24
const FRAMES = 60

const argv = process.argv.slice(2)
const onlyArg = argv.indexOf('--backend')
const only = onlyArg >= 0 ? argv[onlyArg + 1] : null
if (only && !['webgpu', 'webgl'].includes(only)) {
  console.error(`smoke-nebula: --backend must be webgpu or webgl, got "${only}"`)
  process.exit(1)
}
const backends = only ? [only] : ['webgpu', 'webgl']

const READY = `(() => {
  const c = document.querySelector('canvas');
  if (!c) return 'no-canvas';
  if (c.width < 2 || c.height < 2) return 'canvas-unsized';
  if ([...document.querySelectorAll('*')].some((e) => e.children.length === 0 &&
      /initializing renderer/i.test(e.textContent || ''))) return 'booting';
  return 'ready';
})()`

let vite
let failed = 0
const rows = []
const fail = (m) => { failed += 1; console.error(`  x ${m}`) }

try {
  vite = await startVite()

  for (const backend of backends) {
    const port = 9422 + backends.indexOf(backend)
    const page = await openBrowser({ port, profile: `nebula-${backend}` })
    try {
      // One browser per backend, navigated between subjects. Errors
      // accumulate on the page object across navigations, so each subject is
      // judged on the DELTA rather than the total — otherwise the first
      // failure would condemn every subject after it.
      let seenErrors = 0
      for (const s of SUBJECTS) {
        const q = [`${s.flag}=1`, 'freeze']
        if (backend === 'webgl') q.push('backend=webgl')
        await page.send('Page.navigate', { url: `${vite.url}?${q.join('&')}` })

        let state = 'booting'
        const bootBy = Date.now() + 60_000
        while (Date.now() < bootBy) {
          await sleep(250)
          state = await page.ev(READY)
          if (state === 'ready') break
        }
        if (state !== 'ready') {
          fail(`${s.flag}/${backend}: never became ready (${state})`)
          seenErrors = page.errors.length
          continue
        }

        const framesBy = Date.now() + 60_000
        let n = 0
        while (Date.now() < framesBy) {
          n = await page.ev('window.__harnessFrames || 0')
          if (n >= FRAMES) break
          await sleep(120)
        }

        // Assert the backend that actually arrived. A run that silently fell
        // back to WebGL2 while claiming WebGPU proves nothing about WebGPU —
        // the trap documented at the top of harness-cdp.mjs.
        const badge = await page.ev("document.querySelector('.backend-badge')?.textContent || 'n/a'")
        const wanted = backend === 'webgl' ? 'WebGL2' : 'WebGPU'
        if (badge !== wanted) fail(`${s.flag}: asked for ${wanted}, got ${badge}`)

        const b64 = await shoot(page)
        const stats = await contentStats(page, b64)
        const blank = stats.meanLum < MIN_LUM || stats.distinct < MIN_DISTINCT
        if (blank) fail(`${s.flag}/${backend}: nothing drew (lum ${stats.meanLum}, ${stats.distinct} colours)`)

        const fresh = page.errors.slice(seenErrors)
        seenErrors = page.errors.length
        if (fresh.length) fail(`${s.flag}/${backend}: ${fresh.length} console error(s) — ${fresh[0].split('\n')[0]}`)

        const ok = badge === wanted && !blank && !fresh.length && n >= FRAMES
        rows.push({ ...s, backend, badge, ...stats, frames: n, ok })
        console.log(
          `  ${ok ? 'ok' : ' x'} ${s.flag.padEnd(8)} ${String(badge).padEnd(7)} ` +
          `lum ${String(stats.meanLum).padEnd(7)} ${String(stats.distinct).padEnd(5)} colours  ${s.name}`,
        )
      }
    } finally {
      page.close()
    }
  }
} finally {
  vite?.stop()
}

if (failed) {
  console.error(`\nsmoke-nebula FAILED — ${failed} problem(s) across ${rows.length} subject-backend pair(s)`)
  process.exit(1)
}
console.log(
  `\nsmoke-nebula ok — ${rows.length} subject-backend pair(s) compiled and drew ` +
  `(${SUBJECTS.length} volumes x ${backends.length} backend(s)), no console errors`,
)
