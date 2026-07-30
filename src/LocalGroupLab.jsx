import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useMemo, useState } from 'react'
import LocalGroup, { GROUP_INFO } from './LocalGroup'
import Effects from './Effects'
import { createSkybox, bakeSkybox } from './skybox'
import { createRenderer, backendName } from './renderer'

// Group-rung smoke (?group=1, dev only — G3-25/26): the full rung as the
// scale ladder will mount it. ?freeze for deterministic frames.
const params = new URLSearchParams(window.location.search)
const FROZEN = params.has('freeze')

export default function LocalGroupLab() {
  const [gl, setGl] = useState(null)
  const skybox = useMemo(() => createSkybox({ frozen: FROZEN, radius: 140 }), [])
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
        camera={{ position: [0, 16, 40], fov: 50 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#02030a']} />
        <primitive object={skybox} />
        <LocalGroup frozen={FROZEN} />
        <OrbitControls enablePan={false} minDistance={12} maxDistance={90} rotateSpeed={0.5} />
        <Effects />
      </Canvas>

      {!gl && <div className="boot">initializing renderer…</div>}
      {gl && <div className="backend-badge">{backendName(gl)}</div>}

      <div className="hud">
        <div className="kicker">local group lab · G3 section D</div>
        <h1>{GROUP_INFO.name}</h1>
        <div className="cls">{GROUP_INFO.label}</div>
        <p>{GROUP_INFO.description}</p>
        <ul>
          {GROUP_INFO.facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        <div className="hint">drag to orbit · scroll to zoom</div>
      </div>
    </div>
  )
}
