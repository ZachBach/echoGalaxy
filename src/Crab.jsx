import { useEffect, useMemo, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as TSL from 'three/tsl'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { CRAB_BOUNDS } from './crabField'
import { bakeCrabAtlas, buildCrabMaterial } from './crabMaterial'

// <Crab> (SN-06) — the wreckage of the guest star of 1054: the
// atlas-baked filament shell + synchrotron ghost, with the pulsar's
// heart beating at its center. The beat runs at ~2 Hz — a SLOWED
// lighthouse, declared in the facts (the true rate is ~30/s; the
// compression-honesty rule applies to time as much as distance).
// Frozen ⇒ clock 0 ⇒ the heart holds mid-beat, deterministic.
export default function Crab({ frozen = false, steps = 20 }) {
  const gl = useThree((s) => s.gl)
  const [material, setMaterial] = useState(null)

  const heartMat = useMemo(() => {
    const clock = frozen ? TSL.float(0) : TSL.time
    const pulse = TSL.sin(clock.mul(Math.PI * 4))
      .max(0)
      .pow(8)
      .mul(1.4)
      .add(0.5)
    const m = new MeshBasicNodeMaterial()
    m.colorNode = TSL.vec3(0.75, 0.85, 1.15).mul(pulse)
    return m
  }, [frozen])

  useEffect(() => {
    const rt = bakeCrabAtlas(gl)
    const m = buildCrabMaterial({ steps, texture: rt.texture })
    setMaterial(m)
    return () => {
      m.dispose()
      rt.dispose()
    }
  }, [gl, steps])

  useEffect(() => () => heartMat.dispose(), [heartMat])

  return (
    <group rotation={[0.1, 0.5, 0.06]}>
      {material && (
        <mesh material={material}>
          <boxGeometry
            args={[CRAB_BOUNDS.x * 2, CRAB_BOUNDS.y * 2, CRAB_BOUNDS.z * 2]}
          />
        </mesh>
      )}
      <mesh material={heartMat}>
        <sphereGeometry args={[0.045, 12, 12]} />
      </mesh>
    </group>
  )
}

// SN-08 — the guest star's payload. Facts source-verified 2026-08-03
// (Britannica / SEDS / EarthSky).
export const CRAB_INFO = {
  id: 'crab',
  name: 'The Crab Nebula',
  label: 'Supernova remnant · M1 · the guest star of 1054',
  description:
    'The wreckage of an exploded star. In July 1054, astronomers in ' +
    'China recorded a “guest star” bright enough to see in broad ' +
    'daylight. A thousand years later, its shredded body is still ' +
    'flying apart — and its collapsed heart is still beating.',
  facts: [
    'The guest star burned in the daytime sky for 23 days, and at ' +
      'night for nearly two years, before fading. Its light had ' +
      'traveled ~6,500 years to arrive.',
    'The heart is a pulsar: a city-sized ball of almost pure neutrons ' +
      'spinning about 30 times every second. The beat you see here is ' +
      'slowed, so your eye can follow what a radio telescope hears.',
    'The eerie blue light is synchrotron glow — electrons spiraling ' +
      'near light speed along magnetic field lines. The pulsar keeps ' +
      'the entire cloud lit from inside.',
    'Supernovae forge the heavy elements and hurl them into space. ' +
      'The iron in your blood and the calcium in your bones were made ' +
      'in explosions exactly like this one. You are wreckage, ' +
      'rearranged.',
  ],
}
