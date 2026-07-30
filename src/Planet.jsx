import { useEffect, useMemo } from 'react'
import { buildPlanetMaterial, buildAtmosphereMaterial } from './planetMaterial'
import { sunDir } from './sun'

// <Planet> — a lit body driven by a tsl-lib recipe (G1-01 design; see
// planetMaterial.js for the graph contract). The library does its own
// lighting via terminator — no scene lights. The mesh never rotates:
// spin lives in the material's sampling direction.
//
// atmosphere: false | { scale=1.03, ...atmosphereShell opts } — an
// additive fresnel shell over the body, brightest on the day side.
export default function Planet({
  recipe,
  cfg = {},
  radius = 1.7,
  spinRate = 0.04,
  atmosphere = false,
  sun = sunDir,
  frozen = false,
}) {
  const material = useMemo(
    () => buildPlanetMaterial({ recipe, cfg, spinRate, sun, frozen }),
    [recipe, cfg, spinRate, sun, frozen],
  )
  useEffect(() => () => material.dispose(), [material])

  const { scale = 1.03, ...atmoOpts } = atmosphere || {}
  const atmoMaterial = useMemo(
    () => (atmosphere ? buildAtmosphereMaterial({ sun, ...atmoOpts }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [atmosphere, sun],
  )
  useEffect(() => () => atmoMaterial?.dispose(), [atmoMaterial])

  return (
    <group>
      <mesh material={material}>
        <sphereGeometry args={[radius, 96, 96]} />
      </mesh>
      {atmoMaterial && (
        <mesh material={atmoMaterial} renderOrder={1}>
          <sphereGeometry args={[radius * scale, 96, 96]} />
        </mesh>
      )}
    </group>
  )
}
