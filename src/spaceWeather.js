import * as TSL from 'three/tsl'
import { AdditiveBlending } from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { curtain } from './tsl-lib/pattern/curtain.js'
import { fbm } from './tsl-lib/noise/fbm.js'
import { worleyF1F2 } from './tsl-lib/noise/worley.js'
import { spinY } from './tsl-lib/util/spinY.js'

// SW — space weather: what the Sun throws, and what it hits.
//
// The chain this module renders, end to end:
//   sunspots  concentrated magnetic field on the photosphere
//   flares    the field reconnecting — measured as X-ray flux, class A→X
//   CMEs      a billion tonnes of plasma launched, in a three-part shape
//   aurora    that plasma meeting a magnetosphere, days later
//
// Everything here is keyed to real measurements (RESEARCH.md §B5–B9), and
// the per-body differences are the point: Earth glows because it has a
// dynamo, Mars barely does because it lost one, and Jupiter's aurorae are
// permanent because they are powered by Io and Jupiter's own rotation
// rather than by the solar wind at all.

/* ── emission colours ──────────────────────────────────────────────────
 * Auroral colour is not artistic licence — it is a spectroscopic
 * fingerprint, and it is stratified by ALTITUDE because each transition
 * needs a different air density to complete before a collision quenches it:
 *
 *   557.7 nm  atomic oxygen, ~100 km   green   (0.7 s lifetime — fast)
 *   630.0 nm  atomic oxygen, >200 km   red     (slow; needs thin air)
 *   427.8 nm  ionised nitrogen, 400 km+ violet
 *
 * That is why real aurorae are green at the bottom and red on top, and the
 * gradient below reproduces exactly that ordering.
 */
export const AURORA_GREEN = 0x2bff88 // O I 557.7 nm
export const AURORA_RED = 0xff2b3c // O I 630.0 nm
export const AURORA_VIOLET = 0x4b3cff // N2+ 427.8 nm

/**
 * The auroral oval.
 *
 * Aurorae do not happen at the geographic pole, and they do not happen in a
 * cap — they happen in a RING around the MAGNETIC pole, because that is
 * where field lines funnel particles down. Two consequences are modelled:
 *
 *   magPoleTilt  Earth's magnetic axis is ~11° off its spin axis, so the
 *                oval is visibly off-centre and swings as the planet turns.
 *   storm        stronger storms push the oval EQUATORWARD. This is the
 *                whole reason the May 2024 G5 (Kp 9) put aurorae over
 *                southern England: the oval came down to meet them.
 *                storm 0 → quiet oval near 20° colatitude; storm 1 → G5,
 *                dragged down past 35°.
 *
 * @param {number} opts.storm         0..1, mapped from the NOAA G-scale
 * @param {number} opts.magPoleTilt   radians, magnetic vs spin axis
 * @param {number} opts.spinRate      body spin, so the oval rides with it
 */
