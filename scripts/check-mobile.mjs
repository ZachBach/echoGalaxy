/**
 * check-mobile — the responsive gate. Emulates a spread of real phone and
 * tablet viewports and fails on the three things that actually make a layout
 * unusable on a device: a control you cannot reach, a target too small to hit,
 * and a panel that eats the screen you came to look at.
 *
 * It exists because none of that was measurable before. index.css carried no
 * media queries at all; adaptation was a single .compact class switched on
 * matchMedia('(pointer: coarse)') read once at module scope, which conflated
 * "is this touch", "how wide" and "how tall", and could not answer any of them
 * after load. The first run of this harness found, on the system rung with the
 * facts open: six controls off the top edge at 740x360, eleven tap targets
 * under the 44px floor on every device, and a HUD covering 99% of a landscape
 * phone.
 *
 * Emulation is applied BEFORE navigation, deliberately — the app reads pointer
 * type at module scope, so a device override set afterwards would be too late
 * to affect the decision under test.
 *
 * The facts pane is OPENED for the measurement. Collapsed is the easy case and
 * passes trivially; expanded is where a HUD runs off the screen, so the gate
 * measures the state that actually breaks.
 *
 * Run:
 *   npm run check:mobile
 *   node scripts/check-mobile.mjs --rungs system,planet --devices iphone-se
 */

import { startVite, openBrowser, sleep, RUNGS } from './harness-cdp.mjs'

// name, css width, css height, dpr. Chosen to bracket what ships: the 320px
// floor, common 360-430 portraits, a tablet, and two landscapes, which is the
// orientation everything got wrong.
const DEVICES = [
  ['iphone-se', 375, 667, 2],
  ['galaxy-s8', 360, 740, 3],
  ['android-small', 320, 568, 2],
  ['iphone-14', 390, 844, 3],
  ['pixel-7', 412, 915, 2.6],
  ['iphone-14-promax', 430, 932, 3],
  ['ipad-mini', 768, 1024, 2],
  ['iphone-14-land', 844, 390, 3],
  ['galaxy-s8-land', 740, 360, 3],
]

// 44px is the Apple HIG minimum; Android asks ~48dp. 44 is the floor here.
const MIN_TARGET = 44
// A portrait HUD may take two thirds of the screen with its facts open. A
// landscape one may take more, because it is a side column and the scene is
// beside it rather than under it — hence the orientation split.
const MAX_HUD_PCT_PORTRAIT = 72
const MAX_HUD_PCT_LANDSCAPE = 98

const argv = process.argv.slice(2)
const arg = (k, d) => {
  const i = argv.indexOf(`--${k}`)
  return i === -1 ? d : argv[i + 1]
}
const rungArg = arg('rungs', 'system')
const rungs = rungArg.split(',').map((s) => s.trim()).filter(Boolean)
const devArg = arg('devices', null)
const devices = devArg
  ? DEVICES.filter((d) => devArg.split(',').map((s) => s.trim()).includes(d[0]))
  : DEVICES

const badRung = rungs.filter((r) => !RUNGS.includes(r))
if (badRung.length) {
  console.error(`check-mobile: unknown rung(s): ${badRung.join(', ')}\n  known: ${RUNGS.join(', ')}`)
  process.exit(1)
}
if (!devices.length) {
  console.error(`check-mobile: no matching devices\n  known: ${DEVICES.map((d) => d[0]).join(', ')}`)
  process.exit(1)
}

const MEASURE = `(() => {
  const de = document.documentElement, vw = innerWidth, vh = innerHeight;
  const hud = document.querySelector('.hud');
  if (!hud) return { error: 'no hud' };
  // The HUD is three anchored regions inside a transparent full-frame
  // container, so measuring .hud itself now reports 100% on every device and
  // means nothing. What the cap is actually about is how much of the screen
  // the OPAQUE panels eat, so union the regions' vertical spans — the same
  // quantity the old single-panel height measured, computed for a split HUD.
  const regions = [...document.querySelectorAll('.hud-top, .hud-side, .hud-bottom')]
    .map((e) => e.getBoundingClientRect())
    .filter((q) => q.width > 0 && q.height > 0)
    .map((q) => [Math.max(0, q.top), Math.min(vh, q.bottom)])
    .filter(([a, b]) => b > a)
    .sort((a, b) => a[0] - b[0]);
  let covered = 0, curA = null, curB = null;
  for (const [a, b] of regions) {
    if (curA === null) { curA = a; curB = b; continue }
    if (a <= curB) { curB = Math.max(curB, b) } else { covered += curB - curA; curA = a; curB = b }
  }
  if (curA !== null) covered += curB - curA;
  const r = { height: covered };
  const btns = [...document.querySelectorAll('.hud button')];
  const off = btns.filter((b) => { const q = b.getBoundingClientRect();
    return q.width > 0 && (q.right > vw + 0.5 || q.bottom > vh + 0.5 || q.left < -0.5 || q.top < -0.5); });
  const tiny = btns.filter((b) => { const q = b.getBoundingClientRect();
    return q.width > 0 && (q.width < ${MIN_TARGET} || q.height < ${MIN_TARGET}); });
  return {
    vw, vh,
    overflowX: de.scrollWidth - vw,
    hudH: Math.round(r.height),
    hudPct: Math.round((r.height / vh) * 100),
    compact: hud.classList.contains('compact'),
    buttons: btns.length,
    offscreen: off.map((b) => (b.textContent || '').trim().slice(0, 18)),
    tiny: tiny.map((b) => (b.textContent || '').trim().slice(0, 18) +
      ' ' + Math.round(b.getBoundingClientRect().width) + 'x' + Math.round(b.getBoundingClientRect().height)),
  };
})()`

