import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useMemo, useState } from 'react'
import Effects from './Effects'
import { createSkybox, bakeSkybox } from './skybox'
import { createRenderer, backendName } from './renderer'
import WolfRayet, { WR_INFO } from './WolfRayet'

// Wolf-Rayet lab (?wr=1, dev only): Sh 2-80 exactly as the nebula rung
// mounts it. ?freeze for deterministic frames; ?steps= for the march
// budget. Orbit around to the wake side — the shape is the point.
const params = new URLSearchParams(window.location.search)
const FROZEN = params.has('freeze')
const STEPS = Number(params.get('steps')) || 20

export default function WolfRayetLab() {
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
        camera={{ position: [0, 0.2, 4.4], fov: 50 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#02030a']} />
        <primitive object={skybox} />
        <WolfRayet frozen={FROZEN} steps={STEPS} />
        <OrbitControls enablePan={false} minDistance={2.6} maxDistance={10} rotateSpeed={0.5} />
        <Effects />
      </Canvas>

      {!gl && <div className="boot">initializing renderer…</div>}
      {gl && <div className="backend-badge">{backendName(gl)}</div>}

      <div className="hud">
        <div className="kicker">wolf-rayet lab · steps {STEPS}</div>
        <h1>{WR_INFO.name}</h1>
        <div className="cls">{WR_INFO.label}</div>
        <div className="hint">drag to orbit · scroll to zoom</div>
      </div>
    </div>
  )
}