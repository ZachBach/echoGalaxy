import * as TSL from 'three/tsl'
import { AdditiveBlending, DoubleSide } from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { fbm } from './tsl-lib/noise/fbm.js'
import { fireRamp } from './tsl-lib/ramp/fireRamp.js'
import { remap } from './tsl-lib/ramp/remap.js'

// Black hole materials (pure module, node-smokeable).
//
// The event horizon is the cheapest material in the universe: opaque
// black with depth-write — its occlusion of everything behind it IS the
// physics. The spectacle lives in the accretion disc:
//   - Keplerian differential shear: the plasma's angular offset runs
//     ∝ r^-1.5, so inner streaks visibly outrun outer ones.
//   - Doppler beaming: the approaching side is boosted and blue-tinted,
//     the receding side dimmed — the asymmetry in every real EHT image.
//   - fireRamp keeps the plasma honestly thermal (its clamp is why the
//     melt never goes cartoon-blue).
// The "lensed" look is the classic cheat: a second, vertical ring behind
// the sphere; the horizon occludes its middle, leaving the two arcs.

const DISC_INNER = 0.36 // as fraction of outer radius (1.15 / 3.2)

// Every emitter here encircles the shadow, and bloom is global — unchecked
// HDR (inner-edge heat × doppler boost ≈ 5) bleeds enough glow to fill the
// silhouette and the "black circle" the HUD copy promises reads cream.
// Cap the pre-bloom HDR instead of touching the shared bloom (G1-28 rule).
const HDR_CAP = 1.35

function discField(clock, { shear = 1.4, streaks = 5.0 } = {}) {
  const p = TSL.uv().sub(0.5).mul(2)
  const r = p.length() // DISC_INNER..1 across the annulus
  const rN = remap(TSL, r, DISC_INNER, 1, 0, 1)
  const ang = TSL.atan(p.y, p.x)

  // differential rotation: inner laps outer (Kepler ∝ r^-1.5)
  const omega = TSL.pow(r.max(0.2), -1.5)
  const phi = ang.add(clock.mul(0.22).mul(omega).mul(shear))

  // tangentially-stretched turbulence in (phi, r) — seamless via cos/sin
  const q = TSL.vec3(
    TSL.cos(phi).mul(1.1),
    TSL.sin(phi).mul(1.1),
    rN.mul(streaks),
  )
  const n = fbm(TSL, q, { octaves: 3 }).mul(0.5).add(0.5)

  // inner edge is hottest; turbulence modulates
  const heat = rN.oneMinus().mul(1.7).add(n.mul(1.1))
  const plasma = fireRamp(TSL, heat)

  // doppler beaming: +x side approaches (disc spins +y up); boost and
  // blue-tint the approaching limb, dim the receding one
  const d = TSL.sin(ang)
  const boost = d.mul(0.62).add(1).pow(2)
  const tinted = TSL.mix(plasma, TSL.vec3(1.0, 0.98, 0.92), d.max(0).mul(0.28))

  const edgeIn = TSL.smoothstep(DISC_INNER, DISC_INNER + 0.12, r)
  const edgeOut = TSL.smoothstep(1.0, 0.82, r)
  return {
    color: tinted.mul(boost),
    alpha: n.mul(0.5).add(0.55).mul(edgeIn).mul(edgeOut),
  }
}

export function buildHorizonMaterial() {
  const m = new MeshBasicNodeMaterial()
  m.colorNode = TSL.vec3(0, 0, 0)
  return m // opaque, depth-writing: the shadow itself
}

export function buildDiscMaterial({ frozen = false, dim = 1 } = {}) {
  const clock = frozen ? TSL.float(0) : TSL.time
  const { color, alpha } = discField(clock)
  const m = new MeshBasicNodeMaterial()
  m.colorNode = color.mul(dim).min(HDR_CAP)
  m.opacityNode = alpha
  m.transparent = true
  m.blending = AdditiveBlending
  m.depthWrite = false
  m.side = DoubleSide
  return m
}

export function buildPhotonRingMaterial() {
  const p = TSL.uv().sub(0.5).mul(2)
  const r = p.length()
  // a tight gaussian-ish peak at the ring's middle radius
  const peak = TSL.smoothstep(0.7, 0.88, r).mul(TSL.smoothstep(1.0, 0.92, r))
  const m = new MeshBasicNodeMaterial()
  m.colorNode = TSL.vec3(1.0, 0.9, 0.68).mul(0.75)
  m.opacityNode = peak
  m.transparent = true
  m.blending = AdditiveBlending
  m.depthWrite = false
  m.side = DoubleSide
  return m
}
