import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PointsNodeMaterial } from 'three/webgpu'
import { instancedBufferAttribute, texture, vec4 } from 'three/tsl'
import { generateGalaxy } from './galaxyData'

// Dev flag ?freeze stops the spin so renders are deterministic — needed
// for pixel-level parity checks between backends.
const FROZEN =
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).has('freeze')

// Soft round star sprite, generated once on the client.
function useStarTexture() {
  return useMemo(() => {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0.0, 'rgba(255,255,255,1)')
    g.addColorStop(0.2, 'rgba(255,255,255,0.85)')
    g.addColorStop(0.5, 'rgba(255,255,255,0.25)')
    g.addColorStop(1.0, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
}

// WebGPU can't size point primitives (always 1px), so the node pipeline
// renders sized/textured "points" as instanced sprites instead:
// Sprite + PointsNodeMaterial with per-instance position/color attributes.
// This is also the base G2 builds on (per-star TSL color, twinkle, discs).
export default function Galaxy({ type }) {
  const ref = useRef()
  const star = useStarTexture()

  const sprite = useMemo(() => {
    const { positions, colors } = generateGalaxy(type.cfg)
    const posAttr = new THREE.InstancedBufferAttribute(positions, 3)
    const colAttr = new THREE.InstancedBufferAttribute(colors, 3)

    const mat = new PointsNodeMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      size: 0.09,
    })
    mat.positionNode = instancedBufferAttribute(posAttr)
    const tex = texture(star)
    mat.colorNode = vec4(tex.rgb.mul(instancedBufferAttribute(colAttr)), tex.a)

    const s = new THREE.Sprite(mat)
    s.count = positions.length / 3
    s.frustumCulled = false
    return s
  }, [type, star])

  useEffect(() => () => sprite.material.dispose(), [sprite])

  // Slow differential-ish spin — the whole disk turns.
  useFrame((_, dt) => {
    if (ref.current && !FROZEN) ref.current.rotation.y += dt * 0.05
  })

  return <primitive ref={ref} object={sprite} rotation={[0.32, 0, 0]} />
}
