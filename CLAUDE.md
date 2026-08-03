# echoGalaxy — project conventions

Vite + React 19 + @react-three/fiber + three's `WebGPURenderer` (WebGL2
fallback via `?backend=webgl`). No test framework — "pure" modules
(`orbitPhysics.js`, `pillarsField.js`, `crabField.js`) are verified by
running them directly with node ("node-smoked"), not a test runner.
Don't introduce a test framework without asking.

## Shared files — coordinate before editing

These files are touched by more than one rung/feature and are the
classic two-teammates-overwrite-each-other risk. If your task isn't
scoped to one of these specifically, don't edit it without checking
with the lead first:

- `src/App.jsx` — the view switcher, HUD, badge. Almost everything
  routes through here.
- `src/sun.js` — the single shared sun-direction uniform every lit body
  reads.
- `src/volumeAtlas.js` — shared raymarch/atlas machinery consumed by
  both `Pillars.jsx` and `Crab.jsx`.

## Vendored library — never hand-edit

`src/tsl-lib/` is a **one-way copy** of `../tsl-lib/src` (a sibling repo,
not part of this checkout). Do not edit anything under `src/tsl-lib/`
directly — changes go upstream in `../tsl-lib`, then:

```
npm run sync:tsl    # syncs from ../tsl-lib + full vendor gate + build
npm run check:tsl   # gate only, no sync: static checks + runtime smoke
```

If a task needs a new or changed TSL node, that work happens in the
upstream `tsl-lib` repo, not here.

## Conventions worth knowing before you touch code

- TSL nodes are dependency-injected: they take the `three/tsl`
  namespace as a parameter and import nothing themselves. This is what
  keeps `tsl-lib` portable across three versions — don't add direct
  `three/tsl` imports inside vendored node files.
- Shader-driven rungs (galaxy, cluster) derive everything from
  `instanceIndex` in-shader — no per-star buffers. Keep new
  procedural-population work in that pattern rather than reintroducing
  CPU-side buffers.
- `*Data.js` files (`galaxyData.js`, `planetData.js`) are pure data:
  educational copy plus the cfg numbers shader uniforms read. They
  should not import rendering code.
- Physical/orbital constants (Kepler's constant `K`, μ = 4π²/K²) belong
  to the central body being orbited — moons use a different tempo
  constant than planets orbiting the star for exactly this reason.
  Don't unify them without checking the physics.

## Commands

```
npm run dev          # local dev server
npm run build         # production bundle
npm run check:tsl     # vendor gate only (no sync)
npm run sync:tsl       # sync from ../tsl-lib + gate + build
```
