import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Vector3 } from 'three'
import Galaxy from './Galaxy'
import Planet from './Planet'
import Star from './Star'
import BlackHole from './BlackHole'
import RingedWorld from './RingedWorld'
import Moon from './Moon'
import System, {
  SYSTEM_INFO,
  GODS_HANDS_INFO,
  ORBITS,
  orbitPosition,
  LIVE_BODIES,
  GOD_DIAL,
} from './System'
import Pillars, { NEBULA_INFO } from './Pillars'
import Cluster, { CLUSTER_INFO, REDSHIFT_INFO } from './Cluster'
import LocalGroup, { GROUP_INFO, MEMBERS } from './LocalGroup'
import Effects from './Effects'
import { createSkybox, bakeSkybox } from './skybox'
import { GALAXY_TYPES } from './galaxyData'
import { PLANET_TYPES } from './planetData'
import { createRenderer, backendName } from './renderer'
import CaptureRig from './capture/CaptureRig'
import { shotById, ASPECTS } from './capture/shots'

const params = new URLSearchParams(window.location.search)
const FROZEN = import.meta.env.DEV && params.has('freeze')

// MB-01: input modality, read once at boot (device class doesn't change
// mid-session). Drives hint copy, the compact HUD, and the perf policy.
const COARSE =
  typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches

// Capture mode: ?capture=<shotId>&aspect=4x5&fps=60
// Dev only. Pins the rung and object index, hands the camera to the rig,
// and steps the frame loop by hand.
const CAPTURE = import.meta.env.DEV ? shotById(params.get('capture')) : null
const CAPTURE_FPS = Number(params.get('fps')) || 60
const CAPTURE_SIZE = ASPECTS[params.get('aspect') ?? '4x5'] ?? ASPECTS['4x5']
const CAPTURE_SINK = CAPTURE ? params.get('captureSink') : null

if (CAPTURE) {
  window.__echoGalaxyCapture = { id: CAPTURE.id, state: 'arming' }
}

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
  { id: 'nebula', label: 'Nebula', camera: [0, 0.2, 4.6], min: 2.6, max: 9, sky: 60 },
  { id: 'galaxy', label: 'Galaxy', camera: [0, 6, 12], min: 4, max: 28, sky: 60 },
  { id: 'group', label: 'Local Group', camera: [0, 16, 40], min: 12, max: 90, sky: 140 },
  { id: 'cluster', label: 'Coma Cluster', camera: [0, 3.5, 14], min: 6, max: 34, sky: 200 },
]

function initialScale() {
  if (CAPTURE) {
    const c = SCALES.findIndex((s) => s.id === CAPTURE.scale)
    if (c !== -1) return c
  }
  const i = SCALES.findIndex((s) => s.id === params.get('scale'))
  if (i !== -1) return i
  if (params.get('view') === 'planets') return 0 // legacy links keep working
  // the app's historical home — by id, never by index (PC-11: inserting
  // a rung must not silently move the front door)
  return SCALES.findIndex((s) => s.id === 'galaxy')
}

// Repositions the camera when the rung changes (Canvas camera is
// initial-only).
function ViewRig({ scale }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const size = useThree((s) => s.size)
  useEffect(() => {
    const rung = SCALES[scale]
    // MB-06: portrait crops horizontally (vfov is fixed, hfov shrinks
    // with aspect) — push the camera back so the subject fits the
    // narrow frame, capped by the rung's controls max so OrbitControls
    // never snaps it back in. Desktop aspect ⇒ mul clamps to 1.
    const aspect = size.width / size.height
    const len = Math.hypot(...rung.camera)
    const mul = Math.min(Math.max(1.2 / aspect, 1), 2, (rung.max - 0.1) / len)
    camera.position.set(
      rung.camera[0] * mul,
      rung.camera[1] * mul,
      rung.camera[2] * mul,
    )
    camera.lookAt(0, 0, 0)
    controls?.update?.()
  }, [scale, camera, controls, size])
  return null
}

