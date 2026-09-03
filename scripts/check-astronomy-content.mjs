/**
 * Vendor-gate-style check for the astronomy content datasets
 * (BACKLOG phases STA–STD). Node-smoked per the project convention — these
 * are pure-data modules with no rendering imports, so plain node can execute
 * them without a browser or a build.
 *
 *   node scripts/check-astronomy-content.mjs
 *
 * Checks:
 *   1. every module imports and executes
 *   2. no data module imports rendering code (the *Data.js purity rule)
 *   3. ids are unique within each catalogue and globally
 *   4. every entry carries BOTH facts rungs (kids + advanced)
 *   5. factsFor() resolves for both audiences on every entry
 *   6. the constellation list is exactly the 88 IAU constellations
 *   7. no empty strings, no placeholder text left behind
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const src = join(here, '..', 'src')

const MODULES = [
  'stellarData.js',
  'starData.js',
  'constellationData.js',
  'skyCultureData.js',
  'factsLadder.js',
]

let failures = 0
const fail = (msg) => {
  console.error(`  ✗ ${msg}`)
  failures++
}
const pass = (msg) => console.log(`  ✓ ${msg}`)

/* 1 — modules load ------------------------------------------------- */
console.log('\n[1] module load')
const mods = {}
for (const m of MODULES) {
  try {
    mods[m] = await import(`file://${join(src, m).replace(/\\/g, '/')}`)
    pass(m)
  } catch (e) {
    fail(`${m} failed to import: ${e.message}`)
  }
}
if (failures) {
  console.error('\nFAIL — modules did not load; aborting.\n')
  process.exit(1)
}

