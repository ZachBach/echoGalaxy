import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { QuadMesh } from 'three/webgpu'
import {
  buildNebulaBakeMaterial,
  makeGalaxyUniforms,
  applyGalaxyCfg,
  buildGalaxyMaterial,
  buildGalaxyMorphBake,
  makeNebulaUniforms,
  applyNebulaCfg,
  buildNebulaMaterial,
  familyOf,
} from './galaxyShader'

const MORPH_SECONDS = 1.1

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

  // G3-08 + morph: positions bake to TWO storage buffers via compute,
  // ping-ponged per type switch so the material can glide between the
  // previous and next galaxy (positions, rN, and temperatures all ride
  // one progress uniform). WebGL2 keeps the live-math instant swap —
  // its path would need every family's position graph resident at once.
  const morph = buildGalaxyMorphBake(uniforms)
  let bakedMaterial = null
  let bakeWorks = null // unknown until the first renderer-armed setType
  let bakedOnce = false
  let side = 1 // last-written buffer (0 = A, 1 = B)
  let morphing = false
  let pendingCount = null
  let veilTarget = null

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
      const prevCore = uniforms.tempCore.value
      const prevRim = uniforms.tempRim.value
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
          const target = bakedOnce ? 1 - side : side
          renderer.compute(morph.computes[target][family])
          bakedMaterial ??= buildGalaxyMaterial('baked', uniforms, {
            frozen: FROZEN,
            morph,
          })
          if (sprite.material !== bakedMaterial) sprite.material = bakedMaterial

          if (!bakedOnce || FROZEN) {
            // first fill, or deterministic mode: land instantly
            morph.sideFrom.value = target
            morph.sideTo.value = target
            morph.p.value = 1
            sprite.count = cfg.count ?? 20000
            morphing = false
          } else {
            // glide: previous shape is wherever the mix currently sits
            morph.sideFrom.value =
              morph.sideFrom.value +
              (morph.sideTo.value - morph.sideFrom.value) * morph.p.value
            morph.sideTo.value = target
            morph.prevTempCore.value = prevCore
            morph.prevTempRim.value = prevRim
            morph.p.value = 0
            pendingCount = cfg.count ?? 20000
            sprite.count = Math.max(sprite.count || 0, pendingCount)
            // veil fades in with the morph instead of popping
            veilTarget = nebUniforms.strength.value
            nebUniforms.strength.value = 0
            morphing = true
          }
          side = target
          bakedOnce = true
          bakeWorks = true
        } catch (err) {
          console.warn('galaxy position bake unavailable — live path:', err.message)
          bakeWorks = false
        }
      }
      if (bakeWorks === false || !renderer) {
        materials[family] ??= buildGalaxyMaterial(family, uniforms, { frozen: FROZEN })
        if (sprite.material !== materials[family]) sprite.material = materials[family]
        sprite.count = cfg.count ?? 20000
      }
    },
    // Advances the morph; called from the component's frame loop.
    tick(dt) {
      if (!morphing) return
      morph.p.value = Math.min(1, morph.p.value + dt / MORPH_SECONDS)
      if (veilTarget != null) nebUniforms.strength.value = veilTarget * morph.p.value
      if (morph.p.value >= 1) {
        morphing = false
        if (pendingCount != null) sprite.count = pendingCount
        if (veilTarget != null) nebUniforms.strength.value = veilTarget
        pendingCount = null
        veilTarget = null
      }
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

  // Slow differential-ish spin — the whole disk turns — plus the morph
  // progress when a type glide is in flight.
  useFrame((_, dt) => {
    if (ref.current && !FROZEN) ref.current.rotation.y += dt * 0.05
    rig.tick(dt)
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
