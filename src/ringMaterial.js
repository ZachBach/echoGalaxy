import * as TSL from 'three/tsl'
import { DoubleSide } from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { fbm } from './tsl-lib/noise/fbm.js'

// Saturn's rings (SR-02) — pure module per the SR-01 contract.
//
// The material works in planet-radius units: geometry spans
// [RING_INNER·scale, RING_OUTER·scale] world units and the shader
// divides back, so the density profile and the shadow math never learn
// the entry's framing. The sun arrives as a plain JS vector already
// rotated into ring-mesh-local space (the component inverts the group
// tilt and the annulus flip once); every lighting constant folds at
// build time. No clock anywhere — static by construction.

export const RING_INNER = 1.24
export const RING_OUTER = 2.27

const band = (x, lo, hi, soft = 0.02) =>
  TSL.smoothstep(lo - soft, lo + soft, x).mul(
    TSL.smoothstep(hi + soft, hi - soft, x),
  )

// The radial profile, Saturn-true: faint C, bright B, the Cassini gap,
// medium A with an Encke hint — then radial grooves from a thin fbm.
export function ringDensity(x) {
  let d = band(x, RING_INNER, 1.53).mul(0.32)
  d = d.add(band(x, 1.53, 1.95))
  d = d.add(band(x, 2.03, RING_OUTER).mul(0.62))
  d = d.mul(band(x, 1.95, 2.03, 0.012).mul(0.94).oneMinus()) // Cassini
  d = d.mul(band(x, 2.2, 2.223, 0.006).mul(0.85).oneMinus()) // Encke
  const grain = fbm(TSL, TSL.vec3(x.mul(26), 0.73, 4.1), { octaves: 2 })
    .mul(0.5)
    .add(0.5)
  return d.mul(grain.mul(0.38).add(0.72)).clamp(0, 1)
}

export function buildRingMaterial({
  sun = [0, 0.6, 0.8],
  scale = 1,
  shadow = true,
} = {}) {
  const m = new MeshBasicNodeMaterial()

  // ring-plane position in R units (planar-uv trick, black-hole
  // disc precedent); the plane is z = 0 in mesh-local space
  const p = TSL.uv().sub(0.5).mul(2 * RING_OUTER)
  const x = p.length()
  const rho = ringDensity(x)

  // icy grey-blue → warm gold with density
  const tint = TSL.mix(
    TSL.vec3(0.72, 0.74, 0.78),
    TSL.vec3(0.9, 0.82, 0.64),
    rho,
  )

  // lighting folds to a constant: the plane normal is +z in mesh-local,
  // so lit-face + transmitted-face brightness depend only on sun.z.
  // Kept modest — bright rings bloom, and bloom washes the shadow
  // (the black-hole lesson, again).
  const brightness = 0.3 + 0.5 * Math.abs(sun[2])

  let shade = TSL.float(1)
  if (shadow) {
    // planet shadow: anti-sun side of the plane AND inside the shadow
    // cylinder (planet radius = 1 in R units). Two dot products.
    const s = p.x.mul(sun[0]).add(p.y.mul(sun[1]))
    const axisDist = x.mul(x).sub(s.mul(s)).max(0).sqrt()
    const inCyl = TSL.smoothstep(1.0, 0.88, axisDist)
    const behind = TSL.smoothstep(0.05, -0.2, s)
    shade = inCyl.mul(behind).mul(0.93).oneMinus() // floor 0.07
  }

  m.colorNode = tint.mul(brightness).mul(shade)
  m.opacityNode = rho.mul(0.92)
  m.transparent = true
  m.side = DoubleSide
  m.depthWrite = false
  return m
}
