import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  makeGalaxyUniforms,
  applyGalaxyCfg,
  buildGalaxyMaterial,
  makeNebulaUniforms,
  applyNebulaCfg,
  buildNebulaMaterial,
  familyOf,
} from './galaxyShader'

// Dev flag ?freeze stops all animation so renders are deterministic —
// needed for pixel-level parity checks between backends.
const FROZEN =
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).has('freeze')

// G2: one persistent sprite for the app's lifetime. Every per-star value
// derives in-shader from instanceIndex (galaxyShader.js) — there are no
// per-star attributes and no CPU generation. Type changes inside the disc
// family (spiral ↔ barred) are pure uniform swaps; crossing families
// swaps to a cached material. Geometry never rebuilds; count is the only
// per-type CPU-side quantity.
function createGalaxyRig() {
  const uniforms = makeGalaxyUniforms()
  const nebUniforms = makeNebulaUniforms()
  const materials = {}
  const sprite = new THREE.Sprite()
  sprite.frustumCulled = false
  const nebulaMaterial = buildNebulaMaterial(nebUniforms, { frozen: FROZEN })
  // Unit circle scaled to the veil radius per type — fragments only exist
  // where the veil can be nonzero.
  const nebula = new THREE.Mesh(new THREE.CircleGeometry(1, 64), nebulaMaterial)
  nebula.rotation.x = -Math.PI / 2
  nebula.renderOrder = -1

  return {
    sprite,
    nebula,
    setType(cfg) {
      applyGalaxyCfg(uniforms, cfg)
      const veilRadius = applyNebulaCfg(nebUniforms, cfg)
      nebula.scale.setScalar(veilRadius)
      const family = familyOf(cfg.type)
      materials[family] ??= buildGalaxyMaterial(family, uniforms, { frozen: FROZEN })
      if (sprite.material !== materials[family]) sprite.material = materials[family]
      sprite.count = cfg.count ?? 20000
    },
    dispose() {
      for (const m of Object.values(materials)) m.dispose()
      nebulaMaterial.dispose()
      nebula.geometry.dispose()
    },
  }
}

export default function Galaxy({ type }) {
  const ref = useRef()
  const rig = useMemo(createGalaxyRig, [])

  useEffect(() => rig.setType(type.cfg), [rig, type])
  useEffect(() => () => rig.dispose(), [rig])

  // Slow differential-ish spin — the whole disk turns.
  useFrame((_, dt) => {
    if (ref.current && !FROZEN) ref.current.rotation.y += dt * 0.05
  })

  // Nebula first (renderOrder -1, additive) — the stars draw over their
  // own interstellar medium; the whole group tilts and spins together.
  return (
    <group ref={ref} rotation={[0.32, 0, 0]}>
      <primitive object={rig.nebula} />
      <primitive object={rig.sprite} />
    </group>
  )
}
