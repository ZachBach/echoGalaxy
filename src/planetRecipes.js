import { trigLattice } from './tsl-lib/noise/trigLattice.js'
import { fbm } from './tsl-lib/noise/fbm.js'
import { warp } from './tsl-lib/noise/warp.js'
import { worleyF1, worleyF1F2 } from './tsl-lib/noise/worley.js'
import { ramp } from './tsl-lib/ramp/ramp.js'
import { fireRamp } from './tsl-lib/ramp/fireRamp.js'
import { remap } from './tsl-lib/ramp/remap.js'
import { posterize } from './tsl-lib/ramp/posterize.js'
import { dissolve } from './tsl-lib/pattern/dissolve.js'
import { bandedFlow } from './tsl-lib/pattern/bandedFlow.js'
import { fresnel } from './tsl-lib/fresnel/fresnel.js'
import { ringDensity } from './ringMaterial.js'

// Specular sun glint — Blinn-Phong half-vector against the world normal. One
// normalize, one dot, one pow. Water and ice are the only surfaces in this set
// smooth enough to throw a real highlight; on rock it would read as plastic.
// max(0) before pow() is load-bearing: a negative base under a fractional or
// large exponent is one of the documented backend divergences.
function sunGlint(TSL, sun, { power = 90 } = {}) {
  const eye = TSL.cameraPosition.sub(TSL.positionWorld).normalize()
  const h = sun.add(eye).normalize()
  return TSL.normalWorld.dot(h).max(0).pow(power)
}

// The rings' shadow on the globe — the reverse of the shadow ringMaterial
// already casts from the globe onto the rings. March from the surface point
// toward the sun and ask where that ray crosses the ring plane:
//   n·(dir + t·sun) = 0  →  t = −(n·dir)/(n·sun)
// Only a forward crossing (t > 0) can occlude, and ringDensity is already zero
// outside the annulus, so it doubles as the radial test. The denominator is
// clamped in magnitude with its sign restored through step(), so a sun lying
// in the ring plane can never divide by zero and paint a NaN; the term fades
// out there anyway, since edge-on rings cast no usable shadow.
function ringShadow(TSL, dir, sun, normal) {
  const N = TSL.vec3(normal[0], normal[1], normal[2])
  const sn = N.dot(sun)
  const signed = sn.abs().max(0.06).mul(TSL.step(0, sn).mul(2).sub(1))
  const t = N.dot(dir).negate().div(signed)
  const hit = dir.add(sun.mul(t))
  const r = hit.sub(N.mul(N.dot(hit))).length()
  return ringDensity(r)
    .mul(TSL.smoothstep(0, 0.03, t))
    .mul(TSL.smoothstep(0.05, 0.18, sn.abs()))
}

// Planet surface recipes on the G1-01 contract:
//   (TSL, ctx) => { surface, nightLights?, emissive? }
// Patterns sample ctx.spunDir (they ride the spinning body frame);
// view-dependent terms (fresnel glaze) deliberately don't. Colors are
// echoGalaxy's own educational palette, not the library brand set.
// The magma/ice recipes are the vendored materials re-expressed over the
// body frame (their originals sample positionLocal on a lab knot).

// G1-11/12 — rocky: trigLattice continents through a height ramp, polar
// snow on |y| (spinY preserves y, so the caps are stable), warm city
// lights on land clusters — visible only where terminator.night says so.
export function rocky(TSL, { spunDir, clock }) {
  const continents = trigLattice(TSL, spunDir, { terms: 3, freq: 3.2, drift: clock.mul(0.02) })
  const detail = fbm(TSL, spunDir.mul(5), { octaves: 3 }).mul(0.18)
  const h = TSL.smoothstep(-0.12, 0.5, continents.add(detail))
  const base = ramp(TSL, h, [
    [0.0, 0x06326e], // deep ocean
    [0.46, 0x0a4a8f], // shallows
    [0.5, 0xc2b280], // shore
    [0.56, 0x4e7a3a], // lowland
    [0.75, 0x8a7a55], // highland
    [1.0, 0xcfd8dc], // peaks
  ])
  const snow = TSL.smoothstep(0.72, 0.86, spunDir.y.abs())
  const land = TSL.smoothstep(0.5, 0.55, h)
  const cities = TSL.smoothstep(0.3, 0.6, trigLattice(TSL, spunDir, { terms: 4, freq: 11 }))
  return {
    surface: TSL.mix(base, TSL.color(0xe8f2f7), snow),
    nightLights: TSL.color(0xffc46b)
      .mul(land.mul(cities).mul(snow.oneMinus()))
      .mul(1.1),
  }
}

