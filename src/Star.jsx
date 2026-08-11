import { useEffect, useMemo } from 'react'
import { buildStarBodyMaterial, buildCoronaMaterial } from './starMaterial'
import { THE_SUN } from './starData'

// <Star> — fireRamp plasma sphere + streaks corona shell (G1-26/27).
// Deliberately not a <Planet>: no terminator, emissive-only — the star
// is the light source, not a lit body.
export default function Star({
  radius = 1.7,
  coronaScale = 1.24,
  bodyColor = 0xffffff,
  coronaColor = 0xffa64d,
  coronaStrength = 0.8,
  frozen = false,
}) {
  const body = useMemo(
    () => buildStarBodyMaterial({ frozen, color: bodyColor }),
    [frozen, bodyColor],
  )
  const corona = useMemo(
    () => buildCoronaMaterial({
      frozen,
      bodyRadius: radius,
      shellRadius: radius * coronaScale,
      color: coronaColor,
      strength: coronaStrength,
    }),
    [frozen, radius, coronaScale, coronaColor, coronaStrength],
  )
  useEffect(() => () => { body.dispose(); corona.dispose() }, [body, corona])

  return (
    <group>
      <mesh material={body}>
        <sphereGeometry args={[radius, 96, 96]} />
      </mesh>
      <mesh material={corona} renderOrder={1}>
        <sphereGeometry args={[radius * coronaScale, 96, 96]} />
      </mesh>
    </group>
  )
}

// G1-30 — the educational payload, consumed by planetData in G1-31.
// The explorer rung. These are deliberately the facts about what is on
// screen — the corona shell and the granulated surface are things this
// shader actually renders, so the reader can look while they read.
const STAR_FACTS = [
  'How big is a star? If the Sun were a bowling ball, Earth would be a ' +
    'peppercorn beside it — about 1.3 million Earths would fit inside.',
  'A star’s color IS its temperature: red ≈ 3,000 K, our sun’s ' +
    'white-yellow ≈ 5,800 K, blue giants pass 20,000 K — the same ' +
    'blackbody physics as a heating iron bar.',
  'The corona — the wispy streamers past the edge — is millions of ' +
    'degrees, hundreds of times hotter than the surface below it. Why is ' +
    'still an active research problem.',
  'Granulation: the mottled surface is convection — rising cells of ' +
    'hot plasma the size of continents, each lasting only minutes.',
]

// First entry on the two-rung facts ladder (factsLadder.js). The body this
// rung renders is a G2V star at ~5,800 K — our Sun's profile — so the
// astronomer rung is the researched Sol entry from starData.js rather than
// a second set of numbers written here. `facts` stays for anything still
// reading the flat legacy shape.
export const STAR_INFO = {
  id: 'star',
  name: 'Star',
  label: 'G-type main-sequence · the engine',
  description:
    'A ball of plasma so massive that its own gravity crushes hydrogen ' +
    'nuclei together into helium — nuclear fusion. The energy released ' +
    'holds the star up against collapse and lights everything around it.',
  facts: STAR_FACTS,
  factsKids: STAR_FACTS,
  factsAdvanced: THE_SUN.factsAdvanced,
}
