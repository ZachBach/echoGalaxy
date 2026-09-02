import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import {
  makeGalaxyUniforms,
  applyGalaxyCfg,
  buildGalaxyMaterial,
  familyOf,
} from './galaxyShader'

// The Local Group rung (G3-21/22/23): real members, honestly arranged —
// distances compressed ~10× for viewing (at true scale the galaxies
// would be dots 400 units apart), relative sizes and neighbourhoods
// kept: LMC/SMC hug the Milky Way, M32/M110 hug Andromeda, Triangulum
// rides near Andromeda. The Milky Way is rendered as what it IS — a
// barred spiral.
//
// Budget rule (G3-23): the WHOLE group spends one galaxy's star budget —
// counts below sum to exactly 24,000, so the group rung costs what the
// single-galaxy view costs. Members are live-math rigs (per-member
// uniforms; the B-section compute bake's one-shared-buffer design
// doesn't extend to concurrent members, and at this budget it wouldn't
// pay anyway). Nebula veils are skipped at group distance.
export const MEMBERS = [
  {
    id: 'milkyway',
    cfg: { type: 'barred', count: 7500, arms: 2, spin: 1.05, radius: 8, bar: 0.42, randomness: 0.28, thickness: 0.34, tempCore: 4000, tempRim: 10000 },
    pos: [-8, 0, 10],
    rot: [0.35, 0.4, 0.1],
    info: {
      name: 'Milky Way', label: 'Barred spiral · home',
      description:
        'Our galaxy, seen from a vantage point no camera will ever reach. ' +
        'Somewhere in one of those outer arms, two-thirds of the way from ' +
        'the center, is the Sun — and everyone you have ever met.',
      facts: [
        'It holds 100–400 billion stars — count one per second and you’d ' +
          'need over 3,000 years for the low estimate.',
        'At its heart sits Sagittarius A*, a black hole of 4 million solar ' +
          'masses.',
        'The Sun has completed only ~20 laps of the galaxy in its whole ' +
          '4.6-billion-year life — one orbit takes about 230 million years.',
      ],
    },
  },
  {
    id: 'andromeda',
    cfg: { type: 'spiral', count: 8400, arms: 2, spin: 1.3, radius: 9, randomness: 0.3, thickness: 0.36, tempCore: 4300, tempRim: 10500 },
    pos: [16, 4, -10],
    rot: [1.15, -0.3, 0.35],
    info: {
      name: 'Andromeda (M31)', label: 'Spiral · 2.5 million light-years',
      description:
        'The Milky Way’s big sibling and its destiny: the two spirals are ' +
        'falling toward each other and will merge into one giant galaxy in ' +
        'roughly 4.5 billion years.',
      facts: [
        'It is the farthest thing human eyes can see unaided — a smudge of ' +
          'light that left home 2.5 million years ago.',
        'It holds roughly a trillion stars — a few times our own count.',
        'Its light is blueshifted: unlike almost everything else in the ' +
          'sky, it is coming TOWARD us at ~110 km/s.',
      ],
    },
  },
  {
    id: 'triangulum',
    cfg: { type: 'spiral', count: 2700, arms: 3, spin: 1.4, radius: 4, randomness: 0.34, thickness: 0.3, tempCore: 5000, tempRim: 11500 },
    pos: [24, -2, 2],
    rot: [0.5, 0.9, -0.2],
    info: {
      name: 'Triangulum (M33)', label: 'Spiral · the Group’s third giant',
      description:
        'The third-largest galaxy in the Local Group — a loose, star-forming ' +
        'spiral riding near Andromeda, and possibly its satellite.',
      facts: [
        'About 40 billion stars — a tenth of the Milky Way’s count.',
        'It hosts one of the largest star-forming regions in the entire ' +
          'Local Group, NGC 604.',
        'It may already be gravitationally bound to Andromeda — a giant ' +
          'with a giant moon.',
      ],
    },
  },
  {
    id: 'lmc',
    cfg: { type: 'irregular', count: 1150, radius: 2, thickness: 0.5, tempCore: 6500, tempRim: 12000 },
    pos: [-4.5, -2.5, 13.5],
    rot: [0.2, 0, 0.4],
    info: {
      name: 'Large Magellanic Cloud', label: 'Irregular · our closest big neighbour',
      description:
        'A ragged satellite galaxy orbiting the Milky Way, close enough to ' +
        'see with the naked eye from the southern hemisphere — a bright ' +
        'cloud that never moves with the weather.',
      facts: [
        'Home to the Tarantula Nebula, the most furious star factory in ' +
          'the Local Group.',
        'Supernova 1987A exploded here — the closest supernova seen since ' +
          'telescopes were invented.',
        'It sits about 160,000 light-years away — next door, as galaxies go.',
      ],
    },
  },
  {
    id: 'smc',
    cfg: { type: 'irregular', count: 800, radius: 1.4, thickness: 0.5, tempCore: 6800, tempRim: 12500 },
    pos: [-3, -3.5, 16],
    rot: [0.6, 0.3, 0],
    info: {
      name: 'Small Magellanic Cloud', label: 'Irregular · the LMC’s companion',
      description:
        'The Large Cloud’s smaller partner, torn and stretched by the ' +
        'gravity of both its sibling and the Milky Way.',
      facts: [
        'A bridge of gas — the Magellanic Bridge — physically connects it ' +
          'to the Large Cloud: galaxies holding hands.',
        'Studying its pulsing stars is how astronomers first learned to ' +
          'measure distances across the universe.',
        'The Milky Way is slowly pulling both Clouds apart — in a few ' +
          'billion years they will be absorbed.',
      ],
    },
  },
  {
    id: 'm32',
    cfg: { type: 'elliptical', count: 850, radius: 1.3, thickness: 0.4, tempCore: 3900, tempRim: 3300 },
    pos: [14.5, 5.5, -8],
    rot: [0, 0, 0],
    info: {
      name: 'M32', label: 'Compact elliptical · Andromeda’s satellite',
      description:
        'A dense little ball of old stars pressed against Andromeda’s disc. ' +
        'It may be the surviving core of a much larger galaxy that Andromeda ' +
        'stripped bare.',
      facts: [
        'One of the densest galaxies known — millions of stars crammed ' +
          'into a space our neighbourhood would fit thousands in.',
        'Its missing outer layers are the evidence: galaxies EAT each other.',
        'You saw it in this scene before you knew its name — the bright dot ' +
          'against Andromeda’s disc.',
      ],
    },
  },
  {
    id: 'm110',
    cfg: { type: 'elliptical', count: 850, radius: 1.6, thickness: 0.4, tempCore: 3800, tempRim: 3200 },
    pos: [18.5, 2, -13],
    rot: [0.3, 0, 0.5],
    info: {
      name: 'M110', label: 'Dwarf elliptical · Andromeda’s satellite',
      description:
        'Andromeda’s other close companion — a soft, spread-out swarm of ' +
        'old stars on the far side of the great spiral from M32.',
      facts: [
        'A “dwarf” that still holds around 10 billion stars.',
        'Unusually for an elliptical, it shows traces of recent star ' +
          'formation — a small mystery.',
        'Charles Messier drew it in 1773 but never gave it a number; it ' +
          'joined his catalogue two centuries late, in 1967.',
      ],
    },
  },
  // The four below fill the gaps the first seven left. Two dwarf
  // spheroidals, because dSphs are the Local Group's most NUMEROUS class by
  // a wide margin and the scene showed none of them; one irregular that
  // orbits neither giant, because "everything huddles around a big spiral"
  // was the wrong lesson to teach; and the group's only starburst.
  //
  // Their counts are funded by trimming the seven above, not added on top —
  // the budget rule at the head of this file is the whole reason the group
  // rung costs what the single-galaxy view costs. check:content enforces the
  // 24,000 now rather than trusting the comment.
  {
    id: 'sculptor',
    cfg: { type: 'elliptical', count: 300, radius: 1.4, thickness: 0.55, shapeExp: 1.0, tempCore: 3800, tempRim: 3300 },
    pos: [-16, 8.4, 6.7],
    rot: [0, 0, 0],
    info: {
      name: 'Sculptor Dwarf', label: 'Dwarf spheroidal · Milky Way satellite',
      description:
        'A faint haze of old stars orbiting the Milky Way, so thinly spread ' +
        'you could look straight through it without noticing. Galaxies like ' +
        'this one are the most common kind in the Local Group, and the ' +
        'hardest of all to find.',
      facts: [
        'The commonest sort of galaxy here, and among the last to be ' +
          'noticed — it turned up on a photographic plate in 1937.',
        'Almost no gas is left, so almost no new stars: it finished forming ' +
          'them billions of years ago.',
        'It weighs far more than its stars can account for, which makes ' +
          'dwarf spheroidals some of the best hunting grounds for dark ' +
          'matter.',
      ],
    },
  },
  {
    id: 'fornax',
    cfg: { type: 'elliptical', count: 350, radius: 1.5, thickness: 0.5, shapeExp: 1.05, tempCore: 3900, tempRim: 3400 },
    pos: [-8, 12, 5.2],
    rot: [0.2, 0, 0.3],
    info: {
      name: 'Fornax Dwarf', label: 'Dwarf spheroidal · Milky Way satellite',
      description:
        'The brightest of the Milky Way’s dwarf spheroidal satellites, and ' +
        'the only one to have kept globular clusters of its own — a tiny ' +
        'galaxy that still holds a few cities of stars.',
      facts: [
        'It owns six globular clusters, which is extraordinary for a galaxy ' +
          'this small.',
        'Unlike most dwarf spheroidals it went on making stars for billions ' +
          'of years after its siblings stopped.',
        'About 460,000 light-years away — nearly three times farther than ' +
          'the Large Magellanic Cloud.',
      ],
    },
  },
  {
    id: 'ngc6822',
    cfg: { type: 'irregular', count: 600, radius: 1.7, thickness: 0.5, tempCore: 6400, tempRim: 11500 },
    pos: [4, -8, 14],
    rot: [0.4, 0.2, 0.1],
    info: {
      name: 'Barnard’s Galaxy (NGC 6822)', label: 'Irregular · nobody’s satellite',
      description:
        'An irregular galaxy adrift in the space between the Milky Way and ' +
        'Andromeda, orbiting neither of them. Most of the Local Group ' +
        'huddles close to one giant or the other; this one keeps its ' +
        'distance from both.',
      facts: [
        'E. E. Barnard found it in 1884 with a five-inch telescope.',
        'At about 1.6 million light-years out it is far enough to belong to ' +
          'no one — it is a member of the group, not a satellite of anything.',
        'Edwin Hubble studied it to help prove such smudges were galaxies in ' +
          'their own right, not clouds inside our own.',
      ],
    },
  },
  {
    id: 'ic10',
    cfg: { type: 'irregular', count: 500, radius: 1.4, thickness: 0.5, tempCore: 7000, tempRim: 13000 },
    pos: [10, 9, -15],
    rot: [0.3, 0.5, 0],
    info: {
      name: 'IC 10', label: 'Irregular · the only starburst here',
      description:
        'The Local Group’s one starburst galaxy — a small irregular building ' +
        'new stars far faster than something its size has any business ' +
        'doing, seen through the dust of our own galaxy’s disc.',
      facts: [
        'It is crowded with Wolf-Rayet stars: massive suns in the short, ' +
          'violent stage just before they explode.',
        'We look at it straight through the plane of the Milky Way, which is ' +
          'why its membership of the group was not settled until the 1990s.',
        'The burst cannot last. It is spending gas far faster than it can ' +
          'replace it.',
      ],
    },
  },
]

