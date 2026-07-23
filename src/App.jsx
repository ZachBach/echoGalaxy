import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useState } from 'react'
import Galaxy from './Galaxy'
import { GALAXY_TYPES } from './galaxyData'

export default function App() {
  const [index, setIndex] = useState(0)
  const type = GALAXY_TYPES[index]

  const go = (delta) =>
    setIndex((i) => (i + delta + GALAXY_TYPES.length) % GALAXY_TYPES.length)

  return (
    <div className="app">
      <Canvas camera={{ position: [0, 6, 12], fov: 55 }} dpr={[1, 2]}>
        <color attach="background" args={['#02030a']} />
        <Galaxy type={type} />
        <OrbitControls
          enablePan={false}
          minDistance={4}
          maxDistance={28}
          rotateSpeed={0.5}
        />
        <EffectComposer>
          <Bloom
            intensity={1.15}
            luminanceThreshold={0.04}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      <div className="hud">
        <div className="kicker">echoGalaxy · a free tool for exploring the universe</div>
        <h1>{type.name}</h1>
        <div className="cls">{type.hubble}</div>
        <p>{type.description}</p>
        <ul>
          {type.facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        <div className="nav">
          <button onClick={() => go(-1)}>‹ Prev</button>
          <span>
            {index + 1} / {GALAXY_TYPES.length}
          </span>
          <button onClick={() => go(1)}>Next ›</button>
        </div>
        <div className="hint">drag to orbit · scroll to zoom</div>
      </div>
    </div>
  )
}
