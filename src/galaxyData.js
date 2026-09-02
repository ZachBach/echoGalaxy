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
  {
    // The hinge of Hubble's tuning fork, and the one class the panel's own
    // "Hubble type" label kept promising and not delivering.
    //
    // APPENDED, not inserted at its place on the fork (between barred and
    // elliptical), because src/capture/shots.js addresses galaxy entries by
    // raw positional index — shots 06-09 are 0,1,2,3. Inserting would leave
    // 08-elliptical rendering a lenticular with no error anywhere. Reordering
    // is a shots.js change, not a data change.
    id: 'lenticular',
    name: 'Lenticular Galaxy',
    hubble: 'Hubble type · S0',
    description:
      'A disk galaxy that has spent its gas. It kept the flattened, rotating shape of a spiral and a large bright bulge, but has no arms left to light and almost no new stars forming — the whole disk is carried by old yellow and red suns.',
    facts: [
      'A spiral’s shape without a spiral’s arms: the structure survived, the star formation did not.',
      'Hubble placed S0 at the hinge of his tuning fork, between the ellipticals and the spirals.',
      'They crowd the centres of galaxy clusters, where a galaxy’s gas can be stripped away by the hot gas it falls through.',
    ],
    cfg: {
      type: 'lenticular',
      // Gas-poor, so the veil is faint and dusty-warm rather than pink —
      // nearly as sparse as the elliptical's, for the same physical reason.
      nebula: { a: 0xd8c39a, b: 0x8f7f66, strength: 0.07, freq: 0.26, falloff: 0.42 },
      // Old stars throughout. The narrow core-to-rim span is the point: a
      // spiral runs 4200K to 11000K because its arms are still lighting blue
      // ones, and that blue rim is exactly what an S0 has lost.
      tempCore: 4200,
      tempRim: 5000,
      count: 22000,
      // How a disk gets NO arms without a new shader family. The disc graph
      // places stars on `arms` discrete azimuths; at 2000 they are 0.18
      // degrees apart, which is continuous at any zoom this rung allows. So
      // the branch term stops meaning anything and the result is an
      // axisymmetric disk. familyOf() already routes anything not
      // elliptical/irregular to the disc graph, so this class costs no shader
      // branch at all, and spin has nothing left to wind.
      //
      // 48 was tried first and is the trap: coarse enough to blend ONLY if
      // the scatter is wide, which forced randomness up to 0.42, which puffed
      // the disk into a ball and made the render indistinguishable from the
      // elliptical sitting two entries before it. Going the other way — many
      // more branches, much LESS scatter — is what buys the flat, rimmed disk
      // that is the entire difference between an S0 and an E.
      arms: 2000,
      spin: 0,
      // 6.6, under the spiral's 8 and the elliptical's 7. The rim is the
      // whole argument for this class being a disk rather than a swarm, and
      // at 7.5 the lower half of it ran off the bottom of the frame on this
      // rung's fixed camera — the one edge worth seeing was the one cropped.
      radius: 6.6,
      randomness: 0.1,
      // A lens: a thin disk around a bright bulge. Half the spiral's 0.34,
      // where the arms want room to be seen, and a third of the elliptical's
      // 0.4 — at this rung's 26-degree camera that difference is the shape.
      thickness: 0.14,
      // The bulge. shapeExp concentrates stars toward the centre — 0.7 is the
      // disc default, 2 is the elliptical. An S0's bulge is the largest of any
      // disk galaxy, so it sits between the two.
      shapeExp: 1.35,
    },
  },
]
