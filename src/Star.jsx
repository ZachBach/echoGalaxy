import { useEffect, useMemo } from 'react'
import { buildStarBodyMaterial, buildCoronaMaterial } from './starMaterial'

// <Star> — fireRamp plasma sphere + streaks corona shell (G1-26/27).
// Deliberately not a <Planet>: no terminator, emissive-only — the star
// is the light source, not a lit body.
export default function Star({ radius = 1.7, coronaScale = 1.24, frozen = false }) {
  const body = useMemo(() => buildStarBodyMaterial({ frozen }), [frozen])
  const corona = useMemo(
    () => buildCoronaMaterial({ frozen, bodyRadius: radius, shellRadius: radius * coronaScale }),
    [frozen, radius, coronaScale],
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
export const STAR_INFO = {
  id: 'star',
  name: 'Star',
  label: 'G-type main-sequence · the engine',
  description:
    'A ball of plasma so massive that its own gravity crushes hydrogen ' +
    'nuclei together into helium — nuclear fusion. The energy released ' +
    'holds the star up against collapse and lights everything around it.',
  facts: [
    'A star’s color IS its temperature: red ≈ 3,000 K, our sun’s ' +
      'white-yellow ≈ 5,800 K, blue giants pass 20,000 K — the same ' +
      'blackbody physics as a heating iron bar.',
    'The corona — the wispy streamers past the edge — is millions of ' +
      'degrees, hundreds of times hotter than the surface below it. Why is ' +
      'still an active research problem.',
    'Granulation: the mottled surface is convection — rising cells of ' +
      'hot plasma the size of continents, each lasting only minutes.',
  ],
}
