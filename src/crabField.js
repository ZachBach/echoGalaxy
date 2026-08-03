import { ridgedFbm } from './tsl-lib/noise/ridgedFbm.js'
import { worleyF1F2 } from './tsl-lib/noise/worley.js'

// The Crab Nebula density field (SN-03) — pure module per the SN-01
// contract. The wreckage of SN 1054: an ellipsoidal SHELL of shredded
// ejecta filaments (a worley F2−F1 web — the ice-crack machinery
// reborn at nebula scale) around the smooth synchrotron ghost that the
// pulsar keeps lit. An emission nebula lights itself: no sun tap, and
// no clock — static by the bake's own precedent.
//
// Channels: R = filament density, G = synchrotron glow, B = ellipsoid
// radius (the shading falloffs read it back).

export const CRAB_BOUNDS = { x: 1.5, y: 1.15, z: 1.15 }
const AXES = [1.35, 0.95, 0.95] // the real ~1.4:1 oval

export const crabField = (TSL, p) => {
  const q = TSL.vec3(p.x.div(AXES[0]), p.y.div(AXES[1]), p.z.div(AXES[2]))
  const re = q.length()

  // the shell: a gaussian band at re ≈ 0.97
  const band = TSL.exp(re.sub(0.97).div(0.16).pow(2).negate())

  // the filament web: cell borders of a worley partition (F2−F1 small
  // at the walls), roughened by ridged detail
  const w = worleyF1F2(TSL, q.mul(3.2), { impl: 'fallback' })
  const web = TSL.smoothstep(0.14, 0.02, w.y.sub(w.x))
  const rough = ridgedFbm(TSL, q.mul(4.1), { octaves: 2 }).mul(0.5).add(0.6)
  const filament = band.mul(web).mul(rough)

  // the synchrotron ghost: smooth, brightest at the heart, fading
  // through the shell
  const glow = TSL.exp(re.mul(re).mul(-2.2))

  return { filament, glow, re }
}

export const crabFieldVec4 = (TSL) => (p) => {
  const { filament, glow, re } = crabField(TSL, p)
  return TSL.vec4(filament, glow, re, 1)
}
