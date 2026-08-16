import { useEffect, useMemo, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as TSL from 'three/tsl'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { WR_BOUNDS, WR_RUN } from './wrBubbleField'
import { bakeWrBubbleAtlas, buildWrBubbleMaterial } from './wrBubbleMaterial'

// <WolfRayet> — Sh 2-80, the shell WR 124 blew off itself. The middle
// act of the nebula rung: the Pillars are a star being born, the Crab
// is one already dead, and this is the violence in between.
//
// There is deliberately NO group rotation here, unlike the Crab. The
// march runs in world space, so rotating the group would turn the box
// and leave the volume where it was — and on these non-cubic bounds it
// would break the ray-box exit as well. The tilt that puts the runaway
// axis across the view is baked into the field as WR_RUN instead.
//
// The star does not pulse. A Wolf-Rayet is not a pulsar, and giving it
// the Crab's heartbeat would teach the wrong thing — but its wind is
// genuinely clumpy and its brightness genuinely wanders, so it gets a
// slow flicker built from two incommensurate sines that never settles
// into a period an eye can count. Frozen ⇒ clock 0 ⇒ deterministic.
export default function WolfRayet({ frozen = false, steps = 20 }) {
  const gl = useThree((s) => s.gl)
  const [material, setMaterial] = useState(null)

  const starMat = useMemo(() => {
    const clock = frozen ? TSL.float(0) : TSL.time
    const flicker = TSL.sin(clock.mul(0.9))
      .mul(TSL.sin(clock.mul(1.37).add(1.1)))
      .mul(0.12)
      .add(1)
    const m = new MeshBasicNodeMaterial()
    // 44,700 K. Blue-white, and the hottest thing on the rung.
    m.colorNode = TSL.vec3(1.05, 1.18, 1.5).mul(flicker)
    return m
  }, [frozen])

  useEffect(() => {
    const rt = bakeWrBubbleAtlas(gl)
    const m = buildWrBubbleMaterial({ steps, texture: rt.texture })
    setMaterial(m)
    return () => {
      m.dispose()
      rt.dispose()
    }
  }, [gl, steps])

  useEffect(() => () => starMat.dispose(), [starMat])

  return (
    <group>
      {material && (
        <mesh material={material}>
          <boxGeometry
            args={[WR_BOUNDS.x * 2, WR_BOUNDS.y * 2, WR_BOUNDS.z * 2]}
          />
        </mesh>
      )}
      {/* Nudged forward along the runaway axis: 20,000 years of travel
          since the shell left, which is why the leading face is close
          enough to shock and the wake is not. */}
      <mesh material={starMat} position={WR_RUN.map((c) => c * 0.1)}>
        <sphereGeometry args={[0.038, 12, 12]} />
      </mesh>
    </group>
  )
}

// The middle act's payload. Facts source-verified 2026-08-16 (NASA/ESA
// Webb release for WR 124, Wikipedia WR 124 / M1-67 with the cited
// distance and mass-loss figures).
export const WR_INFO = {
  id: 'wolf-rayet',
  name: 'Sh 2-80',
  label: 'Wolf-Rayet ring nebula · M1-67 · WR 124 · ~21,000 light-years away',
  description:
    'A star throwing itself away. WR 124 is about twenty times the ' +
    'Sun\'s mass and burning through it so fast that it is shedding its ' +
    'own outer layers into space — six light-years of them so far. What ' +
    'you are looking at is not wreckage yet. It is the last act before ' +
    'the wreckage.',
  facts: [
    'The shell left the star about 20,000 years ago and is still ' +
      'moving at over 150,000 km/h. The star is losing mass roughly a ' +
      'hundred million times faster than the Sun does.',
    'It is lopsided on purpose. WR 124 is a runaway — it is ploughing ' +
      'through interstellar gas at speed, so the shell piles up ahead ' +
      'of it and streams out behind, like a wake.',
    'The clumps are not decoration. Each of the big knots holds around ' +
      'thirty times the mass of the Earth, in gas and dust.',
    'The gold here is infrared, not what your eye would see. Webb ' +
      'looked at this shell to answer a real question: dust like this ' +
      'should be destroyed by the star that made it, and yet there is ' +
      'far more of it in the universe than anyone can account for.',
    'In a few hundred thousand years this star will explode. The Crab ' +
      'Nebula is what the next slide looks like.',
  ],
}