# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

The library has **two rosters**, and they are not interchangeable:

- `gallery.js` — the curated NODE visualizers (28). What `smoke-tsl-lib`
  has always walked.
- `materialsGallery.js` — the full MATERIAL roster (43), derived from the
  modules so it cannot drift from the directory.

Materials are authored against `positionLocal` on a lab knot. A body in
this app must **re-express** the material over the body frame (`spunDir`)
rather than call its `apply()` — otherwise the pattern sits still while
the planet turns under it. `magma`, `ice`, `caustics`, `sandDunes` and
`crystal` are all in the tree as worked examples of that translation.

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
- Surface recipes in `planetRecipes.js` are on one contract:
  `(TSL, ctx) => { surface, nightLights?, emissive? }`. Patterns sample
  `ctx.spunDir` so they ride the spinning body frame; view-dependent
  terms (a fresnel glaze, a specular glint) deliberately do not. Colors
  are echoGalaxy's own educational palette, **not** the library brand set
  — that rule inverts the upstream one, where hex literals are banned.
- `<Planet>` memoizes its material on **cfg identity**, so anything passed
  as `cfg` or `atmosphere` must be a stable reference (module constant or
  `useMemo`). A fresh object literal per render rebuilds the whole TSL
  node graph every frame, for every planet — that was a real bug (G1-08),
  and `EMPTY_CFG` at the top of `Planet.jsx` is the fix for the default.

## Inspecting one rung in isolation — the dev-only routes

`main.jsx` lazy-routes a query flag to a standalone scene instead of
`App`. All are stripped from the production bundle (`import.meta.env.DEV`
folds to false, so the chunks are eliminated), which is why adding to them
costs the shipped app nothing. They are checked in a fixed priority order,
so passing two means the first one listed wins:

```
?lab=1       tsl-lib portability lab — all 71 entries (28 nodes + 43 materials)
?planet=1    planet recipes         (&type=<recipe> pins one, &spin=0 freezes)
?system=1    the orbital scene
?group=1     Local Group
?pillars=1   the Pillars volume
?cluster=1   Coma
?crab=1      the Crab remnant
```

Debug flags that work anywhere: `?backend=webgl` (force the WebGL2
backend), `?simulate-no-webgpu` (hide `navigator.gpu` so the real fallback
path runs in a capable browser), `?freeze` (stop the spin — determinism
checks depend on it), `?scale=`/`?system=`/`?sky=`. Dev hooks a harness
can read: `window.__gl` (the renderer, from `renderer.js`) and
`window.__r3f` (R3F state, set in every scene's `onCreated`).

## Commands

```
npm run dev             # local dev server
npm run build           # production bundle
npm run check:tsl       # vendor gate only (no sync)
npm run sync:tsl        # sync from ../tsl-lib + gate + build
npm run check:content   # astronomy content gate (ids, facts ladder, the 88)
npm run check:planet    # planet materials on every obliquity + ring geometry
npm run check:shots     # capture list: follow ids, sky modes, title cues
npm run check:all       # all four gates, in order
npm run check:shaders   # browser gate: every tsl-lib node AND material
                        # compiles and draws on BOTH backends (~3 min, two
                        # Chrome launches — deliberately not in check:all)
npm run check:frozen    # browser gate: each rung renders byte-identically
                        # across two INDEPENDENT browsers (--rungs a,b and
                        # --backend to narrow; full run is 36 launches)
npm run check:parity    # browser gate: WebGPU vs WebGL2 per rung, against
                        # the recorded bars in docs/parity-bars.json
                        # (--record to re-record; bars are hardware-specific)
npm run capture:social  # render social-video frame sets (see video/HANDOFF.md)
npm run backlog:csv     # export BACKLOG.md tasks to CSV for a tracker
```

Run `check:all` before a capture session. A session costs a browser, a
folder picker and minutes of real-time rendering per shot, so every error
caught statically is one not discovered after the frames are on disk —
or, as happened with 05-system's framing, not discovered at all until
someone watched the motion.

## Headless verification — the trap that prints a green pass

Harnesses here drive system Chrome over the DevTools Protocol using Node's
built-in WebSocket, adding no dependency. `scripts/harness-cdp.mjs` is the
shared rig — Vite boot, browser launch, rung render, screenshot, per-pixel
diff — and new browser gates should import it rather than re-derive it.
(`smoke-lab-shaders.mjs` and `shoot.mjs` predate it and still carry their
own copies.) Harnesses belong in `scripts/`, committed: they used to be
rebuilt in a scratch directory every session and thrown away with it,
which is how "the rig is deterministic" stayed an assertion in a commit
message rather than a command anyone could re-run.

**`?freeze` alone is not determinism.** It pins spin, orbits and camera
drift, but three's Timer reads `performance.now()` on every node-frame
update, so `TSL.time` keeps running on wall clock — twinkle, corona,
plasma and the veil bake all move. `harness-cdp.mjs` therefore also pins
the clock from OUTSIDE the app, injecting a virtual timeline that advances
a fixed step per animation frame before any page script runs. That is what
CaptureRig does internally, done without editing `App.jsx`. Gates then wait
on a frame COUNT, not a wall-clock sleep: a slow boot shifts when frame 120
happens, never which instant frame 120 depicts.

**Never pass `--use-angle=swiftshader` to a run that claims WebGPU.** It
leaves `navigator.gpu` in place but makes `requestAdapter()` return null,
so three falls back and the run reports WebGL2 while printing a full green
pass — the same suite twice, proving nothing about WebGPU. Measured on
Chrome 151: with the flag `adapter=null`, without it `adapter=OK`.
`shoot.mjs` still carries the flag and has this blind spot. Always assert
the backend you asked for actually arrived by reading `.backend-badge`,
the way `smoke-lab-shaders.mjs` does.

Two smaller ones: `navigator.gpu` is undefined on `about:blank` (not a
secure context), so probe on a real localhost origin and wait for the
navigation to land before evaluating. And a live WebGPU/WebGL canvas reads
back blank through `drawImage` without `preserveDrawingBuffer` — take a
CDP screenshot and hand the PNG back into the page if you need pixels,
which is also how `harness-cdp.mjs` diffs without a PNG library.

**Two different questions, two gates.** `check:frozen` compares a backend
against *itself* across two independent browsers — 12/12 rung-backend
pairs at 0/255. `check:parity` compares WebGPU against WebGL2 — six rungs
inside their bars, worst is `system` at 0.46/255 against a 1.5 ceiling. A
green `check:frozen` is not evidence the backends agree with each other,
and vice versa; keep them straight.

Both measure the **render only** — the HUD is hidden before the screenshot,
because overlay text is identical on both backends by construction and
would flatter a parity mean toward zero. And both guard against passing
vacuously: `check:frozen` has a content floor, since a blank frame is
byte-identical to another blank frame. `docs/parity-bars.json` records the
GPU and driver alongside the numbers — the bars are hardware-specific and
a different adapter will need `--record`.

## Deploying

Deploying to the Aurelius site is a manual copy of `dist/` into the
parent repo's `galaxy/` directory — `vite.config.js` sets `base: './'`
so the same build serves standalone and from that subdirectory. No
script automates the copy.