// G1-13 — lava: the magma recipe over the body frame. The melt and crack
// edges go out as emissive — lava glows on the night side; the cooled
// crust is ordinary lit surface. fireRamp's internal clamp keeps the melt
// from ever going blue-white.
export function lava(TSL, { spunDir, clock }) {
  const p = spunDir.mul(2.2).add(TSL.vec3(0, clock.mul(-0.05), 0))
  const n = fbm(TSL, warp(TSL, p, { amp: 0.7 }), { octaves: 4 }).mul(0.5).add(0.5)
  const melt = fireRamp(TSL, remap(TSL, n, 0, 1, 0.5, 3.2))
  // Crust-dominant balance (planet, not lab knot): most of the shell is
  // cooled rock; melt shows only through the crack network.
  const crust = TSL.smoothstep(0.38, 0.52, n)
  const { edge } = dissolve(TSL, n, 0.4, { edgeWidth: 0.14 })
  return {
    surface: TSL.mix(TSL.color(0x14141a), TSL.color(0x2a2a33), crust),
    emissive: melt
      .mul(crust.oneMinus())
      .add(TSL.color(0xff7a33).mul(edge.mul(1.6))),
  }
}

// G1-14 — ice: worley crack veins (fallback impl by upstream choice — it
// benches faster) + depth tint + a light fresnel glaze. The rim itself
// belongs to the atmosphere shell, so the recipe keeps the glaze subtle.
export function ice(TSL, { spunDir, sun }) {
  const w = worleyF1F2(TSL, spunDir.mul(2.8), { impl: 'fallback' })
  const cracks = TSL.smoothstep(0.07, 0.0, w.y.sub(w.x))
  const depth = fbm(TSL, spunDir.mul(1.4), { octaves: 3 }).mul(0.5).add(0.5)
  // Plate facets, the crystal material's posterize trick re-expressed over the
  // body frame. Flattening the cell interiors into steps turns the same worley
  // field the cracks already use into rafts with flat faces, so the shell reads
  // as a fractured ice sheet rather than a smooth ball — Europa's chaos terrain
  // is the reference. It costs nothing extra: `w` is sampled once and both the
  // seams and the facets come out of it. Kept to 5 steps at a 0.13 tint so it
  // reads as plate relief, not as posterisation banding.
  const facets = posterize(TSL, w.x.mul(1.6).clamp(0, 1), { steps: 5 })
  // Tighter and weaker than the ocean's: polished ice is a sharper mirror than
  // water but covers less of the disc, and the crack network breaks it up.
  const glint = sunGlint(TSL, sun, { power: 140 }).mul(cracks.oneMinus())
  return {
    surface: TSL.mix(TSL.color(0xdff0f7), TSL.color(0x2b6cf6).mul(0.55), depth.mul(0.6))
      .mul(facets.mul(0.13).add(0.94))
      .mul(cracks.mul(-0.55).add(1))
      .add(TSL.color(0xbfe9ff).mul(fresnel(TSL, { power: 2 }).mul(0.5)))
      .add(TSL.color(0xffffff).mul(glint.mul(0.55))),
  }
}

// G1-15 — gas giant: bandedFlow (born here as a prototype, promoted
// upstream in G1-23..25 — parity 0%, class ③ — and consumed vendored)
// through a tan/cream ramp, darkened poles.
export function gas(TSL, { spunDir, clock }) {
  const t = bandedFlow(TSL, spunDir, {
    bands: 6,
    warpAmp: 0.22,
    warpFreq: 2.4,
    drift: clock.mul(0.03),
  })
  const banded = ramp(TSL, t, [
    [0.0, 0x8a5a2b],
    [0.35, 0xc99a5f],
    [0.6, 0xe8d3ae],
    [1.0, 0xa9714a],
  ])
  const poles = TSL.smoothstep(0.75, 0.95, spunDir.y.abs())
  return { surface: TSL.mix(banded, TSL.color(0x6e4a2f), poles.mul(0.5)) }
}

