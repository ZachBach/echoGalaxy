import * as TSL from 'three/tsl'
import { AdditiveBlending } from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { spinY } from './tsl-lib/util/spinY.js'
import { turbulence } from './tsl-lib/noise/turbulence.js'
import { fireRamp } from './tsl-lib/ramp/fireRamp.js'
import { remap } from './tsl-lib/ramp/remap.js'
import { fresnel } from './tsl-lib/fresnel/fresnel.js'
import { streaks } from './tsl-lib/pattern/streaks.js'

// <Star> materials (G1-26/27, El-Sol recipe family). Separate from the
// planet pipeline by design (G1-01 scope call): no terminator — the star
// IS the light. Plain JS so both graphs are node-smokeable.

// Body: slow-churning turbulence through fireRamp. fireRamp's internal
// 0.95 clamp is load-bearing — above it the channel ordering inverts and
// plasma turns blue-white, so brightness tuning happens in the remap/gain
// here, never by removing the clamp. Bloom balance (G1-28) is also tuned
// here — never in Effects.jsx.
export function buildStarBodyMaterial({ spinRate = 0.02, frozen = false, gain = 2.4 } = {}) {
  const clock = frozen ? TSL.float(0) : TSL.time
  const dir = TSL.positionLocal.normalize()
  const spun = spinY(TSL, dir, clock.mul(spinRate))
  const p = spun.mul(2.4).add(TSL.vec3(0, clock.mul(-0.06), 0))
  const churn = turbulence(TSL, p, { octaves: 4 })
  const plasma = fireRamp(TSL, remap(TSL, churn, 0, 1, 0.8, 4.0), { gain })
  // limb darkening — real stars dim toward the edge; also keeps the
  // silhouette from blowing out under bloom
  const limb = fresnel(TSL, { power: 1.6 }).oneMinus().mul(0.55).add(0.45)
  const material = new MeshBasicNodeMaterial()
  material.colorNode = plasma.mul(limb)
  return material
}

// Corona: angular streak lobes around the view axis on an additive shell.
// Falloff is *radial in view space* — brightest just off the body limb,
// gone before the shell's own edge (a fresnel-based falloff peaks at the
// shell silhouette and reads as a hard-edged annulus — tried and
// rejected). positionView is safe on mesh shells — the ledger's entry 2
// (dead positionView) applies only to the sprite billboard path.
export function buildCoronaMaterial({
  frozen = false,
  bodyRadius = 1.7,
  shellRadius = 2.1,
  lobes = 3,
  sharpness = 3,
  floor = 0.45,
  color = 0xffa64d,
  strength = 0.8,
} = {}) {
  const clock = frozen ? TSL.float(0) : TSL.time
  const ang = TSL.atan(TSL.positionView.y, TSL.positionView.x)
  const s = streaks(TSL, ang, { lobes, sharpness, floor, drift: clock.mul(0.04) })
  // Radial coordinate = the view ray's closest approach to the star
  // center (impact parameter), NOT positionView.xy.length() — on the
  // shell's front surface that lateral offset is perspective-shrunk (a
  // ray grazing the body limb hits the shell at ~0.7·bodyRadius) and the
  // falloff lands in the wrong place. b: body limb → bodyRadius, shell
  // silhouette → shellRadius, exactly.
  const P = TSL.positionView
  const v = P.normalize()
  const C = TSL.modelViewMatrix.mul(TSL.vec4(0, 0, 0, 1)).xyz
  const b = C.sub(v.mul(C.dot(v))).length()
  const falloff = TSL.smoothstep(bodyRadius * 1.02, shellRadius * 0.98, b).oneMinus()
    .mul(TSL.smoothstep(bodyRadius * 0.9, bodyRadius, b)) // keep the disc face clean
  const material = new MeshBasicNodeMaterial()
  material.colorNode = TSL.color(color).mul(s)
  material.opacityNode = falloff.mul(strength)
  material.transparent = true
  material.blending = AdditiveBlending
  material.depthWrite = false
  return material
}
