import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import * as TSL from 'three/tsl'
import Planet from './Planet'
import { sunDir } from './sun'
import { PLANET_RECIPES, ATMOSPHERES } from './planetRecipes'
import { buildRingMaterial, RING_INNER, RING_OUTER } from './ringMaterial'

// <RingedWorld> (SR-05/06) — a Saturn: the pale banded giant wearing
// its ring system, tilted 26.7° like the original. In `ringsOnly` mode
// the planet vanishes and the rings stand alone (SR-06): larger, tipped
// further toward the viewer so the Cassini gap reads, and shadowless —
// nothing casts it.
//
// The sun contract (SR-01): everything here is static, so the world
// sunDir is rotated ONCE in JS into each local frame — the planet gets
// it as a uniform in group-local space (the terminator stays world-
// anchored under the tilt), the ring material gets it as a plain
// vector in ring-mesh-local space (group tilt + the −π/2 annulus flip,
// both inverted). Zero runtime cost.

const TILT = [0.466, 0, 0.12] // 26.7°, with a compositional lean
const TILT_ALONE = [0.7, 0, 0.1]

export default function RingedWorld({ frozen = false, ringsOnly = false }) {
  const scale = ringsOnly ? 1.55 : 1.15
  const tilt = ringsOnly ? TILT_ALONE : TILT

  const { sunU, ringMat } = useMemo(() => {
    const qGroup = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(tilt[0], tilt[1], tilt[2]),
    )
    const qRing = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-Math.PI / 2, 0, 0),
    )
    const sunLocal = sunDir.value.clone().applyQuaternion(qGroup.clone().invert())
    const sunRing = sunLocal.clone().applyQuaternion(qRing.clone().invert())
    return {
      sunU: TSL.uniform(sunLocal),
      ringMat: buildRingMaterial({
        sun: [sunRing.x, sunRing.y, sunRing.z],
        scale,
        shadow: !ringsOnly,
      }),
    }
  }, [ringsOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => ringMat.dispose(), [ringMat])

  return (
    <group rotation={tilt}>
      {!ringsOnly && (
        <Planet
          recipe={PLANET_RECIPES.ringed}
          radius={scale}
          atmosphere={ATMOSPHERES.ringed}
          sun={sunU}
          spinRate={0.05}
          frozen={frozen}
        />
      )}
      <mesh rotation-x={-Math.PI / 2} material={ringMat} renderOrder={2}>
        <ringGeometry args={[RING_INNER * scale, RING_OUTER * scale, 256]} />
      </mesh>
    </group>
  )
}
