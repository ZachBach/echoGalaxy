import * as TSL from 'three/tsl'
import { AdditiveBlending } from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { spinY } from './tsl-lib/util/spinY.js'
import { terminator } from './tsl-lib/fresnel/terminator.js'
import { atmosphereShell } from './tsl-lib/fresnel/atmosphereShell.js'
import { TERMINATOR_FOR } from './planetRecipes.js'
import { sunDir } from './sun.js'

// Rotate a direction about local X. Obliquity is a build-time constant, so
// cos/sin fold in JS and this costs four multiplies on the GPU.
function tiltX(TSL, dir, angle) {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return TSL.vec3(
    dir.x,
    dir.y.mul(c).sub(dir.z.mul(s)),
    dir.y.mul(s).add(dir.z.mul(c)),
  )
}

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
// `obliquity` (radians) tilts the body's rotation axis off the orbital-plane
// normal. It rides in the sampling direction rather than on the mesh, for the
// same reason spin does: `dir` has to stay world-aligned so the terminator
// keeps pointing at the sun. Tilting the mesh instead would drag the day/night
// line around with the poles, which is exactly wrong. A sphere is symmetric,
// so nothing is lost by leaving the geometry alone.
export function buildPlanetMaterial({
  recipe,
  cfg = {},
  spinRate = 0.04,
  obliquity = 0,
  sun = sunDir,
  frozen = false,
}) {
  const clock = frozen ? TSL.float(0) : TSL.time
  const dir = TSL.positionLocal.normalize()
  const bodyDir = obliquity ? tiltX(TSL, dir, -obliquity) : dir
  const spunDir = spinY(TSL, bodyDir, clock.mul(spinRate))
  const ctx = { dir, spunDir, sun, clock, cfg }

  const { surface, nightLights, emissive } = recipe(TSL, ctx)
  // Terminator softness is a property of the body type — an airless world has
  // a knife-edge day/night line, a thick atmosphere smears it into a wide
  // twilight — so it defaults from the recipe and stays overridable per body.
  const { shade, night } = terminator(
    TSL,
    dir,
    sun,
    cfg.terminator || TERMINATOR_FOR.get(recipe),
  )

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
