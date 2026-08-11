/**
 * starAstrometry — positions for catalogue stars the sky catalogue cannot
 * hold. GENERATED, do not hand-edit.
 *
 *   node scripts/fetch-star-astrometry.mjs
 *
 * Complementary to skyCatalog.js, not a competing copy of it. skyCatalog is
 * built from the Yale Bright Star Catalogue and is complete to V <= 6.5,
 * the naked-eye limit; for the bright profile stars it remains the source of
 * record and nothing here duplicates them.
 *
 * These 8 are the stars that limit structurally excludes. Most are
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
 *           `spectral` string so the two can be compared rather than
 *           silently diverging.
 *
 * Source: SIMBAD (CDS), queried 2026-08-11 over TAP/ADQL, `basic` joined to
 * `ident`. A BACKLOG Tier-1 source. Wenger et al. 2000, A&AS 143, 9.
 *
 * Pure data. No rendering imports.
 */

/** The sky-catalogue magnitude limit these stars fall below, at generation. */
export const EXCLUDED_BELOW_VMAG = 6.5

export const STAR_ASTROMETRY = [
  {
    "id": "barnards-star",
    "name": "Barnard's Star",
    "simbad": "NAME Barnard's star",
    "vmag": 9.51,
    "ra": 269.452077,
    "dec": 4.693365,
    "plxMas": 546.9759,
    "spectralSimbad": "M4V",
    "otype": "BY*",
    "parallaxUnreliable": false
  },
  {
    "id": "proxima-centauri",
    "name": "Proxima Centauri",
    "simbad": "NAME Proxima Centauri",
    "vmag": 11.13,
    "ra": 217.428942,
    "dec": -62.67949,
    "plxMas": 768.0665,
    "spectralSimbad": "M5.5Ve",
    "otype": "PM*",
    "parallaxUnreliable": false
  },
  {
    "id": "r136a1",
    "name": "R136a1",
    "simbad": "BAT99 108",
    "vmag": 12.23,
    "ra": 84.67665,
    "dec": -69.100797,
    "plxMas": null,
    "spectralSimbad": "WN5h",
    "otype": "WR*",
    "parallaxUnreliable": false
  },
  {
    "id": "sirius-b",
    "name": "Sirius B",
    "simbad": "* alf CMa B",
    "vmag": 8.44,
    "ra": 101.288767,
    "dec": -16.716868,
    "plxMas": 374.4896,
    "spectralSimbad": "DA1.9",
    "otype": "WD*",
    "parallaxUnreliable": false
  },
  {
    "id": "teegardens-star",
    "name": "Teegarden's Star",
    "simbad": "NAME Teegarden's Star",
    "vmag": 15.13,
    "ra": 43.253716,
    "dec": 16.881287,
    "plxMas": 260.9884,
    "spectralSimbad": "dM6",
    "otype": "LM*",
    "parallaxUnreliable": false
  },
  {
    "id": "uy-scuti",
    "name": "UY Scuti",
    "simbad": "V* UY Sct",
    "vmag": 9,
    "ra": 276.902201,
    "dec": -12.466361,
    "plxMas": 0.5166,
    "spectralSimbad": "M4Iae",
    "otype": "s*r",
    "parallaxUnreliable": true,
    "impliedLy": 6314,
    "catalogueLy": 5100,
    "disagreesPct": 23.8
  },
  {
    "id": "vy-canis-majoris",
    "name": "VY Canis Majoris",
    "simbad": "V* VY CMa",
    "vmag": 7.95,
    "ra": 110.743026,
    "dec": -25.767554,
    "plxMas": 0.4192,
    "spectralSimbad": "M5Iae",
    "otype": "s*r",
    "parallaxUnreliable": true,
    "impliedLy": 7780,
    "catalogueLy": 3900,
    "disagreesPct": 99.5
  },
  {
    "id": "wolf-359",
    "name": "Wolf 359",
    "simbad": "Wolf  359",
    "vmag": 13.54,
    "ra": 164.120504,
    "dec": 7.014723,
    "plxMas": 415.1794,
    "spectralSimbad": "dM6",
    "otype": "PM*",
    "parallaxUnreliable": false
  }
]

export const ASTROMETRY_SOURCE = {
  name: 'SIMBAD Astronomical Database — CDS, Strasbourg',
  tier: 1,
  url: 'https://simbad.cds.unistra.fr/',
  citation: 'Wenger et al. 2000, A&AS 143, 9',
  queried: '2026-08-11',
  frame: 'ICRS / J2000',
}

/** Look up astrometry by echoGalaxy star id. Returns null for bright stars,
 *  which live in skyCatalog instead. */
export function astrometryFor(id) {
  return STAR_ASTROMETRY.find((s) => s.id === id) ?? null
}
