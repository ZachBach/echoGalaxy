import * as THREE from 'three'

/**
 * The four broad classes of the Hubble "tuning fork" galaxy classification,
 * each with a short explainer, a few facts, and the parameters that shape its
 * procedural point cloud (see generateGalaxy).
 */
export const GALAXY_TYPES = [
  {
    id: 'spiral',
    name: 'Spiral Galaxy',
    hubble: 'Hubble type · Sb / Sc',
    description:
      'A flattened, rotating disk of stars, gas, and dust wound into bright spiral arms around a glowing central bulge. New stars light the arms blue; older stars redden the core.',
    facts: [
      'The arms are density waves — stars drift through them like cars through a traffic jam.',
      'The Milky Way and neighbouring Andromeda are both spirals.',
      'Typically 10,000–100,000 light-years across.',
    ],
    cfg: {
      type: 'spiral',
      count: 24000,
      arms: 3,
      spin: 1.15,
      radius: 8,
      randomness: 0.32,
      thickness: 0.34,
      coreColor: '#ffdca0',
      armColor: '#4a7dff',
    },
  },
  {
    id: 'barred',
    name: 'Barred Spiral',
    hubble: 'Hubble type · SBb',
    description:
      'A spiral whose arms unwind from the ends of a straight bar of stars cutting through the core. The bar funnels gas inward, feeding star formation and the central black hole.',
    facts: [
      'Our own Milky Way is a barred spiral.',
      'Roughly two-thirds of spiral galaxies have bars.',
      'The bar is a slowly rotating, self-sustaining family of stellar orbits.',
    ],
    cfg: {
      type: 'barred',
      count: 24000,
      arms: 2,
      spin: 1.0,
      radius: 8,
      randomness: 0.28,
      thickness: 0.34,
      bar: 0.42,
      coreColor: '#ffd39a',
      armColor: '#5a86ff',
    },
  },
  {
    id: 'elliptical',
    name: 'Elliptical Galaxy',
    hubble: 'Hubble type · E0–E7',
    description:
      'A smooth, featureless swarm of mostly old, red stars on randomly tilted orbits — little gas, little new star formation. Shapes range from near-spherical to elongated footballs.',
    facts: [
      'The largest galaxies known are giant ellipticals at the centres of clusters.',
      'Many form when two spiral galaxies collide and merge.',
      'With orbits pointing every which way, there are no arms.',
    ],
    cfg: {
      type: 'elliptical',
      count: 22000,
      radius: 7,
      thickness: 0.4,
      coreColor: '#ffe0c4',
      armColor: '#c9663f',
    },
  },
  {
    id: 'irregular',
    name: 'Irregular Galaxy',
    hubble: 'Hubble type · Irr',
    description:
      'No ordered disk or bulge — a chaotic, clumpy scatter of gas and hot young stars, often distorted by a neighbour’s gravity. Rich in the raw material for building new stars.',
    facts: [
      'The Large and Small Magellanic Clouds orbit the Milky Way as irregulars.',
      'Their disorder is often the scar of a past gravitational encounter.',
      'Bright blue knots mark bursts of recent star formation.',
    ],
    cfg: {
      type: 'irregular',
      count: 18000,
      radius: 6.5,
      thickness: 0.5,
      coreColor: '#dff0ff',
      armColor: '#5aa0ff',
    },
  },
]

// Deterministic PRNG (mulberry32) — the same galaxy on every load, so
// visuals are stable per type and cross-backend renders are comparable
// pixel for pixel.
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Roughly bell-shaped random in [-1, 1].
function gauss(rnd) {
  return (rnd() + rnd() + rnd() - 1.5) / 1.5
}

// Cubic-biased jitter that keeps most particles tight to the arm.
function jitter(rnd, scale) {
  return Math.pow(rnd(), 3) * (rnd() < 0.5 ? 1 : -1) * scale
}

/**
 * Build position + color buffers for a galaxy of the given config.
 * Returns { positions: Float32Array, colors: Float32Array }.
 */
export function generateGalaxy(cfg) {
  const {
    type,
    count = 20000,
    radius = 8,
    arms = 3,
    spin = 1.1,
    randomness = 0.32,
    thickness = 0.36,
    bar = 0.4,
    coreColor = '#ffd9a0',
    armColor = '#4a7dff',
    seed = 20260729,
  } = cfg

  const rnd = mulberry32(seed)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const cCore = new THREE.Color(coreColor)
  const cEdge = new THREE.Color(armColor)
  const col = new THREE.Color()

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    let x = 0
    let y = 0
    let z = 0
    let t = 0 // 0 at the core, 1 at the rim — drives the colour blend

    if (type === 'elliptical') {
      // Dense-cored 3-D ellipsoid; no arms.
      const r = Math.pow(rnd(), 2) * radius
      const dir = new THREE.Vector3(gauss(rnd), gauss(rnd) * 0.72, gauss(rnd) * 0.86)
      if (dir.lengthSq() < 1e-6) dir.set(0, 0.001, 0)
      dir.normalize().multiplyScalar(r)
      x = dir.x
      y = dir.y
      z = dir.z
      t = r / radius
    } else if (type === 'irregular') {
      // A handful of star-forming clumps loosely strewn about.
      const clumps = 5
      const c = Math.floor(rnd() * clumps)
      const ca = (c / clumps) * Math.PI * 2 + gauss(rnd) * 0.4
      const cr = radius * (0.25 + 0.4 * ((c % 3) / 2))
      x = Math.cos(ca) * cr + gauss(rnd) * radius * 0.32
      z = Math.sin(ca) * cr + gauss(rnd) * radius * 0.32
      y = gauss(rnd) * thickness * 1.6
      t = Math.min(1, Math.hypot(x, z) / radius)
    } else {
      // Spiral / barred spiral.
      const r = Math.pow(rnd(), 0.7) * radius
      const branch = ((i % arms) / arms) * Math.PI * 2

      if (type === 'barred' && r < radius * bar) {
        // Inner region is a straight bar along one axis.
        const end = branch < Math.PI ? 0 : Math.PI
        x = Math.cos(end) * r + jitter(rnd, randomness * radius * 0.25)
        z = Math.sin(end) * r * 0.22 + gauss(rnd) * randomness * 0.9
        y = gauss(rnd) * thickness
        t = r / radius
      } else {
        const angle = branch + r * spin
        const rr = randomness * r
        x = Math.cos(angle) * r + jitter(rnd, rr)
        z = Math.sin(angle) * r + jitter(rnd, rr)
        y = gauss(rnd) * thickness * (1 - (r / radius) * 0.5)
        t = r / radius
      }
    }

    positions[i3] = x
    positions[i3 + 1] = y
    positions[i3 + 2] = z

    col.copy(cCore).lerp(cEdge, Math.min(1, t))
    colors[i3] = col.r
    colors[i3 + 1] = col.g
    colors[i3 + 2] = col.b
  }

  return { positions, colors }
}