export function buildAuroraMaterial({
  storm = 0.35,
  magPoleTilt = 0.192, // 11° — Earth
  spinRate = 0.15,
  strength = 1.0,
  frozen = false,
} = {}) {
  const clock = frozen ? TSL.float(0) : TSL.time
  const dir = TSL.positionLocal.normalize()

  // Into the magnetic frame: tilt about X, then ride the body's spin so the
  // oval turns with the planet instead of hanging in space.
  const spun = spinY(TSL, dir, clock.mul(spinRate))
  const c = Math.cos(magPoleTilt)
  const s = Math.sin(magPoleTilt)
  const magDir = TSL.vec3(
    spun.x,
    spun.y.mul(c).sub(spun.z.mul(s)),
    spun.y.mul(s).add(spun.z.mul(c)),
  )

  // Colatitude from the nearer magnetic pole, 0 at the pole.
  const absLat = magDir.y.abs().clamp(-1, 1)
  const colat = TSL.acos(absLat)

  // Oval centre marches equatorward with storm strength; the band also
  // broadens, because a fed oval is a thicker one.
  const centre = TSL.float(0.35 + 0.28 * storm) // radians ≈ 20° → 36°
  const halfWidth = TSL.float(0.055 + 0.05 * storm)

  const d = colat.sub(centre).div(halfWidth) // -1..1 across the band
  const band = TSL.float(1).sub(d.abs()).clamp(0, 1)

  // Curtain structure. u.x runs AROUND the oval (magnetic longitude), u.y
  // runs across it — so the curtains hang the right way, with their hard
  // top edge poleward.
  const lon = TSL.atan(magDir.z, magDir.x)
  const u = TSL.vec2(lon.mul(1.6), d.mul(0.5).add(0.5))
  const { glow, edge } = curtain(TSL, u, {
    ridgeFreq: 1.4,
    ridgeAmp: 0.22,
    ridgeBase: 0.66,
    decay: 3.4,
    rayFreq: 5.5,
    seed: 2.7,
    clock: clock.mul(0.35),
  })

  // Altitude gradient: green low (equatorward edge of the band), red high,
  // violet at the very top — the 557.7 / 630.0 / 427.8 nm ordering.
  const h = d.mul(0.5).add(0.5).clamp(0, 1)
  const colour = TSL.mix(
    TSL.color(AURORA_GREEN),
    TSL.color(AURORA_RED),
    TSL.smoothstep(0.45, 0.9, h),
  ).add(TSL.color(AURORA_VIOLET).mul(TSL.smoothstep(0.86, 1.0, h).mul(0.5)))

  const body = glow.mul(0.9).add(edge.mul(0.6)).mul(band)

  const material = new MeshBasicNodeMaterial()
  material.colorNode = colour.mul(body).mul(strength * (0.45 + 0.9 * storm))
  material.opacityNode = body.mul(band).clamp(0, 1)
  material.transparent = true
  material.blending = AdditiveBlending
  material.depthWrite = false
  return material
}

/**
 * Map the NOAA G-scale to the storm parameter. G1..G5 are Kp 5..9, and a G5
 * happens roughly four days per eleven-year solar cycle — which is why the
 * quiet default is the honest one.
 */
export const STORM_FOR_G = { 0: 0.0, 1: 0.25, 2: 0.4, 3: 0.58, 4: 0.78, 5: 1.0 }

/**
 * Which bodies get what. RESEARCH.md §B9.
 *
 * The request asked for geomagnetic storms on "rocky planets" — but the
 * honest answer is more interesting than the uniform one, because rocky
 * planets are mostly where aurorae AREN'T. Earth has them because it has a
 * working dynamo; Venus and Mars essentially do not, and that difference is
 * a large part of why one of the three is habitable.
 */
export const MAGNETOSPHERES = {
  mercury: { kind: 'intrinsic-weak', aurora: false, magPoleTilt: 0.03,
    note: 'A real magnetosphere at ~1% of Earth’s surface field, with real substorms — but no atmosphere to light up, so no visible aurora. X-ray fluorescence from the surface is the closest thing.' },
  venus: { kind: 'induced', aurora: false, magPoleTilt: 0,
    note: 'No dynamo. The solar wind drapes straight onto the ionosphere, forming an induced magnetosphere — and strips atmosphere as it goes.' },
  earth: { kind: 'intrinsic', aurora: true, magPoleTilt: 0.192, storm: 0.35,
    note: 'A dynamo in liquid iron, tilted ~11° from the spin axis. The oval sits around the magnetic pole, and storms push it equatorward.' },
  mars: { kind: 'crustal', aurora: 'diffuse', magPoleTilt: 0,
    note: 'The dynamo died. What remains is patchy crustal magnetism, which produces localised discrete aurorae and a planet-wide diffuse glow — and no shield.' },
  jupiter: { kind: 'intrinsic-giant', aurora: true, magPoleTilt: 0.17, storm: 0.75,
    note: 'The strongest planetary field in the Solar System, ~20,000× Earth’s dipole moment. Its aurorae are permanent, powered by Jupiter’s rotation and by plasma from Io — not by the solar wind.' },
  saturn: { kind: 'intrinsic-giant', aurora: true, magPoleTilt: 0.02, storm: 0.5,
    note: 'Fed by Enceladus’ geysers the way Jupiter’s is fed by Io. Its magnetic axis is almost exactly aligned with its spin axis — nearly unique.' },
  uranus: { kind: 'intrinsic-tilted', aurora: true, magPoleTilt: 1.03, storm: 0.6,
    note: 'The field is tilted ~59° from the spin axis AND offset from the centre — on a planet already lying on its side, the magnetosphere tumbles chaotically through each rotation.' },
  neptune: { kind: 'intrinsic-tilted', aurora: true, magPoleTilt: 0.82, storm: 0.5,
    note: 'Tilted ~47° and badly offset, so its aurorae appear far from the poles in places no Earth-based intuition predicts.' },
}

