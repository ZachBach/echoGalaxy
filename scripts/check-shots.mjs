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

// `index` picks which entry of a rung's cycle the shot captures. An
// out-of-range index does not throw, it silently renders a DIFFERENT object,
// and the frames look perfectly fine until someone who knows the subject
// watches them. Inserting Sh 2-80 into the middle of the nebula cycle moved
// the Crab from 1 to 2 and proved the point.
//
// A range check alone is not enough, and the proof is that it passed for
// months over a live defect: `22-ice-giant` sat at index 11, which is Venus.
// 11 is a perfectly legal index into a 13-entry cycle, so nothing complained
// — Venus had been inserted ahead of the ice giant and the shot never moved.
// A shot therefore also declares `entry`, the id it BELIEVES it is pointing
// at, and the roster has to agree. That is what turns a silent repoint into
// a failed gate.
//
// Rosters are read wherever they can be read honestly:
//   galaxy  imported — galaxyData.js is pure data with no imports at all
//   planet  parsed as TEXT: planetData.js pulls in planetRecipes, which
//           reaches the vendored tsl-lib through extensionless specifiers
//           node will not resolve, plus two JSX components. Same reason
//           systemData.js is read as text above.
//   nebula  length only, from App.jsx's literal array — its entries are
//           objects exported by JSX components, so there are no ids to read.
// Anything still unreadable is counted as unknown rather than guessed at,
// and said so out loud.
console.log('\n[9] shot index points at the entry it claims')
{
  const appSrc = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const listLen = (name) => {
    const m = appSrc.match(new RegExp(`${name}\\s*=\\s*useMemo\\(\\(\\)\\s*=>\\s*\\[([^\\]]*)\\]`))
    if (!m) return null
    const items = m[1].split(',').map((s) => s.trim()).filter(Boolean)
    return items.length || null
  }

  // Ordered entry ids per rung, where they can be established.
  const rosters = {}
  rosters.galaxy = (await import('../src/galaxyData.js')).GALAXY_TYPES.map((g) => g.id)

  // PLANET_TYPES mixes object literals with bare imported constants
  // (BLACK_HOLE_INFO) and a spread of one (...STAR_INFO), so the ids are not
  // all in the file being parsed. The id of an imported entry is resolved by
  // following planetData's OWN import line to the module it names — nothing
  // here hardcodes which file a constant lives in.
  {
    const src = readFileSync(new URL('../src/planetData.js', import.meta.url), 'utf8')
    const constId = (name) => {
      const im = src.match(new RegExp(`import \\{[^}]*\\b${name}\\b[^}]*\\} from '\\./([^']+)'`))
      if (!im) return null
      for (const ext of ['.jsx', '.js', '']) {
        let mod
        try { mod = readFileSync(new URL(`../src/${im[1]}${ext}`, import.meta.url), 'utf8') } catch { continue }
        const m = mod.match(new RegExp(`export const ${name}\\s*=\\s*\\{[^}]*?id:\\s*'([^']+)'`))
        if (m) return m[1]
      }
      return null
    }
    const body = src.slice(src.indexOf('export const PLANET_TYPES = ['))
    const ids = []
    let depth = 0
    let cur = null
    for (const line of body.split('\n').slice(1)) {
      if (/^\]/.test(line)) break
      if (depth === 0) {
        const bare = line.match(/^\s{2}([A-Z][A-Z0-9_]*),\s*$/)
        if (bare) { ids.push(constId(bare[1]) ?? `?${bare[1]}`); continue }
        if (/^\s{2}\{/.test(line)) cur = null
      }
      if (cur === null && depth >= 0) {
        const idm = line.match(/^\s+id:\s*'([^']+)'/)
        const spm = line.match(/^\s+\.\.\.([A-Z][A-Z0-9_]*),/)
        if (idm) cur = idm[1]
        else if (spm) cur = constId(spm[1]) ?? `?${spm[1]}`
      }
      depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length
      if (depth === 0 && /^\s{2}\}/.test(line)) { ids.push(cur ?? '?'); cur = null }
    }
    if (ids.length && !ids.some((i) => i.startsWith('?'))) rosters.planet = ids
    else fail(`could not read the planet roster cleanly: ${ids.join(', ') || '(empty)'}`)
  }

  const lengths = { nebula: listLen('nebulaList') }
  let checked = 0
  const unknown = []
  for (const s of SHOTS) {
    if (s.index === undefined) continue
    const ids = rosters[s.scale]
    const n = ids ? ids.length : lengths[s.scale]
    if (!n) { unknown.push(s.id); continue }
    checked += 1
    if (s.index < 0 || s.index >= n) {
      fail(`${s.id}: index ${s.index} is outside the ${s.scale} cycle (0..${n - 1})`)
    } else if (ids && !s.entry) {
      fail(`${s.id}: declares no entry id, so its index cannot be verified — add entry: '${ids[s.index]}'`)
    } else if (ids && ids[s.index] !== s.entry) {
      fail(`${s.id}: index ${s.index} is "${ids[s.index]}", not the "${s.entry}" it claims`)
    }
  }
  if (!failed && checked)
    ok(`${checked} indexed shot(s) point where they claim ` +
       `(galaxy ${rosters.galaxy.length}, planet ${rosters.planet?.length ?? '?'}, nebula ${lengths.nebula})`)
  if (unknown.length)
    console.log(`  .. ${unknown.length} indexed shot(s) on rungs whose cycle this gate cannot read: ${unknown.join(', ')}`)
}

console.log(failed ? `\ncheck-shots FAILED (${failed})` : '\ncheck-shots ok')
process.exit(failed ? 1 : 0)
