/**
 * check-shots — static gate for the capture shot list.
 *
 *   node scripts/check-shots.mjs
 *
 * A capture session is expensive: a browser, a folder picker, and minutes of
 * real-time rendering per shot. Every error this catches is one that would
 * otherwise be found after the frames are on disk, or — worse — not found at
 * all. Shot 05-system once framed as far as Jupiter and cropped everything
 * beyond it, and stills looked fine; only motion showed it.
 *
 * `follow` is the sharpest edge. CaptureRig treats an unresolvable orbit id as
 * fatal rather than falling back, which is right, but the failure lands after
 * the operator has already chosen a folder. Catching it here costs nothing.
 *
 * systemData.js is read as text rather than imported: it pulls in
 * planetRecipes, which imports the vendored tsl-lib through extensionless
 * specifiers that plain node cannot resolve. Vite resolves them; node does
 * not. Parsing is the honest way to reach it from a script.
 */

import { readFileSync } from 'node:fs'

const { SHOTS, DISSOLVE, ASPECTS, BASE_H_FOV } = await import('../src/capture/shots.js')
const systemSrc = readFileSync(new URL('../src/systemData.js', import.meta.url), 'utf8')
const assembleSrc = readFileSync(new URL('./assemble.mjs', import.meta.url), 'utf8')

let failed = 0
const fail = (m) => { failed += 1; console.error(`  x ${m}`) }
const ok = (m) => console.log(`  ok ${m}`)

// Rung clamps describe what a *user* can reach. The rig drives the camera
// directly with OrbitControls disabled, so a shot may legitimately sit
// outside them — this is advisory, and only shouts when a shot is so far out
// it is more likely a typo than an intent.
const RUNG = {
  planet: [2.6, 12], system: [3, 28], nebula: [2.6, 9],
  galaxy: [4, 28], group: [12, 90], cluster: [6, 34],
}
const SKY_MODES = ['off', 'stars', 'zodiac', 'all']

console.log(`[1] ${SHOTS.length} shots`)
const ids = SHOTS.map((s) => s.id)
const dupes = ids.filter((x, i) => ids.indexOf(x) !== i)
dupes.length ? fail(`duplicate shot ids: ${[...new Set(dupes)].join(', ')}`) : ok('ids unique')

console.log('\n[2] rungs and required fields')
for (const s of SHOTS) {
  if (!RUNG[s.scale]) fail(`${s.id}: unknown scale "${s.scale}"`)
  if (!(s.seconds > 0)) fail(`${s.id}: seconds must be positive`)
  if (!s.from?.pos || !s.to?.pos) fail(`${s.id}: needs both from.pos and to.pos`)
  if (s.fovLock && !['h', 'v'].includes(s.fovLock)) fail(`${s.id}: fovLock must be 'h' or 'v'`)
  if (s.ease && !['inout', 'linear'].includes(s.ease)) fail(`${s.id}: ease must be 'inout' or 'linear'`)
}
if (!failed) ok('every shot has a known rung, a duration, and a path')

// `follow` names a TOP-LEVEL orbit. CaptureRig's findOrbit only walks
// system.orbits, so a moon id would parse but never resolve at runtime.
console.log('\n[3] follow ids resolve to top-level orbits')
const topLevel = new Set()
{
  // Take ids that sit on a line also carrying an orbit radius `r:` — moons
  // are nested under their planet and carry orbitR instead.
  const re = /id:\s*'([^']+)'[^\n]*\br:\s*[\d.]/g
  let m
  while ((m = re.exec(systemSrc))) topLevel.add(m[1])
}
const follows = SHOTS.filter((s) => s.follow)
for (const s of follows) {
  if (topLevel.has(s.follow)) ok(`${s.id.padEnd(18)} follows ${s.follow}`)
  else fail(`${s.id}: follows "${s.follow}", which is not a top-level orbit id`)
}
if (!follows.length) ok('no shot uses follow')

console.log('\n[4] sky overrides')
const skies = SHOTS.filter((s) => s.sky)
for (const s of skies) {
  if (SKY_MODES.includes(s.sky)) ok(`${s.id.padEnd(18)} sky=${s.sky}`)
  else fail(`${s.id}: sky "${s.sky}" is not one of ${SKY_MODES.join('|')}`)
}
if (!skies.length) ok('no shot pins a sky mode')

