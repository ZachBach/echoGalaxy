import { trigLattice } from './tsl-lib/noise/trigLattice.js'
import { fbm } from './tsl-lib/noise/fbm.js'
import { warp } from './tsl-lib/noise/warp.js'
import { worleyF1F2 } from './tsl-lib/noise/worley.js'
import { ramp } from './tsl-lib/ramp/ramp.js'
import { fireRamp } from './tsl-lib/ramp/fireRamp.js'
import { remap } from './tsl-lib/ramp/remap.js'
import { dissolve } from './tsl-lib/pattern/dissolve.js'
import { bandedFlow } from './tsl-lib/pattern/bandedFlow.js'
import { fresnel } from './tsl-lib/fresnel/fresnel.js'

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
export function ice(TSL, { spunDir }) {
  const w = worleyF1F2(TSL, spunDir.mul(2.8), { impl: 'fallback' })
  const cracks = TSL.smoothstep(0.07, 0.0, w.y.sub(w.x))
  const depth = fbm(TSL, spunDir.mul(1.4), { octaves: 3 }).mul(0.5).add(0.5)
  return {
    surface: TSL.mix(TSL.color(0xdff0f7), TSL.color(0x2b6cf6).mul(0.55), depth.mul(0.6))
      .mul(cracks.mul(-0.55).add(1))
      .add(TSL.color(0xbfe9ff).mul(fresnel(TSL, { power: 2 }).mul(0.5))),
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
export function ringed(TSL, { spunDir, clock }) {
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
  return { surface: TSL.mix(banded, TSL.color(0x8d764f), poles.mul(0.4)) }
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
  const caps = TSL.smoothstep(0.78, 0.93, spunDir.y.abs())
  return { surface: TSL.mix(base, TSL.color(0xddeaf0), caps.mul(0.7)) }
}

// A water-rich world. Islands deliberately stay sparse so it reads as an
// ocean planet rather than a recolored Earth, while the drifting field gives
// the sea a living surface at close range.
export function ocean(TSL, { spunDir, clock }) {
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
  return { surface: TSL.mix(water, islands, land) }
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
  titan,
}
