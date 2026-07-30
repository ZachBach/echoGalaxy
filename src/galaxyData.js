/**
 * The four broad classes of the Hubble "tuning fork" galaxy classification,
 * each with a short explainer, a few facts, and the cfg the galaxy shader's
 * uniforms read (see galaxyShader.js — since G2 the stars are generated
 * entirely in-shader from instanceIndex; the CPU contributes only these
 * numbers).
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
      nebula: { a: 0xd46a9e, b: 0x5a8fd6, strength: 0.16, freq: 0.32, falloff: 0.3 },
      tempCore: 4200,
      tempRim: 11000,
      count: 24000,
      arms: 3,
      spin: 1.15,
      radius: 8,
      randomness: 0.32,
      thickness: 0.34,
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
      nebula: { a: 0xc98a5a, b: 0x5a86d6, strength: 0.15, freq: 0.3, falloff: 0.3 },
      tempCore: 4000,
      tempRim: 10000,
      count: 24000,
      arms: 2,
      spin: 1.0,
      radius: 8,
      randomness: 0.28,
      thickness: 0.34,
      bar: 0.42,
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
      nebula: { a: 0xc9a06a, b: 0x8a6a50, strength: 0.05, freq: 0.25, falloff: 0.55 },
      tempCore: 3900,
      tempRim: 3200,
      count: 22000,
      radius: 7,
      thickness: 0.4,
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
      nebula: { a: 0xd46a9e, b: 0x4ec9b0, strength: 0.2, freq: 0.45, falloff: 0.25 },
      tempCore: 6500,
      tempRim: 12000,
      count: 18000,
      radius: 6.5,
      thickness: 0.5,
    },
  },
]