console.log('\n[5] camera distances (advisory)')
{
  const d = (p) => Math.hypot(...p)
  let noted = 0
  for (const s of SHOTS) {
    const [lo, hi] = RUNG[s.scale] ?? [0, Infinity]
    for (const [label, pt] of [['from', s.from?.pos], ['via', s.via?.pos], ['to', s.to?.pos]]) {
      if (!pt) continue
      // A followed shot's path is an OFFSET from a moving body, not a world
      // position, so the rung clamp does not apply to it at all.
      if (s.follow) continue
      const dist = d(pt)
      if (dist < lo * 0.5 || dist > hi * 1.5) {
        console.log(`  .. ${s.id} ${label} at ${dist.toFixed(1)}, well outside the ${s.scale} range ${lo}-${hi}`)
        noted += 1
      }
    }
  }
  ok(noted ? `${noted} position(s) far outside their rung range — intentional for rig-driven paths, but worth an eye` : 'all fixed-path positions sit within their rung range')
}

console.log('\n[6] assemble title cues reference real shots')
{
  const cued = [...assembleSrc.matchAll(/shot:\s*'([^']+)'/g)].map((m) => m[1])
  const missing = cued.filter((c) => !ids.includes(c))
  missing.length
    ? fail(`assemble.mjs cues reference missing shots: ${missing.join(', ')}`)
    : ok(`${cued.length} title cue(s) all resolve`)
}

// A title card is a factual claim burned into the footage. This one shipped
// saying 8,355 while the sky held 25,199, because the catalogue grew and the
// copy did not. Numbers in cards are checked against their source.
console.log('\n[7] copy agrees with the data')
{
  const { STARS } = await import('../src/skyCatalog.js')
  // Sky.jsx is a component, so it is read as text — node cannot import JSX.
  const skySrc = readFileSync(new URL('../src/Sky.jsx', import.meta.url), 'utf8')

  // Any "N real stars" / "N,NNN stars" claim, wherever it is written. This has
  // drifted twice: once in a burned-in title card, once in the HUD's own
  // educational copy, both times because the catalogue grew and the prose did
  // not. Both surfaces are checked against the same single source of truth.
  const sources = [
    ['assemble.mjs title card', assembleSrc],
    ['Sky.jsx SKY_INFO', skySrc],
  ]
  let claims = 0
  for (const [where, src] of sources) {
    for (const m of src.matchAll(/([\d]{1,3}(?:,[\d]{3})+)\s+real stars/g)) {
      claims += 1
      const n = Number(m[1].replace(/,/g, ''))
      if (n === STARS.length) ok(`${where}: "${m[1]} real stars" matches skyCatalog`)
      else fail(`${where} claims ${m[1]} stars, but skyCatalog holds ${STARS.length}`)
    }
  }
  if (!claims) ok('no star-count claim anywhere in copy')

  // The figures default and the prose that describes it must agree. Saying
  // "the zodiac" while drawing all 88 is the same failure in a different key.
  const drawsAll = /figures\s*=\s*'all'/.test(skySrc)
  const saysAll = /all 88/i.test(skySrc)
  if (drawsAll && !saysAll) fail('Sky.jsx draws all 88 figures but its copy does not say so')
  else if (!drawsAll && saysAll) fail('Sky.jsx copy claims all 88 figures but does not draw them')
  else ok(`figures default and its description agree (${drawsAll ? 'all 88' : 'zodiac'})`)
}

console.log('\n[8] runtime')
{
  const raw = SHOTS.reduce((a, s) => a + s.seconds, 0)
  const total = raw - DISSOLVE * (SHOTS.length - 1)
  console.log(`  ${total.toFixed(1)}s assembled (${raw.toFixed(1)}s raw, ${SHOTS.length - 1} dissolves at ${DISSOLVE}s)`)
  // Platform ceilings are a planning fact, not a pass/fail condition.
  if (total > 90) console.log(`  .. past the 90s Facebook Reels ceiling; Instagram allows ~3 min. A subset cut may be wanted.`)
  const frames30 = Math.round(total * 30)
  console.log(`  ~${frames30} frames at 30 fps, ~${(SHOTS.reduce((a, s) => a + s.seconds * 30, 0)).toFixed(0)} to capture`)
  ok(`aspects available: ${Object.keys(ASPECTS).join(', ')} at BASE_H_FOV ${BASE_H_FOV}`)
}

console.log(failed ? `\ncheck-shots FAILED (${failed})` : '\ncheck-shots ok')
process.exit(failed ? 1 : 0)
