import { ATMOSPHERES, PLANET_RECIPES } from './planetRecipes'

// System distances are deliberately compressed so every orbit remains visible
// in one scene. Their ordering and the Kepler r^1.5 timing relationship remain
// literal; the HUD calls out the distinction rather than presenting a scale
// model as one.
const solarSystem = {
  id: 'solar',
  info: {
    id: 'solar-system',
    name: 'Solar System',
    label: 'G-type star · eight planets',
    description:
      'Our own planetary family, compressed into one navigable scene. The orbit ' +
      'spacing is visualized so every world fits in frame, but their order and ' +
      'Kepler timing remain real: inner worlds move faster than outer worlds.',
    facts: [
      'The Solar System has eight recognized planets, from Mercury to Neptune. Dwarf planets are a different category.',
      'Nearly all major bodies orbit the Sun in the same direction and close to one plane: a fossil of the flat disk that made them.',
      'The Sun holds 99.86% of the Solar System’s mass. Everything else is moving in its gravity well.',
      'The scene compresses distance for comparison; it is a physics demonstration, not a scale model.',
    ],
  },
  star: {
    render: { radius: 1.15 },
    info: {
      id: 'sun',
      name: 'The Sun',
      label: 'G-type main-sequence star · the engine',
      description:
        'The Sun is the system’s central mass and energy source. Its fusion light ' +
        'sets every planet’s day side, while gravity keeps the family together.',
      facts: [
        'The Sun contains more than 99.8% of all mass in the Solar System.',
        'Light takes about eight minutes to travel from the Sun to Earth.',
        'Its color and temperature place it among the G-type main-sequence stars.',
      ],
    },
  },
  orbits: [
    {
      id: 'sol-mercury', recipe: PLANET_RECIPES.desert, atmo: false, r: 2.2, size: 0.2, phase: 0.13,
      info: {
        name: 'Mercury', label: 'First orbit · smallest planet',
        description: 'A scorched, airless rocky world racing nearest to the Sun.',
        facts: [
          'Mercury completes one Solar orbit in 88 Earth days.',
          'It has almost no atmosphere to spread heat, so day and night temperatures differ dramatically.',
          'Its surface records billions of years of impacts in craters and basins.',
        ],
      },
    },
    {
      id: 'sol-venus', recipe: PLANET_RECIPES.cloud, atmo: ATMOSPHERES.cloud, r: 3.05, size: 0.3, phase: 0.62,
      info: {
        name: 'Venus', label: 'Second orbit · cloud-covered greenhouse',
        description: 'A rocky planet hidden beneath a dense, reflective atmosphere of carbon-dioxide clouds.',
        facts: [
          'Venus is close to Earth in size, but its surface is hot enough to melt lead.',
          'Its thick atmosphere traps heat through an extreme greenhouse effect.',
          'A Venus year is shorter than a Venus day: its rotation is extraordinarily slow.',
        ],
      },
    },
    {
      id: 'sol-earth', recipe: PLANET_RECIPES.rocky, atmo: ATMOSPHERES.rocky, r: 4.0, size: 0.38, phase: 0.31,
      moons: [{ id: 'sol-moon', orbitR: 0.85, size: 0.1, phase: 0.3, recipe: PLANET_RECIPES.moon }],
      info: {
        name: 'Earth', label: 'Third orbit · ocean world',
        description: 'A rocky planet with liquid oceans, continents, an atmosphere, and one large tidally locked moon.',
        facts: [
          'Earth is the only world currently known to host life.',
          'Its day/night boundary is the terminator: sunrise and sunset are happening there at once.',
          'The Moon turns once per orbit, so the same face stays turned toward Earth.',
        ],
      },
    },
    {
      id: 'sol-mars', recipe: PLANET_RECIPES.desert, atmo: ATMOSPHERES.desert, r: 5.05, size: 0.25, phase: 0.78,
      info: {
        name: 'Mars', label: 'Fourth orbit · cold desert',
        description: 'A small rocky world with a thin atmosphere, iron-rich dust, polar ice, and an ancient river story.',
        facts: [
          'Mars has the largest volcano in the Solar System: Olympus Mons.',
          'Evidence of dried channels and minerals shows that liquid water once shaped its surface.',
          'A Martian year lasts 687 Earth days.',
        ],
      },
    },
    {
      id: 'sol-jupiter', recipe: PLANET_RECIPES.gas, atmo: ATMOSPHERES.gas, r: 6.7, size: 0.62, phase: 0.48,
      ring: { tilt: 0.35 },
      moons: [
        { id: 'sol-io', orbitR: 1.55, size: 0.09, phase: 0.6, recipe: PLANET_RECIPES.lava },
        { id: 'sol-titan', orbitR: 2.1, size: 0.13, phase: 0.1, recipe: PLANET_RECIPES.titan, atmosphere: ATMOSPHERES.titan },
      ],
      info: {
        name: 'Jupiter', label: 'Fifth orbit · largest planet',
        description: 'A hydrogen-and-helium giant whose mass and storms dominate the outer planetary system.',
        facts: [
          'Jupiter outweighs every other planet in the Solar System combined.',
          'Its Great Red Spot is a storm larger than Earth that has persisted for centuries.',
          'The glowing moon is an Io analogue: tides from a giant planet can keep a small world volcanically active.',
        ],
      },
    },
    {
      id: 'sol-saturn', recipe: PLANET_RECIPES.ringed, atmo: ATMOSPHERES.ringed, r: 8.45, size: 0.54, phase: 0.08,
      ring: { tilt: 0.52 },
      info: {
        name: 'Saturn', label: 'Sixth orbit · ringed giant',
        description: 'A pale gas giant surrounded by a vast, thin disk of water-ice particles.',
        facts: [
          'Saturn’s rings are billions of icy particles, each orbiting independently.',
          'The Cassini Division is a real gap sculpted by orbital resonance with the moon Mimas.',
          'Saturn is less dense than water, though no ocean could ever be large enough to float it.',
        ],
      },
    },
    {
      id: 'sol-uranus', recipe: PLANET_RECIPES.iceGiant, atmo: ATMOSPHERES.iceGiant, r: 10.45, size: 0.43, phase: 0.57,
      info: {
        name: 'Uranus', label: 'Seventh orbit · sideways ice giant',
        description: 'A blue-green ice giant tipped almost onto its side, likely by a giant impact early in its history.',
        facts: [
          'Uranus rotates with an axial tilt of about 98 degrees.',
          'Methane high in its atmosphere absorbs red light, giving the planet its blue-green color.',
          'Its long seasons can keep one pole in sunlight for decades at a time.',
        ],
      },
    },
    {
      id: 'sol-neptune', recipe: PLANET_RECIPES.iceGiant, atmo: ATMOSPHERES.iceGiant, r: 12.55, size: 0.4, phase: 0.25,
      info: {
        name: 'Neptune', label: 'Eighth orbit · wind-swept ice giant',
        description: 'The outermost major planet, a deep-blue ice giant with some of the fastest winds measured in the Solar System.',
        facts: [
          'Neptune takes about 165 Earth years to circle the Sun.',
          'Its atmosphere hosts winds faster than 1,000 miles per hour.',
          'It was predicted mathematically before it was observed through a telescope.',
        ],
      },
    },
  ],
}

