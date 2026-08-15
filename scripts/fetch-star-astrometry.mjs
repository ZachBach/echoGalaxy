/**
 * fetch-star-astrometry — positions for the catalogue stars that the sky
 * catalogue structurally cannot contain. Writes src/starAstrometry.js.
 *
 *   node scripts/fetch-star-astrometry.mjs [--dry]
 *
 * WHY THIS EXISTS, given skyCatalog.js already holds 8,355 stars.
 *
 * skyCatalog is built from the Yale Bright Star Catalogue, which is complete
 * to V ≈ 6.5 — the naked-eye limit. That is the right basis for drawing a sky
 * a person could actually stand under, and for the 27 bright profile stars it
 * is the source of record. This module does not duplicate those.
 *
 * But a naked-eye catalogue structurally excludes our nearest neighbours.
 * Proxima Centauri is the closest star to the Sun and sits at V 11.1; Barnard's
 * Star, Wolf 359 and Teegarden's Star are likewise invisible to the eye. Nearby
 * red dwarfs are dim, so the "closest stellar systems" section of starData.js
 * describes stars that can never be drawn from the BSC. The same holds at the
 * other extreme — VY Canis Majoris, UY Scuti and R136a1 are luminous but far,
 * and Sirius B is drowned by its own primary.
 *
 * So the selection here is DERIVED, never hand-listed: every profile star whose
 * apparent magnitude falls below skyCatalog's own MAG_LIMIT. Add a faint star
 * to the catalogue, or change the limit, and re-running this picks it up.
 *
 * Source: SIMBAD Astronomical Database, Centre de Données astronomiques de
 * Strasbourg (CDS) — a BACKLOG Tier-1 source — over its TAP/ADQL endpoint,
 * `basic` joined to `ident` so proper names and Bayer designations both
 * resolve. Wenger et al. 2000, A&AS 143, 9.
 *
 * Two SIMBAD quirks, both learned the hard way and neither inferable:
 *   • Casing differs per object: "NAME Barnard's star" but
 *     "NAME Teegarden's Star".
 *   • Catalogue numbers carry variable internal padding ("G  45-20",
 *     "GCRV  6780"), so the literal "Wolf 359" does not match; GJ 406 does.
 * Identifiers are therefore curated below rather than derived from names.
 */

const TAP = 'https://simbad.cds.unistra.fr/simbad/sim-tap/sync'
const FALLBACK_MAG_LIMIT = 6.5
const PC_TO_LY = 3.2615638
// Heuristic only: the threshold at which a parallax-implied distance is
// treated as contradicting the catalogue rather than merely rounding against
// it. Nearby stars here agree to within 1.3%, so anything past 10% is a real
// disagreement worth surfacing, not noise.
const DISAGREE_PCT = 10

// echoGalaxy star id -> the identifier SIMBAD keys on. Covers the whole
// profile catalogue; the magnitude filter below decides which are written.
// The Sun is absent by design — it has no fixed equatorial coordinate, which
// is a category error rather than a missing value.
const SIMBAD_ID = {
  'proxima-centauri': '* alf Cen C',
  'alpha-centauri-a': '* alf Cen A',
  'alpha-centauri-b': '* alf Cen B',
  'barnards-star': "NAME Barnard's star",
  'wolf-359': 'GJ 406',
  'sirius-b': '* alf CMa B',
  'epsilon-eridani': '* eps Eri',
  'tau-ceti': '* tau Cet',
  'teegardens-star': "NAME Teegarden's Star",
  sirius: 'NAME Sirius',
  canopus: '* alf Car',
  arcturus: '* alf Boo',
  vega: 'NAME Vega',
  capella: '* alf Aur',
  rigel: '* bet Ori',
  procyon: '* alf CMi',
  achernar: '* alf Eri',
  hadar: '* bet Cen',
  altair: '* alf Aql',
  acrux: '* alf Cru',
  aldebaran: '* alf Tau',
  antares: '* alf Sco',
  spica: '* alf Vir',
  polaris: '* alf UMi',
  thuban: '* alf Dra',
  deneb: '* alf Cyg',
  regulus: '* alf Leo',
  fomalhaut: '* alf PsA',
  betelgeuse: 'NAME Betelgeuse',
  alnitak: '* zet Ori',
  alnilam: '* eps Ori',
  mintaka: '* del Ori',
  'mu-cephei': '* mu. Cep',
  'vy-canis-majoris': 'V* VY CMa',
  'uy-scuti': 'V* UY Sct',
  'eta-carinae': '* eta Car',
  r136a1: 'RMC 136a1',
  'p-cygni': '* P Cyg',
}

