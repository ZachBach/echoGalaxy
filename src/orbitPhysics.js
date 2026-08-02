// God's Hands physics core (GH-02) — pure module, node-smokeable.
//
// One gravitational truth for the System rung: the Kepler rails
// (orbitPosition in System.jsx) run period = K·r^1.5, so the central
// body's gravitational parameter is fixed by the same constant —
//   v_circ = 2π/(K·√r)  ⇒  μ = v_circ²·r = 4π²/K²
// — and a body released from its rail with rail velocity continues the
// identical circle under integration. Rails and free-fall agree by
// construction; no tuning seam exists between them.
//
// State shape: { x, z, vx, vz } — world units in the orbital plane
// (y = 0; the rung is planar, so the physics is honestly 2D).

export const K = 7.5 // seconds per unit^1.5 — the system's Kepler tempo
export const MU = (4 * Math.PI * Math.PI) / (K * K)

// Outcome bounds (visual-first, by design — see the GH-01 note):
// inside the star it's swallowed; past the rung's controls max (24)
// it's gone from every camera, bound or not.
export const INFALL_R = 1.15
export const ESCAPE_R = 26

export const circularVelocity = (r) => Math.sqrt(MU / r)
export const escapeVelocity = (r) => Math.sqrt((2 * MU) / r)

// The rail's velocity vector at a position (counter-clockwise in x/z,
// matching orbitPosition's advancing theta) — the handover vector for a
// body released without a fling.
export function railVelocity({ x, z }) {
  const r = Math.hypot(x, z)
  const v = circularVelocity(r)
  return { vx: (-z / r) * v, vz: (x / r) * v }
}

// Symplectic (semi-implicit) Euler, substepped: kick then drift at a
// fixed h so close star passes don't whip the integrator, with the
// frame dt clamped so a backgrounded tab can't slingshot a planet.
const DT_MAX = 1 / 30
const H = 1 / 240

export function step(body, dt) {
  let remaining = Math.min(dt, DT_MAX)
  while (remaining > 0) {
    const h = remaining < H ? remaining : H
    const r2 = Math.max(body.x * body.x + body.z * body.z, 1e-4)
    const s = -MU / (r2 * Math.sqrt(r2)) // -μ/r³
    body.vx += s * body.x * h
    body.vz += s * body.z * h
    body.x += body.vx * h
    body.z += body.vz * h
    remaining -= h
  }
  return body
}

// Specific orbital energy — negative is bound; the smoke's conserved
// quantity and section C's cannonball dial both read it.
export function orbitalEnergy({ x, z, vx, vz }) {
  const r = Math.hypot(x, z)
  return (vx * vx + vz * vz) / 2 - MU / r
}

export function outcome({ x, z }) {
  const r = Math.hypot(x, z)
  if (r < INFALL_R) return 'infall'
  if (r > ESCAPE_R) return 'escape'
  return null
}

// The cannonball dial's oracle (GH-10): given a position and a candidate
// release velocity, name the fate analytically before it happens.
// Conic-section math, aligned with outcome()'s visual-first bounds: a
// bound ellipse whose periapsis dips inside the star is an infall, and
// one whose apoapsis leaves the rung's rim is reported as an escape —
// the dial must agree with what the eye will see.
export function predictFate(body) {
  const r = Math.hypot(body.x, body.z)
  const v2 = body.vx * body.vx + body.vz * body.vz
  const eps = v2 / 2 - MU / r
  if (eps >= 0) return 'escape'
  const L = body.x * body.vz - body.z * body.vx
  const a = -MU / (2 * eps)
  const e = Math.sqrt(Math.max(0, 1 + (2 * eps * L * L) / (MU * MU)))
  if (a * (1 - e) < INFALL_R) return 'infall'
  if (a * (1 + e) > ESCAPE_R) return 'escape'
  return 'orbit'
}
