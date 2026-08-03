# echoGalaxy

A free, open educational tool for exploring galaxies and the universe.

**The scale journey**: five rungs — Planet → Star System → Nebula →
Galaxy → Local Group — climbable from the HUD ladder, `?scale=` links, or
by zooming past the edge of any rung (scroll out at the stop to go up a
scale). Every rung
carries its own facts ladder; legacy `?view=planets` links still work.
Within the rungs:

- **Galaxies** — orbit a procedurally generated galaxy and cycle the four
  broad Hubble classes — spiral, barred spiral, elliptical, irregular.
  Since G2 the galaxy is generated **entirely on the GPU**: every star's
  position, blackbody color (Kelvin through the published Planckian-locus
  table), size, and twinkle derives in-shader from its instance index —
  zero buffers, and switching types is a uniform swap. Each galaxy floats
  in its own fbm nebula veil, palette-keyed to real emission physics
  (the gas-poor elliptical's veil is nearly absent on purpose).
- **Planets** — eight bodies built from tsl-lib shader nodes: rocky (with
  city lights on the night side), lava, ice, gas giant (the `bandedFlow`
  node born here and promoted upstream), a star with a live corona, a
  black hole — event horizon, photon ring, and a Doppler-beamed accretion
  disc (the approaching side really is brighter) — and a Saturn, twice:
  **The Ringed World** (Saturn-true ring radii, the Cassini Division, and
  the planet's shadow biting the far side of the ring plane) and **The
  Rings, Alone** (the planet removed — a sheet of orbiting snowballs,
  proportionally thinner than paper, young enough that dinosaurs may
  have seen a ringless Saturn).

- **Star System** — the star and four worlds on literal Kepler-third-law
  orbits (the inner molten world laps the outer ice world), each
  terminator tracking its own sun direction — and now **moons**: the
  rocky world's grey companion is tidally locked (one spin per orbit,
  same face home forever — the lock is exact in the shader, not
  narrated), and the ringed giant carries an ember Io and a
  haze-shrouded Titan. Moons ride God's Hands flings with their world,
  and their tempo constant differs from the planets' for the honest
  reason: Kepler's constant belongs to the central body. And **God's
  Hands**: grab
  any planet and fling it — the moment you let go it obeys real
  Newtonian gravity (the same constant the rails run on). Too slow falls
  into the star, too fast escapes forever, in between it finds a new
  orbit; a live dial names your throw's fate before you release, and the
  facts introduce the sky's real hands of god — the MSH 15-52 pulsar
  nebula, cometary globule CG 4, and cosmology's Fingers-of-God effect.
  One click restores the heavens to their rails.
- **Nebula** — the Pillars of Creation (Eagle Nebula, M16), raymarched:
  the density field (noise-sculpted columns, photoevaporation rim, EGG
  star-knots pulsing at the fingertips) bakes once at boot into a z-slice
  atlas texture, so the volume march runs at two texture taps per step —
  the young cluster doing the eroding shines above the tips, along the
  exact light direction the field is shaded by.
- **Local Group** — the real neighbourhood: the barred Milky Way with the
  Magellanic Clouds, Andromeda with M32/M110, Triangulum — 24,000 stars
  total, the same budget as one galaxy. A deep-space STARFIELD skybox
  (baked to an equirect at boot) sits behind every rung.

Every entry ships with a short explainer and a few facts — the educational
payload is the point.

**On a phone**, echoGalaxy is a full touch app: one-finger orbit, pinch
zoom, pinch **past** the edge of a scale to climb the ladder, and God's
Hands works by fingertip — grab a planet and fling it. The HUD compacts
(facts collapse behind a toggle so the sky stays reachable), portrait
framing pushes the camera back so nothing crops, and the whole app is an
installable PWA that **boots offline** — every rung, every shader, no
connection. This is the foundation the Play Store build (Trusted Web
Activity) wraps.

## Stack

Vite + React 19 + [@react-three/fiber](https://r3f.docs.pmnd.rs/) + three's
`WebGPURenderer` — WebGPU when the browser has it, three's WebGL2 backend
otherwise (`?backend=webgl` forces the fallback for side-by-side testing).
Bloom is three's node-based `RenderPipeline` + `BloomNode`.

## Run

```
npm install
npm run dev
```

Open the printed localhost URL. `npm run build` produces a production bundle.

## Structure

- `src/App.jsx` — canvas, the Galaxies|Planets view switcher, HUD, badge.
- `src/renderer.js` — async WebGPURenderer factory (backend pick + dev flags).
- `src/Effects.jsx` — node-based bloom (`RenderPipeline`, owns the frame).
- `src/Galaxy.jsx` — the persistent galaxy rig (one sprite for the app
  lifetime; uniform/material swaps on type change).
- `src/galaxyShader.js` — the in-shader generation: disc/elliptical/
  irregular position fields from `instanceIndex` hashes, blackbody star
  color, twinkle, and the nebula veil (spiralArm/densityFalloff prototypes
  live here).
- `src/galaxyData.js` — galaxy classes: educational copy + the cfg numbers
  the shader uniforms read (pure data since G2).
- `src/Planet.jsx` + `src/planetMaterial.js` — the lit-body pipeline: body-frame
  sampling (`spunDir`), terminator composition, atmosphere shell.
- `src/planetRecipes.js` — rocky / lava / ice / gas surface recipes +
  atmosphere presets, built from vendored tsl-lib nodes.
- `src/planetData.js` — the planet catalogue (copy + cfg per type).
- `src/Star.jsx` + `src/starMaterial.js` — fireRamp plasma + streaks corona.
- `src/BlackHole.jsx` + `src/blackHoleMaterial.js` — event horizon, photon
  ring, Keplerian-shear accretion disc with Doppler beaming, lensed-halo
  cheat.
- `src/sun.js` — the one shared sun-direction uniform.
- `src/orbitPhysics.js` — God's Hands physics: the Kepler tempo constant
  `K`, μ = 4π²/K², a substepped symplectic integrator, and the analytic
  fate oracle behind the cannonball dial (pure module, node-smoked).
- `src/Pillars.jsx` + `src/pillarsMaterial.js` + `src/pillarsField.js` —
  the nebula rung: SDF+noise density field (pure module), boot-time
  z-slice atlas bake, bounded raymarch, cluster stars.
- `src/Moon.jsx` — orbiting, tidally-locked `<Planet>` wrapper (the
  lock is construction: spinRate = +2π/period, derived not tuned);
  cratered-regolith + Titan-haze recipes live in planetRecipes.
- `src/RingedWorld.jsx` + `src/ringMaterial.js` — the Saturn pair:
  Saturn-true radial ring profile (C/B/Cassini/A + Encke), analytic
  planet shadow (two dot products), the sun pre-rotated into each local
  frame at build time. The System rung's gas giant borrows the ring.
- `src/Lab.jsx` / `src/PlanetLab.jsx` — dev-only scenes (`?lab=1` /
  `?planet=1`) for node portability and planet verification.
- `src/tsl-lib/` — **vendored copy** of the Aurelius TSL library. Do not edit;
  see below.

## Vendored tsl-lib

`src/tsl-lib/` is a one-way copy of `../tsl-lib/src` (the library is
dependency-injected — nodes take the `three/tsl` namespace as a parameter and
import nothing, which is what makes it portable across three versions). New
nodes are born upstream, bench-gated there, then synced here — deploys stay
self-contained, no `file:` deps.

```
npm run sync:tsl    # sync from ../tsl-lib + full vendor gate
npm run check:tsl   # gate only: static checks + runtime smoke
```

The gate: `check-tsl-lib` (every vendored import stays inside `src/tsl-lib`,
every `TSL.<member>` the library touches exists in the installed three),
`smoke-tsl-lib` (every gallery entry builds its node graph on a real node
material), then a production build. `src/tsl-lib/VENDORED.md` records the
upstream commit of the current copy.

## Ideas for future voyages

The original roadmap (see `TSL-ROADMAP.md`) is complete — scale context
shipped as the four-rung journey, and the System/Local Group rungs now
have member focus (click through to Andromeda, the Magellanic Clouds,
each orbiting world). Still open:

- Real catalogue imagery (Messier / NGC) mapped via `latlonUv`, with
  distances and redshift.
- Star lifecycle mode. (The stellar-nursery half of this idea shipped as
  the Nebula rung — the Pillars of Creation.)
- Guided tours and a search box for named objects.

(Galaxy-type morphing shipped: on WebGPU, switching Hubble classes now
glides every star to its new seat — the Galaxy rung's Prev/Next is the
demo.)
