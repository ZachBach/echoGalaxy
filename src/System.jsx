import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import * as TSL from 'three/tsl'
import Planet from './Planet'
import Star from './Star'
import { PLANET_RECIPES, ATMOSPHERES } from './planetRecipes'
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

// God's Hands (GH-04): the live-body registry — one source of positional
// truth for rails AND ballistic bodies. System writes it every frame;
// FocusRig (App.jsx) reads it instead of recomputing orbitPosition, so
// member focus stays correct when a body goes off the rails.
export const LIVE_BODIES = new Map() // id → { pos: Vector3, mode }

// GH-10: the cannonball dial's live feed — mutable on purpose. The held
// body's frame loop writes it; the HUD dial reads it on its own rAF.
// No React state, no per-frame re-renders.
export const GOD_DIAL = { active: false, v: 0, vc: 0, ve: 0, fate: '' }

// The star-system rung (G3-13/14): the G1 star at center, the four worlds
// on orbits ordered by the frost-line story (molten innermost, ice
// outermost), with LITERAL Kepler-third-law periods (period ∝ r^1.5) —
// the inner world visibly laps the outer ones. Each planet carries its
// own sun uniform aimed at the origin, so terminators track the orbit.
// The tempo constant K lives in orbitPhysics.js (GH-02) so the rails and
// God's Hands free-fall share one gravitational truth.

// Kepler positions as a pure function so the camera FollowRig (member
// focus, App.jsx) computes the same position from the same clock — one
// source of orbital truth.
export function orbitPosition(orbit, t, out = new THREE.Vector3()) {
  const theta = orbit.phase * Math.PI * 2 + (t * Math.PI * 2) / (K * Math.pow(orbit.r, 1.5))
  return out.set(Math.cos(theta) * orbit.r, 0, Math.sin(theta) * orbit.r)
}

// Relative periods (r^1.5): lava 1.0× · rocky 1.9× · gas 3.5× · ice 5.4×
export const ORBITS = [
  {
    id: 'lava', recipe: PLANET_RECIPES.lava, atmo: ATMOSPHERES.lava, r: 2.3, size: 0.3, phase: 0.13,
    info: {
      name: 'The Molten World', label: 'Innermost orbit · fastest year',
      description:
        'Closest to the star, where it was too hot for anything volatile to ' +
        'survive — a world of bare melt and cooling crust, lapping every ' +
        'other planet in the system.',
      facts: [
        'Kepler’s law makes it the sprinter: its year is the system’s shortest.',
        'The glow needs no sunlight — watch its night side stay bright.',
        'Mercury, our own innermost planet, races around the Sun in 88 days.',
      ],
    },
  },
  {
    id: 'rocky', recipe: PLANET_RECIPES.rocky, atmo: ATMOSPHERES.rocky, r: 3.5, size: 0.38, phase: 0.52,
    moons: [{ id: 'moon', orbitR: 0.85, size: 0.1, phase: 0.3, recipe: 'moon' }],
    info: {
      name: 'The Rocky World', label: 'Second orbit · the temperate zone',
      description:
        'Far enough out that water stays liquid, close enough that it does ' +
        'not freeze — this is the habitable-zone seat, and it looks the part: ' +
        'oceans, continents, city lights on the night side.',
      facts: [
        'Its year runs ~1.9× the molten world’s — distance^1.5, live.',
        'The terminator line you see IS sunrise and sunset happening.',
        'In our system this seat is Earth’s: 1 AU, one year.',
        'The grey moon is tidally locked — one spin per orbit, the same ' +
          'face toward home forever. Ours was born when a Mars-sized ' +
          'world struck the young Earth, and it drifts 3.8 cm farther ' +
          'away every year.',
      ],
    },
  },
  {
    id: 'gas', recipe: PLANET_RECIPES.gas, atmo: ATMOSPHERES.gas, r: 5.3, size: 0.62, phase: 0.82,
    ring: { tilt: 0.35 }, // SR-10: every giant wears rings; this one modestly
    // MN-05: Io INSIDE-adjacent (outside the ring's 1.41 edge), Titan
    // out at 2.1 — bigger than Io, as in life
    moons: [
      { id: 'io', orbitR: 1.55, size: 0.09, phase: 0.6, recipe: 'lava' },
      { id: 'titan', orbitR: 2.1, size: 0.13, phase: 0.1, recipe: 'titan', atmosphere: 'titan' },
    ],
    info: {
      name: 'The Gas Giant', label: 'Third orbit · the system’s bouncer',
      description:
        'The biggest world in the system, built from the hydrogen the star ' +
        'did not claim. Giants like this shepherd comets and asteroids — ' +
        'Jupiter has been soaking up impacts for the inner planets for eons.',
      facts: [
        'Its year is ~3.5× the molten world’s.',
        'The bands are jet streams; the wobbles between them are shear.',
        'Jupiter outweighs every other planet in our system combined — twice over.',
        'The ember moon is an Io — kneaded molten by the giant’s tides. ' +
          'When Galileo saw four moons circling Jupiter in 1610, it was ' +
          'the first proof that not everything orbits the Earth.',
        'The orange moon is a Titan: the only kind of moon with a thick ' +
          'atmosphere — 1.5× Earth’s pressure, with methane rain, ' +
          'rivers, and seas. The only other place where liquid falls ' +
          'from clouds.',
      ],
    },
  },
  {
    id: 'ice', recipe: PLANET_RECIPES.ice, atmo: ATMOSPHERES.ice, r: 7.1, size: 0.34, phase: 0.31,
    info: {
      name: 'The Ice World', label: 'Outermost orbit · beyond the frost line',
      description:
        'Past the frost line, water is a building material, not a liquid. ' +
        'The slow outer lane of the system — everything here takes the ' +
        'long way around.',
      facts: [
        'Its year runs ~5.4× the molten world’s — the slow outer lane.',
        'The crack veins are an ice shell flexing over what lies beneath.',
        'Neptune, our outermost planet, takes 165 Earth years per orbit.',
      ],
    },
  },
]