let vite
let failures = 0
try {
  vite = await startVite()

  for (const rung of rungs) {
    console.log(`\n— ${rung} — facts open, ${devices.length} viewports`)
    for (const [name, w, h, dpr] of devices) {
      const page = await openBrowser({
        port: 9890, profile: `mobile-${rung}-${name}`,
        width: Math.max(w, 400), height: Math.max(h, 400),
      })
      try {
        await page.send('Emulation.setDeviceMetricsOverride', {
          width: w, height: h, deviceScaleFactor: dpr, mobile: true,
          screenWidth: w, screenHeight: h,
        })
        await page.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })

        await page.send('Page.navigate', { url: `${vite.url}?scale=${rung}` })
        let ready = false
        const deadline = Date.now() + 60_000
        while (Date.now() < deadline) {
          await sleep(280)
          const s = await page.ev(`(() => { const c = document.querySelector('canvas');
            if (!c || c.width < 2) return 'no';
            if ([...document.querySelectorAll('*')].some((e) => e.children.length === 0 &&
                /initializing renderer/i.test(e.textContent || ''))) return 'boot';
            return document.querySelector('.hud') ? 'ready' : 'no-hud' })()`)
          if (s === 'ready') { ready = true; break }
        }
        if (!ready) {
          console.log(`  ✗ ${name.padEnd(17)} never became ready`)
          failures++
          continue
        }
        await sleep(900)

        // Open the facts drawer. The control is .facts-tab since the HUD split;
        // the old .facts-toggle selector silently matched nothing, which meant
        // this gate was measuring a CLOSED panel while reporting "facts open".
        await page.ev(`(() => { const t = document.querySelector('.facts-tab');
          if (t && !document.querySelector('.hud .facts')) { t.click(); return true } return false })()`)
        await sleep(500)

        const m = await page.ev(MEASURE)
        const landscape = w > h
        const cap = landscape ? MAX_HUD_PCT_LANDSCAPE : MAX_HUD_PCT_PORTRAIT
        const problems = []
        if (m.error) problems.push(m.error)
        if (m.offscreen?.length) problems.push(`${m.offscreen.length} control(s) offscreen: ${m.offscreen.join(', ')}`)
        if (m.tiny?.length) problems.push(`${m.tiny.length} target(s) under ${MIN_TARGET}px: ${m.tiny.join(', ')}`)
        if (m.overflowX > 0) problems.push(`${m.overflowX}px horizontal overflow`)
        if (m.hudPct > cap) problems.push(`HUD covers ${m.hudPct}% of the screen (cap ${cap}%)`)

        if (problems.length) failures++
        console.log(
          `  ${problems.length ? '✗' : '✓'} ${name.padEnd(17)} ${(w + 'x' + h).padEnd(9)}` +
          ` hud ${String(m.hudH).padStart(4)}px ${String(m.hudPct).padStart(3)}%` +
          ` ${m.buttons} controls`,
        )
        for (const p of problems) console.log(`      ! ${p}`)
      } finally {
        page.close()
      }
    }
  }

  console.log('')
  if (failures) console.error(`check-mobile: ${failures} viewport(s) failed`)
  else console.log(`check-mobile ok — ${rungs.length * devices.length} viewport(s): every control reachable, every target >= ${MIN_TARGET}px, no overflow`)
} catch (e) {
  console.error('check-mobile: ' + (e?.message ?? e))
  failures ||= 1
} finally {
  vite?.stop()
}
process.exit(failures ? 1 : 0)