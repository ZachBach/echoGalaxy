import * as TSL from 'three/tsl'
import { BackSide, HalfFloatType, Mesh, NoBlending, RenderTarget, SphereGeometry } from 'three'
import { MeshBasicNodeMaterial, QuadMesh } from 'three/webgpu'
import { flicker } from './tsl-lib/pattern/flicker.js'
import { latlonUv } from './tsl-lib/util/latlonUv.js'

// Deep-space skybox (G3-01 decision): BackSide sphere, mesh-scaled to
// world size. The star field is STARFIELD's hash-cell machinery
// (src/tsl-lib/materials/starfield.js — the canonical version) minus its
// fullscreen fbm wisp (G3-06: the wisp cost ~14 fps for a term the dim
// factor had already pushed below perception). Colors are echoGalaxy's
// own ice/gold per the educational-palette rule.
//
// G3-10: the field bakes to an equirect texture once at boot —
// bakeSkybox() — sampled back through the library's latlonUv (finally
// earning its keep). Twinkle survives the bake: per-cell phase rides the
// texture's alpha channel; only the per-cell rate variety flattens to a
// constant (documented trade).

// Static star field over a direction-scaled domain: color + the raw h2
// hash (the twinkle phase channel).
function starField(p) {
  const { vec3, hash, step, smoothstep } = TSL
  const g = p.mul(7)
  const id = g.floor().add(vec3(101.3, 211.7, 313.1))
  const f = g.fract()
  const h1 = hash(id.dot(vec3(1.0, 57.0, 113.0)))
  const h2 = hash(id.dot(vec3(57.0, 113.0, 1.0)))
  const h3 = hash(id.dot(vec3(113.0, 1.0, 57.0)))
  const seat = vec3(h1, h2, h3).mul(0.7).add(0.15)
  const d = f.sub(seat).length()
  const lit = step(0.82, h3)
  const star = smoothstep(0.16, 0.02, d).mul(lit)
  const gold = step(0.93, h2)
  const color = TSL.mix(TSL.color(0xcfe2ff), TSL.color(0xffd9a0), gold).mul(star.mul(2.2))
  return { color, h1, h2 }
}

const DOMAIN = 7 // star-density knob: positionLocal magnitude × the ×7 lattice

export function buildSkyboxMaterial({ frozen = false, dim = 0.5 } = {}) {
  const clock = frozen ? TSL.float(0) : TSL.time
  const { color, h1, h2 } = starField(TSL.positionLocal)
  const tw = flicker(TSL, clock, { rate: h1.mul(3).add(1), phase: h2.mul(40), depth: 0.7 })
  const material = new MeshBasicNodeMaterial()
  material.colorNode = color.mul(tw).mul(dim)
  material.side = BackSide
  material.depthWrite = false
  return material
}

export function createSkybox({ frozen = false, radius = 60, domainRadius = DOMAIN, dim = 0.5 } = {}) {
  const mesh = new Mesh(
    new SphereGeometry(domainRadius, 48, 48),
    buildSkyboxMaterial({ frozen, dim }),
  )
  mesh.scale.setScalar(radius / domainRadius)
  mesh.renderOrder = -10
  mesh.frustumCulled = false
  return mesh
}

// Bake the star field to a 2048×1024 equirect once (it is static modulo
// twinkle) and swap the mesh to a textured material: one texture sample
// + one sin per fragment instead of three hashes + trig. Falls back to
// the live material on any failure.
export function bakeSkybox(mesh, renderer, { frozen = false, dim = 0.5 } = {}) {
  try {
    const rt = new RenderTarget(2048, 1024, { depthBuffer: false, type: HalfFloatType })
    const bakeMat = new MeshBasicNodeMaterial()
    // inverse of latlonUv: uv → direction
    const u = TSL.uv()
    const lon = u.x.sub(0.5).mul(Math.PI * 2)
    const lat = u.y.sub(0.5).mul(Math.PI)
    const dir = TSL.vec3(
      TSL.cos(lat).mul(TSL.cos(lon)),
      TSL.sin(lat),
      TSL.cos(lat).mul(TSL.sin(lon)),
    )
    const { color, h2 } = starField(dir.mul(DOMAIN))
    bakeMat.colorNode = TSL.vec4(color.mul(dim), h2)
    bakeMat.blending = NoBlending
    const quad = new QuadMesh(bakeMat)
    const prev = renderer.getRenderTarget()
    renderer.setRenderTarget(rt)
    quad.render(renderer)
    renderer.setRenderTarget(prev)

    const clock = frozen ? TSL.float(0) : TSL.time
    const texMat = new MeshBasicNodeMaterial()
    const d = TSL.positionLocal.normalize()
    const tex = TSL.texture(rt.texture, latlonUv(TSL, d))
    const tw = flicker(TSL, clock, { rate: 2, phase: tex.a.mul(40), depth: 0.7 })
    texMat.colorNode = tex.rgb.mul(tw)
    texMat.side = BackSide
    texMat.depthWrite = false

    const live = mesh.material
    mesh.material = texMat
    live.dispose()
    bakeMat.dispose()
  } catch (err) {
    console.warn('skybox bake unavailable — live path:', err.message)
  }
}
