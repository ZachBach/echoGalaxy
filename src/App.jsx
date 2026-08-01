import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import Galaxy from './Galaxy'
import Planet from './Planet'
import Star from './Star'
import System, { SYSTEM_INFO } from './System'
import LocalGroup, { GROUP_INFO } from './LocalGroup'
import Effects from './Effects'
import { createSkybox, bakeSkybox } from './skybox'
import { GALAXY_TYPES } from './galaxyData'
import { PLANET_TYPES } from './planetData'
import { createRenderer, backendName } from './renderer'
import CaptureRig from './capture/CaptureRig'
import { shotById, ASPECTS } from './capture/shots'

const params = new URLSearchParams(window.location.search)
const FROZEN = import.meta.env.DEV && params.has('freeze')

// Capture mode: ?capture=<shotId>&aspect=4x5&fps=60
// Dev only. Pins the rung and object index, hands the camera to the rig,
// and steps the frame loop by hand.
const CAPTURE = import.meta.env.DEV ? shotById(params.get('capture')) : null
const CAPTURE_FPS = Number(params.get('fps')) || 60
const CAPTURE_SIZE = ASPECTS[params.get('aspect') ?? '4x5'] ?? ASPECTS['4x5']

// Capture determinism: three's core Timer captures performance.now() at
// renderer creation (`_startTime`) and reads it on every node-frame
// update — TSL.time therefore runs on wall clock no matter what the R3F
// clock does. Patch it at MODULE scope, before the renderer or any bake
// exists, so the veil/sky bakes and every animated material live on one
// fixed timeline that CaptureRig advances frame by frame. (Found by
// capturing the same shot twice and diffing hashes — the twinkle and the
// veil bake drifted on wall time.)
if (CAPTURE) {
  window.__captureClock = { t: 0 }
  performance.now = () => window.__captureClock.t
}

// The scale journey (G3-28): four rungs, one state machine. Each rung
// carries its scene, camera framing, controls range, skybox radius, and
// its slot in the facts ladder.
const SCALES = [
  { id: 'planet', label: 'Planet', camera: [0, 0.8, 5.6], min: 2.6, max: 12, sky: 60 },
  { id: 'system', label: 'System', camera: [0, 4.5, 11], min: 3, max: 24, sky: 60 },
  { id: 'galaxy', label: 'Galaxy', camera: [0, 6, 12], min: 4, max: 28, sky: 60 },
  { id: 'group', label: 'Local Group', camera: [0, 16, 40], min: 12, max: 90, sky: 140 },
]

function initialScale() {
  if (CAPTURE) {
    const c = SCALES.findIndex((s) => s.id === CAPTURE.scale)
    if (c !== -1) return c
  }
  const i = SCALES.findIndex((s) => s.id === params.get('scale'))
  if (i !== -1) return i
  if (params.get('view') === 'planets') return 0 // legacy links keep working
  return 2 // galaxy — the app's historical home
}

// Repositions the camera when the rung changes (Canvas camera is
// initial-only).
function ViewRig({ scale }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  useEffect(() => {
    camera.position.set(...SCALES[scale].camera)
    camera.lookAt(0, 0, 0)
    controls?.update?.()
  }, [scale, camera, controls])
  return null
}

// G3-30: zoom-through — scrolling out while parked at the controls'
// outer stop climbs a rung; scrolling in at the inner stop descends.
// Debounced so one wheel gesture moves one rung.
function ZoomThrough({ scale, onShift }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const gl = useThree((s) => s.gl)
  const lastShift = useRef(0)
  useEffect(() => {
    const el = gl.domElement
    const onWheel = (e) => {
      if (!controls) return
      const now = performance.now()
      if (now - lastShift.current < 700) return
      const d = camera.position.distanceTo(controls.target)
      const { min, max } = SCALES[scale]
      if (e.deltaY > 0 && d >= max - 0.05 && scale < SCALES.length - 1) {
        lastShift.current = now
        onShift(scale + 1)
      } else if (e.deltaY < 0 && d <= min + 0.05 && scale > 0) {
        lastShift.current = now
        onShift(scale - 1)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: true })
    return () => el.removeEventListener('wheel', onWheel)
  }, [gl, camera, controls, scale, onShift])
  return null
}

