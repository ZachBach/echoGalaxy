# echoGalaxy

A free, open educational tool for exploring galaxies and the universe.

Two views, switchable in the HUD (or `?view=planets`):

- **Galaxies** — orbit a procedurally generated galaxy and cycle the four
  broad Hubble classes — spiral, barred spiral, elliptical, irregular.
- **Planets** — five worlds built from tsl-lib shader nodes: rocky (with
  city lights on the night side), lava, ice, gas giant (the `bandedFlow`
  node born here and promoted upstream), and a star with a live corona.

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
- `src/Galaxy.jsx` — the galaxy as instanced sprites (WebGPU can't size point
  primitives, so stars are `Sprite` + `PointsNodeMaterial` instances).
- `src/galaxyData.js` — galaxy classes, educational copy, seeded generator.
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

## Roadmap ideas

- Real catalogue objects (Messier / NGC) with imagery, distances, and redshift.
- Scale context — zoom from planet → star → galaxy → cluster → cosmic web.
- Star lifecycle / stellar-nursery mode.
- Guided tours and a search box for named objects.
