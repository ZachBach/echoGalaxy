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

const proximaPlanet = (letter, r, size, phase, recipe, atmo, label, description, facts) => ({
  id: `proxima-${letter}`,
  recipe,
  atmo,
  r,
  size,
  phase,
  info: {
    name: `Proxima Centauri ${letter}`,
    label,
    description,
    facts: [
      ...facts,
      'Proxima Centauri is the closest star to the Sun, about 4.24 light-years away.',
      'Their separations are visually expanded here so their Keplerian motion can be inspected.',
    ],
  },
})

// The nearest system there is. Worth having beside the Solar System for one
// reason above the others: the answer to "are there planets around the next
// star over" turns out to be yes, and the next star over is this one.
const proximaSystem = {
  id: 'proxima-centauri',
  info: {
    id: 'proxima-centauri-system',
    name: 'Proxima Centauri',
    label: 'Red dwarf · the nearest star of all',
    description:
      'The closest star to the Sun, and close enough that its planets are the ' +
      'nearest worlds outside our own system — a small, dim red dwarf with at ' +
      'least two planets and a third strong candidate further out.',
    facts: [
      'At 4.24 light-years it is the nearest star to the Sun, and it still takes light over four years to reach us.',
      'It is a flare star: it erupts violently enough that an unshielded planet nearby could have its atmosphere stripped away.',
      'It is the third member of the Alpha Centauri system, orbiting the two Sun-like stars there at a great distance.',
      'The scene expands the orbits for study; their ordering and Kepler timing are the point.',
    ],
  },
  star: {
    render: {
      radius: 0.84,
      // A flare star wears a big, hot, active corona — that is the thing about
      // Proxima worth seeing, and the reason its shell runs wider and stronger
      // than TRAPPIST-1's despite the two being near neighbours in class.
      coronaScale: 1.42,
      bodyColor: 0xff8a5e,
      coronaColor: 0xff5a34,
      coronaStrength: 0.88,
    },
    info: {
      id: 'proxima-star',
      name: 'Proxima Centauri',
      label: 'Red dwarf · the nearest star',
      description:
        'A small, cool red dwarf. Despite being our closest stellar neighbour ' +
        'it is far too faint to see without a telescope.',
      facts: [
        'At about an eighth of the Sun’s mass it is barely heavy enough to fuse hydrogen at all.',
        'A flare can brighten it by a large factor within minutes, then fade again.',
        'It burns its fuel so slowly that it will still be shining trillions of years from now.',
      ],
    },
  },
  orbits: [
    proximaPlanet(
      'd', 2.4, 0.2, 0.11, PLANET_RECIPES.mercury, false,
      'First orbit · a scorched sub-Earth',
      'A small, hot world orbiting so close to the star that its year lasts a matter of days.',
      ['Proxima Centauri d is roughly a quarter of Earth’s mass, on a five-day orbit.'],
    ),
    proximaPlanet(
      'b', 3.5, 0.3, 0.58, PLANET_RECIPES.rocky, ATMOSPHERES.rocky,
      'Second orbit · the nearest temperate world',
      'A roughly Earth-mass planet in the star’s temperate zone — the closest ' +
      'world of its kind to Earth that anyone has found.',
      [
        'Proxima Centauri b receives about as much energy from its star as Earth does from the Sun.',
        'Its year lasts a little over eleven Earth days.',
        'Whether it kept an atmosphere against the star’s flares is the open question about it.',
      ],
    ),
    proximaPlanet(
      'c', 7.2, 0.44, 0.27, PLANET_RECIPES.iceGiant, ATMOSPHERES.iceGiant,
      'Third orbit · a cold outer candidate',
      'A cold super-Earth or small ice giant far out from the star, still ' +
      'listed as a candidate rather than a confirmed world.',
      ['Proxima Centauri c takes about five Earth YEARS to complete one orbit.'],
    ),
  ],
}

const kepler90Planet = (letter, r, size, phase, recipe, atmo, label, description, facts) => ({
  id: `kepler90-${letter}`,
  recipe,
  atmo,
  r,
  size,
  phase,
  info: {
    name: `Kepler-90 ${letter}`,
    label,
    description,
    facts: [
      ...facts,
      'Every one of Kepler-90’s eight planets orbits closer to its star than Earth orbits the Sun.',
      'Their separations are visually expanded here so their Keplerian motion can be inspected.',
    ],
  },
})