/* 2 — purity: no rendering imports --------------------------------- */
console.log('\n[2] data purity (no rendering imports)')
const BANNED = [/from ['"]three/, /from ['"]react/, /from ['"]@react-three/, /\.jsx['"]/]
for (const m of MODULES) {
  const text = readFileSync(join(src, m), 'utf8')
  const hit = BANNED.find((re) => re.test(text))
  if (hit) fail(`${m} imports rendering code (matched ${hit})`)
  else pass(`${m} is pure data`)
}

/* 3 — collect every entry ------------------------------------------ */
const { STELLAR_FOUNDATIONS } = mods['stellarData.js']
const { STAR_PROFILES, BRIGHTNESS_RANKING, NEAREST_RANKING } = mods['starData.js']
const { CONSTELLATIONS, IAU_CONSTELLATION_COUNT, ZODIAC, constellationById } =
  mods['constellationData.js']
const { SKY_CULTURES, POLE_STAR_CHRONOLOGY } = mods['skyCultureData.js']
const { factsFor, hasLadder, AUDIENCES } = mods['factsLadder.js']

const CATALOGUES = {
  STELLAR_FOUNDATIONS,
  STAR_PROFILES,
  CONSTELLATIONS,
  SKY_CULTURES,
}

console.log('\n[3] id uniqueness')
const globalIds = new Map()
for (const [name, list] of Object.entries(CATALOGUES)) {
  const ids = list.map((e) => e.id)
  const dupes = ids.filter((v, i) => ids.indexOf(v) !== i)
  if (dupes.length) fail(`${name} has duplicate ids: ${[...new Set(dupes)].join(', ')}`)
  else pass(`${name} — ${ids.length} unique ids`)
  for (const id of ids) {
    if (globalIds.has(id)) fail(`id "${id}" collides: ${globalIds.get(id)} vs ${name}`)
    else globalIds.set(id, name)
  }
}
pass(`${globalIds.size} unique ids across all catalogues`)

/* 4 + 5 — the facts ladder ----------------------------------------- */
console.log('\n[4] facts ladder — both rungs present')
let entryCount = 0
let kidsFactCount = 0
let advFactCount = 0
for (const [name, list] of Object.entries(CATALOGUES)) {
  let bad = 0
  for (const e of list) {
    entryCount++
    if (!hasLadder(e)) {
      fail(`${name}/${e.id} is missing a facts rung`)
      bad++
      continue
    }
    kidsFactCount += e.factsKids.length
    advFactCount += e.factsAdvanced.length
    for (const audience of AUDIENCES) {
      const f = factsFor(e, audience)
      if (!Array.isArray(f) || f.length === 0) fail(`${name}/${e.id} factsFor(${audience}) empty`)
      if (f.some((s) => typeof s !== 'string' || s.trim().length < 10))
        fail(`${name}/${e.id} has an empty or stub ${audience} fact`)
    }
  }
  if (!bad) pass(`${name} — every entry carries kids + advanced`)
}

/* 6 — the 88 ------------------------------------------------------- */
console.log('\n[6] IAU constellation completeness')
if (CONSTELLATIONS.length !== IAU_CONSTELLATION_COUNT)
  fail(`expected ${IAU_CONSTELLATION_COUNT} constellations, found ${CONSTELLATIONS.length}`)
else pass(`all ${IAU_CONSTELLATION_COUNT} IAU constellations present`)

const abbrs = CONSTELLATIONS.map((c) => c.abbr)
if (abbrs.some((a) => !/^[A-Z][A-Za-z]{2}$/.test(a)))
  fail(`malformed abbreviation: ${abbrs.filter((a) => !/^[A-Z][A-Za-z]{2}$/.test(a)).join(', ')}`)
else pass('all abbreviations are well-formed three-letter IAU codes')

const ranks = CONSTELLATIONS.map((c) => c.areaRank).sort((a, b) => a - b)
const expected = Array.from({ length: 88 }, (_, i) => i + 1)
if (JSON.stringify(ranks) !== JSON.stringify(expected)) fail('areaRank is not a clean 1..88 permutation')
else pass('areaRank is a complete 1..88 permutation (Hydra largest, Crux smallest)')

if (ZODIAC.length !== 12 || !ZODIAC.every((z) => constellationById(z)))
  fail('zodiac list is incomplete or contains unresolvable ids')
else pass('all 12 zodiac constellations resolve')

const missingGenitive = CONSTELLATIONS.filter((c) => !c.genitive || !c.english)
if (missingGenitive.length) fail(`missing genitive/english: ${missingGenitive.map((c) => c.id).join(', ')}`)
else pass('every constellation has genitive + English name')

/* The facts panel opens with `description`, so an entry without one renders a
 * blank paragraph above its facts. Written by hand, deliberately — the
 * alternative on the table was assembling a sentence from `english`,
 * `brightest` and `notable`, which produces 88 paragraphs that read like
 * assembled clauses in a catalogue where every other entry is written. A
 * minimum length is asserted because the failure mode is a stub, not an
 * absence. */
const MIN_DESCRIPTION = 80
const noDescription = CONSTELLATIONS.filter(
  (c) => !c.description || c.description.trim().length < MIN_DESCRIPTION,
)
if (noDescription.length)
  fail(
    `${noDescription.length} constellation(s) missing a written description ` +
      `(min ${MIN_DESCRIPTION} chars): ${noDescription.map((c) => c.abbr).join(', ')}`,
  )
else pass(`all ${CONSTELLATIONS.length} constellations carry a written description`)

/* The join that makes the sky layer surfaceable at all: every content entry
 * has to name a figure the catalogue actually draws, and every drawn figure
 * has to have something written about it. Both directions are clean today and
 * nothing else would notice if one rotted — a missing figure would light up
 * nothing, and an unwritten one would page to a blank panel. skyCatalog.js is
 * pure data (no imports), so it can be imported here outright. */
{
  const { FIGURE_SEGMENTS } = await import('../src/skyCatalog.js')
  const drawn = new Set(FIGURE_SEGMENTS.map((s) => s[0]))
  const noFigure = CONSTELLATIONS.filter((c) => !drawn.has(c.abbr)).map((c) => c.abbr)
  const noEntry = [...drawn].filter((a) => !abbrs.includes(a))
  if (noFigure.length) fail(`content with no drawn figure: ${noFigure.join(', ')}`)
  if (noEntry.length) fail(`drawn figure with no content entry: ${noEntry.join(', ')}`)
  if (!noFigure.length && !noEntry.length)
    pass(`all ${drawn.size} drawn figures join their content entry by abbr, both ways`)
}

/* 7 — placeholder sweep -------------------------------------------- */
console.log('\n[7] placeholder sweep')
const PLACEHOLDERS = /\b(TODO|TBD|FIXME|Lorem ipsum|XXX|placeholder)\b/i
let placeholders = 0
for (const m of MODULES) {
  const text = readFileSync(join(src, m), 'utf8')
  // "placeholder" legitimately appears in prose about other things; only flag
  // it inside a quoted string that looks like unfinished content.
  for (const [i, line] of text.split('\n').entries()) {
    if (PLACEHOLDERS.test(line) && /['"`]/.test(line)) {
      fail(`${m}:${i + 1} looks like unfinished content: ${line.trim().slice(0, 70)}`)
      placeholders++
    }
  }
}
if (!placeholders) pass('no placeholder text found')

/* 8 — reference tables vs. profiles --------------------------------- *
 * The tables and the profiles state the same numbers twice, so they can
 * disagree — and did: Antares carried mag 0.6 (the bright extreme of its
 * variation) against the ranking's 0.96. Structure checks can't see that
 * class of error, only a cross-reference can. Variables are compared on
 * their representative `mag`; `magRange` carries the variation.           */
console.log('\n[8] reference tables agree with profiles')
const byName = new Map(STAR_PROFILES.map((s) => [s.name, s]))
let disagreements = 0

for (const row of BRIGHTNESS_RANKING) {
  const star = byName.get(row.name)
  if (!star || typeof star.mag !== 'number') continue
  if (Math.abs(star.mag - row.mag) > 0.02) {
    fail(`${row.name}: profile mag ${star.mag} vs BRIGHTNESS_RANKING ${row.mag}`)
    disagreements++
  }
}
for (const row of NEAREST_RANKING) {
  const star = byName.get(row.name)
  if (!star || typeof star.distance !== 'number' || typeof row.distance !== 'number') continue
  if (Math.abs(star.distance - row.distance) > 0.05) {
    fail(`${row.name}: profile distance ${star.distance} ly vs NEAREST_RANKING ${row.distance} ly`)
    disagreements++
  }
}
for (const star of STAR_PROFILES) {
  if (!Array.isArray(star.magRange) || typeof star.mag !== 'number') continue
  const [lo, hi] = star.magRange
  if (star.mag < lo || star.mag > hi) {
    fail(`${star.name}: mag ${star.mag} falls outside magRange [${lo}, ${hi}]`)
    disagreements++
  }
}
if (!disagreements) pass('profiles and reference tables state the same numbers')

// The catalogue claims to cover "the brightest stars in Earth's sky", so a
// top-16 entry with no profile is a broken promise, not a gap. Alpha Centauri
// is exempt: it is ranked as a combined pair but profiled as A and B.
const topRanked = BRIGHTNESS_RANKING.filter((r) => r.rank <= 16 && r.name !== 'Alpha Centauri')
const unprofiled = topRanked.filter((r) => !byName.has(r.name))
if (unprofiled.length) fail(`top-16 stars without a profile: ${unprofiled.map((r) => r.name).join(', ')}`)
else pass(`all ${topRanked.length} top-16 brightest stars carry a profile`)

/* 10 — star profiles resolve to real catalogue stars ------------------ *
 * SK-2. A profile carries `name` and `designation`; the catalogue is keyed by
 * HR number. Nothing joined the two, so `hr` was added by hand — which means
 * it is exactly the kind of field that is wrong silently: a plausible number
 * points at a real star that is simply the wrong one, and a marker appears in
 * a confident, incorrect place.
 *
 * Position is the check that actually catches that. Magnitude is a weaker
 * signal here, because two of these genuinely disagree with the catalogue for
 * astronomical reasons rather than clerical ones — and both are already
 * declared in fields the profile carries:
 *
 *   eta-carinae  catalogue 6.21, profile 4.5. A luminous blue variable that
 *                was magnitude -0.8 in 1843 and 8th a century later. Its
 *                magRange [-1.0, 7.9] brackets the catalogue's value.
 *   acrux        catalogue 1.33, profile 0.76. The catalogue lists the
 *                component; the profile gives what the naked eye sees, which
 *                is the sum. Its `spectral` names both stars.
 *
 * So the magnitude rule has two escapes and both are read from data already
 * present, rather than from a list of exceptions maintained here.            */
console.log('\n[10] star profiles resolve to catalogue stars')
{
  const { STARS, HR_INDEX, figureDirection, figureRadius } = await import('../src/skyCatalog.js')
  const MAG_LIMIT = 7.5
  const MAG_TOLERANCE = 0.6
  // Each figure is measured against its OWN extent plus a margin, because one
  // number cannot describe both Crux (2.1 degrees across) and Hydra (62). A
  // fixed 25 was tried and failed on Achernar, which is a real member of
  // Eridanus sitting 36.9 degrees off centre — the river runs that far, and
  // the star's name means "end of the river". The margin covers members that
  // are not themselves endpoints of the drawn stick figure.
  const DEGREE_MARGIN = 8

  const abbrByName = new Map(CONSTELLATIONS.map((c) => [c.name, c.abbr]))
  let checked = 0
  let bad = 0

  // A bright profile with no `hr` is the failure that matters most: it is a
  // star the sky draws and the app cannot point at.
  const unmapped = STAR_PROFILES.filter(
    (p) => p.id !== 'sol' && typeof p.mag === 'number' && p.mag <= MAG_LIMIT && !p.hr,
  )
  if (unmapped.length) {
    fail(`bright profile(s) with no hr: ${unmapped.map((p) => p.id).join(', ')}`)
    bad += unmapped.length
  }

  for (const p of STAR_PROFILES) {
    if (!p.hr) continue
    checked += 1
    const i = HR_INDEX.get(p.hr)
    if (i === undefined) {
      fail(`${p.id}: HR ${p.hr} is not in the catalogue`)
      bad += 1
      continue
    }
    const s = STARS[i]
    const dir = abbrByName.has(p.constellation)
      ? figureDirection(abbrByName.get(p.constellation))
      : null
    if (dir) {
      const dot = Math.max(-1, Math.min(1, s[1] * dir[0] + s[2] * dir[1] + s[3] * dir[2]))
      const deg = (Math.acos(dot) * 180) / Math.PI
      const reach = (figureRadius(abbrByName.get(p.constellation)) ?? 0) + DEGREE_MARGIN
      if (deg > reach) {
        fail(
          `${p.id}: HR ${p.hr} sits ${deg.toFixed(1)}° from the centre of ` +
            `${p.constellation}, which only reaches ${reach.toFixed(1)}° — wrong star`,
        )
        bad += 1
        continue
      }
    }
    const catMag = s[4]
    const varies = Array.isArray(p.magRange) && catMag >= p.magRange[0] && catMag <= p.magRange[1]
    const multiple = typeof p.spectral === 'string' && p.spectral.includes('+')
    if (Math.abs(catMag - p.mag) > MAG_TOLERANCE && !varies && !multiple) {
      fail(
        `${p.id}: catalogue magnitude ${catMag} against profile ${p.mag}, ` +
          `and neither magRange nor a multiple spectral type explains it`,
      )
      bad += 1
    }
  }
  if (!bad)
    pass(
      `${checked} star profiles resolve, sit inside their own constellation's ` +
        `reach, and agree on magnitude`,
    )

  const faint = STAR_PROFILES.filter((p) => p.id !== 'sol' && !p.hr)
  console.log(
    `  .. ${faint.length} profile(s) fainter than V ${MAG_LIMIT} carry no hr and ` +
      `are not drawn: ${faint.map((p) => p.name).join(', ')}`,
  )
}

/* 9 — Local Group star budget --------------------------------------- *
 * LocalGroup.jsx opens with a budget rule: every member's `count` together
 * sums to exactly 24,000, so the whole group rung costs what the single
 * galaxy view costs. That was a comment and nothing more, which is a
 * dangerous shape for an invariant — adding a member is a two-line edit and
 * blowing the budget is invisible until someone profiles a phone. The file
 * is read as TEXT because it is JSX and node cannot import it; the same
 * reason Sky.jsx is read as text in the shots gate.                       */
console.log('\n[9] Local Group star budget')
{
  const BUDGET = 24_000
  const text = readFileSync(join(src, 'LocalGroup.jsx'), 'utf8')
  const members = [...text.matchAll(/id: '([^']+)',\s*\n\s*cfg: \{[^}]*?count: (\d+)/g)]
  if (!members.length) {
    fail('could not read any member counts out of LocalGroup.jsx')
  } else {
    const total = members.reduce((n, m) => n + Number(m[2]), 0)
    if (total !== BUDGET)
      fail(
        `the ${members.length} Local Group members spend ${total.toLocaleString()} stars, ` +
        `not the ${BUDGET.toLocaleString()} the budget rule promises ` +
        `(${total > BUDGET ? '+' : ''}${(total - BUDGET).toLocaleString()})`,
      )
    else pass(`${members.length} members spend exactly ${BUDGET.toLocaleString()} stars`)
  }
}

/* summary ----------------------------------------------------------- */
console.log('\n─────────────────────────────────────────')
console.log(`entries          ${entryCount}`)
console.log(`  foundations    ${STELLAR_FOUNDATIONS.length}`)
console.log(`  star profiles  ${STAR_PROFILES.length}`)
console.log(`  constellations ${CONSTELLATIONS.length}`)
console.log(`  sky cultures   ${SKY_CULTURES.length}`)
console.log(`facts (kids)     ${kidsFactCount}`)
console.log(`facts (advanced) ${advFactCount}`)
console.log(`facts total      ${kidsFactCount + advFactCount}`)
console.log(`reference tables ${
  [BRIGHTNESS_RANKING, NEAREST_RANKING, POLE_STAR_CHRONOLOGY].reduce((n, t) => n + t.length, 0)
} rows`)
console.log('─────────────────────────────────────────')

if (failures) {
  console.error(`\nFAIL — ${failures} problem(s).\n`)
  process.exit(1)
}
console.log('\nPASS — astronomy content gate clean.\n')
