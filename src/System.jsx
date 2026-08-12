import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import * as TSL from 'three/tsl'
import Planet from './Planet'
import Star from './Star'
import {
  K,
  step,
  outcome,
  circularVelocity,
  escapeVelocity,
  predictFate,
} from './orbitPhysics'
import { buildRingMaterial, RING_INNER, RING_OUTER } from './ringMaterial'
import Moon, { moonPeriod } from './Moon'
import Aurora from './Aurora'
import { DEFAULT_SYSTEM, SYSTEMS } from './systemData'

export { DEFAULT_SYSTEM, SYSTEMS }
export const ORBITS = DEFAULT_SYSTEM.orbits
export const SYSTEM_INFO = DEFAULT_SYSTEM.info

// God's Hands (GH-04): the live-body registry — one source of positional
// truth for rails AND ballistic bodies. System writes it every frame;
// FocusRig (App.jsx) reads it instead of recomputing orbitPosition, so
// member focus stays correct when a body goes off the rails.
export const LIVE_BODIES = new Map() // id → { pos: Vector3, mode }

// GH-10: the cannonball dial's live feed — mutable on purpose. The held
// body's frame loop writes it; the HUD dial reads it on its own rAF.
// No React state, no per-frame re-renders.
export const GOD_DIAL = { active: false, v: 0, vc: 0, ve: 0, fate: '' }

// Kepler positions as a pure function so the camera FollowRig (member
// focus, App.jsx) computes the same position from the same clock — one
// source of orbital truth.
export function orbitPosition(orbit, t, out = new THREE.Vector3()) {
  const theta = orbit.phase * Math.PI * 2 + (t * Math.PI * 2) / (K * Math.pow(orbit.r, 1.5))
  return out.set(Math.cos(theta) * orbit.r, 0, Math.sin(theta) * orbit.r)
}

// GH-04..07: kepler (rail) → held (the hand owns it) → newton (free
// fall) → gone (swallowed/escaped, respawns on the moving rail). The
// GH-01 contract, embodied. Handlers exist only when hands are allowed
// (not frozen, not capture) — inert by absence.
const RESPAWN_BEAT = 1.2 // s between a body's death and its rail return
const DRAG_R_MAX = 23.5 // can't drag past the rung's rim
const FLING_MAX = 1.8 // × v_esc at release radius — flings saturate sane