// SR-03 — the ringed world: bandedFlow again, but Saturn's manner —
// fewer, softer, paler bands (its haze layer mutes the contrast Jupiter
// flaunts). The rings are a separate material (ringMaterial.js); this
// is only the globe.
// cfg.ringNormal — the ring plane's normal in this body's local frame, which
// switches on the ring shadow. Callers that draw rings around the globe pass
// it; a bare `ringed` world without rings leaves it off and pays nothing.
export function ringed(TSL, { spunDir, dir, sun, clock, cfg = {} }) {
  const t = bandedFlow(TSL, spunDir, {
    bands: 4,
    warpAmp: 0.1,
    warpFreq: 1.7,
    drift: clock.mul(0.02),
  })
  const banded = ramp(TSL, t, [
    [0.0, 0xa8895c],
    [0.35, 0xd8bd8d],
    [0.65, 0xefe3c0],
    [1.0, 0xc4a26b],
  ])
  const poles = TSL.smoothstep(0.7, 0.95, spunDir.y.abs())
  let surface = TSL.mix(banded, TSL.color(0x8d764f), poles.mul(0.4))
  if (cfg.ringNormal) {
    // 0.82 not 1.0: the B ring is opaque but the rings scatter light sideways,
    // so the shadow band on Saturn is deep grey, never black.
    surface = surface.mul(ringShadow(TSL, dir, sun, cfg.ringNormal).mul(-0.82).add(1))
  }
  return { surface }
}

// A dry terrestrial world: wind-sculpted mineral terrain rather than the
// ocean/continent balance of rocky(). The small polar caps stay fixed while
// the terrain rotates beneath the terminator.
export function desert(TSL, { spunDir, clock }) {
  const p = warp(
    TSL,
    spunDir.mul(2.7).add(TSL.vec3(0, clock.mul(0.012), 0)),
    { amp: 0.26, octaves: 2 },
  )
  const terrain = fbm(TSL, p, { octaves: 3 }).mul(0.5).add(0.5)
  const base = ramp(TSL, terrain, [
    [0.0, 0x2b1610],
    [0.34, 0x6e3420],
    [0.58, 0xb65e31],
    [0.78, 0xd99a60],
    [1.0, 0xead1a1],
  ])
  // A transverse dune train, the sandDunes material re-expressed over the body
  // frame. The pow() skews the crest profile so the slip face is steep and the
  // windward slope long, and that asymmetry is the whole reason it reads as a
  // dune field rather than as a sine wave. Ergs collect in the low ground, so
  // the train is masked out of the highlands — a sand sea, not a global
  // corduroy — and the polar caps below cover whatever survives at the poles.
  const q = warp(TSL, spunDir.mul(3.4), { amp: 0.5, octaves: 2 })
  const crest = TSL.sin(q.x.mul(19).add(q.z.mul(4.4))).mul(0.5).add(0.5)
  const dunes = crest.pow(1.6).mul(TSL.smoothstep(0.70, 0.26, terrain))
  const caps = TSL.smoothstep(0.78, 0.93, spunDir.y.abs())
  return {
    surface: TSL.mix(base.mul(dunes.mul(0.30).add(0.88)), TSL.color(0xddeaf0), caps.mul(0.7)),
  }
}

