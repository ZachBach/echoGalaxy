import { fbm } from './tsl-lib/noise/fbm.js'
import { ridgedFbm } from './tsl-lib/noise/ridgedFbm.js'
import { worleyF1 } from './tsl-lib/noise/worley.js'

// The Pillars of Creation density field (PC-02) — pure module per the
// PC-01 contract. Slab-local IS world space: the mesh sits at the
// origin, unscaled; the rung frames with the camera.
//
// Three leaning columns (tallest left, per the 1995 Hubble frame) rise
// from a base cloud; their SDF shell is eroded by ridgedFbm into the
// crenellated edges, interior dust varies by fbm (the only animated
// term — the silhouette stands, the dust breathes). EGG knots are
// worley cells confined to the fingertips.

export const BOUNDS = { x: 1.6, y: 1.5, z: 0.5 }
const BASE_Y = -1.5

// x/z: axis foot; top: absolute y of the tip; r: base radius;
// lean: x drift per unit height (tips reach up-left toward the cluster)
const PILLARS = [
  { x: -0.78, z: -0.08, top: 1.32, r: 0.34, lean: -0.11 },
  { x: -0.02, z: 0.06, top: 0.28, r: 0.2, lean: -0.08 },
  { x: 0.74, z: 0.14, top: 0.72, r: 0.27, lean: -0.09 },
]

const smin = (TSL, a, b, k) => {
  const h = TSL.clamp(b.sub(a).div(k).mul(0.5).add(0.5), 0, 1)
  return TSL.mix(b, a, h).sub(h.mul(h.oneMinus()).mul(k))
}

// SDF shell + fingertip mask for the whole formation.
export const pillarField = (TSL, p) => {
  let sd = null
  let tip = null
  for (const c of PILLARS) {
    const span = c.top - BASE_Y
    const hN = TSL.clamp(p.y.sub(BASE_Y).div(span), 0, 1)
    const axisX = TSL.float(c.x).add(p.y.sub(BASE_Y).mul(c.lean))
    const dx = p.x.sub(axisX)
    const dz = p.z.sub(c.z).mul(1.45)
    const radial = TSL.sqrt(dx.mul(dx).add(dz.mul(dz)))
    // taper toward the tip, with a knob just below it (the EGG head)
    const knob = TSL.smoothstep(0.66, 0.88, hN).mul(TSL.smoothstep(1.0, 0.92, hN))
    const radius = TSL.float(c.r)
      .mul(TSL.float(1).sub(hN.mul(0.35)))
      .add(knob.mul(c.r * 0.24))
    // dome: close the column above its top
    const s = radial.sub(radius).add(p.y.sub(c.top).max(0).mul(1.6))
    sd = sd === null ? s : smin(TSL, sd, s, 0.22)
    const tw = TSL.smoothstep(0.6, 0.86, hN).mul(TSL.smoothstep(0.06, -0.06, s))
    tip = tip === null ? tw : tip.max(tw)
  }
  // the base cloud the pillars rise from
  sd = smin(TSL, sd, p.y.sub(BASE_Y + 0.3), 0.26)
  const shell = TSL.smoothstep(0.1, -0.12, sd)
  return { shell, tip }
}

// Full sample: presence + EGG knots. One pillarField, one ridged(oct),
// one fbm(2), one worley per call.
export const samplePillars = (TSL, p, { octaves = 3, clock } = {}) => {
  const { shell, tip } = pillarField(TSL, p)
  const ridge = ridgedFbm(TSL, p.mul(2.4), { octaves })
  const t = clock ?? TSL.float(0)
  const dust = fbm(TSL, p.mul(3.2).add(TSL.vec3(t.mul(0.02), t.mul(0.014), 0)), {
    octaves: 2,
  })
    .mul(0.5)
    .add(0.5)
  const carved = shell.mul(ridge.mul(0.85).add(0.35)).mul(dust.mul(0.6).add(0.55))
  const rho = TSL.smoothstep(0.16, 0.5, carved)
  const knot = TSL.smoothstep(0.17, 0.045, worleyF1(TSL, p.mul(8)))
    .mul(tip)
    .mul(shell)
  return { rho, knot }
}

// Half-cost density for the single light tap (PC-01: no second march):
// SDF shell + one ridged octave, no dust, no worley.
export const densityLite = (TSL, p) => {
  const { shell } = pillarField(TSL, p)
  const ridge = ridgedFbm(TSL, p.mul(2.4), { octaves: 1 })
  return TSL.smoothstep(0.16, 0.5, shell.mul(ridge.mul(0.85).add(0.35)).mul(0.8))
}