function OrbitingPlanet({ orbit, frozen, hands, onEvent, restoreSignal, choreo }) {
  const ref = useRef()
  const controls = useThree((s) => s.controls)
  const gl = useThree((s) => s.gl)
  const clock = useThree((s) => s.clock)
  const sunU = useMemo(() => TSL.uniform(new THREE.Vector3(1, 0, 0)), [])
  const scratch = useMemo(() => new THREE.Vector3(), [])

  const entry = useMemo(
    () => ({ pos: new THREE.Vector3(), mode: 'kepler' }),
    [],
  )
  // SR-10: the modest ring — shadowless and constant-lit at this scale
  // (a shadow would be sub-pixel; the sun direction changes as the
  // planet orbits, but a representative constant is honest at ~20 px)
  const ringMat = useMemo(
    () =>
      orbit.ring
        ? buildRingMaterial({
            sun: [0, 0.5, 0.86],
            scale: orbit.size,
            shadow: false,
            // Both default to Saturn's, so an entry that says only `tilt`
            // keeps exactly the material it had before these existed.
            profile: orbit.ring.profile,
            gain: orbit.ring.gain,
          })
        : null,
    [orbit],
  )
  useEffect(() => () => ringMat?.dispose(), [ringMat])
  const modeRef = useRef('kepler')
  const phys = useRef({ x: orbit.r, z: 0, vx: 0, vz: 0 })
  const hist = useRef([])
  const goneUntil = useRef(0)
  const choreoOrigin = useRef(null)

  const setMode = (m) => {
    modeRef.current = m
    entry.mode = m
    if (m !== 'held') GOD_DIAL.active = false
    onEvent?.(orbit.id, m)
  }

  // The one release estimator (GH-05/10): endpoint delta over the recent
  // history window, clamped to FLING_MAX·v_esc. The dial previews it
  // every held frame; onPointerUp applies it — dial and physics cannot
  // disagree about the throw.
  const releaseVelocity = () => {
    const h = hist.current
    const last = h[h.length - 1]
    const first = h[0]
    const dt = last.t - first.t
    let vx = 0
    let vz = 0
    if (dt > 0.016) {
      vx = (last.x - first.x) / dt
      vz = (last.z - first.z) / dt
    }
    const r = Math.max(Math.hypot(phys.current.x, phys.current.z), 0.3)
    const vMax = FLING_MAX * escapeVelocity(r)
    const speed = Math.hypot(vx, vz)
    if (speed > vMax) {
      vx *= vMax / speed
      vz *= vMax / speed
    }
    return { vx, vz }
  }

  const applyPos = (x, z) => {
    ref.current?.position.set(x, 0, z)
    sunU.value.set(-x, 0, -z).normalize()
    entry.pos.set(x, 0, z)
  }

  const place = (t) => {
    const p = orbitPosition(orbit, t, scratch)
    applyPos(p.x, p.z)
  }

  useEffect(() => {
    LIVE_BODIES.set(orbit.id, entry)
    place(0)
    return () => LIVE_BODIES.delete(orbit.id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // GH-08: restore order — back to the rail wherever it runs NOW.
  useEffect(() => {
    if (!restoreSignal) return
    if (controls) controls.enabled = true
    if (ref.current) ref.current.visible = true
    setMode('kepler')
    place(frozen ? 0 : clock.elapsedTime)
  }, [restoreSignal]) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(({ clock: c }, delta) => {
    if (frozen) return
    const t = c.elapsedTime
    // Capture choreography (shot 12-godshands): pointer hands are disabled
    // under capture, so the shot data replays the same kepler → held →
    // newton contract on the deterministic clock. Grab where the rail runs
    // at grabAt, carry along a bowed line to the drop point, release with
    // the scripted velocity — the physics from there is the real thing.
    if (choreo) {
      const m = modeRef.current
      if (m === 'kepler' && t >= choreo.grabAt && t < choreo.releaseAt) {
        choreoOrigin.current = { x: entry.pos.x, z: entry.pos.z }
        phys.current.x = entry.pos.x
        phys.current.z = entry.pos.z
        phys.current.vx = 0
        phys.current.vz = 0
        hist.current = [
          { t: performance.now() / 1000, x: entry.pos.x, z: entry.pos.z },
        ]
        setMode('held')
      } else if (m === 'held' && choreoOrigin.current) {
        if (t < choreo.releaseAt) {
          const u = (t - choreo.grabAt) / (choreo.releaseAt - choreo.grabAt)
          const s = u * u * u * (u * (u * 6 - 15) + 10)
          const o = choreoOrigin.current
          const dx = choreo.drop[0] - o.x
          const dz = choreo.drop[1] - o.z
          const len = Math.hypot(dx, dz) || 1
          const bow = Math.sin(s * Math.PI) * (choreo.bow ?? 0)
          phys.current.x = o.x + dx * s + (-dz / len) * bow
          phys.current.z = o.z + dz * s + (dx / len) * bow
        } else {
          phys.current.x = choreo.drop[0]
          phys.current.z = choreo.drop[1]
          phys.current.vx = choreo.fling[0]
          phys.current.vz = choreo.fling[1]
          choreoOrigin.current = null
          setMode('newton')
        }
      }
    }
    const mode = modeRef.current
    if (mode === 'kepler') {
      place(t)
    } else if (mode === 'held') {
      applyPos(phys.current.x, phys.current.z)
      // sample every frame, not just on pointer moves — a still hand
      // must decay the window to zero (fling-pause-release drops, it
      // does not replay the stale fling)
      const now = performance.now() / 1000
      const h = hist.current
      h.push({ t: now, x: phys.current.x, z: phys.current.z })
      while (h.length > 2 && now - h[0].t > 0.15) h.shift()
      const { vx, vz } = releaseVelocity()
      const r = Math.hypot(phys.current.x, phys.current.z)
      GOD_DIAL.active = true
      GOD_DIAL.v = Math.hypot(vx, vz)
      GOD_DIAL.vc = circularVelocity(r)
      GOD_DIAL.ve = escapeVelocity(r)
      GOD_DIAL.fate = predictFate({
        x: phys.current.x,
        z: phys.current.z,
        vx,
        vz,
      })
    } else if (mode === 'newton') {
      step(phys.current, delta)
      applyPos(phys.current.x, phys.current.z)
      const out = outcome(phys.current)
      if (out) {
        goneUntil.current = t + RESPAWN_BEAT
        if (ref.current) ref.current.visible = false
        setMode('gone')
        onEvent?.(orbit.id, out)
      }
    } else if (mode === 'gone' && t >= goneUntil.current) {
      if (ref.current) ref.current.visible = true
      setMode('kepler')
      place(t)
    }
  })

  // Pointer ray → the orbital plane (y = 0), clamped to the rung's rim.
  const planePoint = (ray) => {
    const s = -ray.origin.y / ray.direction.y
    if (!Number.isFinite(s) || s <= 0) return null
    const x = ray.origin.x + ray.direction.x * s
    const z = ray.origin.z + ray.direction.z * s
    const r = Math.hypot(x, z)
    const k = r > DRAG_R_MAX ? DRAG_R_MAX / r : 1
    return { x: x * k, z: z * k }
  }

  const handlers = hands && !frozen
    ? {
        onPointerOver: () => {
          if (!LIVE_BODIES_HELD()) gl.domElement.style.cursor = 'grab'
        },
        onPointerOut: () => {
          if (!LIVE_BODIES_HELD()) gl.domElement.style.cursor = ''
        },
        onPointerDown: (e) => {
          if (modeRef.current === 'gone') return
          e.stopPropagation()
          e.target.setPointerCapture(e.pointerId)
          if (controls) controls.enabled = false
          phys.current.x = entry.pos.x
          phys.current.z = entry.pos.z
          phys.current.vx = 0
          phys.current.vz = 0
          hist.current = [
            { t: performance.now() / 1000, x: entry.pos.x, z: entry.pos.z },
          ]
          gl.domElement.style.cursor = 'grabbing'
          setMode('held')
        },
        onPointerMove: (e) => {
          if (modeRef.current !== 'held') return
          const p = planePoint(e.ray)
          if (!p) return
          phys.current.x = p.x
          phys.current.z = p.z
          // history sampling happens in the frame loop, not here
        },
        onPointerUp: (e) => {
          if (modeRef.current !== 'held') return
          e.stopPropagation()
          if (controls) controls.enabled = true
          gl.domElement.style.cursor = ''
          // a still hand means v ≈ 0 — the body drops and falls sunward,
          // which is the whole lesson (orbits are sideways falling)
          const { vx, vz } = releaseVelocity()
          phys.current.vx = vx
          phys.current.vz = vz
          setMode('newton')
        },
      }
    : {}

  return (
    <group ref={ref} {...handlers}>
      <Planet
        recipe={orbit.recipe}
        cfg={orbit.cfg}
        radius={orbit.size}
        atmosphere={orbit.atmo}
        sun={sunU}
        spinRate={orbit.spinRate ?? 0.15}
        obliquity={orbit.obliquity}
        frozen={frozen}
      />
      {/* SW — the auroral oval, only where a magnetosphere exists to make
          one. Earth glows; Venus and Mars do not, and that asymmetry is
          the comparative-planetology lesson, not an omission. */}
      {orbit.aurora && (
        <Aurora
          radius={orbit.size}
          storm={orbit.aurora.storm}
          magPoleTilt={orbit.aurora.magPoleTilt}
          spinRate={orbit.spinRate ?? 0.15}
          strength={orbit.aurora.strength ?? 1}
          frozen={frozen}
        />
      )}
      {ringMat && (
        <group rotation={[orbit.ring.tilt, 0, 0]}>
          <mesh rotation-x={-Math.PI / 2} material={ringMat} renderOrder={2}>
            <ringGeometry
              args={[RING_INNER * orbit.size, RING_OUTER * orbit.size, 128]}
            />
          </mesh>
        </group>
      )}
      {orbit.moons?.map((mn) => (
        <Moon
          key={mn.id}
          orbitR={mn.orbitR}
          size={mn.size}
          period={moonPeriod(mn.orbitR)}
          phase={mn.phase}
          recipe={mn.recipe}
          atmosphere={mn.atmosphere || false}
          sun={sunU}
          frozen={frozen}
        />
      ))}
    </group>
  )
}

// Is any body currently in a hand? (cursor affordances only)
function LIVE_BODIES_HELD() {
  for (const e of LIVE_BODIES.values()) if (e.mode === 'held') return true
  return false
}

export default function System({
  system = DEFAULT_SYSTEM,
  frozen = false,
  hands = false,
  onGodState,
  onGodEvent,
  restoreSignal = 0,
  choreo = null,
}) {
  // one faint shared ring material — plain basic material; the node
  // pipeline converts classic materials fine
  const ringMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x39456b,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )
  useEffect(() => () => ringMaterial.dispose(), [ringMaterial])

  // Aggregate the children's discrete mode changes into the two booleans
  // the HUD cares about: is a body held right now / is any body off its
  // rail. Called on grabs and releases only — no per-frame re-renders.
  const stateRef = useRef({ held: false, wild: false })
  const report = (id, evt) => {
    onGodEvent?.(id, evt)
    let held = false
    let wild = false
    for (const e of LIVE_BODIES.values()) {
      if (e.mode === 'held') held = true
      if (e.mode !== 'kepler') wild = true
    }
    const s = stateRef.current
    if (s.held !== held || s.wild !== wild) {
      stateRef.current = { held, wild }
      onGodState?.({ held, wild })
    }
  }

  // Dev hook for the harness: live positions in screen space, so a
  // headless pointer can find a moving planet to grab.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__god = {
      bodies: LIVE_BODIES,
      mode: (id) => LIVE_BODIES.get(id)?.mode,
      screenPos: (id) => {
        const e = LIVE_BODIES.get(id)
        const st = window.__r3f
        if (!e || !st) return null
        const v = e.pos.clone().project(st.camera)
        return {
          x: (v.x / 2 + 0.5) * st.size.width,
          y: (-v.y / 2 + 0.5) * st.size.height,
          mode: e.mode,
        }
      },
    }
    return () => delete window.__god
  }, [])

  return (
    <group>
      <Star {...system.star.render} frozen={frozen} />
      {system.orbits.map((o) => (
        <group key={o.id}>
          <mesh rotation-x={-Math.PI / 2} material={ringMaterial} renderOrder={-1}>
            <ringGeometry args={[o.r - 0.012, o.r + 0.012, 160]} />
          </mesh>
          <OrbitingPlanet
            orbit={o}
            frozen={frozen}
            hands={hands}
            onEvent={report}
            restoreSignal={restoreSignal}
            choreo={choreo && choreo.body === o.id ? choreo : null}
          />
        </group>
      ))}
    </group>
  )
}

