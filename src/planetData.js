import { PLANET_RECIPES, ATMOSPHERES } from './planetRecipes'
import { STAR_INFO } from './Star'

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
    ],
    recipe: PLANET_RECIPES.rocky,
    atmosphere: ATMOSPHERES.rocky,
    spinRate: 0.04,
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
]
