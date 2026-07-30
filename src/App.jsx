import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useState } from 'react'
import Galaxy from './Galaxy'
import Planet from './Planet'
import Star from './Star'
import Effects from './Effects'
import { GALAXY_TYPES } from './galaxyData'
import { PLANET_TYPES } from './planetData'
import { createRenderer, backendName } from './renderer'

const params = new URLSearchParams(window.location.search)
const FROZEN = import.meta.env.DEV && params.has('freeze')

// Per-view camera + controls framing (G1-34). Galaxy numbers are the
// v0.1 originals; planets sit closer with a tighter zoom range.
const VIEWS = {
  galaxies: { position: [0, 6, 12], min: 4, max: 28 },
  planets: { position: [0, 0.8, 5.6], min: 2.6, max: 12 },
}

// Repositions the camera when the view changes — the Canvas camera prop
// is initial-only.
function ViewRig({ view }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  useEffect(() => {
    camera.position.set(...VIEWS[view].position)
    camera.lookAt(0, 0, 0)
    controls?.update?.()
  }, [view, camera, controls])
  return null
}

export default function App() {
  const [view, setView] = useState(
    params.get('view') === 'planets' ? 'planets' : 'galaxies',
  )
  const [galaxyIndex, setGalaxyIndex] = useState(0)
  const [planetIndex, setPlanetIndex] = useState(0)
  // The renderer, captured once init() has resolved — backend identity is
  // only final after that, so all backend reads go through this state.
  const [gl, setGl] = useState(null)

  const planets = view === 'planets'
  const list = planets ? PLANET_TYPES : GALAXY_TYPES
  const index = planets ? planetIndex : galaxyIndex
  const setIndex = planets ? setPlanetIndex : setGalaxyIndex
  const type = list[index]

  const go = (delta) =>
    setIndex((i) => (i + delta + list.length) % list.length)

  const switchView = (v) => {
    setView(v)
    const url = new URL(window.location)
    if (v === 'planets') url.searchParams.set('view', 'planets')
    else url.searchParams.delete('view')
    window.history.replaceState(null, '', url)
  }

  return (
    <div className="app">
      <Canvas
        gl={createRenderer}
        onCreated={(state) => {
          setGl(state.gl)
          if (import.meta.env.DEV) window.__r3f = state
        }}
        camera={{ position: VIEWS.galaxies.position, fov: 55 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#02030a']} />
        <ViewRig view={view} />
        {planets ? (
          type.star ? (
            <Star frozen={FROZEN} />
          ) : (
            <Planet
              key={type.id}
              recipe={type.recipe}
              spinRate={type.spinRate}
              atmosphere={type.atmosphere}
              frozen={FROZEN}
            />
          )
        ) : (
          <Galaxy type={type} />
        )}
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={VIEWS[view].min}
          maxDistance={VIEWS[view].max}
          rotateSpeed={0.5}
        />
        <Effects />
      </Canvas>

      {!gl && <div className="boot">initializing renderer…</div>}

      {import.meta.env.DEV && gl && (
        <div className="backend-badge">{backendName(gl)}</div>
      )}

      <div className="hud">
        <div className="views">
          <button
            className={planets ? '' : 'active'}
            onClick={() => switchView('galaxies')}
          >
            Galaxies
          </button>
          <button
            className={planets ? 'active' : ''}
            onClick={() => switchView('planets')}
          >
            Planets
          </button>
        </div>
        <div className="kicker">echoGalaxy · a free tool for exploring the universe</div>
        <h1>{type.name}</h1>
        <div className="cls">{planets ? type.label : type.hubble}</div>
        <p>{type.description}</p>
        <ul>
          {type.facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        <div className="nav">
          <button onClick={() => go(-1)}>‹ Prev</button>
          <span>
            {index + 1} / {list.length}
          </span>
          <button onClick={() => go(1)}>Next ›</button>
        </div>
        <div className="hint">drag to orbit · scroll to zoom</div>
      </div>
    </div>
  )
}
