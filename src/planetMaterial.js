import * as TSL from 'three/tsl'
import { AdditiveBlending } from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { spinY } from './tsl-lib/util/spinY.js'
import { terminator } from './tsl-lib/fresnel/terminator.js'
import { atmosphereShell } from './tsl-lib/fresnel/atmosphereShell.js'
import { sunDir } from './sun.js'

// The <Planet> body material (G1-01 design). Plain JS so the graph is
// smokeable in node without a browser — Planet.jsx is a thin wrapper.
//
// recipe(TSL, ctx) => { surface, nightLights?, emissive? } — vec3 nodes.
//   ctx = { dir, spunDir, sun, clock, cfg }
//
// Terminator composition happens here, once, for every recipe:
//   color = surface·shade + nightLights·night + emissive
// `dir` (unspun, == normal on the unit sphere) anchors the terminator to
// the world; `spunDir` drives pattern sampling so the surface drifts
// beneath a fixed terminator. All animation derives from ctx.clock —
// float(0) when frozen, so frozen frames are fully deterministic.
export function buildPlanetMaterial({
  recipe,
  cfg = {},
  spinRate = 0.04,
  sun = sunDir,
  frozen = false,
}) {
  const clock = frozen ? TSL.float(0) : TSL.time
  const dir = TSL.positionLocal.normalize()
  const spunDir = spinY(TSL, dir, clock.mul(spinRate))
  const ctx = { dir, spunDir, sun, clock, cfg }

  const { surface, nightLights, emissive } = recipe(TSL, ctx)
  const { shade, night } = terminator(TSL, dir, sun, cfg.terminator)

  let color = surface.mul(shade)
  if (nightLights) color = color.add(nightLights.mul(night))
  if (emissive) color = color.add(emissive)

  const material = new MeshBasicNodeMaterial()
  material.colorNode = color
  return material
}

// The limb-glow shell (G1-06): additive fresnel ring, brightest on the
// day side, on a slightly larger sphere over the body. opts are
// atmosphereShell's (inner, outer, power, strength, dayEdges); the shell
// radius multiplier (`scale`, default 1.03) is consumed by <Planet>, not
// here.
export function buildAtmosphereMaterial({ sun = sunDir, ...opts } = {}) {
  const { color, opacity } = atmosphereShell(TSL, sun, opts)
  const material = new MeshBasicNodeMaterial()
  material.colorNode = color
  material.opacityNode = opacity
  material.transparent = true
  material.blending = AdditiveBlending
  material.depthWrite = false
  return material
}
