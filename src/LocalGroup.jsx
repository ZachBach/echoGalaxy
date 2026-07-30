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
const MEMBERS = [
  {
    id: 'milkyway',
    cfg: { type: 'barred', count: 8000, arms: 2, spin: 1.05, radius: 8, bar: 0.42, randomness: 0.28, thickness: 0.34, tempCore: 4000, tempRim: 10000 },
    pos: [-8, 0, 10],
    rot: [0.35, 0.4, 0.1],
  },
  {
    id: 'andromeda',
    cfg: { type: 'spiral', count: 9000, arms: 2, spin: 1.3, radius: 9, randomness: 0.3, thickness: 0.36, tempCore: 4300, tempRim: 10500 },
    pos: [16, 4, -10],
    rot: [1.15, -0.3, 0.35],
  },
  {
    id: 'triangulum',
    cfg: { type: 'spiral', count: 3000, arms: 3, spin: 1.4, radius: 4, randomness: 0.34, thickness: 0.3, tempCore: 5000, tempRim: 11500 },
    pos: [24, -2, 2],
    rot: [0.5, 0.9, -0.2],
  },
  {
    id: 'lmc',
    cfg: { type: 'irregular', count: 1200, radius: 2, thickness: 0.5, tempCore: 6500, tempRim: 12000 },
    pos: [-4.5, -2.5, 13.5],
    rot: [0.2, 0, 0.4],
  },
  {
    id: 'smc',
    cfg: { type: 'irregular', count: 800, radius: 1.4, thickness: 0.5, tempCore: 6800, tempRim: 12500 },
    pos: [-3, -3.5, 16],
    rot: [0.6, 0.3, 0],
  },
  {
    id: 'm32',
    cfg: { type: 'elliptical', count: 1000, radius: 1.3, thickness: 0.4, tempCore: 3900, tempRim: 3300 },
    pos: [14.5, 5.5, -8],
    rot: [0, 0, 0],
  },
  {
    id: 'm110',
    cfg: { type: 'elliptical', count: 1000, radius: 1.6, thickness: 0.4, tempCore: 3800, tempRim: 3200 },
    pos: [18.5, 2, -13],
    rot: [0.3, 0, 0.5],
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
