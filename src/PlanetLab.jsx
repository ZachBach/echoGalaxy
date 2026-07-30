import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useState } from 'react'
import Planet from './Planet'
import Star from './Star'
import { PLANET_RECIPES, ATMOSPHERES } from './planetRecipes'
import { createRenderer, backendName } from './renderer'
import { setSunDir } from './sun'

// Planet lab (?planet=1, dev only): cycles the section-B recipes on the
// <Planet> core — the G1-17/18 verification vehicle, superseded by the
// real planets view in G1-32. Harness flags:
//   ?type=rocky|lava|ice|gas — pin a type (default: cycler, ←/→ keys)
//   ?atmo=0      — drop the atmosphere shell
//   ?spin=0.3    — spinRate override
//   ?freeze      — deterministic frame (clock = 0)
//   ?flat=1      — uniform surface (lighting-only control)
//   ?sun=x,y,z   — sun direction override
const params = new URLSearchParams(window.location.search)
const FROZEN = params.has('freeze')
const SPIN = params.has('spin') ? parseFloat(params.get('spin')) : 0.04
const ATMO = params.get('atmo') !== '0'
const FLAT = params.get('flat') === '1'
const PINNED = params.get('type')
if (params.has('sun')) {
  const [x, y, z] = params.get('sun').split(',').map(parseFloat)
  setSunDir(x, y, z)
}

const TYPES = [...Object.keys(PLANET_RECIPES), 'star'] // rocky, lava, ice, gas, star

// Uniform surface — with the pattern gone, any frame-to-frame change is
// lighting movement (the G1-04 control).
function debugFlat(TSL) {
  return { surface: TSL.vec3(0.35, 0.38, 0.3) }
}

export default function PlanetLab() {
  const [gl, setGl] = useState(null)
  const [i, setI] = useState(Math.max(0, TYPES.indexOf(PINNED)))
  const type = TYPES[i]
  const go = (d) => setI((v) => (v + d + TYPES.length) % TYPES.length)

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
        camera={{ position: [0, 0, 5.2], fov: 50 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#04050c']} />
        {type === 'star' && !FLAT ? (
          <Star frozen={FROZEN} />
        ) : (
          <Planet
            key={FLAT ? 'flat' : type}
            recipe={FLAT ? debugFlat : PLANET_RECIPES[type]}
            spinRate={SPIN}
            frozen={FROZEN}
            atmosphere={ATMO ? ATMOSPHERES[type] : false}
          />
        )}
        <OrbitControls enablePan={false} minDistance={2.6} maxDistance={12} />
      </Canvas>

      {!gl && <div className="boot">initializing renderer…</div>}
      {gl && <div className="backend-badge">{backendName(gl)}</div>}

      <div className="hud">
        <div className="kicker">planet lab · G1 section B</div>
        <h1>{type}</h1>
        <div className="cls">
          {i + 1} / {TYPES.length} · atmosphere {ATMO ? 'on' : 'off'}
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
