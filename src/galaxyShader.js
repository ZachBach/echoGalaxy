import * as TSL from 'three/tsl'
import { AdditiveBlending, Color, DoubleSide } from 'three'
import { PointsNodeMaterial, MeshBasicNodeMaterial } from 'three/webgpu'
import { hashChannels } from './tsl-lib/noise/hashChannels.js'
import { spriteDisc } from './tsl-lib/pattern/spriteDisc.js'
import { flicker } from './tsl-lib/pattern/flicker.js'
import { fbm } from './tsl-lib/noise/fbm.js'
import { blackbody } from './tsl-lib/ramp/blackbody.js'

// The G2 galaxy: every per-star quantity — position, temperature, size,
// twinkle phase — derives in-shader from `instanceIndex` via hashChannels.
// There are NO per-star attributes; the CPU contributes a count and a set
// of uniforms. Three family graphs share one uniforms object:
//   disc       spiral + barred (bar=0 ⇒ pure spiral) — uniform-swappable
//   elliptical dense-cored ellipsoid
//   irregular  star-forming clumps
// All animation derives from the clock passed at build (frozen ⇒ float(0)).

export function makeGalaxyUniforms() {
  const u = (v) => TSL.uniform(v)
  return {
    radius: u(8),
    arms: u(3),
    spin: u(1.15),
    bar: u(0), // 0 disables the bar branch (spiral IS barred with bar=0)
    randomness: u(0.32),
    thickness: u(0.34),
    shapeExp: u(0.7), // radial density shaping exponent
    tempCore: u(4200),
    tempRim: u(11000),
  }
}

export function applyGalaxyCfg(U, cfg) {
  U.radius.value = cfg.radius ?? 8
  U.arms.value = cfg.arms ?? 3
  U.spin.value = cfg.spin ?? 1.1
  U.bar.value = cfg.type === 'barred' ? (cfg.bar ?? 0.4) : 0
  U.randomness.value = cfg.randomness ?? 0.32
  U.thickness.value = cfg.thickness ?? 0.36
  U.shapeExp.value = cfg.type === 'elliptical' ? 2 : 0.7
  U.tempCore.value = cfg.tempCore ?? 4500
  U.tempRim.value = cfg.tempRim ?? 9000
}

export const familyOf = (type) =>
  type === 'elliptical' || type === 'irregular' ? type : 'disc'

// gaussian-ish (-1..1) from three hash channels — the CPU gauss() shape
const gauss3 = (TSL, a, b, c) => a.add(b).add(c).sub(1.5).div(1.5)
// cubic-biased signed jitter — the CPU jitter() shape
const jit = (TSL, h, hs) => h.pow(3).mul(hs.sub(0.5).sign())

// densityFalloff prototype (G2-14, promotion candidate): eases stars out
// near the rim instead of the CPU era's hard radius cutoff.
export const densityFalloff = (TSL2, rN, { start = 0.85, end = 1.02 } = {}) =>
  TSL2.smoothstep(start, end, rN).oneMinus()

// spiralArm prototype (G2-12, promotion candidate): the disc-galaxy
// position field — arm placement + winding + scatter — from a radius
// param and a branch random, all cfg as nodes/uniforms.
export const spiralArm = (TSL2, u, branchRand, h, U) => {
  const rN = u.pow(U.shapeExp)
  const r = rN.mul(U.radius)
  const branch = branchRand.mul(U.arms).floor().div(U.arms).mul(Math.PI * 2)
  const angle = branch.add(r.mul(U.spin))
  const rr = U.randomness.mul(r)
  const sx = TSL2.cos(angle).mul(r).add(jit(TSL2, h[0], h[1]).mul(rr))
  const sz = TSL2.sin(angle).mul(r).add(jit(TSL2, h[2], h[3]).mul(rr))
  const sy = gauss3(TSL2, h[4], h[5], h[6]).mul(U.thickness).mul(rN.mul(0.5).oneMinus())

  // bar branch (barred spirals): straight inner bar along x
  const end = branchRand.step(0.5).mul(Math.PI) // half the stars each end
  const bx = TSL2.cos(end).mul(r).add(jit(TSL2, h[0], h[1]).mul(U.randomness).mul(U.radius).mul(0.25))
  const bz = TSL2.sin(end).mul(r).mul(0.22).add(gauss3(TSL2, h[2], h[3], h[5]).mul(U.randomness).mul(0.9))
  const by = gauss3(TSL2, h[4], h[6], h[7]).mul(U.thickness)

  const inBar = TSL2.step(r, U.radius.mul(U.bar))
  return {
    pos: TSL2.mix(TSL2.vec3(sx, sy, sz), TSL2.vec3(bx, by, bz), inBar),
    rN,
  }
}

function discPosition(h, U) {
  return spiralArm(TSL, h[8], h[9], h, U)
}

function ellipticalPosition(h, U) {
  const rN = h[8].pow(U.shapeExp)
  const r = rN.mul(U.radius)
  const dir = TSL.vec3(
    gauss3(TSL, h[0], h[1], h[2]),
    gauss3(TSL, h[3], h[4], h[5]).mul(0.72),
    gauss3(TSL, h[6], h[7], h[9]).mul(0.86),
  ).add(TSL.vec3(0, 1e-4, 0))
  return { pos: dir.normalize().mul(r), rN }
}

