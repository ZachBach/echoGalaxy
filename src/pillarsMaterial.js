import * as TSL from 'three/tsl'
import { BOUNDS, samplePillars, densityLite } from './pillarsField.js'
import { flicker } from './tsl-lib/pattern/flicker.js'
import {
  buildAtlasBakeMaterial as buildBake,
  bakeAtlas,
  buildMarchMaterial,
} from './volumeAtlas.js'

// The raymarched Pillars volume — atlas-baked (PC-05 verdict), running
// on the SHARED volumeAtlas machinery since SN-02 (the Crab became the
// second consumer and the extraction earned itself). This module keeps
// what is the Pillars': the field's channel assignment (R = density,
// G = EGG knots, B = pre-tapped light gradient) and the shading law
// (dark dust body, edge-thresholded photoevaporation rim, pulsing
// nursery knots). HDR discipline per the black-hole rule: rim ≤ 1.25,
// EGGs ≤ 1.6, capped at the source.

const ATLAS = { sw: 160, sh: 144, nz: 40, cols: 8, rows: 5 }

const L = (() => {
  const v = [-0.45, 0.85, 0.25]
  const n = Math.hypot(...v)
  return v.map((c) => c / n)
})()
export const LIGHT_DIR = L

const SIGMA = 3.4 // extinction — how fast dust goes opaque

// the Pillars' field: density + knots + the pre-tapped light gradient
const pillarsFieldVec4 = (octaves) => (p) => {
  const lightDir = TSL.vec3(L[0], L[1], L[2])
  const s = samplePillars(TSL, p, { octaves })
  const lit = densityLite(TSL, p.add(lightDir.mul(0.09)))
  const grad = s.rho.sub(lit).max(0)
  return TSL.vec4(s.rho, s.knot, grad, 1)
}

export function buildAtlasBakeMaterial({ octaves = 3 } = {}) {
  return buildBake({ atlas: ATLAS, bounds: BOUNDS, field: pillarsFieldVec4(octaves) })
}

export function bakePillarsAtlas(renderer, { octaves = 3 } = {}) {
  return bakeAtlas(renderer, {
    atlas: ATLAS,
    bounds: BOUNDS,
    field: pillarsFieldVec4(octaves),
  })
}

export function buildPillarsMaterial({ steps = 20, texture, frozen = false } = {}) {
  const clock = frozen ? TSL.float(0) : TSL.time
  return buildMarchMaterial({
    atlas: ATLAS,
    bounds: BOUNDS,
    texture,
    steps,
    shade: (smp, pos, dt) => {
      const rho = smp.r
      const knotK = smp.g
      const grad = smp.b
      const shade = grad.mul(1.1).add(0.14)
      // dark dust body — warm umber silhouettes; only the rim and the
      // EGGs cross bloom's threshold with authority
      const body = TSL.vec3(0.21, 0.145, 0.09)
        .mul(shade)
        .add(TSL.vec3(0.015, 0.028, 0.048)) // cool ambient fill, shadow side
      // rim as an EDGE, not a wash: thresholded gradient, confined to
      // the upper reaches — the base cloud stays dark
      const heightMask = TSL.smoothstep(-0.7, 0.35, pos.y).mul(0.85).add(0.15)
      const rim = TSL.vec3(1.0, 0.8, 0.55).mul(
        TSL.smoothstep(0.35, 0.75, grad).pow(1.5).mul(1.35).min(1.25).mul(heightMask),
      )
      // PC-09 (re-scoped after the bake): the nursery pulses — each EGG
      // breathes on a slow flicker, phase drawn from its own knot value
      // (spatial variety for one sin per step). Frozen ⇒ static.
      const tw = flicker(TSL, clock, { rate: 0.35, phase: knotK.mul(20), depth: 0.35 })
      const knot = TSL.vec3(1.0, 0.45, 0.25).mul(knotK.mul(1.4)).mul(tw)
      const src = body.add(rim).add(knot)
      const a = rho.mul(dt).mul(SIGMA).min(0.65)
      return { src, a }
    },
  })
}
