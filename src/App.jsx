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
  GODS_HANDS_INFO,
  SYSTEMS,
  orbitPosition,
  LIVE_BODIES,
  GOD_DIAL,
} from './System'
import Pillars, { NEBULA_INFO } from './Pillars'
import Cluster, { CLUSTER_INFO, REDSHIFT_INFO } from './Cluster'
import Crab, { CRAB_INFO } from './Crab'
import WolfRayet, { WR_INFO } from './WolfRayet'
import LocalGroup, { GROUP_INFO, MEMBERS } from './LocalGroup'
import Effects from './Effects'
import { createSkybox, bakeSkybox } from './skybox'
import Sky, { SKY_INFO } from './Sky'
import { GALAXY_TYPES } from './galaxyData'
import { CONSTELLATIONS } from './constellationData'
import { figureDirection, STARS, HR_INDEX } from './skyCatalog'
import { STAR_PROFILES } from './starData'
import { PLANET_TYPES } from './planetData'
import { createRenderer, backendName } from './renderer'
import { factsFor, hasLadder, AUDIENCES, AUDIENCE_LABELS } from './factsLadder'
import CaptureRig from './capture/CaptureRig'
import { shotById, ASPECTS } from './capture/shots'

const params = new URLSearchParams(window.location.search)
const FROZEN = import.meta.env.DEV && params.has('freeze')

// ZD: real-sky mode. 'zodiac' (default) draws the thirteen ecliptic figures;
// 'all' draws all 88; 'stars' drops the figures and keeps the catalogue;
// 'off' returns to the procedural skybox alone. Not dev-gated — this is a
// shipping feature, and the link is worth sharing.
//
// A capture shot may pin its own mode, which is how the sky shots ask for
// all 88 figures while every other shot keeps the shipping zodiac default.
// Declared below CAPTURE so the shot can win; see the const just after it.
const SKY_PARAM = params.get('sky')

// MB-01: input modality, read once at boot (device class doesn't change
// mid-session). Drives hint copy and the perf policy.
const COARSE =
  typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches

// LAYOUT is a different question from INPUT, and conflating them was the bug.
// COARSE alone decided the compact HUD, which meant a touchscreen laptop got
// the phone panel, a narrow desktop window did not get it, and — because a
// module const is read once — rotating a phone re-evaluated nothing at all.
// Layout now tracks the viewport and updates live. Pointer type keeps the
// jobs it is actually right for. Capture mode never renders the HUD, so none
// of this can move a frame.
const COMPACT_QUERY = '(pointer: coarse), (max-width: 820px), (max-height: 520px)'

