import { useEffect, useMemo } from 'react'
import { buildAuroraMaterial } from './spaceWeather'

// <Aurora> (SW) — the auroral oval, as a thin additive shell just above the
// atmosphere. Mount as a sibling of <Planet> inside the body's group.
//
// It sits at 1.055× the body radius by default, outside the 1.03 atmosphere
// shell, because the aurora really is above the weather: the oval lights up
// between roughly 100 and 400 km, which is thermosphere, well above every
// cloud on Earth.
//
// Only bodies with a magnetosphere get one — see MAGNETOSPHERES in
// spaceWeather.js. That is not an optimisation, it is the lesson.
export default function Aurora({
  radius = 1,
  scale = 1.055,
  storm = 0.35,
  magPoleTilt = 0.192,
  spinRate = 0.15,
  strength = 1,
  frozen = false,
}) {
  const material = useMemo(
    () => buildAuroraMaterial({ storm, magPoleTilt, spinRate, strength, frozen }),
    [storm, magPoleTilt, spinRate, strength, frozen],
  )
  useEffect(() => () => material.dispose(), [material])

  return (
    <mesh material={material} renderOrder={2}>
      <sphereGeometry args={[radius * scale, 96, 96]} />
    </mesh>
  )
}
