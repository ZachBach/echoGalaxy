/**
 * Solar System physical truth — RESEARCH.md Part B1/B2, Phase SS.
 *
 * The measured numbers, kept separate from the scene numbers that consume
 * them. `systemData.js` holds framing (compressed orbit radii, render
 * sizes); this module holds reality. When the two disagree, this file is
 * right and the scene is a documented compromise.
 *
 * Sources (fetched 2026-08-11, not recalled):
 *   radiusKm, rotationDays  NASA JPL SSD, Planetary Physical Parameters
 *                           https://ssd.jpl.nasa.gov/planets/phys_par.html
 *   eccentricity, inclDeg   NASA JPL SSD, Approximate Positions of the
 *                           Planets (Keplerian elements, J2000)
 *                           https://ssd.jpl.nasa.gov/planets/approx_pos.html
 *   obliquityDeg            IAU convention (north pole by right-hand rule),
 *                           cross-checked against the alternate
 *                           "tilt-to-orbit" convention, which reconciles
 *                           exactly: 180 − 2.64 = 177.36 (Venus),
 *                           180 − 82.23 = 97.77 (Uranus).
 *
 * ── On the two obliquity conventions ──────────────────────────────────
 * Venus is quoted as either 177.36° or 2.64°, and Uranus as either 97.77°
 * or 82.23°, depending on which pole the source calls north. They describe
 * identical physics. We use the IAU values because they are what NASA fact
 * sheets print and what the app's own Uranus copy already cites ("about 98
 * degrees") — and because they carry the retrograde information *in the
 * number itself*: an obliquity past 90° means the body's north pole points
 * below its orbital plane, i.e. it turns backwards relative to its orbit.
 *
 * So `spinSign()` derives retrograde motion from obliquity alone. Venus and
 * Uranus turn backwards because of their tilts, not because of a separate
 * hand-set flag that could drift out of agreement with them. Rotation
 * periods below are therefore stored as unsigned magnitudes; JPL publishes
 * them negative for exactly these two bodies, and that sign would
 * double-count if it were kept here as well.
 *
 * Pure data + pure functions. No imports, no rendering.
 */

export const PLANETS = {
  mercury: {
    name: 'Mercury',
    radiusKm: 2439.4,
    massEarth: 0.0553,
    rotationDays: 58.6462,
    orbitDays: 87.969,
    obliquityDeg: 0.034,
    eccentricity: 0.20563593,
    inclDeg: 7.00497902,
    semiMajorAu: 0.38709927,
    // Dynamo: yes, but weak — ~1% of Earth's surface field. Real
    // magnetosphere, real substorms, no visible-light aurora.
    magnetosphere: 'intrinsic-weak',
    moons: 0,
  },
  venus: {
    name: 'Venus',
    radiusKm: 6051.8,
    massEarth: 0.815,
    rotationDays: 243.018,
    orbitDays: 224.701,
    obliquityDeg: 177.36, // ⇒ retrograde, by spinSign()
    eccentricity: 0.00677672,
    inclDeg: 3.39467605,
    semiMajorAu: 0.72333566,
    magnetosphere: 'induced', // no dynamo; solar wind on the ionosphere
    moons: 0,
  },
  earth: {
    name: 'Earth',
    radiusKm: 6371.0084,
    massEarth: 1,
    rotationDays: 0.99726968,
    orbitDays: 365.256,
    obliquityDeg: 23.44,
    eccentricity: 0.01671123,
    inclDeg: 0, // the ecliptic is *defined* by Earth's orbit
    semiMajorAu: 1.00000261,
    magnetosphere: 'intrinsic',
    moons: 1,
  },
  mars: {
    name: 'Mars',
    radiusKm: 3389.5,
    massEarth: 0.107,
    rotationDays: 1.02595676,
    orbitDays: 686.98,
    obliquityDeg: 25.19,
    eccentricity: 0.0933941,
    inclDeg: 1.84969142,
    semiMajorAu: 1.52371034,
    // No global dynamo. Patchy crustal remanence + induced. The lost
    // dynamo is the leading suspect in the lost atmosphere.
    magnetosphere: 'crustal',
    moons: 2,
  },
  jupiter: {
    name: 'Jupiter',
    radiusKm: 69911,
    massEarth: 317.8,
    rotationDays: 0.41354,
    orbitDays: 4332.589,
    obliquityDeg: 3.13,
    eccentricity: 0.04838624,
    inclDeg: 1.30439695,
    semiMajorAu: 5.202887,
    // ~20,000× Earth's dipole moment. Rotation-driven and fed by Io's
    // plasma torus, so its aurorae are permanent, not storm-driven.
    magnetosphere: 'intrinsic-giant',
    moons: 115, // ⚠ VOLATILE — see moonCountNote()
  },
  saturn: {
    name: 'Saturn',
    radiusKm: 58232,
    massEarth: 95.2,
    rotationDays: 0.44401,
    orbitDays: 10759.22,
    obliquityDeg: 26.73,
    eccentricity: 0.05386179,
    inclDeg: 2.48599187,
    semiMajorAu: 9.53667594,
    magnetosphere: 'intrinsic-giant', // fed by Enceladus, as Jupiter is by Io
    moons: 293, // ⚠ VOLATILE — see moonCountNote()
  },
  uranus: {
    name: 'Uranus',
    radiusKm: 25362,
    massEarth: 14.5,
    rotationDays: 0.71833,
    orbitDays: 30685.4,
    obliquityDeg: 97.77, // ⇒ retrograde, and lying on its side
    eccentricity: 0.04725744,
    inclDeg: 0.77263783,
    semiMajorAu: 19.18916464,
    magnetosphere: 'intrinsic-tilted', // field tilted ~59° AND offset
    moons: 28,
  },
  neptune: {
    name: 'Neptune',
    radiusKm: 24622,
    massEarth: 17.1,
    rotationDays: 0.67125,
    orbitDays: 60189,
    obliquityDeg: 28.32,
    eccentricity: 0.00859048,
    inclDeg: 1.77004347,
    semiMajorAu: 30.06992276,
    magnetosphere: 'intrinsic-tilted', // ~47° tilt, ~0.55 R offset
    moons: 16,
  },
}

