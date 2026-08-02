import { useEffect, useMemo } from 'react'
import {
  buildHorizonMaterial,
  buildDiscMaterial,
  buildPhotonRingMaterial,
} from './blackHoleMaterial'

// <BlackHole> — event horizon + photon ring + doppler accretion disc +
// the lensed-halo cheat (a vertical ring whose middle the horizon
// occludes, leaving the two Interstellar arcs). Neither planet nor star:
// its own component, per the G1-01 scope discipline.
export default function BlackHole({ radius = 0.9, frozen = false }) {
  const horizon = useMemo(() => buildHorizonMaterial(), [])
  const disc = useMemo(() => buildDiscMaterial({ frozen }), [frozen])
  const halo = useMemo(() => buildDiscMaterial({ frozen, dim: 0.26 }), [frozen])
  const photon = useMemo(() => buildPhotonRingMaterial(), [])
  useEffect(
    () => () => {
      horizon.dispose()
      disc.dispose()
      halo.dispose()
      photon.dispose()
    },
    [horizon, disc, halo, photon],
  )

  const rOut = radius * 3.55
  const rIn = rOut * 0.36

  return (
    <group rotation={[0.32, 0, 0.06]}>
      {/* the shadow: opaque, depth-writing black sphere */}
      <mesh material={horizon}>
        <sphereGeometry args={[radius, 64, 64]} />
      </mesh>
      {/* photon ring hugging the horizon */}
      <mesh material={photon} renderOrder={1}>
        <ringGeometry args={[radius * 1.02, radius * 1.45, 128]} />
      </mesh>
      {/* accretion disc, flat in the equator */}
      <mesh rotation-x={-Math.PI / 2} material={disc} renderOrder={2}>
        <ringGeometry args={[rIn, rOut, 192]} />
      </mesh>
      {/* lensed halo: vertical ring behind — the horizon eats its middle,
          the surviving arcs read as light bent over and under */}
      <mesh position-z={-0.01} material={halo} renderOrder={1}>
        <ringGeometry args={[radius * 1.28, radius * 2.1, 160]} />
      </mesh>
    </group>
  )
}

export const BLACK_HOLE_INFO = {
  id: 'blackhole',
  blackhole: true,
  name: 'Black Hole',
  label: 'Event horizon · the point of no return',
  description:
    'Gravity so strong that space itself flows inward faster than light ' +
    'can swim against it. The black circle is not a surface — it is the ' +
    'last place light was ever seen. Everything you see glowing is matter ' +
    'screaming as it falls.',
  facts: [
    'Nothing that crosses the event horizon comes back. Not rockets, not ' +
      'signals, not light — the exit simply does not point outward anymore.',
    'One side of the disc shines brighter because that plasma races ' +
      'TOWARD you at close to light speed — Doppler beaming, visible in ' +
      'every real photo of a black hole.',
    'How big? The Milky Way’s central black hole weighs 4 million Suns, ' +
      'yet its horizon would fit inside Mercury’s orbit.',
    'The glowing ring near the shadow is light that ORBITED the hole ' +
      'before escaping to your eye.',
  ],
}
