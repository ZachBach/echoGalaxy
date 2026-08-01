// echoGalaxy capture shot list.
//
// One entry per clip. Each shot pins a rung and an object index, then runs
// a camera path from `from` to `to` (with an optional `via` midpoint that
// turns the move into a Catmull-Rom curve instead of a straight line).
//
// Positions are in the same world units as the SCALES table in App.jsx, so
// they respect each rung's OrbitControls min/max distance. Numbers here are
// starting values, not verified framing. Render the contact sheet, look at
// it, adjust. That loop is cheap and it is the whole point of authoring the
// path in code.
//
// fovLock:
//   'h' — hold horizontal field of view constant across aspects. Use for
//         wide subjects (galaxy disc, Local Group) so the 9:16 render does
//         not clip the edges off.
//   'v' — hold vertical field of view constant. Use for tight subjects
//         (a single planet) so the body keeps filling the frame height.
//
// ease: 'inout' for shots that start and stop, 'linear' for shots that are
// mid-move on both sides of a dissolve (keeps momentum reading continuous
// across the cut).

// Reference: the rung camera defaults and distance clamps from App.jsx.
//   planet  [0, 0.8, 5.6]   min 2.6   max 12
//   system  [0, 4.5, 11]    min 3     max 24
//   galaxy  [0, 6, 12]      min 4     max 28
//   group   [0, 16, 40]     min 12    max 90

// Base horizontal field of view, derived from the app's vertical fov of 55
// at the 4:5 master aspect. See fovFor() in CaptureRig.jsx.
export const BASE_H_FOV = 45.2

export const ASPECTS = {
  '4x5': { w: 1080, h: 1350 },
  '9x16': { w: 1080, h: 1920 },
  '1x1': { w: 1080, h: 1080 },
}

export const SHOTS = [
  {
    // Cold open. All three platforms autoplay muted, so the first second has
    // to earn the stop. Lead with the widest, strangest frame, then cut hard
    // down to a planet surface and run the journey outward from there.
    id: '01-hook',
    scale: 'group',
    seconds: 1.4,
    ease: 'linear',
    fovLock: 'h',
    from: { pos: [0, 20.0, 58.0], target: [0, 0, 0] },
    to: { pos: [0, 20.6, 59.4], target: [0, 0, 0] },
  },
  {
    // Rocky world. The move swings the terminator across frame so the city
    // lights come up on the night side as it goes. That detail is the single
    // best "this is a shader, not a texture" moment on the planet rung.
    id: '02-rocky',
    scale: 'planet',
    index: 0,
    seconds: 5.0,
    ease: 'inout',
    fovLock: 'v',
    from: { pos: [3.2, 0.6, 3.4], target: [0, 0, 0] },
    via: { pos: [1.4, 0.5, 4.0] },
    to: { pos: [-1.2, 0.9, 4.2], target: [0, 0, 0] },
  },
  {
    // Gas giant. Slow lateral drift, close in, so bandedFlow reads as motion
    // in the bands rather than as a still image.
    id: '03-gas',
    scale: 'planet',
    index: 3,
    seconds: 4.2,
    ease: 'inout',
    fovLock: 'v',
    from: { pos: [0.6, 0.4, 3.0], target: [0, 0, 0] },
    to: { pos: [-0.9, 1.1, 3.6], target: [0, 0, 0] },
  },
  {
    // Star. Start inside the corona glow and pull off it. This is the
    // handoff shot into the system rung.
    id: '04-star',
    scale: 'planet',
    index: 4,
    seconds: 3.0,
    ease: 'linear',
    fovLock: 'v',
    from: { pos: [0, 0.3, 3.2], target: [0, 0, 0] },
    to: { pos: [0, 1.4, 6.8], target: [0, 0, 0] },
  },
  {
    // Star system. This one needs real dwell. The whole payload is that the
    // inner molten world laps the outer ice world, and that only reads if
    // the shot is long enough to watch it happen. Do not trim this below
    // about seven seconds without checking the orbit periods first.
    id: '05-system',
    scale: 'system',
    seconds: 7.0,
    ease: 'inout',
    fovLock: 'h',
    from: { pos: [0, 2.2, 9.0], target: [0, 0, 0] },
    via: { pos: [0, 5.0, 11.4] },
    to: { pos: [0, 8.5, 15.0], target: [0, 0, 0] },
  },
  {
    // Four Hubble classes on one continuous descending arc. Shot 06 drops
    // toward the disc plane, then 07 through 09 keep the same motion going
    // so the dissolves feel like one move rather than four separate ones.
    id: '06-spiral',
    scale: 'galaxy',
    index: 0,
    seconds: 3.6,
    ease: 'inout',
    fovLock: 'h',
    from: { pos: [0, 9.5, 14.0], target: [0, 0, 0] },
    to: { pos: [0, 4.2, 12.4], target: [0, 0, 0] },
  },
  {
    id: '07-barred',
    scale: 'galaxy',
    index: 1,
    seconds: 3.2,
    ease: 'linear',
    fovLock: 'h',
    from: { pos: [0, 4.0, 12.6], target: [0, 0, 0] },
    to: { pos: [0, 6.0, 13.4], target: [0, 0, 0] },
  },
  {
    // Elliptical. The veil is nearly absent here on purpose, and that is a
    // real physics point (gas-poor system), so hold it long enough that the
    // difference from the two spirals lands.
    id: '08-elliptical',
    scale: 'galaxy',
    index: 2,
    seconds: 3.2,
    ease: 'linear',
    fovLock: 'h',
    from: { pos: [0, 6.2, 13.2], target: [0, 0, 0] },
    to: { pos: [0, 8.0, 14.4], target: [0, 0, 0] },
  },
  {
    id: '09-irregular',
    scale: 'galaxy',
    index: 3,
    seconds: 3.2,
    ease: 'inout',
    fovLock: 'h',
    from: { pos: [0, 8.2, 14.2], target: [0, 0, 0] },
    to: { pos: [0, 5.6, 13.0], target: [0, 0, 0] },
  },
  {
    // Final pull back. Andromeda and Triangulum enter frame as the camera
    // retreats. End wide and hold, so the last frame is the one that sits
    // in the feed after playback stops.
    id: '10-group',
    scale: 'group',
    seconds: 6.0,
    ease: 'inout',
    fovLock: 'h',
    from: { pos: [0, 12.0, 34.0], target: [0, 0, 0] },
    via: { pos: [0, 17.0, 52.0] },
    to: { pos: [0, 24.0, 74.0], target: [0, 0, 0] },
  },
]

// Cross-dissolve length used between every pair of clips, in seconds.
// Total runtime is sum(seconds) minus DISSOLVE * (SHOTS.length - 1).
export const DISSOLVE = 0.4

export function shotById(id) {
  return SHOTS.find((s) => s.id === id) ?? null
}

export function totalSeconds() {
  const raw = SHOTS.reduce((a, s) => a + s.seconds, 0)
  return raw - DISSOLVE * (SHOTS.length - 1)
}
