import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useMemo, useState } from 'react'
import * as TSL from 'three/tsl'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { GALLERY } from './tsl-lib/gallery'
import { createRenderer, backendName } from './renderer'

// Version-portability smoke (?lab=1, dev only): cycle every tsl-lib gallery
// entry on a sphere — the library's curated visualizers, verified upstream
// on r178, here compiled and rendered by this repo's three (r184) on both
// backends. Sphere, not quad, per the upstream parity guidance for the
// fresnel family (curvature-dependent nodes need silhouettes).
function LabSphere({ entry }) {
  const mat = useMemo(() => {
    const m = new MeshBasicNodeMaterial()
    entry.apply(TSL, m, { clock: TSL.time })
    return m
  }, [entry])
  useEffect(() => () => mat.dispose(), [mat])
  return (
    <mesh material={mat}>
      <sphereGeometry args={[1.7, 96, 96]} />
    </mesh>
  )
}

export default function Lab() {
  const [i, setI] = useState(0)
  const [gl, setGl] = useState(null)
  const entry = GALLERY[i]
  const go = (d) => setI((v) => (v + d + GALLERY.length) % GALLERY.length)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app">
      <Canvas
        gl={createRenderer}
        onCreated={(state) => {
          setGl(state.gl)
          window.__r3f = state
        }}
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#05060d']} />
        <LabSphere entry={entry} />
        <OrbitControls enablePan={false} minDistance={2.5} maxDistance={10} />
      </Canvas>

      {!gl && <div className="boot">initializing renderer…</div>}
      {gl && <div className="backend-badge">{backendName(gl)}</div>}

      <div className="hud">
        <div className="kicker">tsl-lib lab · version-portability smoke · r184</div>
        <h1>{entry.name}</h1>
        <div className="cls">
          {entry.family} · {entry.id} · {i + 1} / {GALLERY.length}
        </div>
        <div className="nav">
          <button onClick={() => go(-1)}>‹ Prev</button>
          <span>← / → keys</span>
          <button onClick={() => go(1)}>Next ›</button>
        </div>
        <div className="hint">drag to orbit · scroll to zoom</div>
      </div>
    </div>
  )
}