// GH-11 — the God's Hands payload: shown while the god is at work (a
// body held or off its rail). Facts anchored to real objects, verified
// against NASA/Chandra/NuSTAR, NOIRLab/ESO, and NED 2026-08-01.
export const GODS_HANDS_INFO = {
  id: 'godshands',
  name: 'God’s Hands',
  label: 'Gravity, hands-on · Newton’s cannonball',
  description:
    'You are holding a world. Throw it, and it must obey the same law as ' +
    'everything else in the sky: too slow falls into the star, too fast ' +
    'leaves forever, and in between it finds an orbit — a fall that ' +
    'keeps missing. Every orbit in the universe is exactly that.',
  facts: [
    'Newton explained orbits with a cannon on a mountaintop: fire too ' +
      'slow and the ball drops back; fast enough and it falls around ' +
      'the world forever. You are holding the cannonball.',
    'There is a real Hand of God in the sky: MSH 15-52, a hand-shaped ' +
      'X-ray nebula 150 light-years across, blown by a 19-km neutron ' +
      'star spinning 7 times a second.',
    'In the constellation Puppis, the dusty fingers of “God’s Hand” — ' +
      'cometary globule CG 4 — reach toward a galaxy, a dark cloud ' +
      'holding enough material to build several Suns.',
    'Cosmologists really do map galaxies into long “Fingers of God” — ' +
      'and every finger points at Earth. Not real structure: an ' +
      'artifact of measuring distance by redshift while galaxies swarm ' +
      'inside their clusters.',
  ],
}
