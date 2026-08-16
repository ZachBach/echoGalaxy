import { ridgedFbm } from './tsl-lib/noise/ridgedFbm.js'
import { worleyF1 } from './tsl-lib/noise/worley.js'

// The Sh 2-80 density field — pure module per the SN-01 contract. The
// ring nebula around WR 124 (also catalogued M1-67): roughly six
// light-years of a 20-solar-mass star's own outer layers, thrown off
// about 20,000 years ago and still being shoved around.
//
// Deliberately NOT the Crab a second time. The Crab is a web of
// filaments lit from inside by a pulsar; this is a field of discrete
// KNOTS around an EVACUATED cavity. The star's wind has swept the
// interior clean, so the centre is a hole rather than a heart — the
// same machinery reading the opposite way.
//
// The second difference is the shape itself. WR 124 is a runaway star,
// ploughing through the interstellar medium at roughly 180 km/s, which
// brakes and compresses the shell ahead of it and lets it stream freely
// astern. The nebula is lopsided, and that lopsidedness is the whole
// silhouette.
//
// The runaway direction is BAKED IN rather than applied as a rotation on
// the mesh, and that is not a style choice. buildMarchMaterial marches in
// WORLD space — it takes its entry point from positionWorld and computes
// the ray-box exit against world-axis-aligned bounds — so rotating the
// group turns the box without turning the volume inside it, and on
// non-cubic bounds it also breaks the exit maths. A group rotation here
// pointed the runaway axis straight at the camera and rendered a perfect
// circle. RUN is therefore already tilted across the default view.
//
// An emission nebula lights itself: no sun tap, and no clock — static
// by the bake's own precedent.
//
// Channels: R = knot density, G = bow shock, B = radius (the shading
// falloffs read it back).

// Bounds follow the warped shell: the long axis is x, because that is
// where RUN points. Astern reaches R0 + 0.22, ahead only R0 - 0.13.
export const WR_BOUNDS = { x: 1.35, y: 1.1, z: 1.1 }

const R0 = 0.86 // mean shell radius, in bounds units

// The direction of travel: almost square across the default view, with
// only a slight tip toward the camera. Tipped further (z = 0.42) the
// shock stopped being a rim and became a bright cap covering the leading
// FACE — the ray then crosses the shock band nearly head-on over a wide
// solid angle, and limb brightening does the rest. Kept side-on, the
// same band shows up where it belongs, at the leading edge.
// Normalised here so the dot product below is a cosine.
export const WR_RUN = (([x, y, z]) => {
  const n = Math.hypot(x, y, z)
  return [x / n, y / n, z / n]
})([0.97, 0.08, 0.2])
const RUN = WR_RUN

export const wrBubbleField = (TSL, p) => {
  const r = p.length()
  // +1 dead ahead, -1 astern. Guarded so the origin is not a divide by
  // zero — the cavity means nothing samples there anyway, but the bake
  // evaluates every voxel including that one.
  const fore = p.div(r.max(1e-4)).dot(TSL.vec3(...RUN))

  // The runaway warp. Each half is clamped at 0 so the leading term
  // cannot reach around into the wake and vice versa.
  const shellR = TSL.float(R0)
    .sub(fore.max(0).pow(1.4).mul(0.13)) // braked ahead
    .add(fore.negate().max(0).pow(2).mul(0.22)) // streaming astern

  // The shell: a gaussian band, THINNER ahead where it is shocked and
  // swept up, thicker astern where it expands freely. Squared by
  // self-multiply rather than pow(x,2) — the base goes negative inside
  // the shell, and pow of a negative base is undefined in GLSL.
  const d = r.sub(shellR).div(TSL.float(0.135).sub(fore.mul(0.05)))
  const band = TSL.exp(d.mul(d).negate())

  // The knots. worley F1 near a cell centre gives blobs where the
  // Crab's F2−F1 gave walls: same lattice, opposite reading. Clumps in
  // M1-67 run to about 30 Earth masses each. Fallback impl for the same
  // reason the Crab pins it — mx_worley availability varies by build
  // (BACKEND-NOTES #3), and the two backends must agree.
  const cell = worleyF1(TSL, p.mul(4.6), { impl: 'fallback' })
  const knot = TSL.smoothstep(0.46, 0.05, cell)
  const grain = ridgedFbm(TSL, p.mul(5.4), { octaves: 2 }).mul(0.5).add(0.55)
  const clump = band.mul(knot.mul(0.8).add(0.32)).mul(grain)

  // The wind cavity's inner wall. The gaussian alone fades inward too
  // gently for a bubble a 2,000 km/s wind has actually swept clean.
  const cavity = TSL.smoothstep(shellR.sub(0.3), shellR.sub(0.08), r)

  // The bow shock: a thin pile-up of swept interstellar medium, ahead
  // only. Same squaring caution as the band.
  //
  // The angular power is high on purpose. At pow(3) the shock covered
  // most of the leading hemisphere and the whole object read as a SPHERE
  // LIT FROM ONE SIDE — exactly the wrong lesson for a cloud that emits
  // its own light. Confined to a rim, it reads as a shock front instead.
  const b = r.sub(shellR).div(0.042)
  const bow = TSL.exp(b.mul(b).negate()).mul(fore.max(0).pow(6))

  return { knots: clump.mul(cavity), bow, r }
}

export const wrBubbleFieldVec4 = (TSL) => (p) => {
  const { knots, bow, r } = wrBubbleField(TSL, p)
  return TSL.vec4(knots, bow, r, 1)
}
