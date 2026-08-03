import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useMemo, useState } from 'react'
import Effects from './Effects'
import { createSkybox, bakeSkybox } from './skybox'
import { createRenderer, backendName } from './renderer'
import { createClusterField } from './clusterShader'

// Cluster lab (?cluster=1, dev only — CB-04): the Coma field exactly as
// the sixth rung will mount it (skybox + bloom + the thousand-galaxy
// sprite). ?zspace=1 boots in redshift space for the morph proof;
// ?freeze for deterministic frames.
const params = new URLSearchParams(window.location.search)
const FROZEN = params.has('freeze')
const ZSPACE = Number(params.get('zspace')) || 0

export default function ClusterLab() {
  const [gl, setGl] = useState(null)
  const skybox = useMemo(() => createSkybox({ frozen: FROZEN }), [])
  const field = useMemo(() => {
    const f = createClusterField()
    f.zSpace.value = ZSPACE
    return f
  }, [])
  useEffect(
    () => () => {
      skybox.material.dispose()
      skybox.geometry.dispose()
      field.sprite.material.dispose()
    },
    [skybox, field],
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
        camera={{ position: [0, 3.5, 11], fov: 50 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#02030a']} />
        <primitive object={skybox} />
        <primitive object={field.sprite} />
        <OrbitControls enablePan={false} minDistance={4} maxDistance={30} rotateSpeed={0.5} />
        <Effects />
      </Canvas>

      {!gl && <div className="boot">initializing renderer…</div>}
      {gl && <div className="backend-badge">{backendName(gl)}</div>}

      <div className="hud">
        <div className="kicker">
          cluster lab · CB section A · zspace {ZSPACE}
        </div>
        <h1>The Coma Cluster</h1>
        <div className="cls">1000 galaxies · one draw · both backends</div>
        <div className="hint">drag to orbit · scroll to zoom</div>
      </div>
    </div>
  )
}