function irregularPosition(h, U) {
  const clumps = 5
  const c = h[8].mul(clumps).floor()
  const ca = c.div(clumps).mul(Math.PI * 2).add(gauss3(TSL, h[0], h[1], h[2]).mul(0.4))
  const cr = U.radius.mul(c.mod(3).div(2).mul(0.4).add(0.25))
  const gx = gauss3(TSL, h[3], h[4], h[5])
  const gz = gauss3(TSL, h[6], h[7], h[9])
  const gy = gauss3(TSL, h[1], h[5], h[10])
  const x = TSL.cos(ca).mul(cr).add(gx.mul(U.radius).mul(0.32))
  const z = TSL.sin(ca).mul(cr).add(gz.mul(U.radius).mul(0.32))
  const y = gy.mul(U.thickness).mul(1.6)
  const rN = TSL.vec2(x, z).length().div(U.radius).min(1)
  return { pos: TSL.vec3(x, y, z), rN }
}

const POSITION = {
  disc: discPosition,
  elliptical: ellipticalPosition,
  irregular: irregularPosition,
}

// ---- Nebula veil (G2-28/29): the galaxy's own interstellar medium ----
// A disc-plane circle under the stars (additive, renders first). Palettes
// are educational-physics-keyed (G2-28 table): Hα pink + reflection blue
// for star-formers, warm dust for the barred core, near-absent amber for
// the gas-poor elliptical — the rendering itself teaches the gas budget.

// Unit-circle geometry, scaled to the veil radius per type — fragments
// only exist where the veil can be nonzero (a full-bleed plane at dpr 2
// cost ~33 fps; see G2-34). Field cost: TWO fbm evals (one cheap warp
// channel + the veil), not warp()'s three-plus-one.
export function makeNebulaUniforms() {
  return {
    colA: TSL.uniform(new Color(0xd46a9e)),
    colB: TSL.uniform(new Color(0x5a8fd6)),
    strength: TSL.uniform(0.15),
    worldFreq: TSL.uniform(3.4), // freq · veil radius (JS-side product)
    falloffStart: TSL.uniform(0.3),
  }
}

export function applyNebulaCfg(N, cfg) {
  const n = cfg.nebula ?? {}
  N.colA.value.set(n.a ?? 0xd46a9e)
  N.colB.value.set(n.b ?? 0x5a8fd6)
  N.strength.value = n.strength ?? 0.15
  N.worldFreq.value = (n.freq ?? 0.32) * (cfg.radius ?? 8) * 1.2
  N.falloffStart.value = n.falloff ?? 0.3
  return (cfg.radius ?? 8) * 1.2 // veil radius — the rig scales the mesh
}

export function buildNebulaMaterial(N, { frozen = false } = {}) {
  const clock = frozen ? TSL.float(0) : TSL.time
  const p01 = TSL.uv().sub(0.5).mul(2) // -1..1 over the unit circle
  const rN = p01.length()
  const mask = TSL.smoothstep(N.falloffStart, 1.0, rN).oneMinus()
  const q = TSL.vec3(p01.x.mul(N.worldFreq), p01.y.mul(N.worldFreq), clock.mul(0.015))
  // Budget: 3 fbm octaves total (G2-34 — the pretty 4-eval warp+fbm
  // version cost two thirds of the frame rate). Soft clouds are honest
  // for gas anyway.
  const w = fbm(TSL, q.mul(0.5), { octaves: 1 }).mul(0.9)
  const veil = fbm(TSL, q.add(TSL.vec3(w, w.negate(), 0)), { octaves: 2 })
    .mul(0.5)
    .add(0.5)
  const mat = new MeshBasicNodeMaterial()
  mat.colorNode = TSL.mix(N.colB, N.colA, veil)
  mat.opacityNode = veil.pow(1.6).mul(mask).mul(N.strength)
  mat.transparent = true
  mat.blending = AdditiveBlending
  mat.depthWrite = false
  mat.side = DoubleSide
  return mat
}

export function buildGalaxyMaterial(family, U, { frozen = false } = {}) {
  const clock = frozen ? TSL.float(0) : TSL.time
  const h = hashChannels(TSL, TSL.instanceIndex, 12)

  const { pos, rN } = POSITION[family](h, U)

  const mat = new PointsNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: true,
  })
  mat.positionNode = pos
  mat.colorNode = blackbody(TSL, TSL.mix(U.tempCore, U.tempRim, rN))
  mat.opacityNode = spriteDisc(TSL, TSL.uv(), { edge: 0.06, core: 0.4 })
    .mul(flicker(TSL, clock, { rate: 1.6, phase: h[11].mul(Math.PI * 2), depth: 0.22 }))
    .mul(densityFalloff(TSL, rN))
  mat.sizeNode = TSL.float(0.09).mul(h[10].mul(0.6).add(0.7)) // mean-1 jitter
  return mat
}