export default function App() {
  const [scale, setScale] = useState(initialScale)
  const [galaxyIndex, setGalaxyIndex] = useState(
    CAPTURE?.scale === 'galaxy' ? (CAPTURE.index ?? 0) : 0,
  )
  const [planetIndex, setPlanetIndex] = useState(
    CAPTURE?.scale === 'planet' ? (CAPTURE.index ?? 0) : 0,
  )
  // The renderer, captured once init() has resolved — backend identity is
  // only final after that, so all backend reads go through this state.
  const [gl, setGl] = useState(null)
  const [fading, setFading] = useState(false)

  // One deep-space backdrop for every rung, app-lifetime; radius follows
  // the rung.
  const skybox = useMemo(() => createSkybox({ frozen: FROZEN }), [])
  useEffect(
    () => () => {
      skybox.material.dispose()
      skybox.geometry.dispose()
    },
    [skybox],
  )
  const rung = SCALES[scale]
  useEffect(() => {
    skybox.scale.setScalar(rung.sky / 7)
  }, [rung, skybox])

  const shiftScale = (next) => {
    if (next === scale) return
    setFading(true)
    setScale(next)
    const url = new URL(window.location)
    url.searchParams.set('scale', SCALES[next].id)
    url.searchParams.delete('view')
    window.history.replaceState(null, '', url)
    setTimeout(() => setFading(false), 260)
  }

  // The facts ladder (G3-33): every rung feeds the same HUD skeleton.
  let info
  let list = null
  let index = 0
  let setIndex = null
  if (rung.id === 'planet') {
    list = PLANET_TYPES
    index = planetIndex
    setIndex = setPlanetIndex
    info = list[index]
  } else if (rung.id === 'galaxy') {
    list = GALAXY_TYPES
    index = galaxyIndex
    setIndex = setGalaxyIndex
    info = list[index]
  } else if (rung.id === 'system') {
    info = SYSTEM_INFO
  } else {
    info = GROUP_INFO
  }

  const go = (delta) => setIndex?.((i) => (i + delta + list.length) % list.length)

  return (
    <div
      className="app"
      style={
        CAPTURE
          ? { width: CAPTURE_SIZE.w, height: CAPTURE_SIZE.h }
          : undefined
      }
    >
      <Canvas
        gl={createRenderer}
        onCreated={(state) => {
          setGl(state.gl)
          if (import.meta.env.DEV) window.__r3f = state
          bakeSkybox(skybox, state.gl, { frozen: FROZEN })
        }}
        camera={{ position: SCALES[2].camera, fov: 55 }}
        dpr={CAPTURE ? 1 : [1, 2]}
        frameloop={CAPTURE ? 'never' : 'always'}
      >
        <color attach="background" args={['#02030a']} />
        {!CAPTURE && <ViewRig scale={scale} />}
        {!CAPTURE && <ZoomThrough scale={scale} onShift={shiftScale} />}
        <primitive object={skybox} />
        {rung.id === 'planet' &&
          (info.star ? (
            <Star frozen={FROZEN} />
          ) : (
            <Planet
              key={info.id}
              recipe={info.recipe}
              spinRate={info.spinRate}
              atmosphere={info.atmosphere}
              frozen={FROZEN}
            />
          ))}
        {rung.id === 'system' && <System frozen={FROZEN} />}
        {rung.id === 'galaxy' && <Galaxy type={GALAXY_TYPES[galaxyIndex]} />}
        {rung.id === 'group' && <LocalGroup frozen={FROZEN} />}
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={rung.min}
          maxDistance={rung.max}
          rotateSpeed={0.5}
        />
        <Effects />
        {CAPTURE && (
          <CaptureRig
            shot={CAPTURE}
            fps={CAPTURE_FPS}
            width={CAPTURE_SIZE.w}
            height={CAPTURE_SIZE.h}
          />
        )}
      </Canvas>

      {!CAPTURE && !gl && <div className="boot">initializing renderer…</div>}
      {!CAPTURE && <div className={'scale-fade' + (fading ? ' active' : '')} />}

      {!CAPTURE && import.meta.env.DEV && gl && (
        <div className="backend-badge">{backendName(gl)}</div>
      )}

      {CAPTURE && (
        <div className="hud">
          <div className="kicker">capture · {CAPTURE.id} · click to choose the frames folder</div>
        </div>
      )}

      {!CAPTURE && (
      <div className="hud">
        <div className="views">
          {SCALES.map((s, i) => (
            <button
              key={s.id}
              className={i === scale ? 'active' : ''}
              onClick={() => shiftScale(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="kicker">echoGalaxy · a free tool for exploring the universe</div>
        <h1>{info.name}</h1>
        <div className="cls">{info.label ?? info.hubble}</div>
        <p>{info.description}</p>
        <ul>
          {info.facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        {list && (
          <div className="nav">
            <button onClick={() => go(-1)}>‹ Prev</button>
            <span>
              {index + 1} / {list.length}
            </span>
            <button onClick={() => go(1)}>Next ›</button>
          </div>
        )}
        <div className="hint">
          drag to orbit · scroll to zoom · zoom past the edge to change scale
        </div>
      </div>
      )}
    </div>
  )
}