// GH-04..07: kepler (rail) → held (the hand owns it) → newton (free
// fall) → gone (swallowed/escaped, respawns on the moving rail). The
// GH-01 contract, embodied. Handlers exist only when hands are allowed
// (not frozen, not capture) — inert by absence.
const RESPAWN_BEAT = 1.2 // s between a body's death and its rail return
const DRAG_R_MAX = 23.5 // can't drag past the rung's rim
const FLING_MAX = 1.8 // × v_esc at release radius — flings saturate sane

function OrbitingPlanet({ orbit, frozen, hands, onEvent, restoreSignal }) {
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
        ? buildRingMaterial({ sun: [0, 0.5, 0.86], scale: orbit.size, shadow: false })
        : null,
    [orbit],
  )
  useEffect(() => () => ringMat?.dispose(), [ringMat])
  const modeRef = useRef('kepler')
  const phys = useRef({ x: orbit.r, z: 0, vx: 0, vz: 0 })
  const hist = useRef([])
  const goneUntil = useRef(0)

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
        radius={orbit.size}
        atmosphere={orbit.atmo}
        sun={sunU}
        spinRate={0.15}
        frozen={frozen}
      />
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
          recipe={PLANET_RECIPES[mn.recipe]}
          atmosphere={mn.atmosphere ? ATMOSPHERES[mn.atmosphere] : false}
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
  frozen = false,
  hands = false,
  onGodState,
  onGodEvent,
  restoreSignal = 0,
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
      <Star radius={1.15} frozen={frozen} />
      {ORBITS.map((o) => (
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

// G3-17 — the system rung's educational payload (consumed by the scale
// ladder in section E).
export const SYSTEM_INFO = {
  id: 'system',
  name: 'Star System',
  label: 'One star · four worlds',
  description:
    'A star and everything its gravity holds: worlds born from the same ' +
    'flat disk of dust, which is why they all orbit in one plane, in one ' +
    'direction. Distance from the star decided what each one became.',
  facts: [
    'Astronomers measure systems in AU — one AU is the Earth–Sun ' +
      'distance, about 150 million kilometres.',
    'Kepler’s third law, live: the orbital period grows as distance^1.5 — ' +
      'watch the inner molten world lap the slow outer ice world.',
    'The star is not just the center — it IS the system: our own Sun ' +
      'holds 99.86% of the Solar System’s entire mass.',
    'The habitable zone is the ring where water can stay liquid — not so ' +
      'close it steams away, not so far it freezes.',
  ],
}