// A water-rich world. Islands deliberately stay sparse so it reads as an
// ocean planet rather than a recolored Earth, while the drifting field gives
// the sea a living surface at close range.
export function ocean(TSL, { spunDir, sun, clock }) {
  const currents = trigLattice(TSL, spunDir, {
    terms: 3,
    freq: 4.1,
    drift: clock.mul(0.025),
  })
  const detail = fbm(TSL, spunDir.mul(7), { octaves: 2 }).mul(0.12)
  const land = TSL.smoothstep(0.61, 0.78, currents.add(detail))
  const depth = fbm(TSL, spunDir.mul(2.1), { octaves: 3 }).mul(0.5).add(0.5)
  const water = ramp(TSL, depth, [
    [0.0, 0x041b4d],
    [0.45, 0x075da8],
    [0.75, 0x1ba9c7],
    [1.0, 0x9fe8e6],
  ])
  const islands = TSL.mix(TSL.color(0x103a32), TSL.color(0x69a45c), currents.mul(0.5).add(0.5))
  // Open water only — the glint is what tells you at a glance that the blue is
  // liquid. It needs no day-side mask: the caller multiplies surface by the
  // terminator's shade, so it goes out on its own at the evening line.
  const glint = sunGlint(TSL, sun).mul(land.oneMinus())
  // Shallow-water caustics, the caustics material's two-drifting-worley trick
  // re-expressed over the body frame: where both fields sit near a cell edge at
  // once their sum spikes, and that intersection is the web light draws on a
  // sunlit bottom. Gated on `depth`, the same field that drives the water ramp
  // above — its pale end is the shallows — rather than on distance to land.
  // That is both the better physics and the better mask: caustics need a lit
  // floor, which is a property of depth, and shoals far from any island have
  // one while an abyssal trench hugging a coast does not. Rides the same
  // terminator shade as the glint, so it too goes dark at dusk.
  const shoals = TSL.smoothstep(0.55, 0.9, depth).mul(land.oneMinus())
  const ca = worleyF1(TSL, spunDir.mul(9).add(TSL.vec3(clock.mul(0.07), 0, 0)), { impl: 'fallback' })
  const cb = worleyF1(TSL, spunDir.mul(11).sub(TSL.vec3(0, clock.mul(0.05), 0)), { impl: 'fallback' })
  const web = TSL.smoothstep(0.5, 0.95, ca.add(cb).mul(0.5)).pow(2).mul(shoals)
  return {
    surface: TSL.mix(water, islands, land)
      .add(TSL.color(0xbdf3ee).mul(web.mul(1.15)))
      .add(TSL.color(0xfff4d6).mul(glint.mul(0.9))),
  }
}

// A Venus-like cloud deck. The planet is represented by the atmosphere we
// can see rather than a fictional exposed surface below it.
export function cloud(TSL, { spunDir, clock }) {
  const p = warp(
    TSL,
    spunDir.mul(2.2).add(TSL.vec3(clock.mul(0.018), 0, 0)),
    { amp: 0.34, octaves: 2 },
  )
  const cells = fbm(TSL, p, { octaves: 4 }).mul(0.5).add(0.5)
  const bands = TSL.sin(spunDir.y.mul(7).add(clock.mul(0.08))).mul(0.08)
  const cloud = cells.add(bands)
  return {
    surface: ramp(TSL, cloud, [
      [0.0, 0x7c4b1e],
      [0.35, 0xb97930],
      [0.62, 0xe2b85d],
      [0.84, 0xffe2a1],
      [1.0, 0xfff1c9],
    ]),
  }
}

// Uranus and Neptune are ice giants, compositionally distinct from the
// hydrogen-dominated gas giants above. The colder blue palette comes from
// methane-rich upper clouds, not from frozen surface ice.
export function iceGiant(TSL, { spunDir, clock }) {
  const flow = bandedFlow(TSL, spunDir, {
    bands: 8,
    warpAmp: 0.15,
    warpFreq: 2.0,
    drift: clock.mul(0.018),
  })
  const base = ramp(TSL, flow, [
    [0.0, 0x082f6b],
    [0.32, 0x1266a3],
    [0.62, 0x3da8ce],
    [1.0, 0xa3e8e8],
  ])
  const poles = TSL.smoothstep(0.72, 0.94, spunDir.y.abs())
  return { surface: TSL.mix(base, TSL.color(0x7dd3df), poles.mul(0.38)) }
}

