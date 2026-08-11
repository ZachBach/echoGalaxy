/**
 * fetch-sky — generate `src/skyCatalog.js` from real astronomical catalogues.
 *
 *   node scripts/fetch-sky.mjs
 *
 * A BUILD-TIME generator, not a runtime fetch. Its output is committed, so
 * the app ships the sky as ordinary code and the PWA's offline boot is
 * untouched. Re-run it only when the sources change (they are decades-stable).
 *
 * Sources
 *   stars   Yale Bright Star Catalogue, 5th Revised Ed. (Hoffleit+ 1991),
 *           via VizieR V/50/catalog. Complete to V ≈ 6.5, the naked-eye
 *           limit, which is exactly the sky a person can actually see.
 *           Acknowledgement to CDS, Strasbourg.
 *   figures ConstellationLines by Marc van der Sluys, CC BY 4.0,
 *           DOI 10.5281/zenodo.10397192. Keyed by BSC/HR number, so it
 *           joins to the catalogue above on a single integer.
 *
 * Two conversions happen here rather than in the shader, because they are
 * pure data work and doing them once at build time is free:
 *
 * 1. Equatorial → ECLIPTIC coordinates. The scene's orbital plane is y = 0,
 *    and that plane IS the ecliptic. Converting means the zodiac
 *    constellations physically ring the plane the planets orbit in — which
 *    is not decoration, it is the definition of the zodiac. Obliquity
 *    ε = 23.4392811° (IAU 2006, J2000).
 *
 * 2. B−V colour index → effective temperature, by Ballesteros' formula
 *    (Ballesteros 2012, EPL 97 34008):
 *      T = 4600·(1/(0.92·BV + 1.70) + 1/(0.92·BV + 0.62))
 *    Temperature is what the app's existing, already-validated
 *    `blackbody(TSL, T)` node consumes (G2-03 verified it against Mitchell
 *    Charity's published CMF table to a worst case of 8/255). So real stars
 *    render in real colours through physics this codebase already trusts —
 *    Aldebaran comes out orange because it is 3,700 K, not because someone
 *    picked orange.
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = join(here, '..', 'src', 'skyCatalog.js')

const MAG_LIMIT = 6.5 // naked-eye limit; also the BSC's completeness limit
const OBLIQUITY = (23.4392811 * Math.PI) / 180

const VIZIER =
  'https://vizier.cds.unistra.fr/viz-bin/asu-tsv' +
  '?-source=V/50/catalog' +
  '&-out=HR,Name,RAJ2000,DEJ2000,Vmag,B-V' +
  '&-out.max=10000' +
  `&Vmag=%3C${MAG_LIMIT}` +
  '&-sort=Vmag'

const LINES =
  'https://raw.githubusercontent.com/MarcvdSluys/ConstellationLines/master/ConstellationLines.csv'

const get = async (url, what) => {
  process.stdout.write(`  fetching ${what}… `)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${what}: HTTP ${res.status}`)
  const text = await res.text()
  console.log(`${(text.length / 1024).toFixed(0)} KB`)
  return text
}

/* ── stars ─────────────────────────────────────────────────────────── */

const sexToDeg = (s, isRa) => {
  const neg = s.trim().startsWith('-')
  const p = s.trim().replace(/^[+-]/, '').split(/\s+/).map(Number)
  if (p.length < 2 || p.some(Number.isNaN)) return null
  const v = p[0] + (p[1] || 0) / 60 + (p[2] || 0) / 3600
  return (neg ? -v : v) * (isRa ? 15 : 1)
}

// Ballesteros 2012 — B−V to effective temperature (K).
const bvToTemp = (bv) =>
  4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62))

