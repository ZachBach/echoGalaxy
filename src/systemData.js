import { ATMOSPHERES, PLANET_RECIPES } from './planetRecipes'
import { PLANETS, sceneSpinRate, obliquityRad } from './solarBodies'
import { MAGNETOSPHERES } from './spaceWeather'

// SS-05 — every planet used to spin at a hardcoded 0.15, which quietly
// contradicted two facts this scene already prints: that a Venus day is
// longer than a Venus year, and that Uranus turns on its side. Rates now
// derive from measured rotation periods through `sceneSpinRate` (see
// solarBodies.js for why they are compressed rather than literal, and how
// retrograde motion falls out of obliquity instead of a second hand-set
// flag). Ordering and sign are real; only the magnitudes are squeezed.
const spin = (key) => sceneSpinRate(PLANETS[key])

// Axial tilt, same deal: measured obliquity out of solarBodies.js rather than
// a second set of hand-typed radians here. Unlike spin these are NOT squeezed
// — the tilts are literal, so Uranus really does lie on its side and Venus is
// really upside down.
const tilt = (key) => obliquityRad(PLANETS[key])

// Saturn's rings sit over its equator, so one number is both the globe's
// obliquity and the ring group's tilt — deriving both from the same call is
// what stops the two from drifting apart. (This replaces a hand-set 0.52;
// the measured 26.73° is 0.4665 rad.)
//
// The ring mesh is drawn inside a group tilted by this about X and is itself
// rotated −π/2 about X, so its local +Z normal lands at (0, cos t, sin t) in
// the globe's frame. That vector is what `ringed` needs to cast the ring
// shadow. Frozen because <Planet> memos on cfg identity (see Planet.jsx).
// SW — the auroral oval, derived rather than hand-set, exactly like spin and
// tilt above. MAGNETOSPHERES is the single source of which bodies have a
// working dynamo, how far the magnetic axis leans off the spin axis, and how
// hard the solar wind is driving them.
//
// Returns undefined for anything that should NOT get an oval mesh, which is
// most of the system, and that absence is the lesson rather than an omission:
//
//   mercury  a real magnetosphere, but no atmosphere to light up
//   venus    no dynamo at all, only an induced magnetosphere
//   mars     'diffuse' — patchy crustal magnetism gives localised aurorae and
//            a planet-wide glow, which is not an oval and is not what this
//            component draws. Left off rather than drawn wrong.
//
// The giants (aurora: true in the table) are also left off for now, and that
// one is a colour problem, not a data problem: buildAuroraMaterial hard-codes
// Earth's emission lines — O I 557.7 green, O I 630.0 red, N2+ 427.8 violet.
// Those come from an atmosphere of oxygen and nitrogen. Jupiter and Saturn
// glow in H2 Lyman and Werner bands, overwhelmingly ultraviolet, with only a
// faint reddish visible component. Painting Earth's green on a hydrogen world
// would be the same class of error as Jupiter wearing Saturn's rings. Giving
// them ovals needs a palette parameter on the material first.
const aurora = (key) => {
  const m = MAGNETOSPHERES[key]
  if (!m || m.aurora !== true) return undefined
  return { storm: m.storm, magPoleTilt: m.magPoleTilt }
}

