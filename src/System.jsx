import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import * as TSL from 'three/tsl'
import Planet from './Planet'
import Star from './Star'
import { PLANET_RECIPES, ATMOSPHERES } from './planetRecipes'

// The star-system rung (G3-13/14): the G1 star at center, the four worlds
// on orbits ordered by the frost-line story (molten innermost, ice
// outermost), with LITERAL Kepler-third-law periods (period ∝ r^1.5) —
// the inner world visibly laps the outer ones. Each planet carries its
// own sun uniform aimed at the origin, so terminators track the orbit.
const K = 7.5 // seconds per unit^1.5 — sets the visual tempo
const ORBITS = [
  { id: 'lava', recipe: PLANET_RECIPES.lava, atmo: ATMOSPHERES.lava, r: 2.3, size: 0.3, phase: 0.13 },
  { id: 'rocky', recipe: PLANET_RECIPES.rocky, atmo: ATMOSPHERES.rocky, r: 3.5, size: 0.38, phase: 0.52 },
  { id: 'gas', recipe: PLANET_RECIPES.gas, atmo: ATMOSPHERES.gas, r: 5.3, size: 0.62, phase: 0.82 },
  { id: 'ice', recipe: PLANET_RECIPES.ice, atmo: ATMOSPHERES.ice, r: 7.1, size: 0.34, phase: 0.31 },
]

function OrbitingPlanet({ orbit, frozen }) {
  const ref = useRef()
  const sunU = useMemo(() => TSL.uniform(new THREE.Vector3(1, 0, 0)), [])

  const place = (t) => {
    const theta = orbit.phase * Math.PI * 2 + (t * Math.PI * 2) / (K * Math.pow(orbit.r, 1.5))
    const x = Math.cos(theta) * orbit.r
    const z = Math.sin(theta) * orbit.r
    ref.current?.position.set(x, 0, z)
    sunU.value.set(-x, 0, -z).normalize()
  }

  useEffect(() => place(0), []) // eslint-disable-line react-hooks/exhaustive-deps
  useFrame(({ clock }) => {
    if (!frozen) place(clock.elapsedTime)
  })

  return (
    <group ref={ref}>
      <Planet
        recipe={orbit.recipe}
        radius={orbit.size}
        atmosphere={orbit.atmo}
        sun={sunU}
        spinRate={0.15}
        frozen={frozen}
      />
    </group>
  )
}

export default function System({ frozen = false }) {
  // one faint shared ring material — plain basic material; the node
  // pipeline converts classic materials fine
  const ringMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x39456b,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )
  useEffect(() => () => ringMaterial.dispose(), [ringMaterial])

  return (
    <group>
      <Star radius={1.15} frozen={frozen} />
      {ORBITS.map((o) => (
        <group key={o.id}>
          <mesh rotation-x={-Math.PI / 2} material={ringMaterial} renderOrder={-1}>
            <ringGeometry args={[o.r - 0.012, o.r + 0.012, 160]} />
          </mesh>
          <OrbitingPlanet orbit={o} frozen={frozen} />
        </group>
      ))}
    </group>
  )
}

// G3-17 — the system rung's educational payload (consumed by the scale
// ladder in section E).
export const SYSTEM_INFO = {
  id: 'system',
  name: 'Star System',
  label: 'One star · four worlds',
  description:
    'A star and everything its gravity holds: worlds born from the same ' +
    'flat disk of dust, which is why they all orbit in one plane, in one ' +
    'direction. Distance from the star decided what each one became.',
  facts: [
    'Astronomers measure systems in AU — one AU is the Earth–Sun ' +
      'distance, about 150 million kilometres.',
    'Kepler’s third law, live: the orbital period grows as distance^1.5 — ' +
      'watch the inner molten world lap the slow outer ice world.',
    'The star is not just the center — it IS the system: our own Sun ' +
      'holds 99.86% of the Solar System’s entire mass.',
    'The habitable zone is the ring where water can stay liquid — not so ' +
      'close it steams away, not so far it freezes.',
  ],
}
