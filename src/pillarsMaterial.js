import * as TSL from 'three/tsl'
import { HalfFloatType, NoBlending, RenderTarget } from 'three'
import { MeshBasicNodeMaterial, QuadMesh } from 'three/webgpu'
import { BOUNDS, samplePillars, densityLite } from './pillarsField.js'
import { flicker } from './tsl-lib/pattern/flicker.js'

// The raymarched Pillars volume — atlas-baked (PC-05 verdict).
//
// The live-noise march measured 2–3 fps at dpr 2 (≈7 noise evals ×
// steps × megapixels): an order of magnitude under the 25 fps gate, so
// the G3-10 bake hatch fired. The field is STATIC — silhouette by
// design, and the interior dust drift died with the bake (recorded
// trade) — so it bakes once at boot into a z-slice atlas via the
// skybox's QuadMesh→RenderTarget pattern:
//   R = density, G = EGG knots, B = light gradient (the photoevap term,
//   pre-tapped toward the cluster at bake time).
// The march then costs two bilinear taps per step (z-slice lerp) plus
// arithmetic. Determinism comes free: no clock survives to runtime.
//
// HDR discipline per the black-hole rule: rim ≤ 1.25, EGGs ≤ 1.6,
// capped at the source, shared bloom untouched.

const ATLAS = { sw: 160, sh: 144, nz: 40, cols: 8, rows: 5 }
const AW = ATLAS.sw * ATLAS.cols // 1280
const AH = ATLAS.sh * ATLAS.rows // 720

const L = (() => {
  const v = [-0.45, 0.85, 0.25]
  const n = Math.hypot(...v)
  return v.map((c) => c / n)
})()
export const LIGHT_DIR = L

const SIGMA = 3.4 // extinction — how fast dust goes opaque

// The bake shader: fullscreen quad over the atlas; each tile is one z
// slice of the field. Exported separately so the node smoke can build
// the graph without a renderer.
export function buildAtlasBakeMaterial({ octaves = 3 } = {}) {
  const m = new MeshBasicNodeMaterial()
  const u = TSL.uv()
  const tile = u.mul(TSL.vec2(ATLAS.cols, ATLAS.rows))
  const col = tile.x.floor()
  const row = tile.y.floor()
  const slice = row.mul(ATLAS.cols).add(col)
  const vx = tile.x.fract()
  const vy = tile.y.fract()
  const vz = slice.div(ATLAS.nz - 1).clamp(0, 1)
  const p = TSL.vec3(
    vx.sub(0.5).mul(2 * BOUNDS.x),
    vy.sub(0.5).mul(2 * BOUNDS.y),
    vz.sub(0.5).mul(2 * BOUNDS.z),
  )
  const lightDir = TSL.vec3(L[0], L[1], L[2])
  const s = samplePillars(TSL, p, { octaves })
  const lit = densityLite(TSL, p.add(lightDir.mul(0.09)))
  const grad = s.rho.sub(lit).max(0)
  m.colorNode = TSL.vec4(s.rho, s.knot, grad, 1)
  m.blending = NoBlending
  return m
}

// Render the atlas once. Returns the render target (caller keeps it
// alive for the material's lifetime; dispose with the scene).
export function bakePillarsAtlas(renderer, { octaves = 3 } = {}) {
  const rt = new RenderTarget(AW, AH, { depthBuffer: false, type: HalfFloatType })
  const bakeMat = buildAtlasBakeMaterial({ octaves })
  const quad = new QuadMesh(bakeMat)
  const prev = renderer.getRenderTarget()
  renderer.setRenderTarget(rt)
  quad.render(renderer)
  renderer.setRenderTarget(prev)
  bakeMat.dispose()
  return rt
}

// Sample the atlas at a world point: clamp to bounds, half-texel inset
// per tile (bilinear must never bleed a neighbouring slice), two taps
// lerped across z.
const sampleAtlas = (tex, p) => {
  const vx = p.x.div(2 * BOUNDS.x).add(0.5).clamp(0, 1)
  const vy = p.y.div(2 * BOUNDS.y).add(0.5).clamp(0, 1)
  const vz = p.z.div(2 * BOUNDS.z).add(0.5).clamp(0, 1)
  const uTile = vx.mul(ATLAS.sw - 1).add(0.5).div(ATLAS.sw)
  const vTile = vy.mul(ATLAS.sh - 1).add(0.5).div(ATLAS.sh)
  const k = vz.mul(ATLAS.nz - 1)
  const f = k.fract()
  const tap = (slice) => {
    const row = slice.mul(1 / ATLAS.cols).floor()
    const cl = slice.sub(row.mul(ATLAS.cols))
    return TSL.texture(
      tex,
      TSL.vec2(cl.add(uTile).div(ATLAS.cols), row.add(vTile).div(ATLAS.rows)),
    )
  }
  const s0 = k.floor()
  const s1 = s0.add(1).min(ATLAS.nz - 1)
  return TSL.mix(tap(s0), tap(s1), f)
}

export function buildPillarsMaterial({ steps = 20, texture, frozen = false } = {}) {
  const clock = frozen ? TSL.float(0) : TSL.time
  const m = new MeshBasicNodeMaterial()

  const march = TSL.Fn(() => {
    const ro = TSL.cameraPosition
    const entry = TSL.positionWorld
    const rd = entry.sub(ro).normalize().toVar()

    // analytic exit from the bounding slab (AABB centered at origin)
    const b = TSL.vec3(BOUNDS.x, BOUNDS.y, BOUNDS.z)
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
      const smp = sampleAtlas(texture, pos)
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