const { STAR_PROFILES } = await import('../src/starData.js')

let MAG_LIMIT = FALLBACK_MAG_LIMIT
try {
  ;({ MAG_LIMIT } = await import('../src/skyCatalog.js'))
} catch {
  console.warn(`skyCatalog.js not importable — falling back to V <= ${FALLBACK_MAG_LIMIT}`)
}

// The derived gap: profile stars too faint for the bright-star catalogue.
const gap = STAR_PROFILES.filter(
  (p) => p.id !== 'sol' && SIMBAD_ID[p.id] && typeof p.mag === 'number' && p.mag > MAG_LIMIT,
)
if (!gap.length) {
  console.error('No profile star falls below the sky catalogue limit — nothing to write.')
  process.exit(1)
}
console.log(`sky catalogue limit V <= ${MAG_LIMIT}; ${gap.length} profile star(s) fall below it`)

const q = (s) => `'${s.replace(/'/g, "''")}'`
const ADQL = `SELECT b.main_id, b.ra, b.dec, b.plx_value, b.sp_type, b.otype_txt, i.id
FROM basic AS b JOIN ident AS i ON i.oidref = b.oid
WHERE i.id IN (${gap.map((p) => q(SIMBAD_ID[p.id])).join(',')})`

// Minimal RFC4180 reader — SIMBAD quotes fields containing commas.
function parseCsv(text) {
  const rows = []
  let row = [], field = '', inQ = false
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i]
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i += 1 } else inQ = false }
      else field += c
    } else if (c === '"') inQ = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c !== '\r') field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  const head = rows.shift()
  return rows.filter((r) => r.length === head.length).map((r) => Object.fromEntries(head.map((h, j) => [h, r[j]])))
}

const res = await fetch(TAP, {
  method: 'POST',
  body: new URLSearchParams({ request: 'doQuery', lang: 'adql', format: 'csv', query: ADQL }),
})
if (!res.ok) { console.error(`SIMBAD returned ${res.status}`); process.exit(1) }
const byQueried = new Map(parseCsv(await res.text()).map((r) => [r.id, r]))

const out = []
const missing = []
for (const p of gap) {
  const r = byQueried.get(SIMBAD_ID[p.id])
  if (!r || !r.ra) { missing.push(`${p.id} (${SIMBAD_ID[p.id]})`); continue }
  const plxMas = r.plx_value ? Number(r.plx_value) : null
  // Cross-check: a trigonometric parallax implies a distance. Where that
  // disagrees sharply with the catalogue's published figure, the parallax is
  // usually the weaker measurement, not the catalogue — both offenders here
  // are dust-enshrouded red supergiants whose accepted distances come from
  // VLBI maser astrometry rather than optical parallax. Flag rather than
  // "correct", and never silently overwrite starData.
  const impliedLy = plxMas ? (1000 / plxMas) * PC_TO_LY : null
  const disagreesPct =
    impliedLy && typeof p.distance === 'number'
      ? (100 * (impliedLy - p.distance)) / p.distance
      : null
  out.push({
    id: p.id,
    name: p.name,
    simbad: r.main_id,
    vmag: p.mag,
    ra: Number(Number(r.ra).toFixed(6)),
    dec: Number(Number(r.dec).toFixed(6)),
    plxMas,
    spectralSimbad: r.sp_type || null,
    otype: r.otype_txt || null,
    // True when this parallax must NOT be used to derive a distance.
    parallaxUnreliable: disagreesPct != null && Math.abs(disagreesPct) > DISAGREE_PCT,
    ...(disagreesPct != null && Math.abs(disagreesPct) > DISAGREE_PCT
      ? {
          impliedLy: Number(impliedLy.toFixed(0)),
          catalogueLy: p.distance,
          disagreesPct: Number(disagreesPct.toFixed(1)),
        }
      : {}),
  })
}
out.sort((a, b) => a.id.localeCompare(b.id))