// MN-03 — the Moon: cratered regolith. Worley cells give the craters
// (dark bowls at the seeds, bright rims just outside), low-frequency
// fbm patches darken into maria — the "seas" that are ancient lava.
export function moon(TSL, { spunDir }) {
  const w = worleyF1F2(TSL, spunDir.mul(3.4), { impl: 'fallback' })
  const bowl = TSL.smoothstep(0.16, 0.04, w.x)
  const rim = TSL.smoothstep(0.3, 0.16, w.x).mul(TSL.smoothstep(0.08, 0.16, w.x))
  const base = fbm(TSL, spunDir.mul(4.2), { octaves: 3 }).mul(0.5).add(0.5)
  const maria = TSL.smoothstep(0.6, 0.72, fbm(TSL, spunDir.mul(1.3), { octaves: 2 }).mul(0.5).add(0.5))
  // real regolith is charcoal-dark (albedo ~0.12) — it only looks
  // bright against black space; a high base washes out under bloom
  const grey = base
    .mul(0.14)
    .add(0.33)
    .sub(bowl.mul(0.15))
    .add(rim.mul(0.1))
    .sub(maria.mul(0.12))
  return { surface: TSL.vec3(grey, grey, grey.mul(1.04)) }
}

// SS-04 — Mercury: grey, and specifically NOT Mars.
//
// Before Phase SS, Mercury and Mars shared the `desert` recipe, which ramps
// through rust-oranges — those are Mars's iron oxides, and Mercury has
// almost none. Mercury's regolith is dark, iron-poor silicate: geometric
// albedo 0.106, slightly darker than the Moon's 0.12 and only faintly
// warmer in tone.
//
// Three features distinguish it from the Moon recipe, all real:
//   craters        heavier than the Moon's — no atmosphere, no erosion,
//                  and a longer exposure to the inner-system impact flux
//   smooth plains  vast volcanic flood deposits (Caloris and the northern
//                  plains) that resurfaced whole regions, reading brighter
//                  and crater-poor
//   lobate scarps  Mercury's signature: kilometre-high cliffs running for
//                  hundreds of km, thrust up when the cooling core made the
//                  entire planet CONTRACT. No other planet is visibly
//                  wrinkled by its own shrinkage.
export function mercury(TSL, { spunDir }) {
  const w = worleyF1F2(TSL, spunDir.mul(4.6), { impl: 'fallback' })
  const bowl = TSL.smoothstep(0.15, 0.03, w.x)
  const rim = TSL.smoothstep(0.28, 0.15, w.x).mul(TSL.smoothstep(0.07, 0.15, w.x))

  // Smooth volcanic plains: low-frequency patches that suppress cratering
  // and sit slightly brighter than the ancient highlands.
  const plains = TSL.smoothstep(
    0.54,
    0.68,
    fbm(TSL, spunDir.mul(1.15), { octaves: 2 }).mul(0.5).add(0.5),
  )

  // Lobate scarps: ridged noise (|fbm| folded) thresholded into thin
  // sinuous lines, thinned where the young plains have buried them.
  const ridged = fbm(TSL, spunDir.mul(2.3), { octaves: 3 }).abs()
  const scarps = TSL.smoothstep(0.16, 0.03, ridged).mul(plains.mul(0.6).oneMinus())

  const grain = fbm(TSL, spunDir.mul(5.5), { octaves: 3 }).mul(0.5).add(0.5)
  // Darker base than the Moon's 0.33 seat — albedo 0.106 vs 0.12 — with a
  // faint warm bias, not Mars's saturated rust.
  const grey = grain
    .mul(0.13)
    .add(0.28)
    .sub(bowl.mul(0.14))
    .add(rim.mul(0.09))
    .add(plains.mul(0.07))
    .add(scarps.mul(0.06))
  return { surface: TSL.vec3(grey.mul(1.04), grey, grey.mul(0.94)) }
}

