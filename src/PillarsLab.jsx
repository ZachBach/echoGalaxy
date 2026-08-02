import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useMemo, useState } from 'react'
import Effects from './Effects'
import { createSkybox, bakeSkybox } from './skybox'
import { createRenderer, backendName } from './renderer'
import Pillars from './Pillars'

// Pillars lab (?pillars=1, dev only — PC-04/05/B): the full scene
// exactly as the nebula rung will mount it (skybox + bloom + volume +
// cluster). The field bakes to the z-slice atlas at mount (PC-05
// verdict); ?steps= drives march steps, ?oct= the bake octaves,
// ?freeze for deterministic frames.
const params = new URLSearchParams(window.location.search)
const FROZEN = params.has('freeze')
const STEPS = Number(params.get('steps')) || 20
const OCTAVES = Number(params.get('oct')) || 3

export default function PillarsLab() {
  const [gl, setGl] = useState(null)
  const skybox = useMemo(() => createSkybox({ frozen: FROZEN }), [])
  useEffect(
    () => () => {
      skybox.material.dispose()
      skybox.geometry.dispose()
    },
    [skybox],
  )

  return (
    <div className="app">
      <Canvas
        gl={createRenderer}
        onCreated={(state) => {
          setGl(state.gl)
          window.__r3f = state
          bakeSkybox(skybox, state.gl, { frozen: FROZEN })
        }}
        camera={{ position: [0, 0.1, 4.4], fov: 50 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#02030a']} />
        <primitive object={skybox} />
        <Pillars frozen={FROZEN} steps={STEPS} octaves={OCTAVES} />
        <OrbitControls enablePan={false} minDistance={2.5} maxDistance={10} rotateSpeed={0.5} />
        <Effects />
      </Canvas>

      {!gl && <div className="boot">initializing renderer…</div>}
      {gl && <div className="backend-badge">{backendName(gl)}</div>}

      <div className="hud">
        <div className="kicker">
          pillars lab · PC section A · steps {STEPS} · octaves {OCTAVES}
        </div>
        <h1>Pillars of Creation</h1>
        <div className="cls">raymarch proof · both backends</div>
        <div className="hint">drag to orbit · scroll to zoom</div>
      </div>
    </div>
  )
}
