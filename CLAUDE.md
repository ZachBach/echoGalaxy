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

`src/tsl-lib/` is a **one-way copy** of `../tsl-lib/src`. Upstream is not
part of this checkout: `../tsl-lib` physically lives inside the parent
**AureliusDynamic** repo (`ZachBach/AureliusDynamic`), which also holds
the landing site and tracks tsl-lib as ordinary files. This repo
(`ZachBach/echoGalaxy`) is gitignored by that parent, so the two have
separate remotes and separate history — commits made here never reach
tsl-lib and vice versa. See `../CLAUDE.md` for the parent's layout.

Do not edit anything under `src/tsl-lib/` directly — changes go upstream
in `../tsl-lib`, then:

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
- `*Data.js` files are pure data: educational copy plus the cfg numbers
  shader uniforms read. They must not import rendering code. There are
  seven — `galaxyData.js`, `planetData.js`, and `systemData.js` carry a
  flat `facts` array and the cfg the shaders consume; `stellarData.js`,
  `starData.js`, `constellationData.js`, and `skyCultureData.js` are the
  astronomy content layer (BACKLOG phases STA–STD) and carry a two-rung
  facts ladder instead — `factsKids` + `factsAdvanced`. Read either shape
  through `factsFor(entry, audience)` in `factsLadder.js`, which falls
  back to the flat `facts` so the older catalogues keep working.
  `npm run check:content` gates all of it.
- Physical/orbital constants (Kepler's constant `K`, μ = 4π²/K²) belong
  to the central body being orbited — moons use a different tempo
  constant than planets orbiting the star for exactly this reason.
  Don't unify them without checking the physics.

## Commands

```
npm run dev             # local dev server
npm run build           # production bundle
npm run check:tsl       # vendor gate only (no sync)
npm run sync:tsl        # sync from ../tsl-lib + gate + build
npm run check:content   # astronomy content gate (ids, facts ladder, the 88)
npm run capture:social  # render social-video frame sets (see video/HANDOFF.md)
npm run backlog:csv     # export BACKLOG.md tasks to CSV for a tracker
```

Deploying to the Aurelius site is a manual copy of `dist/` into the
parent repo's `galaxy/` directory — `vite.config.js` sets `base: './'`
so the same build serves standalone and from that subdirectory. No
script automates the copy.