// MN-03 — Titan: the atmosphere IS the face. Near-featureless orange
// haze, the faintest banding, and the real north polar hood. The heavy
// shell preset does the rest of the talking.
export function titan(TSL, { spunDir }) {
  const haze = fbm(TSL, spunDir.mul(2.1), { octaves: 2 }).mul(0.5).add(0.5)
  const bands = TSL.sin(spunDir.y.mul(6)).mul(0.04)
  const base = TSL.mix(
    TSL.color(0xc9853d),
    TSL.color(0xe2a95e),
    haze.mul(0.45).add(bands).add(0.2),
  )
  const hood = TSL.smoothstep(0.55, 0.9, spunDir.y)
  return { surface: TSL.mix(base, TSL.color(0x8f6a35), hood.mul(0.35)) }
}

// G1-16 — per-type atmosphere presets (atmosphereShell opts + shell scale).
export const ATMOSPHERES = {
  rocky: { inner: 0x2b6cf6, outer: 0x57d4ff, strength: 0.55 },
  lava: { inner: 0x7a1e06, outer: 0xff8a3c, strength: 0.4, power: 4 },
  ice: { inner: 0x9fd8ef, outer: 0xe8fbff, strength: 0.45 },
  gas: { inner: 0x8a5a2b, outer: 0xe8cf9e, strength: 0.5, power: 3 },
  ringed: { inner: 0xa8895c, outer: 0xf2e6c8, strength: 0.4, power: 3 },
  titan: { inner: 0xc9853d, outer: 0xf0c07a, strength: 0.7, power: 2.5 },
  desert: { inner: 0x7b351f, outer: 0xe5a464, strength: 0.25, power: 4 },
  ocean: { inner: 0x0b65a8, outer: 0x79e5e1, strength: 0.6, power: 3 },
  cloud: { inner: 0xa56b2a, outer: 0xffdc8d, strength: 0.78, power: 2.3 },
  iceGiant: { inner: 0x1266a3, outer: 0x9ae8ef, strength: 0.55, power: 3 },
}

// Per-type day/night edge. An airless body has a knife-edge terminator and a
// near-black night side, because there is no air to scatter sunlight past the
// geometric boundary; a deep atmosphere smears the same boundary into a wide
// twilight and lifts the night side off black. `dawn` is the smoothstep window
// on dot(surface, sun) — narrow is hard — and `floor` is the night ambient.
// Same shape as ATMOSPHERES above: keyed by type, overridable per body.
export const TERMINATORS = {
  // Mercury has no atmosphere at all — only a surface-bounded exosphere so
  // thin its atoms never collide with each other. Nothing scatters sunlight
  // past the geometric edge, so its terminator is the hardest in the scene
  // and its night side is the darkest: the sharpest edge here is the most
  // physically correct one, not a stylistic choice.
  mercury: { dawn: [-0.02, 0.04], floor: 0.015, dusk: [0.015, -0.04] },
  moon: { dawn: [-0.03, 0.06], floor: 0.02, dusk: [0.02, -0.05] },
  desert: { dawn: [-0.06, 0.18], floor: 0.06 },
  ice: { dawn: [-0.05, 0.16], floor: 0.05 },
  rocky: { dawn: [-0.12, 0.32], floor: 0.12 },
  ocean: { dawn: [-0.12, 0.32], floor: 0.12 },
  lava: { dawn: [-0.12, 0.3], floor: 0.1 },
  iceGiant: { dawn: [-0.18, 0.42], floor: 0.13 },
  gas: { dawn: [-0.2, 0.45], floor: 0.14 },
  ringed: { dawn: [-0.2, 0.45], floor: 0.14 },
  cloud: { dawn: [-0.3, 0.55], floor: 0.2 },
  titan: { dawn: [-0.34, 0.6], floor: 0.26 },
}

export const PLANET_RECIPES = {
  rocky,
  lava,
  ice,
  gas,
  ringed,
  desert,
  ocean,
  cloud,
  iceGiant,
  moon,
  mercury,
  titan,
}

// recipe function → its terminator preset. Recipes are module-level functions
// and are already the type identity everywhere else (see Planet.jsx's memo
// note), so keying off the function lets every body pick up the right day/night
// edge without each call site having to pass one.
export const TERMINATOR_FOR = new Map(
  Object.entries(PLANET_RECIPES).map(([type, fn]) => [fn, TERMINATORS[type]]),
)