// Member focus (post-roadmap): snaps the camera to a focused body and,
// for orbiting bodies, follows it — the controls target rides the orbit
// so drag/zoom stay natural around a moving world. Runs after ViewRig in
// the tree, so on rung entry the persisted focus wins over the default
// framing.
function FocusRig({ scale, focus }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const clock = useThree((s) => s.clock)
  const scratch = useMemo(() => new Vector3(), [])

  useEffect(() => {
    if (!controls) return
    let target = [0, 0, 0]
    let dist = null
    if (focus?.kind === 'static') {
      target = focus.pos
      dist = focus.dist
    } else if (focus?.kind === 'orbit') {
      // GH-04: the live-body registry is the source of truth — correct
      // for rails and for bodies God's Hands sent ballistic.
      const live = LIVE_BODIES.get(focus.orbit.id)
      const p = live
        ? scratch.copy(live.pos)
        : orbitPosition(focus.orbit, FROZEN ? 0 : clock.elapsedTime, scratch)
      target = [p.x, p.y, p.z]
      dist = focus.dist
    }
    controls.target.set(...target)
    if (dist == null) {
      camera.position.set(...SCALES[scale].camera)
    } else {
      camera.position.set(
        target[0] + dist * 0.22,
        target[1] + dist * 0.36,
        target[2] + dist * 0.9,
      )
    }
    camera.lookAt(controls.target)
    controls.update()
  }, [scale, focus, camera, controls, clock, scratch])

  useFrame(() => {
    if (focus?.kind !== 'orbit' || !controls || FROZEN) return
    const live = LIVE_BODIES.get(focus.orbit.id)
    if (live?.mode === 'held') return // the hand steers; the camera waits
    const p = live
      ? scratch.copy(live.pos)
      : orbitPosition(focus.orbit, clock.elapsedTime, scratch)
    const delta = p.sub(controls.target)
    controls.target.add(delta)
    camera.position.add(delta)
  })
  return null
}

// GH-10: the cannonball dial — reads the mutable GOD_DIAL feed on its
// own rAF and writes the DOM directly; the HUD never re-renders per
// frame. Mounted only while the God's Hands panel is up.
const FATE_LABEL = {
  infall: 'it will fall into the star',
  orbit: 'it will find an orbit',
  escape: 'it will leave forever',
}

