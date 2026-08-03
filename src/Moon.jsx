import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import Planet from './Planet'

// <Moon> (MN-02) — an orbiting, tidally-locked <Planet>. Mount inside
// the parent body's group: the orbit nests, and every parent behavior
// (God's Hands flings, swallow-and-respawn) is inherited, not built.
//
// The lock is exact by construction (MN-01 derivation): the sampling
// spin composes with the orbit as spinY((−1,0,0), a(t) − θ(t)), so
// spinRate = +2π/period keeps a(t) − θ(t) constant — the same
// hemisphere faces home forever. `phase` picks which one.

export const moonPeriod = (r, Km = 14) => Km * Math.pow(r, 1.5)

export default function Moon({
  orbitR,
  size,
  period,
  phase = 0,
  recipe,
  atmosphere = false,
  sun,
  frozen = false,
}) {
  const ref = useRef()

  const place = (t) => {
    const th = phase * Math.PI * 2 + (t * Math.PI * 2) / period
    ref.current?.position.set(Math.cos(th) * orbitR, 0, Math.sin(th) * orbitR)
  }

  useEffect(() => place(0), []) // eslint-disable-line react-hooks/exhaustive-deps
  useFrame(({ clock }) => {
    if (!frozen) place(clock.elapsedTime)
  })

  return (
    <group ref={ref}>
      <Planet
        recipe={recipe}
        radius={size}
        atmosphere={atmosphere}
        sun={sun}
        spinRate={(2 * Math.PI) / period}
        frozen={frozen}
      />
    </group>
  )
}
