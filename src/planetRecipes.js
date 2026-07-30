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

// G1-16 — per-type atmosphere presets (atmosphereShell opts + shell scale).
export const ATMOSPHERES = {
  rocky: { inner: 0x2b6cf6, outer: 0x57d4ff, strength: 0.55 },
  lava: { inner: 0x7a1e06, outer: 0xff8a3c, strength: 0.4, power: 4 },
  ice: { inner: 0x9fd8ef, outer: 0xe8fbff, strength: 0.45 },
  gas: { inner: 0x8a5a2b, outer: 0xe8cf9e, strength: 0.5, power: 3 },
}

export const PLANET_RECIPES = { rocky, lava, ice, gas }