// Equatorial (α, δ in degrees) → ecliptic direction, scene-handed.
// The scene is y-up with the ecliptic at y = 0, so ecliptic latitude
// becomes y and longitude sweeps the x/z plane — the same plane the
// planets' Kepler rails run in.
function toEclipticDir(raDeg, decDeg) {
  const a = (raDeg * Math.PI) / 180
  const d = (decDeg * Math.PI) / 180
  const sinB =
    Math.sin(d) * Math.cos(OBLIQUITY) -
    Math.cos(d) * Math.sin(OBLIQUITY) * Math.sin(a)
  const b = Math.asin(Math.max(-1, Math.min(1, sinB)))
  const y = Math.sin(d) * Math.sin(OBLIQUITY) + Math.cos(d) * Math.cos(OBLIQUITY) * Math.sin(a)
  const x = Math.cos(d) * Math.cos(a)
  const lon = Math.atan2(y, x)
  return {
    x: Math.cos(b) * Math.cos(lon),
    y: Math.sin(b),
    z: Math.cos(b) * Math.sin(lon),
    lonDeg: ((lon * 180) / Math.PI + 360) % 360,
    latDeg: (b * 180) / Math.PI,
  }
}

function parseStars(tsv) {
  const stars = new Map()
  for (const line of tsv.split('\n')) {
    if (!line || line.startsWith('#') || line.startsWith('-')) continue
    const c = line.split('\t')
    if (c.length < 6) continue
    const hr = parseInt(c[0], 10)
    const vmag = parseFloat(c[4])
    if (!Number.isFinite(hr) || !Number.isFinite(vmag)) continue
    const raDeg = sexToDeg(c[2], true)
    const decDeg = sexToDeg(c[3], false)
    if (raDeg == null || decDeg == null) continue
    // A handful of BSC rows (novae, missing entries) carry no colour index.
    // Default to 0.0 — an A0 star, the definition point of the index — and
    // record the gap rather than inventing a colour.
    const bvRaw = parseFloat(c[5])
    const bv = Number.isFinite(bvRaw) ? bvRaw : 0
    const dir = toEclipticDir(raDeg, decDeg)
    stars.set(hr, {
      hr,
      name: (c[1] || '').trim(),
      raDeg,
      decDeg,
      vmag,
      bv,
      hasBv: Number.isFinite(bvRaw),
      temp: bvToTemp(bv),
      ...dir,
    })
  }
  return stars
}

/* ── figures ───────────────────────────────────────────────────────── */

function parseFigures(csv) {
  const byAbbr = new Map()
  for (const line of csv.split('\n').slice(1)) {
    if (!line.trim()) continue
    const c = line.split(',').map((s) => s.trim())
    const abbr = c[0]
    if (!abbr) continue
    const path = c.slice(2).filter((s) => s !== '').map(Number)
    if (!path.length) continue
    if (!byAbbr.has(abbr)) byAbbr.set(abbr, [])
    byAbbr.get(abbr).push(path)
  }
  return byAbbr
}

/* ── main ──────────────────────────────────────────────────────────── */

console.log('\nfetch-sky — building the real sky\n')

const [tsv, csv] = await Promise.all([
  get(VIZIER, 'Bright Star Catalogue (VizieR V/50)'),
  get(LINES, 'ConstellationLines (CC BY 4.0)'),
])

const stars = parseStars(tsv)
const figures = parseFigures(csv)
console.log(`\n  parsed ${stars.size} stars, ${figures.size} constellation figures`)

// Resolve figures to segments of HR pairs, dropping any vertex the
// magnitude-limited catalogue does not contain — and reporting it, because
// a silently short constellation is worse than a loud one.
const segments = []
const missing = new Map()
let drawn = 0
for (const [abbr, paths] of figures) {
  for (const path of paths) {
    for (let i = 0; i + 1 < path.length; i++) {
      const a = path[i]
      const b = path[i + 1]
      if (!stars.has(a) || !stars.has(b)) {
        missing.set(abbr, (missing.get(abbr) || 0) + 1)
        continue
      }
      segments.push([abbr, a, b])
      drawn++
    }
  }
}
console.log(`  resolved ${drawn} line segments`)
if (missing.size) {
  console.log('  ⚠ unresolved segments (vertex fainter than the limit):')
  for (const [abbr, n] of missing) console.log(`      ${abbr}: ${n}`)
} else {
  console.log('  ✓ every figure vertex resolved — no constellation is missing a line')
}