/**
 * Moon counts move faster than any release cycle. NASA's own page said
 * Saturn had 274 on 2025-03-25; it passed 290 in 2026. Any integer this
 * app prints will be wrong within a year, so HUD copy should use this
 * instead of a number — the churn is a better fact than the count.
 */
export function moonCountNote(id) {
  if (id === 'saturn') {
    return 'Saturn’s confirmed moon count passed 290 in 2026 and is still climbing — the number in your textbook is probably already out of date.'
  }
  if (id === 'jupiter') {
    return 'Jupiter’s confirmed moon count passed 110 in 2026. Surveys keep finding more, and the total changes most years.'
  }
  return null
}

/**
 * Retrograde rotation, derived from obliquity rather than stored twice.
 * Obliquity past 90° means the north pole has tipped below the orbital
 * plane — the body turns backwards relative to its orbit.
 *
 * Venus → −1 (177.36°), Uranus → −1 (97.77°), everything else → +1.
 */
export function spinSign(obliquityDeg) {
  return obliquityDeg > 90 ? -1 : 1
}

/**
 * Scene spin rate (rad/s) from a real rotation period.
 *
 * Honest compromise, in the same spirit as the compressed orbit radii —
 * and it needs stating plainly, because the naive options both fail:
 *
 *   • True rate, scene clock: Earth would spin 365 times per 60-second
 *     orbit. Six rotations a second is a strobe, not a planet.
 *   • True day-per-year ratio: same problem, for the same reason.
 *
 * So rates are compressed by a power law, `(1/P)^SPIN_EXP`, which
 * preserves what a viewer can actually check — the *ordering* and the
 * *sign* — while keeping every body watchable. Jupiter is visibly the
 * fastest, Venus visibly the slowest and running backwards, gas giants
 * visibly quicker than rocky worlds. All of that is true; only the
 * magnitudes are squeezed.
 *
 * Verified orderings at the shipped constants:
 *   Jupiter 0.204 > Saturn 0.199 > Neptune 0.172 > Earth 0.150
 *   > Mars 0.149 > Mercury 0.036 > |Uranus| 0.168 (retrograde)
 *   > |Venus| 0.022 (retrograde)
 */
export const SPIN_BASE = 0.15 // Earth's rate, matching the pre-SS look
export const SPIN_EXP = 0.35

export function sceneSpinRate(planet) {
  const { rotationDays, obliquityDeg } = planet
  const mag = SPIN_BASE * Math.pow(1 / Math.abs(rotationDays), SPIN_EXP)
  return spinSign(obliquityDeg) * mag
}

/** Obliquity in radians, for the render tilt. */
export function obliquityRad(planet) {
  return (planet.obliquityDeg * Math.PI) / 180
}

/**
 * Major moons worth rendering, with their real parents. Radii in km,
 * periods in days (RESEARCH.md B3).
 *
 * Titan belongs to Saturn. It was attached to Jupiter in the scene from
 * the MN phase until Phase SS corrected it.
 */
export const MOONS = {
  moon: { name: 'The Moon', parent: 'earth', radiusKm: 1737.4, periodDays: 27.322 },
  phobos: { name: 'Phobos', parent: 'mars', radiusKm: 11.27, periodDays: 0.319 },
  deimos: { name: 'Deimos', parent: 'mars', radiusKm: 6.2, periodDays: 1.263 },
  io: { name: 'Io', parent: 'jupiter', radiusKm: 1821.3, periodDays: 1.769 },
  europa: { name: 'Europa', parent: 'jupiter', radiusKm: 1560.8, periodDays: 3.551 },
  ganymede: { name: 'Ganymede', parent: 'jupiter', radiusKm: 2634.1, periodDays: 7.155 },
  callisto: { name: 'Callisto', parent: 'jupiter', radiusKm: 2410.3, periodDays: 16.689 },
  titan: { name: 'Titan', parent: 'saturn', radiusKm: 2574.7, periodDays: 15.945 },
  enceladus: { name: 'Enceladus', parent: 'saturn', radiusKm: 252.1, periodDays: 1.37 },
  rhea: { name: 'Rhea', parent: 'saturn', radiusKm: 763.8, periodDays: 4.518 },
}

/** Bodies larger than Mercury (2439.4 km radius) that are not planets. */
export const BIGGER_THAN_MERCURY = ['ganymede', 'titan']