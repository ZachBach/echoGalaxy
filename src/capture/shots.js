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

// follow: names a top-level orbit id ('sol-saturn'). The shot's from/via/to
// then read as OFFSETS from that body instead of absolute world positions,
// and the camera aims at the body rather than at `target`. Use it for any
// close pass on a Solar System world — at those distances a planet's own
// orbital motion walks it out of a fixed frame inside a couple of seconds.
// Kepler positions come from System's orbitPosition on the capture clock,
// so the camera and the drawn rails agree by construction.
//
// sky: overrides the real-sky mode for this shot alone — off | stars |
// zodiac | all. Everything unset renders the shipping default (zodiac).

// Reference: the rung camera defaults and distance clamps from App.jsx.
//   planet  [0, 0.8, 5.6]   min 2.6   max 12
//   system  [0, 5.2, 14]    min 3     max 28
//   nebula  [0, 0.2, 4.6]   min 2.6   max 9
//   galaxy  [0, 6, 12]      min 4     max 28
//   group   [0, 16, 40]     min 12    max 90
//   cluster [0, 3.5, 14]    min 6     max 34
//
// The rig drives the camera directly and disables OrbitControls, so a shot
// path is NOT clamped by the rung's min/max. Those numbers describe what a
// user can reach, not what a shot may.
//
// Framing arithmetic used throughout, at BASE_H_FOV 45.2:
//   fovLock 'h'  visible half-width  = 0.416 * d, at every aspect
//   fovLock 'v'  visible half-height = 0.521 * d; half-width = that * aspect
// so a subject of radius R needs d >= R / 0.416 with 'h'. The Solar System
// numbers below are all derived that way against the real orbit radii in
// systemData.js — Mercury 2.2 out to Neptune 12.55.

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
    // The Solar System. Re-authored 2026-08-11: this rung used to hold a
    // generic four-body system and now holds the real eight-planet one, so
    // the old path (d 9.0 -> 15.0, half-width 6.2) framed as far as Jupiter
    // and cropped everything beyond it. Neptune orbits at 12.55.
    //
    // The move is the reveal. It opens low and close, where only the inner
    // four fit and Mercury is visibly racing, then climbs and pulls back to
    // 33 units — half-width 13.8, the whole family with margin. Kepler does
    // the rest: by the end the inner worlds have swept real arc while the
    // outer ones have barely moved, which is the lesson stated as motion
    // rather than as a caption. Mercury laps in 24.5 s, so eight seconds is
    // a third of its year; do not trim this without redoing that sum.
    //
    // Rising from 11 degrees above the plane to 25 also opens the orbit
    // rails from near-edge-on into ellipses, which is what makes the disc
    // read as a disc.
    id: '05-system',
    scale: 'system',
    seconds: 8.0,
    ease: 'inout',
    fovLock: 'h',
    from: { pos: [0, 2.6, 13.0], target: [0, 0, 0] },
    via: { pos: [0, 8.0, 22.0] },
    to: { pos: [0, 14.0, 30.0], target: [0, 0, 0] },
  },
  {
    // The Eagle Nebula is the visual and conceptual bridge between a single
    // stellar system and a galaxy. Its taller field needs a gentle sideways
    // move instead of a pullback, so the pillars read as volume.
    id: '05b-pillars',
    scale: 'nebula',
    seconds: 4.6,
    ease: 'inout',
    fovLock: 'h',
    from: { pos: [0.1, 0.25, 4.7], target: [-0.25, 0.55, 0] },
    via: { pos: [0.8, 0.7, 5.0], target: [-0.25, 0.55, 0] },
    to: { pos: [-0.5, 1.0, 5.6], target: [-0.25, 0.55, 0] },
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

  // ——— Post-roadmap wonders (promo capture manifest, 2026-08-03). New
  // shots append after 10-group so already-rendered frame sets stay valid.

  {
    // The event horizon. A slow arc across the face: the photon ring stays
    // pinned while the lensed background streams past, and the swing from
    // camera-right to camera-left shows the Doppler-bright approaching side
    // of the disc trading places. Verify both on the contact sheet.
    id: '11-blackhole',
    scale: 'planet',
    index: 5, // PLANET_TYPES: ... gas(3), star(4), black hole(5), ringed(6) ...
    seconds: 5.0,
    ease: 'inout',
    fovLock: 'v',
    from: { pos: [2.8, 0.7, 3.4], target: [0, 0, 0] },
    via: { pos: [1.2, 0.9, 4.0] },
    to: { pos: [-1.6, 0.6, 3.8], target: [0, 0, 0] },
  },
  {
    // God's Hands, scripted. Capture disables the pointer hands (and hides
    // the fate dial), so the shot carries a choreography block that
    // OrbitingPlanet plays back on the deterministic clock: grab the molten
    // world (TRAPPIST-1 b), carry it outward for a second, release it
    // slightly too fast for a circular orbit — Newton's cannonball, off the
    // rail and into a wide ellipse.
    id: '12-godshands',
    scale: 'system',
    // On the system rung `index` means member FOCUS, not which system —
    // `system` picks the system by id (initialSystemIndex honors it).
    system: 'trappist-1', // its innermost world is the molten one
    seconds: 6.0,
    ease: 'inout',
    fovLock: 'h',
    choreo: {
      body: 'trappist-b',
      grabAt: 0.5,
      releaseAt: 1.5,
      drop: [3.0, 1.8], // r 3.50 — between the d and e rails
      bow: 0.35, // sideways arc of the carry, world units
      fling: [-0.2996, 0.4993], // 1.30 × v_circ at r 3.50, prograde tangent
    },
    from: { pos: [0, 3.0, 8.0], target: [0, 0, 0] },
    via: { pos: [0.5, 4.2, 9.6] },
    to: { pos: [0, 6.0, 12.5], target: [0, 0, 0] },
  },
  {
    // The Crab: star death answering the Pillars' star birth. Same gentle
    // lateral drift as 05b so the filament web reads as volume, with enough
    // dwell for ~9 beats of the 2 Hz pulsar heart.
    id: '13-crab',
    scale: 'nebula',
    index: 1, // nebulaList: Pillars(0), Crab(1)
    seconds: 4.6,
    ease: 'inout',
    fovLock: 'h',
    from: { pos: [0.4, 0.15, 4.4], target: [0, 0.1, 0] },
    via: { pos: [1.0, 0.55, 4.8], target: [0, 0.1, 0] },
    to: { pos: [-0.6, 0.85, 5.2], target: [0, 0.1, 0] },
  },
  {
    // Coma. Hold real space long enough to read the cluster, then zSpaceAt
    // fires the redshift-space morph mid-shot and the Finger of God
    // stretches toward the camera while it climbs.
    id: '14-coma',
    scale: 'cluster',
    seconds: 6.0,
    ease: 'inout',
    fovLock: 'h',
    zSpaceAt: 2.2, // seconds — Cluster drives its own glide from this cue
    from: { pos: [0.8, 3.0, 14.5], target: [0, 0, 0] },
    via: { pos: [0, 4.2, 13.0] },
    to: { pos: [-1.2, 5.2, 12.2], target: [0, 0, 0] },
  },

  // ——— The rest of the planet rung (2026-08-11). The montage showed four
  // of the twelve bodies; these are the eight that had never been captured
  // as frames. Appended after 14-coma so the existing 9:16 set stays valid.
  //
  // PLANET_TYPES indices, confirmed against planetData.js — note that star
  // (4) and blackHole (5) are a spread and a bare identifier, so they have
  // no literal `id:` line and a naive grep of that file miscounts:
  //   rocky 0, lava 1, ice 2, gas 3, star 4, blackHole 5, ringed 6,
  //   rings 7, desert 8, ocean 9, cloud 10, iceGiant 11
  //
  // Bare planets are radius 1.7 (Planet.jsx default — App passes no radius),
  // which is why the 3.0–4.5 distance band and fovLock 'v' of the earlier
  // planet shots is reused here. The two ring shots are the exception and
  // carry their own geometry note below.

  {
    // Lava. The rocky world's shot sells city lights on the dark side;
    // this one sells the opposite reading of the same terminator — the
    // melt is emissive, so it needs no sun and the night limb burns just
    // as bright. Swing well past the terminator so that lands.
    id: '15-lava',
    scale: 'planet',
    index: 1,
    seconds: 5.0,
    ease: 'inout',
    fovLock: 'v',
    from: { pos: [3.0, 0.5, 3.3], target: [0, 0, 0] },
    via: { pos: [1.0, 0.7, 3.8] },
    to: { pos: [-2.2, 0.4, 3.4], target: [0, 0, 0] },
  },
  {
    // Ice. The worley vein network is the subject and it is fine detail,
    // so stay close and move slowly. The climb at the end catches the
    // fresnel glaze on the limb, which is the recipe's other half.
    id: '16-ice',
    scale: 'planet',
    index: 2,
    seconds: 4.2,
    ease: 'inout',
    fovLock: 'v',
    from: { pos: [1.6, -0.3, 3.2], target: [0, 0, 0] },
    via: { pos: [0.4, 0.3, 3.5] },
    to: { pos: [-1.1, 0.9, 3.4], target: [0, 0, 0] },
  },
  {
    // The ringed world. Ring geometry: RING_OUTER 2.27 x RingedWorld's
    // non-alone scale 1.15 = 2.61 units of disc radius, ~5.2 across —
    // twice a bare planet's width, so this is fovLock 'h' and sits much
    // further out than the planet shots above. At h-fov 45.2 the visible
    // half-width is about 0.416*d, so d must clear ~6.3; the path holds
    // 6.8–7.2 for margin.
    //
    // The move starts near the ring plane and climbs, opening the disc as
    // it goes — that is what brings the planet's shadow across the far
    // side of the rings into view, which planetData calls out as the proof
    // they are a real disc and not a painted halo.
    id: '17-ringed',
    scale: 'planet',
    index: 6,
    seconds: 5.5,
    ease: 'inout',
    fovLock: 'h',
    from: { pos: [4.6, 0.3, 5.0], target: [0, 0, 0] },
    via: { pos: [2.6, 2.0, 6.0] },
    to: { pos: [-1.8, 3.2, 6.2], target: [0, 0, 0] },
  },
  {
    // The rings alone. Wider still — scale 1.55 puts the outer edge at
    // 2.27*1.55 = 3.52, ~7.0 across, needing d over ~8.5 (max on this rung
    // is 12, so the path's 9.0–9.2 fits).
    //
    // Inverted from 17 on purpose: start high with the disc open, then
    // descend to near edge-on so it collapses toward a line. The copy's
    // whole claim is that the sheet is ten metres thin — the only way a
    // camera can argue that is to look along it.
    id: '18-rings',
    scale: 'planet',
    index: 7,
    seconds: 5.0,
    ease: 'inout',
    fovLock: 'h',
    from: { pos: [0, 4.5, 8.0], target: [0, 0, 0] },
    via: { pos: [2.5, 2.0, 8.5] },
    to: { pos: [5.0, 0.25, 7.5], target: [0, 0, 0] },
  },
  {
    // Desert. Slowest spin on the rung (0.028), so the camera supplies the
    // motion rather than the body. Drift laterally across the basins and
    // climb slightly into the polar cap at the end.
    id: '19-desert',
    scale: 'planet',
    index: 8,
    seconds: 4.0,
    ease: 'inout',
    fovLock: 'v',
    from: { pos: [2.0, 0.9, 3.4], target: [0, 0, 0] },
    to: { pos: [-1.4, 1.4, 3.6], target: [0, 0, 0] },
  },
  {
    // Ocean. The drifting current field is what separates this from a
    // recolored rocky world, and it only reads close in. Start slightly
    // below the equator so the sparse islands cross frame as it rises.
    id: '20-ocean',
    scale: 'planet',
    index: 9,
    seconds: 4.2,
    ease: 'inout',
    fovLock: 'v',
    from: { pos: [1.8, -0.5, 3.1], target: [0, 0, 0] },
    via: { pos: [0.3, 0.1, 3.4] },
    to: { pos: [-1.7, 0.6, 3.3], target: [0, 0, 0] },
  },
  {
    // Cloud. The point of this world is refusal: the visible face is
    // atmosphere, not ground. Slowest spin of all (0.018) and the heaviest
    // atmosphere preset (strength 0.78), so push gently inward and let the
    // deck stay stubbornly opaque as it fills the frame.
    id: '21-cloud',
    scale: 'planet',
    index: 10,
    seconds: 4.0,
    ease: 'inout',
    fovLock: 'v',
    from: { pos: [1.2, 0.6, 4.0], target: [0, 0, 0] },
    to: { pos: [-0.6, 1.0, 3.2], target: [0, 0, 0] },
  },
  {
    // Ice giant. Same logic as 03-gas — lateral drift so bandedFlow reads
    // as movement in the bands — but eight bands instead of six and the
    // methane-blue ramp, which is the whole reason it is a separate
    // category from the gas giant rather than a recolor.
    id: '22-ice-giant',
    scale: 'planet',
    index: 11,
    seconds: 4.0,
    ease: 'inout',
    fovLock: 'v',
    from: { pos: [0.9, 0.5, 3.3], target: [0, 0, 0] },
    to: { pos: [-1.1, 1.2, 3.7], target: [0, 0, 0] },
  },

  // ——— The astronomy layer (2026-08-11). The real sky, the real Solar
  // System, and its real tilts all landed after the last capture session,
  // so nothing on disk shows any of it. These six shots are that content.
  //
  // The four `follow` shots are close passes on worlds that are moving:
  // Earth laps its orbit in 60 s and Saturn in 184 s, which at these
  // distances walks either of them clean out of a fixed frame. The rig
  // rides them instead — see the `follow` note at the top of this file.

  {
    // The plane, stated once. Nearly edge-on (2.5 degrees above it), which
    // collapses two different things onto the same line across the frame:
    // the orange ecliptic ring — the Sun's annual path, drawn on a shell 57
    // units out — and the orbital rails of the planets a few units away.
    // They coincide because they are the same plane, and the only way a
    // camera can make that argument is to look along it until the two
    // become one line. The lateral drift keeps parallax alive so the frame
    // still reads as depth rather than as a flat diagram.
    // Contact sheet 2026-08-11: the first pass ran at d 15.7 and swung
    // within 3.3 units of Neptune, which filled a third of the frame and
    // cropped on the edge. Pulled back to d ~19 — still 3 degrees above the
    // plane, so the line still reads as a line — which puts Neptune 7 units
    // out and turns it from an obstruction into a foreground marker sitting
    // on the very line the shot is about.
    id: '23-ecliptic',
    scale: 'system',
    seconds: 5.5,
    ease: 'inout',
    fovLock: 'h',
    from: { pos: [9.0, 1.0, 17.0], target: [0, 0, 0] },
    via: { pos: [0, 0.6, 19.5] },
    to: { pos: [-9.0, 1.4, 16.5], target: [0, 0, 0] },
  },
  {
    // All 88 figures, swept. The zodiac shot's payload is a measured claim
    // from SKY_INFO — zodiac figure stars sit a median 6.1 degrees off the
    // ecliptic against 39.6 for every other constellation — so the frame
    // has to hold both the ecliptic line and enough sky either side of it
    // for the crowding to be visible. A 65-degree azimuth sweep at low
    // elevation does that, and the stars are real: 8,355 Bright Star
    // Catalogue entries at true position and true colour.
    id: '24-zodiac',
    scale: 'system',
    sky: 'all',
    seconds: 5.0,
    ease: 'inout',
    fovLock: 'h',
    from: { pos: [13.0, 2.2, 18.0], target: [0, 0, 0] },
    to: { pos: [-13.0, 2.2, 18.0], target: [0, 0, 0] },
  },
  {
    // Saturn, at its real 26.7-degree obliquity, with the rings riding the
    // equator because the data derives both from one obliquity call. Same
    // move as 17-ringed — start near the ring plane and climb so the disc
    // opens — but on the real body this time, and following it.
    //
    // Distance ~4.3 gives half-width 1.79 against a ring outer edge of
    // 2.27 * 0.54 = 1.23, so the rings fill about seventy percent of the
    // half-frame and Enceladus (1.4) and Rhea (1.72) drift through the
    // corners. Titan at 2.1 stays just outside, which is the price of
    // having the rings read at all.
    id: '25-saturn-real',
    scale: 'system',
    follow: 'sol-saturn',
    seconds: 5.5,
    ease: 'inout',
    fovLock: 'h',
    from: { pos: [3.0, 0.3, 3.0] },
    via: { pos: [1.8, 1.5, 3.6] },
    to: { pos: [-1.2, 2.5, 3.4] },
  },
  {
    // Earth and its Moon: the 23.44-degree tilt that makes seasons, and the
    // one companion in the scene that is tidally locked, so the same face
    // holds through the whole move.
    //
    // NOT an aurora shot, despite Aurora.jsx and spaceWeather.js existing.
    // System.jsx mounts the auroral oval under `orbit.aurora`, and no orbit
    // in systemData.js defines that key — so nothing auroral renders today.
    // If that data lands later this is the shot to re-frame for it: the oval
    // is a polar feature and would want the night-side pole, which means
    // climbing further and coming round toward the terminator.
    //
    // Widened after the contact sheet: at d 2.7 the Moon reached the frame
    // edge and collided with Saturn passing behind. d ~3.2 gives half-width
    // 1.33 against the Moon's 0.85 orbit, so the pair hold together with
    // room to spare.
    id: '26-earth-real',
    scale: 'system',
    follow: 'sol-earth',
    seconds: 5.5,
    ease: 'inout',
    fovLock: 'h',
    from: { pos: [2.2, 0.6, 2.2] },
    via: { pos: [1.2, 1.1, 2.9] },
    to: { pos: [-1.9, 1.3, 2.6] },
  },
  {
    // Uranus on its side. There are no rings and no moons in the data for
    // this world, so the 97.77-degree obliquity has to be carried by the
    // banding alone — and it is, completely: the ice-giant recipe's eight
    // bands run with the equator, and the equator here is vertical. A
    // banded world whose stripes are the wrong way round is the entire
    // shot, and it needs no annotation to land.
    // Contact sheet 2026-08-11: d 2.0 cropped the disc on both edges — the
    // atmosphere shell and its glow add roughly fifteen percent past the
    // 0.43 body radius, which the first estimate did not carry. d ~2.6 sits
    // the whole globe inside the frame, and the banding then reads as what
    // it is: concentric rings around a pole pointed at the camera, rather
    // than the horizontal stripes every other banded world in the cut has.
    id: '27-uranus-tilt',
    scale: 'system',
    follow: 'sol-uranus',
    seconds: 4.5,
    ease: 'inout',
    fovLock: 'v',
    from: { pos: [1.9, 0.45, 1.75] },
    to: { pos: [-1.45, 0.95, 1.95] },
  },
  {
    // Jupiter and the four moons Galileo saw. Distance ~5.15 gives
    // half-width 2.14, which just holds Callisto's 1.95 orbit — the whole
    // Galilean set inside one frame, with Io at 1.0 sweeping fastest.
    // Jupiter's own obliquity is 3.13 degrees, almost upright, and that
    // near-absence is worth having next to Uranus in the cut.
    id: '28-jupiter-moons',
    scale: 'system',
    follow: 'sol-jupiter',
    seconds: 5.0,
    ease: 'inout',
    fovLock: 'h',
    from: { pos: [3.6, 0.6, 3.6] },
    via: { pos: [2.0, 1.6, 4.6] },
    to: { pos: [-2.4, 2.0, 4.2] },
  },
  {
    // The auroral oval, which needed data before it needed a camera: the
    // component and spaceWeather.js were complete for weeks while no orbit
    // defined an `aurora` key, so nothing rendered. Now Earth has one.
    //
    // This is a separate shot from 26-earth-real rather than a re-frame of
    // it, because the two want opposite things. 26 wants the Earth-Moon pair
    // in one frame, which means standing off at d 3.2 — and at that distance
    // the oval is a thin additive shell edge-on against a lit globe, which is
    // to say invisible. This one gives up the Moon and closes to 1.9.
    //
    // Aurorae read at the LIMB, where the line of sight passes lengthwise
    // through the shell — which is also the only way anyone has ever
    // photographed one from orbit. So the move stays close and rolls the pole
    // across frame rather than looking straight down at it.
    //
    // Earth's magnetic axis leans 11° off its spin axis and the oval rides
    // the spin, so over four seconds the ring visibly wobbles rather than
    // sitting still. That wobble is the shot's second payload and the reason
    // it is not a still.
    id: '29-aurora',
    scale: 'system',
    follow: 'sol-earth',
    seconds: 4.5,
    ease: 'inout',
    fovLock: 'v',
    from: { pos: [-0.55, 0.95, 1.55] },
    via: { pos: [0.35, 1.15, 1.45] },
    to: { pos: [1.15, 0.85, 1.25] },
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
