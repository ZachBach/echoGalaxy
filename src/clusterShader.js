import * as TSL from 'three/tsl'
import { AdditiveBlending, Sprite } from 'three'
import { PointsNodeMaterial } from 'three/webgpu'
import { hashChannels } from './tsl-lib/noise/hashChannels.js'

// The Coma Cluster field (CB-02) — one thousand galaxies, one draw.
// Everything per-instance derives in-shader from instanceIndex hashes
// (the G2-11 zero-buffer pattern): position (core/halo mixture ≈ King
// profile), smudge orientation + ellipticity, size, brightness, the
// red-sequence color draw, and the peculiar-velocity draw behind the
// redshift-space morph.
//
// The morph (CB-10): positionNode = P + normalize(P − cameraPos) · v ·
// A(rN) · zSpace. The stretch axis is live view geometry, so the
// Finger of God points at the camera and tracks the orbit; zSpace is
// one uniform glided in JS — frozen at any value, the field is
// deterministic (no clock exists in this module).

export const CLUSTER_COUNT = 1000

// triangular ≈ gaussian from a pair of hash channels, centered on 0
const pair = (a, b) => a.add(b).sub(1)

export function buildClusterMaterial({ zSpace }) {
  const h = hashChannels(TSL, TSL.instanceIndex, 12)

  // — distribution: 72% core (σ 1.0), 28% halo (σ 2.6), x stretched
  const halo = TSL.step(0.72, h[6])
  const sigma = TSL.mix(1.0, 2.6, halo)
  const pos = TSL.vec3(
    pair(h[0], h[1]).mul(sigma).mul(1.25),
    pair(h[2], h[3]).mul(sigma),
    pair(h[4], h[5]).mul(sigma),
  )
  const rN = pos.length().div(3.2).clamp(0, 1)

  // — redshift-space displacement along the live line of sight
  const vel = h[11].sub(0.5).mul(2) // −1..1
  const dispersion = TSL.float(1).add(TSL.exp(rN.mul(rN).mul(-3)).mul(2))
  const viewDir = pos.sub(TSL.cameraPosition).normalize()
  const displaced = pos.add(viewDir.mul(vel.mul(2.8).mul(dispersion).mul(zSpace)))

  // — the smudge: rotated, squashed gaussian in the quad's uv
  const p = TSL.uv().sub(0.5).mul(2)
  const th = h[8].mul(Math.PI * 2)
  const c = TSL.cos(th)
  const s = TSL.sin(th)
  const ex = p.x.mul(c).add(p.y.mul(s))
  const ey = p.y.mul(c).sub(p.x.mul(s))
  const q = h[9].mul(0.6).add(0.4) // ellipticity 0.4..1
  const d2 = ex.mul(ex).add(ey.div(q).mul(ey.div(q)))
  const smudge = TSL.exp(d2.mul(-3.2)).sub(0.04).max(0)

  // — the red sequence: quenched red core, blue survivors outside
  const blueFrac = TSL.smoothstep(0.45, 1, rN).mul(0.55).add(0.06)
  const isBlue = TSL.step(h[9], blueFrac) // h[9] reused at a new scale
  const tint = TSL.mix(
    TSL.color(0xd9b090), // red-and-dead
    TSL.color(0xa7c4ff), // star-forming survivor
    isBlue,
  )
  const brightness = h[10].mul(0.55).add(0.5)

  const mat = new PointsNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: true,
  })
  mat.positionNode = displaced
  mat.colorNode = tint.mul(brightness)
  mat.opacityNode = smudge
  // log-ish sizes: many dwarfs, few giants
  mat.sizeNode = TSL.float(0.3).mul(h[7].mul(h[7]).mul(1.7).add(0.5))
  return mat
}

export function createClusterField({ count = CLUSTER_COUNT } = {}) {
  const zSpace = TSL.uniform(0)
  const material = buildClusterMaterial({ zSpace })
  const sprite = new Sprite(material)
  sprite.count = count
  sprite.frustumCulled = false
  return { sprite, zSpace }
}

// Melotte 111 (CB-06) — Berenice's Hair itself: the ~30-star spray in
// the FOREGROUND, between the viewer and the distant cluster. The two
// objects that share one name, in literal depth — parallax on orbit
// sells it. Bright A-star blue-white with a few warm interlopers;
// bloom supplies the shine.
export const HAIR_COUNT = 30

export function buildHairMaterial() {
  const h = hashChannels(TSL, TSL.instanceIndex, 6)
  const pos = TSL.vec3(
    h[0].sub(0.5).mul(14), // x ±7
    h[1].sub(0.5).mul(9), // y ±4.5
    h[2].mul(4).add(5), // z 5..9 — in front of the cluster
  )
  const p = TSL.uv().sub(0.5).mul(2)
  const d2 = p.x.mul(p.x).add(p.y.mul(p.y))
  const disc = TSL.exp(d2.mul(-5.5)).sub(0.02).max(0)
  const gold = TSL.step(0.8, h[5])
  const tint = TSL.mix(TSL.color(0xcfe2ff), TSL.color(0xffd9a0), gold)

  const mat = new PointsNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: true,
  })
  mat.positionNode = pos
  mat.colorNode = tint.mul(1.6)
  mat.opacityNode = disc
  mat.sizeNode = TSL.float(0.5).mul(h[3].mul(0.9).add(0.6))
  return mat
}

export function createHairField({ count = HAIR_COUNT } = {}) {
  const sprite = new Sprite(buildHairMaterial())
  sprite.count = count
  sprite.frustumCulled = false
  return sprite
}