const SATURN_RING_TILT = tilt('saturn')
const SATURN_CFG = Object.freeze({
  ringNormal: [0, Math.cos(SATURN_RING_TILT), Math.sin(SATURN_RING_TILT)],
})

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
      // SS-04: Mercury had shared Mars's `desert` recipe, so it rendered in
      // Martian rust. Mercury's regolith is dark, iron-poor silicate — grey,
      // and slightly darker than the Moon (albedo 0.106 vs 0.12).
      id: 'sol-mercury', recipe: PLANET_RECIPES.mercury, atmo: false, r: 2.2, size: 0.2, phase: 0.13,
      obliquity: tilt('mercury'), // 0.03° — the most upright planet in the system
      spinRate: spin('mercury'),
      info: {
        name: 'Mercury', label: 'First orbit · smallest planet',
        description:
          'A scorched, airless world of grey silicate rock — cratered like the Moon, ' +
          'and wrinkled by cliffs raised when its cooling core made the whole planet shrink.',
        facts: [
          'Mercury completes one Solar orbit in 88 Earth days.',
          'It has almost no atmosphere to spread heat, so day and night temperatures differ dramatically.',
          'Its surface records billions of years of impacts in craters and basins.',
          'Mercury is grey, not red. It has almost no iron oxide in its surface — the rusty worlds are Mars and its dust.',
          'The long cliffs crossing its surface are lobate scarps: the crust buckled as the planet contracted while its core cooled.',
        ],
      },
    },
    {
      id: 'sol-venus', recipe: PLANET_RECIPES.venus, atmo: ATMOSPHERES.venus, r: 3.05, size: 0.3, phase: 0.62,
      obliquity: tilt('venus'), // 177.36° — flipped, hence its retrograde spin
      spinRate: spin('venus'),
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
      obliquity: tilt('earth'), // 23.44° — the tilt that makes seasons
      spinRate: spin('earth'),
      // The only oval in the scene, and the only one this material's colours
      // are actually right for. Venus and Mars are its control group.
      //
      // storm and magPoleTilt come from the table — a quiet 0.35, because the
      // module is right that the quiet default is the honest one. `strength`
      // is a legibility gain, not a physical claim: at this scene's scale
      // Earth is a 300 px sphere and the oval is a thin shell seen edge-on, so
      // the honest brightness resolves to almost nothing. Overscaling it for
      // visibility is the same bargain this scene already makes with orbit
      // spacing and moon sizes, and the HUD makes that bargain explicit.
      aurora: { ...aurora('earth'), strength: 3 },
      moons: [{ id: 'sol-moon', orbitR: 0.85, size: 0.1, phase: 0.3, recipe: PLANET_RECIPES.moon }],
      info: {
        name: 'Earth', label: 'Third orbit · ocean world',
        description: 'A rocky planet with liquid oceans, continents, an atmosphere, and one large tidally locked moon.',
        facts: [
          'Earth is the only world currently known to host life.',
          'Its day/night boundary is the terminator: sunrise and sunset are happening there at once.',
          'The Moon turns once per orbit, so the same face stays turned toward Earth.',
          'The aurora is a ring around the magnetic pole, not the spin pole, and Earth’s magnetic axis leans about 11° off — so it sits visibly off-centre.',
          'Venus and Mars have no working dynamo and no oval. That difference is a large part of why only one of the three kept its air.',
        ],
      },
    },
    {
      id: 'sol-mars', recipe: PLANET_RECIPES.desert, atmo: ATMOSPHERES.desert, r: 5.05, size: 0.25, phase: 0.78,
      obliquity: tilt('mars'), // 25.19° — nearly Earth's, so Mars has seasons too
      spinRate: spin('mars'),
      // Phobos and Deimos are 11 km and 6 km in radius — at true scale they
      // would be well under a pixel here, so they are overscaled like Io is.
      // Their ORDER and relative size are honest; their diameters are not.
      moons: [
        { id: 'sol-phobos', orbitR: 0.46, size: 0.028, phase: 0.2, recipe: PLANET_RECIPES.moon },
        { id: 'sol-deimos', orbitR: 0.68, size: 0.02, phase: 0.71, recipe: PLANET_RECIPES.moon },
      ],
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
      obliquity: tilt('jupiter'), // 3.13° — almost no seasons on Jupiter
      spinRate: spin('jupiter'),
      // No ringNormal: Jupiter's rings are gossamer dust and cast no shadow
      // anyone has ever seen. The ring mesh here is a visual hint, not Saturn.
      //
      // That was the intent from the start, but until now only the comment
      // said so: `ring` carried a tilt alone, and buildRingMaterial's default
      // is Saturn's profile, so Jupiter rendered a bright ice ring complete
      // with a Cassini Division it has no business having. `dust` swaps in the
      // main-ring-plus-gossamer shape and the gain drops it to a hint.
      // gain 0.3 still read as a solid tan band in a close pass; 0.14 is the
      // value where 28-jupiter-moons shows something is there without the
      // frame arguing it is a ring system.
      ring: { tilt: 0.35, profile: 'dust', gain: 0.14 },
      // The four Galileans, in their real order and their real RELATIVE sizes
      // (Ganymede largest, Europa smallest). All four are overscaled by the
      // same ~5.6× against Jupiter, so comparing them to each other is honest
      // even though comparing them to the planet is not.
      moons: [
        { id: 'sol-io', orbitR: 1.0, size: 0.09, phase: 0.6, recipe: PLANET_RECIPES.lava },
        { id: 'sol-europa', orbitR: 1.28, size: 0.077, phase: 0.15, recipe: PLANET_RECIPES.ice },
        { id: 'sol-ganymede', orbitR: 1.6, size: 0.13, phase: 0.82, recipe: PLANET_RECIPES.moon },
        { id: 'sol-callisto', orbitR: 1.95, size: 0.119, phase: 0.42, recipe: PLANET_RECIPES.moon },
      ],
      info: {
        name: 'Jupiter', label: 'Fifth orbit · largest planet',
        description: 'A hydrogen-and-helium giant whose mass and storms dominate the outer planetary system.',
        facts: [
          'Jupiter outweighs every other planet in the Solar System combined.',
          'Its Great Red Spot is a storm larger than Earth that has persisted for centuries.',
          'The four large moons are Galileo’s: Io, Europa, Ganymede, and Callisto — the first worlds ever seen orbiting something other than Earth.',
          'Io is the most volcanically active body in the Solar System. Jupiter’s tides knead it hard enough to keep it molten.',
          'Ganymede is larger than the planet Mercury, and is the only moon known to generate its own magnetic field.',
        ],
      },
    },
    {
      id: 'sol-saturn', recipe: PLANET_RECIPES.ringed, atmo: ATMOSPHERES.ringed, r: 8.45, size: 0.54, phase: 0.08,
      obliquity: SATURN_RING_TILT, // 26.7°, and the rings ride the equator
      spinRate: spin('saturn'),
      cfg: SATURN_CFG,
      ring: { tilt: SATURN_RING_TILT },
      // Titan orbits SATURN, not Jupiter. orbitR 2.1 clears the ring system
      // (RING_OUTER 2.27 × size 0.54 ≈ 1.23), which is also the real geometry:
      // Titan sits at ~20 Saturn radii, the A ring ends at ~2.3.
      moons: [
        { id: 'sol-enceladus', orbitR: 1.4, size: 0.022, phase: 0.55, recipe: PLANET_RECIPES.ice },
        { id: 'sol-rhea', orbitR: 1.72, size: 0.038, phase: 0.28, recipe: PLANET_RECIPES.moon },
        { id: 'sol-titan', orbitR: 2.1, size: 0.13, phase: 0.1, recipe: PLANET_RECIPES.titan, atmosphere: ATMOSPHERES.titan },
      ],
      info: {
        name: 'Saturn', label: 'Sixth orbit · ringed giant',
        description: 'A pale gas giant surrounded by a vast, thin disk of water-ice particles.',
        facts: [
          'Saturn’s rings are billions of icy particles, each orbiting independently.',
          'The Cassini Division is a real gap sculpted by orbital resonance with the moon Mimas.',
          'Saturn is less dense than water, though no ocean could ever be large enough to float it.',
          'Titan is Saturn’s largest moon — bigger than the planet Mercury, and the only moon with a thick atmosphere.',
          'Enceladus sprays water from cracks at its south pole. Those geysers are what supplies Saturn’s faint outer E ring.',
          'Saturn’s confirmed moon count passed 290 in 2026 and is still climbing — the number in your textbook is probably already out of date.',
        ],
      },
    },
    {
      id: 'sol-uranus', recipe: PLANET_RECIPES.iceGiant, atmo: ATMOSPHERES.iceGiant, r: 10.45, size: 0.43, phase: 0.57,
      obliquity: tilt('uranus'), // 97.77° — on its side, poles to the sun
      spinRate: spin('uranus'),
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
      obliquity: tilt('neptune'), // 28.32°
      spinRate: spin('neptune'),
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