const trappistPlanet = (letter, r, size, phase, recipe, atmo, label, description, facts) => ({
  id: `trappist-${letter}`,
  recipe,
  atmo,
  r,
  size,
  phase,
  info: {
    name: `TRAPPIST-1 ${letter}`,
    label,
    description,
    facts: [
      ...facts,
      'All seven known TRAPPIST-1 planets orbit closer to their star than Mercury orbits the Sun.',
      'Their separations are visually expanded here so their Keplerian motion can be inspected.',
    ],
  },
})

const trappistSystem = {
  id: 'trappist-1',
  info: {
    id: 'trappist-1-system',
    name: 'TRAPPIST-1',
    label: 'Ultracool red dwarf · seven rocky worlds',
    description:
      'A real compact planetary system about 40 light-years away. Seven roughly ' +
      'Earth-sized worlds orbit a dim red star so closely that the whole family ' +
      'would fit comfortably inside Mercury’s orbit around the Sun.',
    facts: [
      'TRAPPIST-1 has seven known roughly Earth-sized planets, named b through h.',
      'Several worlds lie in the star’s temperate zone, where liquid surface water could be possible under the right atmospheres.',
      'The planets are packed into a resonant chain: their orbit periods keep a repeating gravitational rhythm.',
      'The scene expands their spacing for study; their compact order and Kepler timing are the point.',
    ],
  },
  star: {
    render: {
      radius: 0.78,
      coronaScale: 1.32,
      bodyColor: 0xff7655,
      coronaColor: 0xff542e,
      coronaStrength: 0.72,
    },
    info: {
      id: 'trappist-1-star',
      name: 'TRAPPIST-1',
      label: 'Ultracool red dwarf · compact system engine',
      description:
        'A small, cool red dwarf star. It is much dimmer than the Sun, so its ' +
        'temperate zone sits very close to the star.',
      facts: [
        'TRAPPIST-1 is an ultracool red dwarf rather than a Sun-like G-type star.',
        'Its small size lets potentially temperate planets orbit very nearby.',
        'Red dwarfs are the most common kind of star in the Milky Way.',
      ],
    },
  },
  orbits: [
    trappistPlanet(
      'b', 2.0, 0.22, 0.05, PLANET_RECIPES.lava, ATMOSPHERES.lava,
      'First orbit · hot rocky world',
      'The innermost known planet, heated by an orbit so close to its small star.',
      ['TRAPPIST-1 b circles its star in about 1.5 Earth days.'],
    ),
    trappistPlanet(
      'c', 2.65, 0.24, 0.44, PLANET_RECIPES.desert, ATMOSPHERES.desert,
      'Second orbit · irradiated rocky world',
      'A compact rocky world that receives more stellar energy than Earth.',
      ['TRAPPIST-1 c completes an orbit in about 2.4 Earth days.'],
    ),
    trappistPlanet(
      'd', 3.3, 0.2, 0.73, PLANET_RECIPES.rocky, ATMOSPHERES.rocky,
      'Third orbit · small rocky world',
      'A small world in the middle of the system’s tightly coupled orbital chain.',
      ['TRAPPIST-1 d takes about four Earth days to complete one orbit.'],
    ),
    trappistPlanet(
      'e', 4.05, 0.25, 0.2, PLANET_RECIPES.ocean, ATMOSPHERES.ocean,
      'Fourth orbit · temperate-zone candidate',
      'A roughly Earth-sized planet receiving a level of starlight that makes it a compelling temperate-zone target.',
      ['TRAPPIST-1 e is one of several planets studied for potentially temperate conditions.'],
    ),
    trappistPlanet(
      'f', 4.85, 0.26, 0.57, PLANET_RECIPES.rocky, ATMOSPHERES.rocky,
      'Fifth orbit · cool terrestrial world',
      'A larger rocky world where atmosphere and water inventory remain open scientific questions.',
      ['TRAPPIST-1 f completes an orbit in about 9.2 Earth days.'],
    ),
    trappistPlanet(
      'g', 5.75, 0.28, 0.86, PLANET_RECIPES.ice, ATMOSPHERES.ice,
      'Sixth orbit · outer temperate-zone candidate',
      'A cool outer world at the edge of the system’s potentially temperate region.',
      ['TRAPPIST-1 g has a year of about 12.4 Earth days.'],
    ),
    trappistPlanet(
      'h', 6.7, 0.19, 0.33, PLANET_RECIPES.ice, ATMOSPHERES.ice,
      'Seventh orbit · cold outer world',
      'The outermost known planet in the compact chain, receiving relatively little light from its dim star.',
      ['TRAPPIST-1 h completes an orbit in roughly 19 Earth days.'],
    ),
  ],
}

export const SYSTEMS = [solarSystem, trappistSystem]
export const DEFAULT_SYSTEM = SYSTEMS[0]