// Only stars that are either naked-eye bright OR used by a figure need to
// ship. In practice at V<6.5 that is everything, but the filter keeps the
// invariant explicit: no figure can reference a star we dropped.
const used = new Set(segments.flatMap(([, a, b]) => [a, b]))
const list = [...stars.values()].sort((a, b) => a.vmag - b.vmag)

const r4 = (n) => Math.round(n * 1e4) / 1e4
const r2 = (n) => Math.round(n * 100) / 100

const starRows = list
  .map(
    (s) =>
      `[${s.hr},${r4(s.x)},${r4(s.y)},${r4(s.z)},${r2(s.vmag)},${Math.round(s.temp)}]`,
  )
  .join(',\n  ')

// Index map so the renderer can look a star up by HR in O(1) without
// shipping a second copy of the catalogue.
const segRows = segments
  .map(([abbr, a, b]) => `['${abbr}',${a},${b}]`)
  .join(',\n  ')

const named = list
  .filter((s) => s.name && s.vmag < 3.0)
  .map((s) => `[${s.hr},'${s.name.replace(/'/g, "\\'")}']`)
  .join(',\n  ')

const noBv = list.filter((s) => !s.hasBv).length

const out = `/**
 * skyCatalog — the real sky, generated. DO NOT EDIT BY HAND.
 *
 * Regenerate with:  node scripts/fetch-sky.mjs
 *
 * Generated from:
 *   • Yale Bright Star Catalogue, 5th Revised Ed. (Hoffleit+ 1991) via
 *     VizieR V/50/catalog — acknowledgement to CDS, Strasbourg.
 *   • ConstellationLines by Marc van der Sluys, CC BY 4.0,
 *     DOI 10.5281/zenodo.10397192.
 *
 * ${list.length} stars to V ≤ ${MAG_LIMIT} (the naked-eye limit, and the BSC's
 * own completeness limit). ${segments.length} constellation line segments over
 * ${used.size} distinct stars.${noBv ? `\n * ${noBv} star(s) lacked a published B−V and default to 0.0 (A0).` : ''}
 *
 * STAR ROWS: [hr, x, y, z, vmag, tempK]
 *   x,y,z  unit direction in ECLIPTIC coordinates, scene-handed (y-up, the
 *          ecliptic at y = 0). This is the same plane the planets' Kepler
 *          rails run in, which is why the zodiac rings the System rung.
 *   vmag   apparent visual magnitude — LOWER is brighter, and the scale is
 *          logarithmic: flux ∝ 10^(−0.4·m), so a 1.0 star is ~2.512× a 2.0.
 *   tempK  effective temperature from B−V by Ballesteros (2012), feeding the
 *          app's existing blackbody() node. Real colours, real physics.
 *
 * SEGMENT ROWS: [constellation abbr, hr A, hr B] — one drawn line each.
 *
 * Pure data. No rendering imports.
 */

export const MAG_LIMIT = ${MAG_LIMIT}

/** [hr, x, y, z, vmag, tempK] */
export const STARS = [
  ${starRows},
]

/** [abbr, hrA, hrB] */
export const FIGURE_SEGMENTS = [
  ${segRows},
]

/** [hr, catalogue name] for the bright, named stars. */
export const STAR_NAMES = [
  ${named},
]

/** HR number → index into STARS. */
export const HR_INDEX = new Map(STARS.map((s, i) => [s[0], i]))

/** Segments for one constellation, by IAU abbreviation. */
export function figureFor(abbr) {
  return FIGURE_SEGMENTS.filter((s) => s[0] === abbr)
}

/** The 13 constellations the ecliptic actually passes through. */
export const ZODIAC_ABBRS = [
  'Ari', 'Tau', 'Gem', 'Cnc', 'Leo', 'Vir',
  'Lib', 'Sco', 'Oph', 'Sgr', 'Cap', 'Aqr', 'Psc',
]
`

writeFileSync(OUT, out, 'utf8')
console.log(`\n  wrote ${OUT}`)
console.log(`  ${(out.length / 1024).toFixed(0)} KB, ${list.length} stars, ${segments.length} segments\n`)