/* ── the Sun ─────────────────────────────────────────────────────────── */

/**
 * Sunspots — dark, because they are COOLER, not because they are shadows.
 * A sunspot is where the magnetic field (~3000 gauss, a thousand times the
 * quiet photosphere) is strong enough to choke off convection; without hot
 * plasma welling up, the surface drops to ~4000 K against 5772 K around it.
 * It is still blinding. It only looks black by comparison.
 *
 * They also appear in two BELTS rather than anywhere: roughly 5–30° north
 * and south, drifting toward the equator as the cycle ages. Plotting that
 * migration gives the famous "butterfly diagram", and the latitude
 * windowing below is that fact, rendered.
 *
 * @returns {Node} float 0..1 — 1 where a spot is, for the caller to subtract
 */
export function sunspots(TSL_, dir, { clock, density = 5.5, cycle = 0.5 } = {}) {
  const T = TSL_
  // Butterfly belts: centre migrates 30° → 5° as `cycle` runs 0 → 1.
  const beltCentre = 0.52 - 0.44 * cycle // sin(latitude) space, ~31° → ~5°
  const lat = dir.y
  const belt = T.smoothstep(0.16, 0.0, lat.abs().sub(beltCentre).abs())

  const w = worleyF1F2(T, dir.mul(density).add(T.vec3(0, clock.mul(0.02), 0)), {
    impl: 'fallback',
  })
  // Umbra (dark core) inside penumbra (softer surround).
  const umbra = T.smoothstep(0.13, 0.04, w.x)
  const penumbra = T.smoothstep(0.24, 0.11, w.x)
  // Only some cells are active regions at all.
  const active = T.smoothstep(0.42, 0.6, fbm(T, dir.mul(2.1), { octaves: 2 }).mul(0.5).add(0.5))
  return umbra.mul(0.75).add(penumbra.mul(0.3)).mul(belt).mul(active).clamp(0, 1)
}

/**
 * Prominences and CMEs on the corona shell.
 *
 * A prominence is cool (5000–8000 K) dense plasma held above the surface by
 * a twisted magnetic flux rope — the same object is called a FILAMENT when
 * seen dark against the disc and a PROMINENCE when seen bright at the limb.
 * They hang stable for days to weeks, then erupt.
 *
 * When one does, the CME that results has a canonical three-part structure,
 * which this renders literally:
 *   front   a bright leading loop
 *   cavity  a dark gap behind it — the evacuated flux rope
 *   core    a bright knot: the erupting prominence itself
 *
 * Speeds run from under 250 km/s to ~3000 km/s; the fastest reach Earth in
 * 15–18 hours, a typical one in 3–4 days. `period` is the scene's eruption
 * cycle, compressed like everything else here.
 */