function GroupMember({ member, frozen }) {
  const sprite = useMemo(() => {
    const U = makeGalaxyUniforms()
    applyGalaxyCfg(U, member.cfg)
    const s = new THREE.Sprite(
      buildGalaxyMaterial(familyOf(member.cfg.type), U, { frozen, sizeScale: 1.8 }),
    )
    s.count = member.cfg.count
    s.frustumCulled = false
    return s
  }, [member, frozen])
  useEffect(() => () => sprite.material.dispose(), [sprite])

  return (
    <group position={member.pos} rotation={member.rot}>
      <primitive object={sprite} />
    </group>
  )
}

export default function LocalGroup({ frozen = false }) {
  return (
    <group>
      {MEMBERS.map((m) => (
        <GroupMember key={m.id} member={m} frozen={frozen} />
      ))}
    </group>
  )
}

// G3-24 — the group rung's educational payload.
export const GROUP_INFO = {
  id: 'group',
  name: 'The Local Group',
  label: 'Our galactic neighbourhood · ~10 million light-years',
  description:
    'The Milky Way is not alone: gravity binds it to Andromeda, ' +
    'Triangulum, and dozens of dwarf galaxies — our Local Group. ' +
    'Distances here are compressed for viewing; the arrangement and ' +
    'relative sizes are real.',
  facts: [
    'Andromeda’s light is blueshifted — it approaches at ~110 km/s, and ' +
      'in roughly 4.5 billion years the two great spirals will merge.',
    'You are looking at the Milky Way from outside — a barred spiral, a ' +
      'view no probe we have ever built will live to photograph.',
    'The dwarfs are not decoration: the Magellanic Clouds orbit the ' +
      'Milky Way, M32 and M110 orbit Andromeda.',
    'Gravity holds the Group together even as the wider universe ' +
      'expands — beyond its edge, everything recedes.',
  ],
}