function CannonballDial() {
  const ref = useRef()
  useEffect(() => {
    let raf
    const tick = () => {
      const el = ref.current
      if (el) {
        el.textContent = GOD_DIAL.active
          ? `speed ${GOD_DIAL.v.toFixed(2)} · orbit ${GOD_DIAL.vc.toFixed(2)} · ` +
            `escape ${GOD_DIAL.ve.toFixed(2)} — ${FATE_LABEL[GOD_DIAL.fate] ?? ''}`
          : 'grab · drag · release — the dial reads your throw'
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])
  return <div className="dial" ref={ref} />
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

// MB-02 finding: R3F writes INLINE touch-action:auto on the canvas —
// and re-writes it after onCreated when its event system connects, so
// neither a stylesheet rule nor a one-shot override survives. Without
// `none`, the browser claims one-finger drags for page gestures and
// pointercancels OrbitControls mid-rotate (grabs survived only because
// setPointerCapture blocks the steal). Self-healing guard: one string
// compare per frame, immune to whoever writes last.
function TouchPolicy() {
  const gl = useThree((s) => s.gl)
  useFrame(() => {
    const el = gl.domElement
    if (el.style.touchAction !== 'none') el.style.touchAction = 'none'
  })
  return null
}

// MB-03: the touch sibling of ZoomThrough — pinching past the controls'
// stop climbs/descends a rung. Watches ONLY touch pointers (inert for
// mouse; desktop byte-identical). OrbitControls keeps handling the same
// touches — it clamps at the stop, we observe passively.
function TouchZoomThrough({ scale, onShift }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const gl = useThree((s) => s.gl)
  const lastShift = useRef(0)
  useEffect(() => {
    const el = gl.domElement
    const pts = new Map()
    let lastSpread = 0
    let accum = 0
    const spread = () => {
      const [a, b] = [...pts.values()]
      return Math.hypot(a.x - b.x, a.y - b.y)
    }
    const down = (e) => {
      if (e.pointerType !== 'touch') return
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pts.size === 2) {
        lastSpread = spread()
        accum = 0
      }
    }
    const move = (e) => {
      if (e.pointerType !== 'touch' || !pts.has(e.pointerId)) return
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pts.size !== 2 || !controls) return
      const s = spread()
      const d = s - lastSpread
      lastSpread = s
      const now = performance.now()
      if (now - lastShift.current < 700) {
        accum = 0
        return
      }
      const dist = camera.position.distanceTo(controls.target)
      const { min, max } = SCALES[scale]
      // shrinking spread = zoom-out intent; growing = zoom-in
      if (dist >= max - 0.05 && d < 0) accum += d
      else if (dist <= min + 0.05 && d > 0) accum += d
      else accum = 0
      if (accum <= -40 && scale < SCALES.length - 1) {
        lastShift.current = now
        accum = 0
        onShift(scale + 1)
      } else if (accum >= 40 && scale > 0) {
        lastShift.current = now
        accum = 0
        onShift(scale - 1)
      }
    }
    const up = (e) => {
      pts.delete(e.pointerId)
      accum = 0
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
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
  const [systemIndex, setSystemIndex] = useState(0)
  const [groupIndex, setGroupIndex] = useState(0)
  // The renderer, captured once init() has resolved — backend identity is
  // only final after that, so all backend reads go through this state.
  const [gl, setGl] = useState(null)
  const [fading, setFading] = useState(false)
  // God's Hands (GH-04/08): held suspends zoom-through; wild shows the
  // restore-order action; the signal counter resets every body to rails.
  const [god, setGod] = useState({ held: false, wild: false })
  const [restoreCount, setRestoreCount] = useState(0)
  // MB-05: on touch devices the facts collapse — the HUD covered 60% of
  // a portrait screen and its button rows intercepted sky touches.
  const [factsOpen, setFactsOpen] = useState(!COARSE)
  // CB-10: the cluster rung's redshift-space toggle — one boolean; the
  // scene glides its uniform toward the target (snaps when frozen).
  const [zSpace, setZSpace] = useState(false)
  const [captureStarted, setCaptureStarted] = useState(false)
  const [captureResult, setCaptureResult] = useState(null)

  const onCaptureStart = useCallback(() => {
    setCaptureStarted(true)
    window.__echoGalaxyCapture = { id: CAPTURE.id, state: 'capturing' }
  }, [])

  const onCaptureDone = useCallback((result) => {
    setCaptureResult(result)
    window.__echoGalaxyCapture = {
      id: CAPTURE.id,
      state: result.ok ? 'complete' : 'failed',
      ...result,
    }
  }, [])

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
    setGod({ held: false, wild: false }) // System unmounts; state resets
    setZSpace(false) // the cluster returns to real space on rung change
    const url = new URL(window.location)
    url.searchParams.set('scale', SCALES[next].id)
    url.searchParams.delete('view')
    window.history.replaceState(null, '', url)
    setTimeout(() => setFading(false), 260)
  }

  // The facts ladder (G3-33) + member focus: every rung feeds the same
  // HUD skeleton, and every rung now has a cycle — the system and group
  // rungs lead with their overview, then focus each body in turn.
  const starEntry = PLANET_TYPES.find((t) => t.star)
  const systemList = useMemo(
    () => [SYSTEM_INFO, starEntry, ...ORBITS.map((o) => o.info)],
    [starEntry],
  )
  const groupList = useMemo(() => [GROUP_INFO, ...MEMBERS.map((m) => m.info)], [])

  let info
  let list
  let index
  let setIndex
  if (rung.id === 'planet') {
    list = PLANET_TYPES
    index = planetIndex
    setIndex = setPlanetIndex
  } else if (rung.id === 'galaxy') {
    list = GALAXY_TYPES
    index = galaxyIndex
    setIndex = setGalaxyIndex
  } else if (rung.id === 'system') {
    list = systemList
    index = systemIndex
    setIndex = setSystemIndex
  } else if (rung.id === 'nebula' || rung.id === 'cluster') {
    // one formation, no cycle — the facts ARE the payload (and the
    // cluster's interaction is the redshift toggle, not a cycle)
    list = null
    index = 0
    setIndex = null
  } else {
    list = groupList
    index = groupIndex
    setIndex = setGroupIndex
  }
  info = list ? list[index] : rung.id === 'cluster' ? CLUSTER_INFO : NEBULA_INFO

  // GH-12 call: while the god is at work (a body held or off its rail),
  // the info panel becomes the God's Hands payload — the facts arrive at
  // the exact moment the user is doing the thing they explain. No cycle
  // entry (that would perturb the focus indices); order restored, the
  // panel hands back.
  const godPanel = rung.id === 'system' && (god.held || god.wild)
  if (godPanel) info = GODS_HANDS_INFO

  // CB-11: while the cluster sits in redshift space, the panel teaches
  // what the eye is seeing (the GH-12 takeover pattern).
  if (rung.id === 'cluster' && zSpace) info = REDSHIFT_INFO

  // Camera focus target for the focused entry (null = overview framing).
  let focus = null
  if (rung.id === 'group' && groupIndex > 0) {
    const m = MEMBERS[groupIndex - 1]
    const r = m.cfg.radius ?? 2
    focus = { kind: 'static', pos: m.pos, dist: r * 2.6, min: r * 0.9 }
  } else if (rung.id === 'system' && systemIndex > 0) {
    if (systemIndex === 1) {
      focus = { kind: 'static', pos: [0, 0, 0], dist: 4.4, min: 1.8 }
    } else {
      const o = ORBITS[systemIndex - 2]
      focus = { kind: 'orbit', orbit: o, dist: o.size * 7.5, min: o.size * 2.5 }
    }
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
        dpr={CAPTURE ? 1 : COARSE ? [1, 1.5] : [1, 2]}
        frameloop={CAPTURE ? 'never' : 'always'}
      >
        <color attach="background" args={['#02030a']} />
        <TouchPolicy />
        {!CAPTURE && <ViewRig scale={scale} />}
        {!CAPTURE && <FocusRig scale={scale} focus={focus} />}
        {/* zoom-through suspends while focused: focus zoom ranges sit
            below the rung's stops and would false-trigger a descent */}
        {!CAPTURE && !focus && !god.held && (
          <ZoomThrough scale={scale} onShift={shiftScale} />
        )}
        {!CAPTURE && !focus && !god.held && (
          <TouchZoomThrough scale={scale} onShift={shiftScale} />
        )}
        <primitive object={skybox} />
        {rung.id === 'planet' &&
          (info.blackhole ? (
            <BlackHole frozen={FROZEN} />
          ) : info.ringed || info.rings ? (
            <RingedWorld frozen={FROZEN} ringsOnly={!!info.rings} />
          ) : info.star ? (
            <Star frozen={FROZEN} />
          ) : (
            <group key={info.id}>
              <Planet
                recipe={info.recipe}
                spinRate={info.spinRate}
                atmosphere={info.atmosphere}
                frozen={FROZEN}
              />
              {info.moon && (
                <Moon
                  orbitR={info.moon.orbitR}
                  size={info.moon.size}
                  period={info.moon.period}
                  phase={info.moon.phase}
                  recipe={info.moon.recipe}
                  frozen={FROZEN}
                />
              )}
            </group>
          ))}
        {rung.id === 'system' && (
          <System
            frozen={FROZEN}
            hands={!CAPTURE}
            onGodState={setGod}
            restoreSignal={restoreCount}
          />
        )}
        {rung.id === 'nebula' && (
          <Pillars frozen={FROZEN} steps={COARSE ? 14 : 20} />
        )}
        {rung.id === 'galaxy' && <Galaxy type={GALAXY_TYPES[galaxyIndex]} />}
        {rung.id === 'group' && <LocalGroup frozen={FROZEN} />}
        {rung.id === 'cluster' && (
          <Cluster frozen={FROZEN} zSpaceTarget={zSpace ? 1 : 0} />
        )}
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={focus?.min ?? rung.min}
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
            sink={CAPTURE_SINK}
            onStart={onCaptureStart}
            onDone={onCaptureDone}
          />
        )}
      </Canvas>

      {!CAPTURE && !gl && <div className="boot">initializing renderer…</div>}
      {!CAPTURE && <div className={'scale-fade' + (fading ? ' active' : '')} />}

      {!CAPTURE && import.meta.env.DEV && gl && (
        <div className="backend-badge">{backendName(gl)}</div>
      )}

      {CAPTURE && !captureStarted && !captureResult && (
        <div className="hud">
          <div className="kicker">
            capture · {CAPTURE.id} · {CAPTURE_SINK ? 'starting' : 'click to choose the frames folder'}
          </div>
        </div>
      )}

      {CAPTURE && captureResult && !captureResult.ok && (
        <div className="hud">
          <div className="kicker">capture failed · {captureResult.error}</div>
        </div>
      )}

      {!CAPTURE && (
      <div className={'hud' + (COARSE ? ' compact' : '')}>
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
        {factsOpen && (
          <div className="facts">
            <p>{info.description}</p>
            <ul>
              {info.facts.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}
        {COARSE && (
          <button
            className="facts-toggle"
            onClick={() => setFactsOpen((o) => !o)}
          >
            {factsOpen ? 'hide the facts ▾' : 'read the facts ▸'}
          </button>
        )}
        {godPanel && <CannonballDial />}
        {!godPanel && list && (
          <div className="nav">
            <button onClick={() => go(-1)}>‹ Prev</button>
            <span>
              {index + 1} / {list.length}
            </span>
            <button onClick={() => go(1)}>Next ›</button>
          </div>
        )}
        {rung.id === 'system' && god.wild && (
          <div className="nav">
            <button onClick={() => setRestoreCount((c) => c + 1)}>
              ☄ Restore order
            </button>
          </div>
        )}
        {rung.id === 'cluster' && (
          <div className="nav">
            <button onClick={() => setZSpace((z) => !z)}>
              {zSpace ? '← return to real space' : '⇢ view in redshift space'}
            </button>
          </div>
        )}
        <div className="hint">
          {rung.id === 'system' && !FROZEN
            ? COARSE
              ? 'grab a planet and fling it · drag to orbit · pinch to zoom'
              : 'grab a planet and fling it · drag to orbit · scroll to zoom'
            : COARSE
              ? 'drag to orbit · pinch to zoom · pinch past the edge to change scale'
              : 'drag to orbit · scroll to zoom · zoom past the edge to change scale'}
        </div>
      </div>
      )}
    </div>
  )
}
