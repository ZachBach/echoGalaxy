import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useMemo, useState } from 'react'
import System, { SYSTEM_INFO } from './System'
import Effects from './Effects'
import { createSkybox, bakeSkybox } from './skybox'
import { createRenderer, backendName } from './renderer'

// System-rung smoke (?system=1, dev only — G3-16/19): the full rung as it
// will mount in the scale ladder (skybox + bloom + system), verified
// before section E wires it in. ?freeze for deterministic frames.
const params = new URLSearchParams(window.location.search)
const FROZEN = params.has('freeze')

export default function SystemLab() {
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
        camera={{ position: [0, 4.5, 11], fov: 50 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#02030a']} />
        <primitive object={skybox} />
        <System frozen={FROZEN} />
        <OrbitControls enablePan={false} minDistance={3} maxDistance={24} rotateSpeed={0.5} />
        <Effects />
      </Canvas>

      {!gl && <div className="boot">initializing renderer…</div>}
      {gl && <div className="backend-badge">{backendName(gl)}</div>}

      <div className="hud">
        <div className="kicker">system lab · G3 section C</div>
        <h1>{SYSTEM_INFO.name}</h1>
        <div className="cls">{SYSTEM_INFO.label}</div>
        <p>{SYSTEM_INFO.description}</p>
        <ul>
          {SYSTEM_INFO.facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        <div className="hint">drag to orbit · scroll to zoom</div>
      </div>
    </div>
  )
}
