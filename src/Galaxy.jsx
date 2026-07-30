import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { QuadMesh } from 'three/webgpu'
import {
  buildNebulaBakeMaterial,
  makeGalaxyUniforms,
  applyGalaxyCfg,
  buildGalaxyMaterial,
  buildGalaxyBake,
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

  // G3-08: positions bake to a storage buffer via compute, dispatched per
  // type switch — one baked material serves every family. If compute
  // fails on a backend, fall back to the live-math per-frame materials.
  const bake = buildGalaxyBake(uniforms)
  let bakedMaterial = null
  let bakeWorks = null // unknown until the first renderer-armed setType

  // G3-10: veil field baked to a small texture per type switch (RT
  // re-render — no ping-pong involved, works on both backends).
  const nebulaRT = new THREE.RenderTarget(512, 512, {
    depthBuffer: false,
    type: THREE.HalfFloatType,
  })
  const nebulaBakeQuad = new QuadMesh(buildNebulaBakeMaterial(nebUniforms))
  let nebulaBakedMaterial = null
  let veilBakeWorks = null

  return {
    sprite,
    nebula,
    setType(cfg, renderer) {
      applyGalaxyCfg(uniforms, cfg)
      const veilRadius = applyNebulaCfg(nebUniforms, cfg)
      nebula.scale.setScalar(veilRadius)
      const family = familyOf(cfg.type)

      if (veilBakeWorks !== false && renderer) {
        try {
          const prev = renderer.getRenderTarget()
          renderer.setRenderTarget(nebulaRT)
          nebulaBakeQuad.render(renderer)
          renderer.setRenderTarget(prev)
          nebulaBakedMaterial ??= buildNebulaMaterial(nebUniforms, {
            frozen: FROZEN,
            veilTexture: nebulaRT.texture,
          })
          if (nebula.material !== nebulaBakedMaterial) nebula.material = nebulaBakedMaterial
          veilBakeWorks = true
        } catch (err) {
          console.warn('veil bake unavailable — live path:', err.message)
          veilBakeWorks = false
          nebula.material = nebulaMaterial
        }
      }

      // WebGPU only: on the WebGL2 backend, re-dispatching a storage
      // compute leaves alternate dispatches invisible (stale buffer —
      // ping-pong suspect; observation recorded for the G3-38 ledger
      // sweep). WebGL2 keeps the live-math path per the G3-07 design.
      if (bakeWorks === null && renderer) {
        bakeWorks = !!renderer.backend?.isWebGPUBackend
      }
      if (bakeWorks !== false && renderer) {
        try {
          renderer.compute(bake.computes[family])
          bakedMaterial ??= buildGalaxyMaterial('baked', uniforms, {
            frozen: FROZEN,
            bakedBuffer: bake.buffer,
          })
          if (sprite.material !== bakedMaterial) sprite.material = bakedMaterial
          bakeWorks = true
        } catch (err) {
          console.warn('galaxy position bake unavailable — live path:', err.message)
          bakeWorks = false
        }
      }
      if (bakeWorks === false || !renderer) {
        materials[family] ??= buildGalaxyMaterial(family, uniforms, { frozen: FROZEN })
        if (sprite.material !== materials[family]) sprite.material = materials[family]
      }
      sprite.count = cfg.count ?? 20000
    },
    dispose() {
      for (const m of Object.values(materials)) m.dispose()
      bakedMaterial?.dispose()
      nebulaMaterial.dispose()
      nebulaBakedMaterial?.dispose()
      nebulaRT.dispose()
      nebula.geometry.dispose()
    },
  }
}

export default function Galaxy({ type }) {
  const ref = useRef()
  const gl = useThree((s) => s.gl)
  const rig = useMemo(createGalaxyRig, [])

  useEffect(() => rig.setType(type.cfg, gl), [rig, type, gl])
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
