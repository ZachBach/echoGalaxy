import { PLANET_RECIPES, ATMOSPHERES } from './planetRecipes'
import { STAR_INFO } from './Star'
import { BLACK_HOLE_INFO } from './BlackHole'

/**
 * The planet-view catalogue (G1-31): each entry pairs a surface recipe +
 * atmosphere preset with its educational copy — same shape the galaxy
 * HUD consumes (name / label / description / facts).
 */
export const PLANET_TYPES = [
  {
    id: 'rocky',
    name: 'Rocky Planet',
    label: 'Terrestrial world · silicate crust',
    description:
      'A solid world of rock and metal — continents, oceans, and a thin ' +
      'skin of atmosphere over a dense iron heart. The only kind of planet ' +
      'we know can hold liquid water on its surface.',
    facts: [
      'Terrestrial planets form close to their star, where it was too hot ' +
        'for ices to survive — only rock and metal could condense.',
      'The day/night line — the terminator — is where sunrise and sunset ' +
        'are happening right now. City lights only show on the night side.',
      'Earth is the densest planet in the Solar System; Mercury, Venus, ' +
        'and Mars are its rocky siblings.',
      'Watch the grey moon: it turns exactly once per orbit — tidal ' +
        'locking — so it never shows its far side. Humanity needed a ' +
        'spacecraft (Luna 3, 1959) to see the Moon’s other face at all.',
    ],
    recipe: PLANET_RECIPES.rocky,
    atmosphere: ATMOSPHERES.rocky,
    spinRate: 0.04,
    moon: { orbitR: 3.2, size: 0.4, period: 45, phase: 0.15, recipe: PLANET_RECIPES.moon },
  },
  {
    id: 'lava',
    name: 'Lava World',
    label: 'Molten world · magma ocean',
    description:
      'A planet caught glowing: a thin, dark crust of cooled rock pulled ' +
      'apart by the churning melt beneath. Every rocky planet looks like ' +
      'this when it is young — some stay this way forever.',
    facts: [
      'After the giant impacts of formation, every terrestrial planet ' +
        'begins as a global magma ocean.',
      'Io, Jupiter’s innermost big moon, stays molten today — kneaded by ' +
        'tidal forces like bread dough.',
      'The bright cracks are crust rifting apart; the glow needs no ' +
        'sunlight, so the night side burns just as bright.',
    ],
    recipe: PLANET_RECIPES.lava,
    atmosphere: ATMOSPHERES.lava,
    spinRate: 0.03,
  },
  {
    id: 'ice',
    name: 'Ice World',
    label: 'Frozen world · beyond the frost line',
    description:
      'Past the frost line of a planetary system, water freezes as hard as ' +
      'granite — and worlds are built from ice as much as rock. Many hide ' +
      'liquid oceans beneath their cracked shells.',
    facts: [
      'Europa’s fractured ice shell hides an ocean holding more water ' +
        'than all of Earth’s seas combined.',
      'The vein pattern is real physics: an ice crust stretching over a ' +
        'liquid interior cracks, refreezes, and cracks again.',
      'Ice worlds are bright — fresh ice reflects most of the sunlight ' +
        'that reaches it, keeping them frozen.',
    ],
    recipe: PLANET_RECIPES.ice,
    atmosphere: ATMOSPHERES.ice,
    spinRate: 0.035,
  },
  {
    id: 'gas',
    name: 'Gas Giant',
    label: 'Giant planet · mostly hydrogen',
    description:
      'A planet with no surface at all: hydrogen and helium all the way ' +
      'down, until pressure turns gas into liquid metal. The stripes are ' +
      'jet streams shearing clouds into bands that circle the whole world.',
    facts: [
      'Jupiter-like giants are ~90% hydrogen and helium — the same ' +
        'ingredients as a star, just not enough mass to ignite.',
      'Neighbouring bands race in opposite directions at hundreds of ' +
        'km/h; the wobbles between them are shear turbulence.',
      'Gas giants spin fast — Jupiter’s day is under 10 hours, and the ' +
        'spin visibly flattens it.',
    ],
    recipe: PLANET_RECIPES.gas,
    atmosphere: ATMOSPHERES.gas,
    spinRate: 0.06,
  },
  {
    ...STAR_INFO,
    label: STAR_INFO.label,
    star: true,
  },
  BLACK_HOLE_INFO,
  {
    id: 'ringed',
    name: 'The Ringed World',
    label: 'Gas giant with rings · a Saturn',
    description:
      'A pale giant wearing a disc of ice. The rings are not solid — ' +
      'they are billions of snowballs, each on its own orbit, herded by ' +
      'gravity into the flattest structure nature makes. Every giant ' +
      'planet in our Solar System has rings; Saturn just wears them best.',
    facts: [
      'The rings live inside the Roche limit — the line where a planet’s ' +
        'tides tear any forming moon apart. Inside the line gravity can ' +
        'only make rings; outside it, gravity makes moons.',
      'Watch the planet’s shadow bite the far side of the ring plane — ' +
        'proof the rings are a real disc in space, not a painted halo.',
      'Saturn itself is less dense than water. With a bathtub big ' +
        'enough, it would float.',
    ],
    ringed: true,
  },
  {
    id: 'rings',
    name: 'The Rings, Alone',
    label: 'Ring system · ~95% water ice · ten metres thin',
    description:
      'Take the planet away, and this is what remains: a sheet of ' +
      'orbiting snowballs 280,000 kilometres wide and only about ten ' +
      'metres thick. A scale model made of paper would be a kilometre ' +
      'across — the rings are, proportionally, the thinnest thing you ' +
      'have ever seen.',
    facts: [
      'Every particle — from dust grain to house-sized boulder — is a ' +
        'tiny moon on its own orbit; countless gentle collisions keep ' +
        'the sheet impossibly flat.',
      'The dark gap is the Cassini Division: the moon Mimas tugs the ' +
        'particles there at the same point every second orbit — like ' +
        'pushing a child on a swing — until they swing right out.',
      'The rings are young and dying. Dinosaurs may have looked up at a ' +
        'ringless Saturn, and “ring rain” will erase them in ~100 ' +
        'million years. We are alive in the brief window when Saturn ' +
        'has rings at all.',
    ],
    rings: true,
  },
  {
    id: 'desert',
    name: 'Desert World',
    label: 'Terrestrial world · dry basins and polar caps',
    description:
      'A rocky planet shaped by impacts, wind, and temperature extremes. With ' +
      'little surface water, mineral terrain and dust dominate the view.',
    facts: [
      'Mars and Mercury are both dry rocky worlds, but for very different reasons: Mars lost much of its early atmosphere, while Mercury formed close to the Sun.',
      'Iron-rich minerals can turn an entire planet red or orange, as on Mars.',
      'Polar ice can survive even on a dry world when it is sheltered from direct sunlight.',
    ],
    recipe: PLANET_RECIPES.desert,
    atmosphere: ATMOSPHERES.desert,
    spinRate: 0.028,
  },
  {
    id: 'ocean',
    name: 'Ocean World',
    label: 'Water-rich world · sparse islands',
    description:
      'A world where water covers most of the surface. It is a useful thought ' +
      'experiment for the many exoplanets whose bulk density suggests deep global oceans.',
    facts: [
      'Earth is not an ocean world: continents break its global sea into basins and regulate climate through rock chemistry.',
      'A deep global ocean can hide its rocky floor beneath high-pressure ice.',
      'Several known exoplanets may have enough water to qualify as ocean-world candidates, but their surfaces remain unobserved.',
    ],
    recipe: PLANET_RECIPES.ocean,
    atmosphere: ATMOSPHERES.ocean,
    spinRate: 0.038,
  },
  {
    id: 'cloud',
    name: 'Cloud World',
    label: 'Venus-like world · permanent cloud deck',
    description:
      'A rocky planet hidden by high clouds. The visible face is atmosphere, ' +
      'not ground: the surface below can remain inaccessible to direct view.',
    facts: [
      'Venus is wrapped in reflective sulfuric-acid clouds high above its surface.',
      'The same clouds that make Venus bright from space help trap heat in its dense carbon-dioxide atmosphere.',
      'Planetary appearance alone can be misleading: a bright cloud deck says little about conditions at the ground.',
    ],
    recipe: PLANET_RECIPES.cloud,
    atmosphere: ATMOSPHERES.cloud,
    spinRate: 0.018,
  },
  {
    id: 'venus',
    name: 'Venus',
    label: 'Second orbit · the morning and the evening star',
    description:
      'Earth\'s twin in size and mass, and nothing like it in every way that ' +
      'matters. Venus is the brightest thing in our sky after the Sun and the ' +
      'Moon — bright enough to find in broad daylight if you know where to ' +
      'look, and bright because it is wrapped head to foot in cloud that ' +
      'throws back three quarters of the sunlight reaching it.',
    facts: [
      'A day on Venus is longer than its year. It turns once in 243 Earth days and orbits the Sun in 225, so the sunrises do not keep up with the calendar.',
      'It also turns backwards. On Venus the Sun rises in the west — and, with a day that long, does so about twice a year.',
      'The clouds move sixty times faster than the planet. The whole deck laps Venus in roughly four days while the ground beneath barely creeps: superrotation, and nobody has fully explained it.',
      'It is the hottest planet in the Solar System at about 465°C, hotter than Mercury despite being nearly twice as far from the Sun. Carbon dioxide did that, not distance.',
      'The banded shapes here are ultraviolet. To your eye Venus is an almost featureless cream ball; the dark "Y" only appears in UV, painted by an absorber still not conclusively identified.',
      'For most of history it was two objects: a morning star and an evening star, named separately by many cultures before anyone realised they were the same world returning.',
    ],
    recipe: PLANET_RECIPES.venus,
    atmosphere: ATMOSPHERES.venus,
    // Retrograde and very slow. Negative because Venus really does turn the
    // other way; the cloud deck in the recipe superrotates in the same
    // direction, only far faster, which is the honest relationship.
    spinRate: -0.005,
    dedication: 'For Erne.',
  },
  {
    id: 'ice-giant',
    name: 'Ice Giant',
    label: 'Outer giant · methane-blue atmosphere',
    description:
      'A blue outer planet built from more water-, ammonia-, and methane-rich ' +
      'material than a Jupiter-like gas giant. Its color comes from methane high in the atmosphere.',
    facts: [
      'Uranus and Neptune are ice giants, a category distinct from Jupiter and Saturn.',
      'Methane absorbs red light, leaving the blue and green colors that dominate their visible cloud tops.',
      'Ice giants may hide exotic high-pressure fluids and electrically conductive water-ammonia layers deep inside.',
    ],
    recipe: PLANET_RECIPES.iceGiant,
    atmosphere: ATMOSPHERES.iceGiant,
    spinRate: 0.05,
  },
]