function useCompactLayout() {
  const [on, setOn] = useState(
    () => typeof matchMedia === 'function' && matchMedia(COMPACT_QUERY).matches,
  )
  useEffect(() => {
    if (typeof matchMedia !== 'function') return undefined
    const mq = matchMedia(COMPACT_QUERY)
    const onChange = () => setOn(mq.matches)
    mq.addEventListener('change', onChange)
    onChange()
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return on
}

// Capture mode: ?capture=<shotId>&aspect=4x5&fps=60
// Dev only. Pins the rung and object index, hands the camera to the rig,
// and steps the frame loop by hand.
const CAPTURE = import.meta.env.DEV ? shotById(params.get('capture')) : null
const CAPTURE_FPS = Number(params.get('fps')) || 60
const CAPTURE_SIZE = ASPECTS[params.get('aspect') ?? '4x5'] ?? ASPECTS['4x5']
const CAPTURE_SINK = CAPTURE ? params.get('captureSink') : null

// The shot's own sky mode outranks the URL, which outranks the default.
// Default 'all': the whole celestial sphere of figures, not just the thirteen
// the ecliptic crosses. The zodiac-only default was the cautious first cut —
// with 25,199 stars behind them the full 88 read as a real sky rather than a
// diagram, and the ecliptic still gets its own line to distinguish it.
const SKY_MODE = CAPTURE?.sky ?? SKY_PARAM ?? 'all'

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
  { id: 'system', label: 'System', camera: [0, 5.2, 14], min: 3, max: 28, sky: 60 },
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

function initialSystemIndex() {
  // Capture shots pin their system by id (shot 12-godshands runs on
  // TRAPPIST-1); outside capture the ?system= link param decides.
  const id = CAPTURE?.system ?? params.get('system')
  const i = SYSTEMS.findIndex((system) => system.id === id)
  return i === -1 ? 0 : i
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
/**
 * Nudge a bearing sideways by `deg`, about an axis perpendicular to it.
 *
 * SkyRig puts the camera on the far side of the origin and looks back through
 * the scene, so whatever it aims at lands dead centre — with the rung's own
 * subject sitting directly in front of it. A constellation is large enough to
 * surround the subject and reads fine. A single star does not: Betelgeuse
 * arrived exactly behind the Sun, and its reticle looked like a mark ON the
 * Sun rather than a star far beyond it. Tilting the aim a little puts the star
 * off to one side, still well inside the frame, with clear sky around it.
 *
 * 22 degrees, not 14: at 14 the reticle landed at roughly the same screen
 * radius as the outer orbits, so it kept arriving on top of a planet. Further
 * out is emptier.
 */
function tiltDirection(dir, deg) {
  if (!dir) return null
  const [x, y, z] = dir
  // any vector not parallel to dir, crossed with it, gives a perpendicular axis
  const up = Math.abs(y) < 0.9 ? [0, 1, 0] : [1, 0, 0]
  let ax = up[1] * z - up[2] * y
  let ay = up[2] * x - up[0] * z
  let az = up[0] * y - up[1] * x
  const al = Math.hypot(ax, ay, az) || 1
  ax /= al
  ay /= al
  az /= al
  // Rodrigues: v cos + (a x v) sin + a (a . v)(1 - cos)
  const t = (deg * Math.PI) / 180
  const c = Math.cos(t)
  const sn = Math.sin(t)
  const dot = ax * x + ay * y + az * z
  return [
    x * c + (ay * z - az * y) * sn + ax * dot * (1 - c),
    y * c + (az * x - ax * z) * sn + ay * dot * (1 - c),
    z * c + (ax * y - ay * x) * sn + az * dot * (1 - c),
  ]
}

/** Unit direction of a catalogue star, by HR number. */
function starDirection(hr) {
  const i = hr == null ? undefined : HR_INDEX.get(hr)
  if (i === undefined) return null
  const s = STARS[i]
  return [s[1], s[2], s[3]]
}

// SK-1: the sky's answer to FocusRig. A constellation is not a place you can
// fly to — it is a direction, painted on a shell 57 units out — so instead of
// moving toward it the camera swings to the far side of the origin and looks
// back through the scene at it.
//
// Without this the highlight is drawn correctly and is simply not on screen:
// paging to Apus lights up a figure near the south celestial pole while the
// camera is still looking along the ecliptic, and nothing appears to happen.
// The subject stays centred in frame, so you get the system with its
// constellation behind it rather than one or the other.
function SkyRig({ dir }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const key = dir ? dir.join(',') : null
  useEffect(() => {
    const d = key ? key.split(',').map(Number) : null
    if (!d) return
    // Keep whatever distance the reader had zoomed to; only the bearing moves.
    const r = camera.position.length() || 10
    camera.position.set(-d[0] * r, -d[1] * r, -d[2] * r)
    camera.lookAt(0, 0, 0)
    controls?.target?.set?.(0, 0, 0)
    controls?.update?.()
  }, [key, camera, controls])
  return null
}

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
  const [systemIndex, setSystemIndex] = useState(initialSystemIndex)
  const [systemMemberIndex, setSystemMemberIndex] = useState(
    CAPTURE?.scale === 'system' ? (CAPTURE.index ?? 0) : 0,
  )
  const [groupIndex, setGroupIndex] = useState(0)
  // SK-1: null means the sky overlay is off. 0 is The Real Sky, 1..88 are the
  // IAU figures. Kept out of the rung indices on purpose so leaving the sky
  // restores whatever object you were on.
  const [skyIndex, setSkyIndex] = useState(null)
  // Which catalogue the sky pager is walking: 'figures' (The Real Sky + the
  // 88) or 'stars' (the named profiles). Two lists rather than one of 128,
  // because "next" should mean the next constellation OR the next star, never
  // "the 89th thing, which happens to be where the stars begin".
  const [skyView, setSkyView] = useState('figures')
  // SN-07: the nebula rung cycles star birth and star death
  const [nebulaIndex, setNebulaIndex] = useState(
    CAPTURE?.scale === 'nebula' ? (CAPTURE.index ?? 0) : 0,
  )
  // The renderer, captured once init() has resolved — backend identity is
  // only final after that, so all backend reads go through this state.
  const [gl, setGl] = useState(null)
  const [fading, setFading] = useState(false)
  // God's Hands (GH-04/08): held suspends zoom-through; wild shows the
  // restore-order action; the signal counter resets every body to rails.
  const [god, setGod] = useState({ held: false, wild: false })
  const [restoreCount, setRestoreCount] = useState(0)
  // Open everywhere, including touch. MB-05 collapsed this drawer on a phone
  // because the HUD covered 60% of the screen and its button rows intercepted
  // sky touches — but the object pager now lives in the panel's footer, so a
  // collapsed drawer is an app with no way to reach the next planet. The
  // coverage half of that objection is answered by the height cap instead
  // (check:mobile measures 49-65%, against a 72% ceiling); the touch half by
  // the panel being a capped, mid-height column with sky above, below and
  // beside it, rather than the full-width sheet that prompted the change.
  const [factsOpen, setFactsOpen] = useState(true)
  const compactLayout = useCompactLayout()
  // The rung menu behind the hamburger. Open by default where there is room
  // and closed where there is not, then it is the reader's to control —
  // deliberately NOT re-synced to the media query afterwards, because having
  // a menu you opened shut itself on a rotate is worse than either default.
  const [rungsOpen, setRungsOpen] = useState(
    () => !(typeof matchMedia === 'function' && matchMedia(COMPACT_QUERY).matches),
  )
  // The menu behind the ⋯ in the top bar. Closed by default on every screen:
  // it explains what to do, so it must not be the thing in the way.
  const [menuOpen, setMenuOpen] = useState(false)
  // The system switcher, in its own drawer on the left. It used to sit in the
  // bottom stack directly above Prev/Next, which put "‹ System" and "‹ Prev"
  // one under the other — two buttons leading with the same glyph, reading as
  // two Previous controls. Separating them by side removes the ambiguity that
  // no amount of relabelling inside one column would have.
  const [systemsOpen, setSystemsOpen] = useState(
    () => !(typeof matchMedia === 'function' && matchMedia(COMPACT_QUERY).matches),
  )
  // The facts ladder's read rung. Entries from the astronomy content layer
  // carry factsKids + factsAdvanced; the older catalogues carry a flat
  // `facts` that factsFor() falls back to, so this state changes nothing
  // for them and the switch below stays hidden on those rungs.
  // SK-1: the reading level, remembered. Asked once on first load, because
  // until now this switch has never rendered at all — hasLadder() was false
  // for every reachable entry, so the two-rung facts had nothing to govern.
  // The constellations changed that.
  //
  // Every storage access is wrapped: a blocked localStorage (private mode, a
  // browser set to refuse site data) must degrade to "don't ask, don't
  // remember" rather than take the app down or ask on every single load.
  const [audience, setAudience] = useState(() => {
    try {
      const v = localStorage.getItem('eg:audience')
      if (v === 'kids' || v === 'advanced') return v
    } catch {
      /* storage unavailable — fall through to the default */
    }
    return 'kids'
  })
  const [askLevel, setAskLevel] = useState(() => {
    if (CAPTURE) return false // never in front of a frame being rendered
    try {
      return !localStorage.getItem('eg:audience')
    } catch {
      return false
    }
  })
  const chooseLevel = useCallback((a) => {
    setAudience(a)
    setAskLevel(false)
    try {
      localStorage.setItem('eg:audience', a)
    } catch {
      /* the choice still holds for this session */
    }
  }, [])
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
  const system = SYSTEMS[systemIndex]
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

  const shiftSystem = (delta) => {
    const next = (systemIndex + delta + SYSTEMS.length) % SYSTEMS.length
    if (next === systemIndex) return
    setSystemIndex(next)
    setSystemMemberIndex(0)
    setGod({ held: false, wild: false })
    setRestoreCount((count) => count + 1)
    const url = new URL(window.location)
    url.searchParams.set('system', SYSTEMS[next].id)
    window.history.replaceState(null, '', url)
  }

  // The facts ladder (G3-33) + member focus: every rung feeds the same
  // HUD skeleton, and every rung now has a cycle — the system and group
  // rungs lead with their overview, then focus each body in turn.
  const systemList = useMemo(
    () => [system.info, system.star.info, ...system.orbits.map((orbit) => orbit.info)],
    [system],
  )
  const groupList = useMemo(() => [GROUP_INFO, ...MEMBERS.map((m) => m.info)], [])
  // SN-07: stellar life in three acts, in order — the Pillars (birth),
  // Sh 2-80 (a massive star throwing itself away), the Crab (death).
  // Ordered chronologically rather than appended, because the rung is
  // read as a sequence; the cost of that choice is that shot 13's index
  // moved, which shots.js records.
  const nebulaList = useMemo(() => [NEBULA_INFO, WR_INFO, CRAB_INFO], [])
  // The Real Sky leads, then the 88 in IAU order. check:content asserts every
  // one of them names a figure skyCatalog actually draws.
  const figureList = useMemo(() => [SKY_INFO, ...CONSTELLATIONS], [])
  // Only the profiles the catalogue actually draws. The other eight are real
  // stars and stay in the data — they are simply fainter than the V 7.5 limit
  // this sky is built to, so there is no dot to ring. Pointing a reticle at
  // where they would be if you could see them would be a lie told confidently.
  const starList = useMemo(() => STAR_PROFILES.filter((p) => p.hr), [])
  const skyList = skyView === 'stars' ? starList : figureList

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
    index = systemMemberIndex
    setIndex = setSystemMemberIndex
  } else if (rung.id === 'nebula') {
    list = nebulaList
    index = nebulaIndex
    setIndex = setNebulaIndex
  } else if (rung.id === 'cluster') {
    // one formation, no cycle — the cluster's interaction is the
    // redshift toggle, not a cycle
    list = null
    index = 0
    setIndex = null
  } else {
    list = groupList
    index = groupIndex
    setIndex = setGroupIndex
  }
  info = list ? list[index] : CLUSTER_INFO

  // The sky is only DRAWN on the planet and system rungs, and that is a
  // physical claim rather than a budget one: a constellation is a line-of-sight
  // coincidence seen from Earth, so from the galaxy rung outward you are not
  // standing anywhere those figures mean anything. The browser is available
  // exactly where the figures are, and the condition below mirrors the <Sky>
  // mount so the two cannot drift.
  const skyAvailable =
    SKY_MODE !== 'off' && (rung.id === 'system' || rung.id === 'planet')

  // Climbing off a rung that draws the sky closes it, rather than leaving the
  // overlay armed and invisible until you come back down.
  useEffect(() => {
    if (!skyAvailable) setSkyIndex(null)
  }, [skyAvailable])

  // SK-1: the sky takeover. Third instance of the GH-12/CB-11 pattern — the
  // panel's subject is replaced without touching any rung's focus index, so
  // leaving the sky drops you back exactly where you were.
  //
  // The sky is not a rung and deliberately never became one: the ladder is a
  // scale journey and the sky is a VIEWPOINT, drawn on every rung already. It
  // overlays whichever rung you are standing on.
  //
  // Entry 0 is SKY_INFO — "The Real Sky", which had been imported into this
  // file and never used since the day it was written — then the 88 figures,
  // exactly as GROUP_INFO leads the Local Group list.
  if (skyIndex !== null && skyAvailable) {
    list = skyList
    index = skyIndex
    setIndex = setSkyIndex
    info = skyList[skyIndex]
  }

  // GH-12 call: while the god is at work (a body held or off its rail),
  // the info panel becomes the God's Hands payload — the facts arrive at
  // the exact moment the user is doing the thing they explain. No cycle
  // entry (that would perturb the focus indices); order restored, the
  // panel hands back.
  //
  // Ranked ABOVE the sky on purpose: flinging a planet is something you just
  // did with your hands, and an explanation of it outranks whatever you were
  // reading. Redshift below is ranked the other way — it is a mode you are
  // sitting in, not an action, so a reader who has gone to the sky keeps it.
  const godPanel = rung.id === 'system' && (god.held || god.wild)
  if (godPanel) info = GODS_HANDS_INFO

  // CB-11: while the cluster sits in redshift space, the panel teaches
  // what the eye is seeing (the GH-12 takeover pattern).
  if (rung.id === 'cluster' && zSpace) info = REDSHIFT_INFO

  // Where the sky wants the camera pointed — one bearing for both views, so
  // SkyRig does not need to know which catalogue is being walked.
  const skyLookAt =
    !skyAvailable || skyIndex === null
      ? null
      : skyView === 'stars'
        ? tiltDirection(starDirection(skyList[skyIndex]?.hr), 22)
        : skyIndex > 0
          ? figureDirection(skyList[skyIndex].abbr)
          : null

  // Camera focus target for the focused entry (null = overview framing).
  // Suppressed entirely while the sky is up: focus flies the camera at a body
  // in the scene, and the thing being read about is painted on the shell 57
  // units out in every direction. There is nothing to fly to.
  let focus = null
  if (skyIndex !== null && skyAvailable) {
    focus = null
  } else if (rung.id === 'group' && groupIndex > 0) {
    const m = MEMBERS[groupIndex - 1]
    const r = m.cfg.radius ?? 2
    focus = { kind: 'static', pos: m.pos, dist: r * 2.6, min: r * 0.9 }
  } else if (rung.id === 'system' && systemMemberIndex > 0) {
    if (systemMemberIndex === 1) {
      focus = { kind: 'static', pos: [0, 0, 0], dist: 4.4, min: 1.8 }
    } else {
      const orbit = system.orbits[systemMemberIndex - 2]
      if (orbit) {
        focus = {
          kind: 'orbit',
          orbit,
          dist: orbit.size * 7.5,
          min: orbit.size * 2.5,
        }
      }
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
        {!CAPTURE && <SkyRig dir={skyLookAt} />}
        {/* zoom-through suspends while focused: focus zoom ranges sit
            below the rung's stops and would false-trigger a descent */}
        {!CAPTURE && !focus && !god.held && (
          <ZoomThrough scale={scale} onShift={shiftScale} />
        )}
        {!CAPTURE && !focus && !god.held && (
          <TouchZoomThrough scale={scale} onShift={shiftScale} />
        )}
        <primitive object={skybox} />
        {/* ZD — the real sky, but only on the two rungs where it is TRUE.
            These stars are catalogued as seen from the Solar System, so they
            belong at planet and system scale. From the galaxy rung outward
            we are looking at the Milky Way from outside it, and Earth's
            constellations would be a lie told from the wrong vantage point.
            `?sky=` overrides: off | stars | all (all 88 figures). */}
        {SKY_MODE !== 'off' && (rung.id === 'system' || rung.id === 'planet') && (
          /* Browsing the sky forces the figures on and forces all 88: a reader
             paging to Lacerta with ?sky=stars, or with the zodiac subset,
             would otherwise be highlighting a figure that is not drawn. */
          <Sky
            radius={rung.sky - 2}
            showFigures={skyIndex !== null || SKY_MODE !== 'stars'}
            figures={skyIndex !== null || SKY_MODE === 'all' ? 'all' : 'zodiac'}
            showEcliptic={rung.id === 'system' && SKY_MODE !== 'stars'}
            highlight={
              skyView === 'figures' && skyIndex > 0 ? skyList[skyIndex].abbr : null
            }
            markStar={
              skyView === 'stars' && skyIndex !== null
                ? starDirection(skyList[skyIndex]?.hr)
                : null
            }
          />
        )}
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
                cfg={info.cfg}
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
            key={system.id}
            system={system}
            frozen={FROZEN}
            hands={!CAPTURE}
            onGodState={setGod}
            restoreSignal={restoreCount}
            choreo={CAPTURE?.choreo ?? null}
          />
        )}
        {rung.id === 'nebula' && nebulaIndex === 0 && (
          <Pillars frozen={FROZEN} steps={COARSE ? 14 : 20} />
        )}
        {rung.id === 'nebula' && nebulaIndex === 1 && (
          <WolfRayet frozen={FROZEN} steps={COARSE ? 14 : 20} />
        )}
        {rung.id === 'nebula' && nebulaIndex === 2 && (
          <Crab frozen={FROZEN} steps={COARSE ? 14 : 20} />
        )}
        {rung.id === 'galaxy' && <Galaxy type={GALAXY_TYPES[galaxyIndex]} />}
        {rung.id === 'group' && <LocalGroup frozen={FROZEN} />}
        {rung.id === 'cluster' && (
          <Cluster
            frozen={FROZEN}
            zSpaceTarget={zSpace ? 1 : 0}
            zSpaceAt={CAPTURE?.zSpaceAt ?? null}
          />
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

      {askLevel && (
        <div className="level" role="dialog" aria-modal="true" aria-labelledby="level-title">
          <div className="level-card">
            <div className="level-kicker">echoGalaxy</div>
            <h2 id="level-title">How should the facts read?</h2>
            <p>
              Every object here carries two sets of facts, written separately
              rather than one simplified from the other.
            </p>
            <div className="level-choices">
              <button onClick={() => chooseLevel('kids')}>
                <b>{AUDIENCE_LABELS.kids}</b>
                <span>
                  Plain language and concrete pictures. Nothing you would have
                  to un-learn later.
                </span>
              </button>
              <button onClick={() => chooseLevel('advanced')}>
                <b>{AUDIENCE_LABELS.advanced}</b>
                <span>
                  The real numbers, the mechanism, and the named physics
                  behind it.
                </span>
              </button>
            </div>
            <p className="level-foot">Switchable any time, from the facts panel.</p>
          </div>
        </div>
      )}

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
      <div className={'hud' + (compactLayout ? ' compact' : '')}>
        {/* TOP — the scale ladder, behind a hamburger. The rungs are the
            app's primary navigation, so they sit where navigation sits;
            collapsing them hands the sky back its whole upper edge. */}
        <div className="hud-top">
          <div className="top-bar">
            <button
              className={'burger' + (rungsOpen ? ' open' : '')}
              onClick={() => setRungsOpen((o) => !o)}
              aria-expanded={rungsOpen}
              aria-controls="rung-menu"
              aria-label={rungsOpen ? 'Hide scales' : 'Show scales'}
            >
              <span className="bars" aria-hidden="true" />
            </button>
            <div className="top-id">
              <span className="brand">echoGalaxy</span>
              <span className="subject">{info.name}</span>
            </div>
            {/* The menu. A ? would only ever hold help; this holds sections,
                so the next thing that needs a home here is an entry rather
                than another button in a bar that has room for about one more.
—
                Three dots, NOT a second ☰. The scale ladder already owns the
                hamburger at the other end of this bar, and two identical
                glyphs at opposite ends is precisely the failure this HUD
                already fixed once, when "‹ System" sat above "‹ Prev" and read
                as two Previous buttons. Same lesson, different axis. */}
            <button
              className={'menu-btn' + (menuOpen ? ' open' : '')}
              onClick={() => {
                const next = !menuOpen
                setMenuOpen(next)
                // The menu hangs from the top bar and the facts sit on the
                // floor; on a phone they meet in the middle. Same turn-taking
                // rule the two drawers already follow.
                if (next && compactLayout) {
                  setFactsOpen(false)
                  setSystemsOpen(false)
                }
              }}
              aria-expanded={menuOpen}
              aria-controls="menu-panel"
              aria-label={menuOpen ? 'Close the menu' : 'Open the menu'}
            >
              <span className="dots" aria-hidden="true" />
            </button>
          </div>
          {rungsOpen && (
            <div className="views" id="rung-menu">
              {SCALES.map((s, i) => (
                <button
                  key={s.id}
                  className={i === scale ? 'active' : ''}
                  aria-current={i === scale ? 'true' : undefined}
                  onClick={() => shiftScale(i)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
          {menuOpen && (
            <div className="menu" id="menu-panel">
              <section>
                <h2>Moving around</h2>
                <dl>
                  <div>
                    <dt>{COARSE ? 'Drag' : 'Click and drag'}</dt>
                    <dd>Turn the camera around whatever you are looking at.</dd>
                  </div>
                  <div>
                    <dt>{COARSE ? 'Pinch' : 'Scroll'}</dt>
                    <dd>Move closer or further away.</dd>
                  </div>
                  <div>
                    <dt>{COARSE ? 'Pinch past the edge' : 'Keep zooming out'}</dt>
                    <dd>
                      Change scale — out to the next rung up, in to the next
                      one down. The ladder under ☰ jumps straight to any.
                    </dd>
                  </div>
                  {rung.id === 'system' && (
                    <div>
                      <dt>{COARSE ? 'Drag a planet' : 'Grab a planet'}</dt>
                      <dd>
                        Pick a world up and fling it. Its new orbit is solved
                        from the speed you release it at, so it is real physics
                        rather than an animation — and ☄ Restore order puts
                        everything back on its rails.
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt>‹ Prev · Next ›</dt>
                    <dd>
                      Step through the objects on this rung. They sit at the
                      foot of the facts panel, beside the count.
                    </dd>
                  </div>
                </dl>
              </section>
              {skyAvailable && (
                <section>
                  <h2>The sky</h2>
                  <p className="menu-note">
                    Every star above you is a real one, in its real place. All
                    88 constellations are drawn — page through them and each
                    lights up in turn.
                  </p>
                  <button
                    className="menu-action"
                    onClick={() => {
                      setSkyView('figures')
                      setSkyIndex(0)
                      setMenuOpen(false)
                    }}
                  >
                    Browse the 88 constellations
                  </button>
                  <button
                    className="menu-action"
                    onClick={() => {
                      setSkyView('stars')
                      setSkyIndex(0)
                      setMenuOpen(false)
                    }}
                  >
                    Browse the named stars
                  </button>
                  {skyIndex !== null && (
                    <button
                      className="menu-action menu-leave"
                      onClick={() => {
                        setSkyIndex(null)
                        setMenuOpen(false)
                      }}
                    >
                      Back to the {rung.label.toLowerCase()}
                    </button>
                  )}
                </section>
              )}
            </div>
          )}
        </div>

        {/* SIDE — the facts drawer. Anchored right so it never fights the
            bottom nav for the same corner, and collapsed to a tab so the
            scene keeps the middle of the frame. */}
        <aside className={'hud-side' + (factsOpen ? ' open' : '')}>
          <button
            className="facts-tab"
            onClick={() => {
              const next = !factsOpen
              setFactsOpen(next)
              if (next && compactLayout) setMenuOpen(false)
              // On compact the two drawers open toward each other from
              // opposite edges, so on anything narrower than ~600px their
              // panels would meet in the middle. They take turns instead.
              // Desktop has room for both at once and keeps them independent.
              if (next && compactLayout) setSystemsOpen(false)
            }}
            aria-expanded={factsOpen}
            aria-controls="facts-panel"
          >
            {factsOpen ? 'Hide ›' : '‹ Facts'}
          </button>
          {factsOpen && (
            <div className="facts" id="facts-panel">
              {/* Masthead, scrolling body, pager footer — three bands, so the
                  name and the Prev/Next row both stay put while the prose
                  scrolls between them. Which object you are on and how to
                  leave it are the two things you should never have to scroll
                  to find. */}
              <header className="facts-head">
                <h1>{info.name}</h1>
                <div className="cls">{info.label ?? info.hubble}</div>
              </header>
              <div className="facts-body">
                <p>{info.description}</p>
                {hasLadder(info) && (
                  <div className="ladder">
                    {AUDIENCES.map((a) => (
                      <button
                        key={a}
                        className={a === audience ? 'active' : ''}
                        aria-pressed={a === audience}
                        onClick={() => setAudience(a)}
                      >
                        {AUDIENCE_LABELS[a]}
                      </button>
                    ))}
                  </div>
                )}
                <ul>
                  {factsFor(info, audience).map((f, i) => (
                    <li key={`${audience}-${i}`}>{f}</li>
                  ))}
                </ul>
                {/* An entry may carry a dedication. Rendered quietly, after the
                    facts rather than above them — the astronomy is still the
                    point, and a memorial does not want to be a banner. */}
                {info.dedication && <p className="dedication">{info.dedication}</p>}
              </div>
              {/* The object pager. It used to float on the bottom of the
                  screen, where it shared the floor with the drawer tab and a
                  two-line gesture hint and lost. In the panel's footer it is
                  attached to the thing it pages through, and the floor is
                  free. God's Hands suppresses it for the same reason it always
                  did: the cannonball dial is the control that matters then. */}
              {!godPanel && list && (
                <nav className="facts-pager" aria-label="Browse this scale">
                  <button onClick={() => go(-1)} aria-label="Previous">‹ Prev</button>
                  <span className="pager-count">
                    {index + 1}
                    <i>/</i>
                    {list.length}
                  </span>
                  <button onClick={() => go(1)} aria-label="Next">Next ›</button>
                </nav>
              )}
            </div>
          )}
        </aside>

        {/* LEFT — the system switcher, mirrored opposite the facts drawer.
            Only the system rung has more than one, so only it gets a tab. */}
        {rung.id === 'system' && !godPanel && (
          <aside className={'hud-left' + (systemsOpen ? ' open' : '')}>
            <button
              className="systems-tab"
              onClick={() => {
                const next = !systemsOpen
                setSystemsOpen(next)
                if (next && compactLayout) setMenuOpen(false)
                if (next && compactLayout) setFactsOpen(false)
              }}
              aria-expanded={systemsOpen}
              aria-controls="systems-panel"
            >
              {systemsOpen ? 'Hide ‹' : 'Systems ›'}
            </button>
            {systemsOpen && (
              <div className="systems" id="systems-panel">
                <div className="systems-name">{system.info.name}</div>
                <div className="systems-count">
                  {systemIndex + 1} / {SYSTEMS.length}
                </div>
                <div className="systems-step">
                  <button onClick={() => shiftSystem(-1)} aria-label="Previous star system">‹</button>
                  <button onClick={() => shiftSystem(1)} aria-label="Next star system">›</button>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* BOTTOM — the actions that belong to the rung as a whole, not to the
            object you are on. Paging between objects moved into the facts
            panel's footer; what is left here is God's Hands, the two rung
            toggles, and the gesture hint. On most rungs that means this
            region renders nothing at all and the floor is sky. */}
        <div className="hud-bottom">
          {godPanel && <CannonballDial />}
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
      </div>
      )}
    </div>
  )
}