export function buildProminenceMaterial({
  bodyRadius = 1.15,
  shellRadius = 1.62,
  period = 16,
  color = 0xff6a2b,
  coreColor = 0xffd08a,
  strength = 0.9,
  frozen = false,
} = {}) {
  const clock = frozen ? TSL.float(0) : TSL.time

  const P = TSL.positionView
  const v = P.normalize()
  const C = TSL.modelViewMatrix.mul(TSL.vec4(0, 0, 0, 1)).xyz
  // Impact parameter — the G1-27 lesson: body limb lands exactly at
  // bodyRadius, shell silhouette exactly at shellRadius.
  const b = C.sub(v.mul(C.dot(v))).length()

  // Quiescent prominences: arcs standing just off the limb at a few fixed
  // longitudes, breathing slowly.
  const ang = TSL.atan(TSL.positionView.y, TSL.positionView.x)
  const lobe = fbm(TSL, TSL.vec3(ang.mul(1.9), clock.mul(0.05), 4.2), { octaves: 3 })
    .mul(0.5)
    .add(0.5)
  const nearLimb = TSL.smoothstep(bodyRadius * 0.99, bodyRadius * 1.02, b).mul(
    TSL.smoothstep(bodyRadius * 1.34, bodyRadius * 1.06, b),
  )
  const prominence = nearLimb.mul(TSL.smoothstep(0.55, 0.85, lobe))

  // The CME: a front that expands outward once per `period`, with the dark
  // cavity and bright core riding behind it.
  const t = clock.div(period).fract()
  const front = TSL.float(bodyRadius).add(
    t.mul(shellRadius - bodyRadius * 0.98),
  )
  const shellW = 0.07 * shellRadius
  const frontBand = TSL.smoothstep(shellW, 0.0, b.sub(front).abs())
  const cavity = TSL.smoothstep(shellW * 2.6, shellW * 0.9, b.sub(front).abs())
    .mul(TSL.step(b, front))
  const core = TSL.smoothstep(shellW * 1.5, 0.0, b.sub(front.sub(shellW * 3.1)).abs())

  // Angular extent: a CME is a cone, not a sphere.
  const cone = TSL.smoothstep(0.35, 0.85, fbm(TSL, TSL.vec3(ang.mul(0.9), clock.div(period).floor(), 8.1), { octaves: 2 }).mul(0.5).add(0.5))
  // Fade the whole eruption in and out across its cycle.
  const life = TSL.sin(t.mul(Math.PI)).pow(0.7)

  const cme = frontBand.add(core.mul(0.9)).sub(cavity.mul(0.55)).clamp(0, 1)
    .mul(cone)
    .mul(life)

  const material = new MeshBasicNodeMaterial()
  material.colorNode = TSL.color(color)
    .mul(prominence.add(cme))
    .add(TSL.color(coreColor).mul(core.mul(cone).mul(life).mul(0.8)))
  material.opacityNode = prominence.add(cme).mul(strength).clamp(0, 1)
  material.transparent = true
  material.blending = AdditiveBlending
  material.depthWrite = false
  return material
}

/**
 * Solar flare classes, by peak GOES 1–8 Å X-ray flux in W/m². Each letter is
 * a factor of ten and the digit inside a class is linear, so X2 is twice X1
 * — and the scale has no ceiling, which is why X10+ events have names.
 */
export const FLARE_CLASSES = [
  { c: 'A', flux: '< 1e-7', note: 'Background. The Sun is never truly quiet.' },
  { c: 'B', flux: '1e-7 – 1e-6', note: 'Undetectable from the ground.' },
  { c: 'C', flux: '1e-6 – 1e-5', note: 'Common at solar maximum; few effects at Earth.' },
  { c: 'M', flux: '1e-5 – 1e-4', note: 'Brief radio blackouts at the poles (NOAA R1–R2).' },
  { c: 'X', flux: '> 1e-4', note: 'Planet-wide HF blackouts on the sunlit side (R3+).' },
]
