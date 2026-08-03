import * as TSL from 'three/tsl'
import { HalfFloatType, NoBlending, RenderTarget } from 'three'
import { MeshBasicNodeMaterial, QuadMesh } from 'three/webgpu'

// volumeAtlas (SN-02) — the shared slice-atlas volume machinery,
// extracted from the Pillars (PC-05's bake hatch) the day it earned a
// second consumer (the Crab). Three pieces, all field-agnostic:
//
//   1. the BAKE: a fullscreen quad over a 2D atlas of z-slices; each
//      tile decodes to a voxel of the bounds box and evaluates the
//      caller's field(p) → vec4 once, at boot, into a HalfFloat RT;
//   2. the SAMPLER: pseudo-3D reads from the atlas — half-texel inset
//      per tile (bilinear must never bleed a neighbouring slice), two
//      taps lerped across z;
//   3. the MARCH: front-face entry, analytic ray-box exit over the
//      same bounds, a fixed-step loop with front-to-back accumulation,
//      shading delegated to the caller's shade(sample, pos, dt) →
//      { src, a }.
//
// Fields keep their anatomy, channels, and shading laws; this module
// keeps the geometry and the transport. Determinism is inherited: the
// bake runs once, and nothing here owns a clock.

export function buildAtlasBakeMaterial({ atlas, bounds, field }) {
  const m = new MeshBasicNodeMaterial()
  const u = TSL.uv()
  const tile = u.mul(TSL.vec2(atlas.cols, atlas.rows))
  const col = tile.x.floor()
  const row = tile.y.floor()
  const slice = row.mul(atlas.cols).add(col)
  const vx = tile.x.fract()
  const vy = tile.y.fract()
  const vz = slice.div(atlas.nz - 1).clamp(0, 1)
  const p = TSL.vec3(
    vx.sub(0.5).mul(2 * bounds.x),
    vy.sub(0.5).mul(2 * bounds.y),
    vz.sub(0.5).mul(2 * bounds.z),
  )
  m.colorNode = field(p)
  m.blending = NoBlending
  return m
}

export function bakeAtlas(renderer, { atlas, bounds, field }) {
  const rt = new RenderTarget(atlas.sw * atlas.cols, atlas.sh * atlas.rows, {
    depthBuffer: false,
    type: HalfFloatType,
  })
  const bakeMat = buildAtlasBakeMaterial({ atlas, bounds, field })
  const quad = new QuadMesh(bakeMat)
  const prev = renderer.getRenderTarget()
  renderer.setRenderTarget(rt)
  quad.render(renderer)
  renderer.setRenderTarget(prev)
  bakeMat.dispose()
  return rt
}

export const atlasSampler =
  (texture, { atlas, bounds }) =>
  (p) => {
    const vx = p.x.div(2 * bounds.x).add(0.5).clamp(0, 1)
    const vy = p.y.div(2 * bounds.y).add(0.5).clamp(0, 1)
    const vz = p.z.div(2 * bounds.z).add(0.5).clamp(0, 1)
    const uTile = vx.mul(atlas.sw - 1).add(0.5).div(atlas.sw)
    const vTile = vy.mul(atlas.sh - 1).add(0.5).div(atlas.sh)
    const k = vz.mul(atlas.nz - 1)
    const f = k.fract()
    const tap = (slice) => {
      const row = slice.mul(1 / atlas.cols).floor()
      const cl = slice.sub(row.mul(atlas.cols))
      return TSL.texture(
        texture,
        TSL.vec2(cl.add(uTile).div(atlas.cols), row.add(vTile).div(atlas.rows)),
      )
    }
    const s0 = k.floor()
    const s1 = s0.add(1).min(atlas.nz - 1)
    return TSL.mix(tap(s0), tap(s1), f)
  }

export function buildMarchMaterial({ atlas, bounds, texture, steps, shade }) {
  const m = new MeshBasicNodeMaterial()
  const sample = atlasSampler(texture, { atlas, bounds })

  const march = TSL.Fn(() => {
    const ro = TSL.cameraPosition
    const entry = TSL.positionWorld
    const rd = entry.sub(ro).normalize().toVar()

    const b = TSL.vec3(bounds.x, bounds.y, bounds.z)
    const safe = rd.sign().mul(rd.abs().max(1e-4))
    const tA = b.negate().sub(ro).div(safe)
    const tB = b.sub(ro).div(safe)
    const tMax = tA.max(tB)
    const tFar = tMax.x.min(tMax.y).min(tMax.z)
    const tEntry = entry.sub(ro).dot(rd)
    const dt = tFar.sub(tEntry).max(0).div(steps)

    const pos = entry.toVar()
    const stepVec = rd.mul(dt).toVar()
    const T = TSL.float(1).toVar()
    const acc = TSL.vec3(0).toVar()

    TSL.Loop(steps, () => {
      const smp = sample(pos)
      const { src, a } = shade(smp, pos, dt)
      acc.addAssign(src.mul(a).mul(T))
      T.mulAssign(a.oneMinus())
      pos.addAssign(stepVec)
    })
    return TSL.vec4(acc, T.oneMinus())
  })()

  m.colorNode = march.xyz
  m.opacityNode = march.w
  m.transparent = true
  m.depthWrite = false
  return m
}
