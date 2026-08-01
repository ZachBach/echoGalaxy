# echoGalaxy

A free, open educational tool for exploring galaxies and the universe.

**The scale journey**: four rungs — Planet → Star System → Galaxy → Local
Group — climbable from the HUD ladder, `?scale=` links, or by zooming past
the edge of any rung (scroll out at the stop to go up a scale). Every rung
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
- **Planets** — five worlds built from tsl-lib shader nodes: rocky (with
  city lights on the night side), lava, ice, gas giant (the `bandedFlow`
  node born here and promoted upstream), and a star with a live corona.

- **Star System** — the star and four worlds on literal Kepler-third-law
  orbits (the inner molten world laps the outer ice world), each
  terminator tracking its own sun direction.
- **Local Group** — the real neighbourhood: the barred Milky Way with the
  Magellanic Clouds, Andromeda with M32/M110, Triangulum — 24,000 stars
  total, the same budget as one galaxy. A deep-space STARFIELD skybox
  (baked to an equirect at boot) sits behind every rung.

Every entry ships with a short explainer and a few facts — the educational
payload is the point.

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
- `src/sun.js` — the one shared sun-direction uniform.
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
- Star lifecycle / stellar-nursery mode.
- Guided tours and a search box for named objects.

(Galaxy-type morphing shipped: on WebGPU, switching Hubble classes now
glides every star to its new seat — the Galaxy rung's Prev/Next is the
demo.)
