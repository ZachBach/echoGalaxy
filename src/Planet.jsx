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
//
// G1-08 material hygiene: the material memo below is keyed per type —
// `recipe` is the type identity (PLANET_RECIPES entries are module-level
// functions), and every other dep must be referentially stable or the
// node graph recompiles on each render. That is why the cfg default is
// this hoisted constant and not an inline `= {}`: an object literal in a
// parameter default is freshly allocated every render, so Object.is sees
// a new dep each time and the memo never holds. Callers passing cfg or
// atmosphere must pass stable references (module constants or useMemo)
// for the same reason — no caller currently passes cfg at all.
const EMPTY_CFG = Object.freeze({})

export default function Planet({
  recipe,
  cfg = EMPTY_CFG,
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
