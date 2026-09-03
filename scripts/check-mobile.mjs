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
 * A drawer is OPENED for the measurement. Collapsed is the easy case and passes
 * trivially; expanded is where a HUD runs off the screen, so the gate measures
 * the state that actually breaks.
 *
 * On compact the facts and systems drawers are mutually exclusive, so "both
 * open" is no longer a reachable state and opening them in sequence would close
 * the first. Each is therefore measured ALONE, asserted actually open, and the
 * worse of the two is the number that has to clear the cap. The reported row
 * names which state won, so a passing line can never be read as covering a
 * state it did not measure.
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
  const regions = [...document.querySelectorAll('.hud-top, .hud-side, .hud-left, .hud-bottom')]
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
  // On screen and big enough is not the same as tappable. Two anchored regions
  // can land on the same row and print over each other: "‹ Prev" sat across the
  // right third of "‹ Facts" on every phone, in the collapsed state a reader
  // meets FIRST, and this gate showed nine green ticks because it only asked
  // whether a control existed and had size.
  //
  // Measured by RECT INTERSECTION, not by elementFromPoint. Hit-testing the
  // centre was tried and is not good enough: it only catches a control that is
  // covered at its midpoint, and the real overlap here was a third of the way
  // in from one edge — the centre of "‹ Facts" was still clear, so a
  // centre-probe reported the layout healthy while the button was visibly
  // buried. Two interactive controls should not intersect at all, so that is
  // what gets asserted. 1px of tolerance for sub-pixel layout rounding.
  const rects = btns.map((b) => [b, b.getBoundingClientRect()])
    .filter(([, q]) => q.width > 1 && q.height > 1);
  const label = (b) => (b.textContent || '').trim().slice(0, 18) || b.className;
  const clash = [];
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const [ba, qa] = rects[i], [bb, qb] = rects[j];
    if (ba.contains(bb) || bb.contains(ba)) continue; // nested controls are not a clash
    const ox = Math.min(qa.right, qb.right) - Math.max(qa.left, qb.left);
    const oy = Math.min(qa.bottom, qb.bottom) - Math.max(qa.top, qb.top);
    if (ox > 1 && oy > 1) clash.push(label(ba) + ' / ' + label(bb) +
      ' overlap ' + Math.round(ox) + 'x' + Math.round(oy) + 'px');
  }
  const buried = clash;
  return {
    vw, vh,
    overflowX: de.scrollWidth - vw,
    hudH: Math.round(r.height),
    hudPct: Math.round((r.height / vh) * 100),
    compact: hud.classList.contains('compact'),
    buttons: btns.length,
    offscreen: off.map((b) => (b.textContent || '').trim().slice(0, 18)),
    buried,
    tiny: tiny.map((b) => (b.textContent || '').trim().slice(0, 18) +
      ' ' + Math.round(b.getBoundingClientRect().width) + 'x' + Math.round(b.getBoundingClientRect().height)),
  };
})()`

let vite
let failures = 0
try {
  vite = await startVite()

  for (const rung of rungs) {
    console.log(`\n— ${rung} — worst drawer state, ${devices.length} viewports`)
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

        // SK-1: every viewport runs on a fresh Chrome profile, so localStorage
        // is empty and the reading-level modal is up over the HUD. Dismiss it
        // before measuring — otherwise this gate reports on a layout sitting
        // behind a full-frame overlay that no returning reader ever sees, and
        // its coverage and overlap numbers describe a state that is real for
        // exactly one page load.
        await page.ev(`(() => { const b = document.querySelector('.level-choices button');
          if (b) b.click() })()`)
        await sleep(300)

        // Both drawers open at once USED to be the worst case, and this gate
        // opened both to measure it. On compact they are now mutually
        // exclusive — opening one closes the other — so that state cannot be
        // reached, and clicking both in sequence would open the facts, then
        // close them again, and report a collapsed panel as "facts open".
        // That is precisely the deception the dead .facts-toggle selector
        // used to cause, so it is not repeated: each drawer is measured on
        // its own and the WORST of the two is the number that must clear the
        // cap. Every state is asserted open before it is trusted.
        // COLLAPSED is measured too, and it is not an afterthought: it is the
        // state a phone starts in, and it is where "‹ Prev" was found sitting
        // on top of "‹ Facts". Opening a drawer before measuring meant this
        // gate had never once looked at the layout a reader actually meets.
        const closeAll = () => page.ev(`(() => {
          for (const [t, p] of [['.facts-tab', '.hud .facts'], ['.systems-tab', '.hud .systems']]) {
            const b = document.querySelector(t);
            if (b && document.querySelector(p)) b.click();
          } })()`)

        const measureDrawer = async (label, tabSel, panelSel) => {
          await closeAll()
          await sleep(350)
          if (tabSel === null) return { label, ...(await page.ev(MEASURE)) }
          const found = await page.ev(`(() => { const b = document.querySelector('${tabSel}');
            if (!b) return false; b.click(); return true })()`)
          if (!found) return null
          await sleep(500)
          if (!(await page.ev(`!!document.querySelector('${panelSel}')`)))
            return { label, error: `the ${label} drawer never opened — measurement would be of a closed panel` }
          return { label, ...(await page.ev(MEASURE)) }
        }

        const states = []
        for (const [label, tab, panel] of [
          ['collapsed', null, null],
          ['facts', '.facts-tab', '.hud .facts'],
          ['systems', '.systems-tab', '.hud .systems'],
        ]) {
          const r = await measureDrawer(label, tab, panel)
          if (r) states.push(r)
        }
        // Coverage is a property of the worst state; reachability is a property
        // of EVERY state, so the two are aggregated differently. Taking both
        // from the worst-coverage state would let a buried control in the
        // collapsed layout pass unseen behind a roomier state's number.
        const m = states.reduce((a, b) => (a.error ? a : b.error ? b : b.hudPct > a.hudPct ? b : a), states[0])
        const landscape = w > h
        const cap = landscape ? MAX_HUD_PCT_LANDSCAPE : MAX_HUD_PCT_PORTRAIT
        const problems = []
        for (const st of states) {
          if (st.error) { problems.push(st.error); continue }
          const where = `(${st.label})`
          if (st.offscreen?.length) problems.push(`${st.offscreen.length} control(s) offscreen ${where}: ${st.offscreen.join(', ')}`)
          if (st.tiny?.length) problems.push(`${st.tiny.length} target(s) under ${MIN_TARGET}px ${where}: ${st.tiny.join(', ')}`)
          if (st.buried?.length) problems.push(`${st.buried.length} control(s) covered by something else ${where}: ${st.buried.join(', ')}`)
        }
        if (m.overflowX > 0) problems.push(`${m.overflowX}px horizontal overflow`)
        if (m.hudPct > cap) problems.push(`HUD covers ${m.hudPct}% of the screen (cap ${cap}%)`)

        if (problems.length) failures++
        console.log(
          `  ${problems.length ? '✗' : '✓'} ${name.padEnd(17)} ${(w + 'x' + h).padEnd(9)}` +
          ` hud ${String(m.hudH).padStart(4)}px ${String(m.hudPct).padStart(3)}%` +
          ` ${m.buttons} controls  ${m.label} open`,
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