console.log(`resolved ${out.length}/${gap.length}`)
if (missing.length) console.error(`MISSING (${missing.length}): ${missing.join(', ')}`)

if (process.argv.includes('--dry')) {
  console.log(out.map((o) => `  ${o.id.padEnd(18)} V ${String(o.vmag).padStart(6)}  ${String(o.ra).padStart(11)} ${String(o.dec).padStart(11)}  ${o.spectralSimbad ?? ''}`).join('\n'))
  process.exit(missing.length ? 1 : 0)
}

const stamp = new Date().toISOString().slice(0, 10)
const file = `/**
 * starAstrometry — positions for catalogue stars the sky catalogue cannot
 * hold. GENERATED, do not hand-edit.
 *
 *   node scripts/fetch-star-astrometry.mjs
 *
 * Complementary to skyCatalog.js, not a competing copy of it. skyCatalog is
 * built from the Yale Bright Star Catalogue and is complete to V <= ${MAG_LIMIT},
 * the naked-eye limit; for the bright profile stars it remains the source of
 * record and nothing here duplicates them.
 *
 * These ${out.length} are the stars that limit structurally excludes. Most are
 * near neighbours — nearby red dwarfs are dim, so the closest stars to the Sun
 * are invisible to a naked-eye catalogue — and the rest are the far extremes.
 * The set is derived from the magnitude limit at generation time, never
 * hand-listed.
 *
 * Join key is the echoGalaxy star id, so a profile in starData.js resolves to
 * a position directly, without matching on Bayer designations.
 *
 * ra, dec   ICRS decimal degrees, J2000 equinox. NOT converted to the scene's
 *           ecliptic frame — skyCatalog does that at generation time, and
 *           doing it in two places invites the two to disagree. Convert at the
 *           point of use with the same obliquity skyCatalog cites.
 * plxMas    trigonometric parallax, milliarcseconds (null where SIMBAD has
 *           none — R136a1 in the LMC is far too distant for one).
 * parallaxUnreliable
 *           DO NOT derive a distance from plxMas when this is true. The
 *           nearby stars here agree with starData's published distances to
 *           within 1.3%, which independently validates both. The exceptions
 *           are dust-enshrouded red supergiants, where an optical parallax
 *           is the weaker measurement and the accepted distance comes from
 *           VLBI maser astrometry instead. Those entries also carry
 *           impliedLy / catalogueLy / disagreesPct so the conflict is
 *           visible rather than buried. starData is not overwritten.
 * vmag      apparent V from starData.js, carried so the exclusion is auditable.
 * spectralSimbad
 *           SIMBAD's spectral type, kept beside starData's editorial
 *           \`spectral\` string so the two can be compared rather than
 *           silently diverging.
 *
 * Source: SIMBAD (CDS), queried ${stamp} over TAP/ADQL, \`basic\` joined to
 * \`ident\`. A BACKLOG Tier-1 source. Wenger et al. 2000, A&AS 143, 9.
 *
 * Pure data. No rendering imports.
 */

/** The sky-catalogue magnitude limit these stars fall below, at generation. */
export const EXCLUDED_BELOW_VMAG = ${MAG_LIMIT}

export const STAR_ASTROMETRY = ${JSON.stringify(out, null, 2)}

export const ASTROMETRY_SOURCE = {
  name: 'SIMBAD Astronomical Database — CDS, Strasbourg',
  tier: 1,
  url: 'https://simbad.cds.unistra.fr/',
  citation: 'Wenger et al. 2000, A&AS 143, 9',
  queried: '${stamp}',
  frame: 'ICRS / J2000',
}

/** Look up astrometry by echoGalaxy star id. Returns null for bright stars,
 *  which live in skyCatalog instead. */
export function astrometryFor(id) {
  return STAR_ASTROMETRY.find((s) => s.id === id) ?? null
}
`

const { writeFileSync } = await import('node:fs')
writeFileSync(new URL('../src/starAstrometry.js', import.meta.url), file)
console.log(`wrote src/starAstrometry.js (${out.length} stars)`)
process.exit(missing.length ? 1 : 0)
