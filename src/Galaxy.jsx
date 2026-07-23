import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { generateGalaxy } from './galaxyData'

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

export default function Galaxy({ type }) {
  const ref = useRef()
  const star = useStarTexture()
  const { positions, colors } = useMemo(
    () => generateGalaxy(type.cfg),
    [type],
  )

  // Slow differential-ish spin — the whole disk turns.
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.05
  })

  // key={type.id} remounts the geometry when the galaxy class changes.
  return (
    <points ref={ref} key={type.id} rotation={[0.32, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        sizeAttenuation
        map={star}
        alphaMap={star}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
      />
    </points>
  )
}