// Eight planets around a Sun-like star, which makes this the system that ties
// ours on planet count — and the reason it belongs next to the Solar System in
// the switcher. The lesson is in the comparison: the same eight worlds, the
// same kind of star, and the whole family packed inside Earth's orbit.
//
// Letters run b, c, i, d, e, f, g, h by DISTANCE, not alphabetically. Planets
// are lettered in order of discovery, and i was found last — in 2017, by a
// neural network — so it lands third from the star in a sequence that
// otherwise looks mis-sorted. That is real and is left alone.
const kepler90System = {
  id: 'kepler-90',
  info: {
    id: 'kepler-90-system',
    name: 'Kepler-90',
    label: 'Sun-like star · eight worlds, all inside Earth’s orbit',
    description:
      'The first system found to match the Solar System’s eight planets, about ' +
      '2,800 light-years away. The resemblance stops at the count: every one of ' +
      'those eight worlds orbits closer to its star than Earth does to the Sun.',
    facts: [
      'It was the first system known to hold eight planets, tying the Solar System.',
      'The eighth, Kepler-90 i, was found in 2017 by a neural network trained to spot transits human searches had missed.',
      'The whole system would fit inside Earth’s orbit — a Solar System’s worth of planets in a Mercury’s worth of space.',
      'Like our own, the small rocky worlds orbit close in and the giants further out; the pattern repeats at a smaller scale.',
    ],
  },
  star: {
    render: {
      radius: 1.24,
      coronaScale: 1.22,
      coronaColor: 0xffc266,
      coronaStrength: 0.78,
    },
    info: {
      id: 'kepler-90-star',
      name: 'Kepler-90',
      label: 'G-type main-sequence star · slightly hotter than the Sun',
      description:
        'A Sun-like star a little larger and hotter than our own — close enough ' +
        'in kind that the comparison between the two systems is a fair one.',
      facts: [
        'It is a G-type main-sequence star, the same broad class as the Sun.',
        'It sits roughly 2,800 light-years away, far beyond anything visible to the naked eye.',
        'Its planets were all found by watching for the tiny dip in its light as each one crossed in front.',
      ],
    },
  },
  orbits: [
    kepler90Planet(
      'b', 2.1, 0.24, 0.07, PLANET_RECIPES.mercury, false,
      'First orbit · a scorched rocky world',
      'The innermost planet, close enough to its star that a year lasts a week.',
      ['Kepler-90 b completes an orbit in about seven Earth days.'],
    ),
    kepler90Planet(
      'c', 2.6, 0.22, 0.51, PLANET_RECIPES.lava, ATMOSPHERES.lava,
      'Second orbit · a molten rocky world',
      'A small world receiving enough stellar heat to keep its surface glowing.',
      ['Kepler-90 c takes about 8.7 Earth days to go round.'],
    ),
    kepler90Planet(
      'i', 3.15, 0.24, 0.29, PLANET_RECIPES.desert, ATMOSPHERES.desert,
      'Third orbit · the one a machine found',
      'A hot rocky world missed by every human search of the same data, and the ' +
      'planet that brought this system level with our own.',
      [
        'Kepler-90 i was found in 2017 by a neural network trained on Kepler’s light curves.',
        'Its transit signal was too faint for the earlier searches to call it a planet.',
      ],
    ),
    kepler90Planet(
      'd', 4.2, 0.36, 0.72, PLANET_RECIPES.venus, ATMOSPHERES.venus,
      'Fourth orbit · a shrouded super-Earth',
      'A world about three times Earth’s width, well inside the region our own ' +
      'system reserves for Mercury.',
      ['Kepler-90 d has a year of roughly 60 Earth days.'],
    ),
    kepler90Planet(
      'e', 5.1, 0.34, 0.15, PLANET_RECIPES.cloud, ATMOSPHERES.cloud,
      'Fifth orbit · a mini-Neptune',
      'A thick-atmosphered world of a kind the Solar System does not have at all.',
      ['Kepler-90 e completes an orbit in about 92 Earth days.'],
    ),
    kepler90Planet(
      'f', 6.1, 0.36, 0.63, PLANET_RECIPES.iceGiant, ATMOSPHERES.iceGiant,
      'Sixth orbit · a cooler mini-Neptune',
      'The outermost of the system’s three middle worlds, and the last before ' +
      'the giants.',
      ['Kepler-90 f takes about 125 Earth days to complete one orbit.'],
    ),
    kepler90Planet(
      'g', 7.9, 0.58, 0.38, PLANET_RECIPES.gas, ATMOSPHERES.gas,
      'Seventh orbit · a gas giant',
      'A giant roughly Saturn’s size, orbiting where our own system keeps Venus.',
      ['Kepler-90 g has a year of about 211 Earth days.'],
    ),
    kepler90Planet(
      'h', 10.2, 0.68, 0.84, PLANET_RECIPES.gas, ATMOSPHERES.gas,
      'Eighth orbit · the outermost giant',
      'The largest planet of the eight, near Jupiter’s size, and still closer to ' +
      'its star than Earth is to the Sun.',
      ['Kepler-90 h takes about 331 Earth days — nearly an Earth year — to go round.'],
    ),
  ],
}

export const SYSTEMS = [solarSystem, trappistSystem, proximaSystem, kepler90System]
export const DEFAULT_SYSTEM = SYSTEMS[0]
