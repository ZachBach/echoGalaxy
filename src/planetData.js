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
]
