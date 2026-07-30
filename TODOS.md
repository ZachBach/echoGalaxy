# TODOS — echoGalaxy phase logs

Task breakdowns of [TSL-ROADMAP.md](TSL-ROADMAP.md) phases into concrete,
verifiable steps, with evidence recorded per task.

- **Phase G0 — plumbing (the WebGPU bridge): ✅ complete**, committed
  `740b727` (2026-07-29).
- **Phase G1 — planets: ✅ complete**, committed `7343b8d` (2026-07-30) —
  bandedFlow promoted upstream (`51f6f2c`).
- **Phase G2 — galaxies go TSL: ✅ complete** (bulk `15f9cdc`, close-out
  `027963d`, 2026-07-30) — blackbody promoted upstream.
- **Phase G3 — the universe: in progress** (initialized 2026-07-30,
  tasks at the end of this file).

# Phase G0: plumbing (the WebGPU bridge) ✅

40 tasks breaking down Phase G0 into concrete, verifiable steps. Repo state
at writing: `scripts/sync-tsl-lib.mjs` and the first vendored copy of
`src/tsl-lib/` exist; the app still runs the default WebGL renderer with
`@react-three/postprocessing` bloom (three r184, R3F v9).

## A — Renderer bridge (WebGPURenderer in R3F v9)

- [x] G0-01 Confirm the r184 `three/webgpu` API surface used by the plan:
      `WebGPURenderer` constructor options (incl. `forceWebGL`),
      `renderer.init()`, `renderer.backend` — note anything that moved
      since the library's r178 verification.

  > **G0-01 findings (three@0.184.0, @react-three/fiber@9.6.1):**
  > - `three/webgpu` → `build/three.webgpu.js` and `three/tsl` →
  >   `build/three.tsl.js` both present in the export map.
  > - `WebGPURenderer` options confirmed: `forceWebGL` (WebGL2 backend
  >   unconditionally), `antialias`, `alpha`, `depth`, `stencil`, `samples`,
  >   `canvas`, plus `outputType`/`outputBufferType`. Without `forceWebGL`,
  >   the ctor installs a `getFallback` → WebGLBackend automatically (with a
  >   console warning), so WebGL2 auto-fallback needs no app code.
  > - `renderer.init()` is async and idempotent (caches its promise); on
  >   WebGPU init failure it swaps `renderer.backend` to the fallback itself.
  > - Backend identity: `renderer.backend.isWebGPUBackend === true` or
  >   `renderer.backend.isWebGLBackend === true` — read *after* `init()`
  >   resolves, since the fallback swap happens inside it.
  > - R3F v9 awaits the `gl` factory: `typeof glConfig === 'function' ?
  >   await glConfig(defaultProps) : glConfig`, where `defaultProps` is
  >   `{ canvas, powerPreference, antialias: true, alpha: true }` — so
  >   `gl={async (props) => …}` is the supported shape for G0-02/03.
  > - ⚠ Plan correction for G0-12/13: `PostProcessing` is exported from
  >   `three/webgpu`, but **`bloom` is NOT in `three/tsl`** — it lives in
  >   `three/addons/tsl/display/BloomNode.js`, exported as
  >   `bloom(node, strength, radius, threshold)`. Note the param names:
  >   strength/radius/threshold, not intensity/luminanceThreshold/smoothing.
- [x] G0-02 Create `src/renderer.js`: async `gl` factory for the R3F Canvas —
      `new WebGPURenderer({ canvas, antialias: true })` then
      `await renderer.init()`, return the renderer.
- [x] G0-03 Wire the factory into the `<Canvas gl={...}>` in `src/App.jsx`
      (R3F v9 accepts an async gl factory).
- [x] G0-04 Handle the async init window: loading/fallback UI so there is no
      black flash or interaction before the renderer resolves.
- [x] G0-05 Verify WebGL2 auto-fallback when `navigator.gpu` is absent —
      the same dual-backend story tsl-lib is verified for.

  > **G0-02..05 findings (verified in headless Chrome against the dev
  > server; screenshots on both backends):**
  > - Default path boots on the **WebGPU backend**
  >   (`renderer.backend.isWebGPUBackend === true`); with `navigator.gpu`
  >   hidden (dev flag `?simulate-no-webgpu`, see `src/renderer.js`) the
  >   same code lands on **WebGL2** with three's own warning
  >   ("WebGPURenderer: WebGPU is not available…") — no app-side fallback
  >   code needed. Boot overlay tears down and the HUD renders on both.
  > - R3F applies its usual defaults to the custom renderer: toneMapping
  >   ACESFilmic (4), outputColorSpace srgb — same as the old WebGL path,
  >   which is the parity baseline G0-10 needs.
  > - ⚠ **Major divergence (ledger material for G0-30/38):** WebGPU cannot
  >   size point primitives (always 1px), so the v0.1
  >   `<points>`+`PointsMaterial` galaxy rendered *nothing* under
  >   WebGPURenderer on **either** backend (1px points + `map` sampling a
  >   missing `uv` → transparent corner → alpha 0). Per r184's own
  >   `PointsNodeMaterial` docs, sized/textured points must be rendered as
  >   instanced sprites. `Galaxy.jsx` is converted: `THREE.Sprite` +
  >   `PointsNodeMaterial` with `positionNode`/`colorNode` from
  >   `instancedBufferAttribute`, `sprite.count = N`, `frustumCulled =
  >   false`. This pulls the skeleton of G2's "Points → TSL sprite
  >   material" forward; the roadmap's "renders unchanged" smoke is
  >   already half-evidenced (spiral type verified on both backends).
  > - Bloom is temporarily **off** (old composer can't mount on
  >   WebGPURenderer) until section B lands — the transition state the
  >   roadmap sanctioned.
  > - Build note: bundling `three/webgpu` grows the chunk to ~1.6 MB
  >   minified (~450 KB gzip); Vite warns. Candidate cleanup, not a
  >   blocker.
- [x] G0-06 Add a `?backend=webgl` URL flag that passes `forceWebGL: true`,
      so both paths are testable side by side in any browser.
      *Verified headless alongside the G0-05 paths: `?backend=webgl` →
      `isWebGLBackend` with no fallback warning (chosen at construction,
      not swapped in init). Works in prod builds too; `?simulate-no-webgpu`
      stays dev-only since it mutates `navigator`.*
- [x] G0-07 Expose the active backend (WebGPU vs WebGL2) from
      `renderer.backend` via a small context/store the UI can read.
      *Kept minimal: the renderer is captured in App state via Canvas
      `onCreated` (fires after `init()` resolves, when backend identity is
      final) and read through `backendName()` from `src/renderer.js`.
      Promote to context/store if components outside App need it in G1+.*
- [x] G0-08 Dev-only HUD badge showing the active backend.
      *`.backend-badge` top-right, gated on `import.meta.env.DEV`.
      Verified headless: dev shows WebGPU / WebGL2 / WebGL2 across the
      three paths; prod build (vite preview) has no badge on any path —
      the DEV gate is compile-time-stripped.*
- [x] G0-09 Verify `dpr={[1,2]}`, canvas resize, and OrbitControls all behave
      under WebGPURenderer.
      *Verified headless on the WebGPU backend: devicePixelRatio 2 →
      pixelRatio 2 with canvas backing exactly 2× client size; runtime
      resize 900×600→1100×700 updates backing (2200×1400) and camera
      aspect (1.571); devicePixelRatio 3 clamps to 2 per `dpr={[1,2]}`.
      OrbitControls: drag rotated the camera ~7.8 world units with orbit
      distance preserved to the millimeter (13.416 → 13.416); wheel zoom
      pulled it in to 12.746.*
- [x] G0-10 Verify background color `#02030a`, tone mapping, and additive
      blending look identical across the two backends.
      *Made verifiable by seeding `generateGalaxy` (mulberry32, default
      seed in cfg) and a dev `?freeze` flag that stops the spin —
      deterministic frames on both backends. Pixel-diff WebGPU vs WebGL2
      (1000×640): channel means identical to 0.01 (10.91/11.28/17.57 on
      both — tone mapping + additive accumulation match), mean pixel diff
      0.54/255, background corners byte-identical (#02030a through ACES →
      [0,0,1] on both). 2.7% of pixels differ >8, max 160 — isolated
      star-edge AA, the backends' MSAA resolves differing sub-pixel, not a
      systematic shift (identical means rule that out). Side-by-side
      screenshots indistinguishable.*

## B — Bloom migration (composer is WebGL-only)

- [x] G0-11 Reproduce and record exactly how `@react-three/postprocessing`'s
      EffectComposer fails (or no-ops) under the WebGPU backend — error text
      goes in the notes for the ledger.
      *It hard-crashes, not no-ops: `TypeError: renderer.getContext(...).
      getContextAttributes is not a function` (postprocessing's
      EffectComposer probes the WebGL context; WebGPURenderer has none).
      React unmounts the whole Canvas — no canvas element at all. Runtime
      gating would not have been graceful; removal was the only option.*
- [x] G0-12 Spike: minimal three/webgpu `PostProcessing` + `bloom()` node on
      r184, outside the app, to prove the preferred path.
      *Collapsed into G0-13 — the API was proven directly in `Effects.jsx`
      on first mount, no separate spike needed. Ledger finding on the way:
      **r183 renamed `PostProcessing` → `RenderPipeline`** (old name still
      exported but warns deprecated); `bloom` lives in
      `three/addons/tsl/display/BloomNode.js`, not `three/tsl`.*
- [x] G0-13 Implement `src/Effects.jsx`: `pass(scene, camera)` → bloom →
      `postProcessing.outputNode`, taking over the R3F render loop cleanly
      (`useFrame` with render priority, manual render).
      *Done with `RenderPipeline`: scene pass `getTextureNode('output')`,
      `outputNode = color.add(bloom(color, s, r, t))`, `useFrame(() =>
      pipeline.render(), 1)` (positive priority disables R3F's own render),
      dispose on unmount.*
- [x] G0-14 Tune bloom node params to match the current look: intensity 1.15,
      luminanceThreshold 0.04, smoothing 0.9, mipmap blur equivalent.
      *BloomNode speaks UnrealBloom vocabulary (strength/radius/threshold),
      so this was visual tuning, not parameter mapping. Landed on
      strength 0.55, radius 0.25, threshold 0.04 after two iterations —
      the first guess (1.15/0.85) was far too hazy.*
- [x] G0-15 Verify `PostProcessing` + bloom node also runs on the WebGL2
      fallback backend (it should — confirm, don't assume).
      *Confirmed: zero errors on `?backend=webgl` across all four types,
      and the frozen-frame pixel diff with bloom active shows channel
      means identical to 0.01 across backends (20.33/20.16/31.30) — the
      bloom pipeline is numerically equivalent on both. G0-18 contingency
      not needed.*
- [x] G0-16 A/B screenshots per galaxy type: old composer bloom vs node
      bloom; eyeball parity before switching.
      *All four types compared against pre-transition references (captured
      via git stash of the v0.1 state). Character, palettes, and glow
      placement match; the new renders are systematically a touch softer/
      brighter — a product of the instanced-sprite conversion plus
      BloomNode's blur shape, not a tuning miss. Accepted as parity-plus.*
- [x] G0-17 Remove `@react-three/postprocessing` and `postprocessing` from
      package.json once the node path is verified on both backends.
      *Uninstalled; no source imports remained; build passes (bundle now
      1.71 MB min / 475 KB gz — the old composer's weight replaced by the
      bloom addon).*
- [x] G0-18 Contingency (only if G0-15 fails): gate bloom per-backend during
      the transition instead of removing the composer. *Not needed —
      G0-15 passed.*

## C — Vendoring + sync hardening

- [x] G0-19 Add `"sync:tsl": "node scripts/sync-tsl-lib.mjs"` to package.json
      scripts.
      *Done as a full gate chain: `sync:tsl` = sync → `check:tsl` → build,
      where `check:tsl` = static checks + runtime smoke (see G0-21..23).*
- [x] G0-20 Stamp the upstream commit hash into `src/tsl-lib/VENDORED.md` at
      sync time (`git -C ../tsl-lib rev-parse --short HEAD`) so staleness is
      visible.
      *Sync script now stamps it; current copy is upstream `666284f` —
      the fresh sync confirmed the vendored code was already at upstream
      HEAD (only VENDORED.md changed).*
- [x] G0-21 Self-containment scan: no vendored module imports anything
      outside `src/tsl-lib/` (grep import specifiers).
      *`scripts/check-tsl-lib.mjs`: every import must be relative AND
      resolve inside `src/tsl-lib`. Finding: the scan is stricter than
      planned because the library turns out to import **nothing at all**
      — it's dependency-injected (every node takes the TSL namespace as a
      parameter). 56 files clean; bare imports are now a gate failure.*
- [x] G0-22 Import smoke: a dev-only entry that imports `src/tsl-lib/gallery.js`
      (which pulls the whole library) to catch resolution breaks under Vite 8.
      *Done better as `scripts/smoke-tsl-lib.mjs` (plain node, no browser
      needed): imports gallery.js — the whole library — and **executes all
      26 gallery entries** against the real r184 `three/tsl` on a real
      `MeshStandardNodeMaterial`. All 26 build their node graphs clean —
      the first r184 portability datapoint at graph-build level (shader
      compile is section E's browser lab). Vite-resolution coverage comes
      from the build step in the same gate.*
- [x] G0-23 Grep every `three/tsl` / `three/webgpu` import specifier used by
      vendored files and confirm each export exists on r184.
      *Reframed by the dependency-injection discovery: there are no such
      imports. The equivalent check in `check-tsl-lib.mjs` collects every
      `TSL.<member>` access (incl. destructuring) across the library — 28
      distinct members — and verifies each exists in the installed
      `three/tsl`. All present on r184.*
- [x] G0-24 Establish `npm run build` after every sync as the vendor gate;
      document the rule in `src/tsl-lib/VENDORED.md`.
      *The gate is check → smoke → build, chained in `npm run sync:tsl`
      and documented in the VENDORED.md the sync script writes. Full
      chain ran green end-to-end.*
- [x] G0-25 Document the sync→build→smoke sequence in README.md so deploys
      stay self-contained (no `file:` deps).
      *README rewritten: vendored-lib section with the workflow, plus
      fixes for text the WebGPU transition had made stale (stack said
      @react-three/postprocessing; structure said point-cloud galaxy).*

## D — v0.1 galaxy parity smoke (roadmap: "renders unchanged")

- [x] G0-26 Galaxy scene renders under WebGPU: `<points>` + CanvasTexture
      sprite + alphaMap + `depthWrite={false}`.
      *Resolved during section A: `<points>` fundamentally can't render
      sized/textured under WebGPURenderer (see A findings); the scene is
      now instanced sprites and renders on both backends. The CanvasTexture
      + additive + `depthWrite={false}` combination carries over intact.*
- [x] G0-27 Color parity check: sRGB CanvasTexture + vertexColors on WebGPU
      match the WebGL output (known colorspace divergence area).
      *Per-type frozen-frame pixel diffs: channel means identical to ±0.01
      on all four types (e.g. spiral 20.33/20.16/31.30 both backends) —
      the sRGB canvas sprite × per-instance color path is colorimetrically
      identical across backends.*
- [x] G0-28 Cycle every entry in `GALAXY_TYPES` on both backends — no
      crashes, no visual drift, HUD facts intact.
      *All 4 types cycled on both backends: zero page errors, correct HUD
      names, 3 facts each. Mean pixel diff per type 0.19–0.53/255 with
      0.6–2.3% of pixels over 8 (star-edge AA resolve, per the known
      silhouette-AA divergence — ledger entry 5).*
- [x] G0-29 Record FPS on both backends for the same scene and dpr; note the
      delta.
      *Headless Chrome, 1000×640 @ pixelRatio 2, spin + bloom running,
      2.5 s warmup, 5 s rAF count: **WebGPU 54.7 fps vs WebGL2 45.7 fps**
      — WebGPU ~20% faster on this machine. (Headless numbers; headed
      runs will differ but the ordering is informative.)*
- [x] G0-30 Any WebGPU divergence found in D: fix locally or record the
      workaround upstream in `../tsl-lib/docs/BACKEND-NOTES.md`.
      *Written upstream as confirmed entry 6: Points can't render sized/
      textured under WebGPURenderer (1 px topology + uv-less map sampling
      → invisible), rule = instanced-sprite pattern, cross-referenced to
      the ledger's existing entry 2 (r184's PointsNodeMaterial bakes that
      workaround into `setupPositionView`). Upstream file edited but not
      committed — that repo's commits are yours to make.*

## E — Version-portability smoke (r178-verified lib on r184)

- [x] G0-31 Build a dev-only lab scene behind `?lab=1`: one mesh (sphere)
      whose material node is swappable at runtime.
      *`src/Lab.jsx`: sphere (per the upstream parity guidance — fresnel
      family needs curvature) + `MeshBasicNodeMaterial`, each gallery
      entry's `apply(TSL, mat, {clock})` run against the real r184
      namespace. Swapped in via `main.jsx` behind a DEV-gated lazy import;
      verified the prod bundle emits no lab chunk (bundle +0.06 kB, the
      branch only).*
- [x] G0-32 Cycler UI: keyboard next/prev + on-screen label naming the active
      library node.
      *←/→ keys + Prev/Next buttons, label shows name · family · id ·
      index, backend badge reused. Cycles all 26 gallery entries, not just
      the roadmap five.*
- [x] G0-33 `fbm` (src/tsl-lib/noise/fbm.js) renders on r184, both backends.
- [x] G0-34 `worley` (src/tsl-lib/noise/worley.js) renders on r184, both
      backends.
- [x] G0-35 `fresnel` (src/tsl-lib/fresnel/fresnel.js) renders on r184, both
      backends.
- [x] G0-36 `trigLattice` (src/tsl-lib/noise/trigLattice.js) renders on r184,
      both backends.
- [x] G0-37 `curtain` (src/tsl-lib/pattern/curtain.js) renders on r184, both
      backends.

  > **G0-33..37 evidence** (headless, both backends, sphere-region mean
  > brightness gpu/gl2): fbm 133.74/133.85 · worleyF1 8.33/8.15 · fresnel
  > 96.57/96.57 · trigLattice 120.34/120.45 · curtain 100.43/100.81.
  > Beyond the gate: **all 26 gallery entries** rendered on both backends
  > with zero page/console errors and zero dark renders. The one large
  > cross-backend brightness delta (radialPulse, ~93) is capture-time skew
  > on a time-animated pulse — TSL `time` keeps running — not divergence.
  > Screenshots of the five kept per backend; fresnel limb glow and
  > trigLattice continents visually confirmed.
- [x] G0-38 Record every r178→r184 divergence in
      `../tsl-lib/docs/BACKEND-NOTES.md` under a new "Version portability"
      section — or an explicit "r184 verified clean" entry with date if none.
      *Section written upstream (uncommitted — your repo): **r184 clean, no
      library-code changes** — credit to the dependency-injection design.
      Consumer-facing moves recorded: PostProcessing→RenderPipeline rename
      (r183), bloom stays an addon with strength/radius/threshold
      signature, r184 PointsNodeMaterial internalizes the entry-2
      workaround, THREE.Clock deprecation warning.*

## F — Close-out

- [x] G0-39 Tick the Phase G0 checkboxes in TSL-ROADMAP.md and note the
      decisions made (bloom path chosen, backend caveats found).
      *All four roadmap items ticked with decision notes: RenderPipeline
      bloom (no gating), instanced-sprite galaxy, vendor gate chain, r184
      clean verdict. Phase header dated ✅ 2026-07-29.*
- [x] G0-40 Commit: G0 plumbing complete — galaxy renders on WebGPU and
      WebGL2 with node bloom, portability ledger updated.
      *Single commit on main covering the whole G0 transition. The
      companion edit in ../tsl-lib (BACKEND-NOTES.md entry 6 + Version
      portability section) is left uncommitted there — that repo's
      commits are yours.*

# Phase G1: planets (mostly already in the library)

40 tasks (G1-01..40). Ground truth at init: every node G1 needs is verified
on r184 by the G0 lab (`?lab=1`) — trigLattice, terminator, latlonUv,
atmosphereShell, spinY, fireRamp, streaks, and the magma/ice recipes all
render clean on both backends. Key API facts (from the vendored doc blocks):
`terminator(TSL, dir, lightDir, opts)` → `{ day, shade, night }`;
`atmosphereShell(TSL, lightDir, opts)` → `{ color, opacity }` for an
additive shell sphere; `latlonUv(TSL, dir)` → equirect uv; `spinY(TSL, dir,
angle)`; `fireRamp(TSL, x, opts)` (internal 0.95 clamp is load-bearing);
`streaks(TSL, angle, opts)`; materials are `apply(TSL, mat, { clock })`
recipes. The C-section node (`bandedFlow`) is born here and promoted
upstream per the roadmap checklist — upstream bench/docs run in
`../tsl-lib` (its commits/pushes stay yours).

## A — `<Planet>` core (the body-frame pipeline)

- [x] G1-01 Design the `<Planet>` API before code: props `{ recipe, radius,
      spinRate, atmosphere, sunDir }`; document the body-frame convention —
      `dir` = normalized `positionLocal`, the *sampling* direction spins
      (`spinY(dir, clock·rate)`), the mesh does not rotate, so lighting
      stays fixed while the surface turns (Terra convention).

  > **G1-01 design (the contract G1-02..09 implement):**
  >
  > **Props** — `<Planet recipe radius spinRate atmosphere sun frozen>`:
  > - `recipe`: `(TSL, ctx) => { surface, nightLights?, emissive? }` — all
  >   vec3 nodes. Planet core owns terminator composition (one place):
  >   `color = surface·shade + nightLights·night + emissive`. `surface` is
  >   lit (shade floor 0.18 keeps night readable), `nightLights` gated by
  >   the night mask (city lights), `emissive` unshaded (lava glow).
  >   Recipes never call terminator themselves.
  > - `ctx = { dir, spunDir, sun, clock, cfg }` — recipes sample patterns
  >   with `spunDir`, never `dir` (that's the whole spin story), and derive
  >   ALL animation from `ctx.clock` (never `TSL.time` directly).
  > - `radius` (default 1.7 — lab framing), `spinRate` (rad·s⁻¹, default
  >   0.04), `atmosphere`: `false` | `{ inner, outer, power, strength,
  >   dayEdges, scale=1.03 }` (atmosphereShell opts + shell multiplier),
  >   `sun`: TSL uniform node (below), `frozen`: bool.
  >
  > **Body frame** — `dir = positionLocal.normalize()`: unit sphere at
  > origin ⇒ `dir` *is* the surface direction terminator/latlonUv expect
  > (and the normal). `spunDir = spinY(TSL, dir, clock.mul(spinRate))` is
  > the sampling direction. The mesh never rotates; lighting terms
  > (terminator, atmosphereShell) use unspun `dir` against a world-anchored
  > sun, so the terminator stays put while the surface drifts beneath it.
  > *Note vs upstream Terra:* Terra keeps the pattern glued to the frame
  > and rotates `positionNode` instead (spinY source block); spinning the
  > sampling dir is the static-mesh equivalent (opposite drift sign,
  > irrelevant), avoids touching positionNode, and keeps normal = dir.
  >
  > **Sun** — one module-scope `sunDir = uniform(vec3)` exported from
  > Planet.jsx (default ≈ normalize(-0.8, 0.35, 0.55)); scene mutates
  > `sunDir.value`, all consumers (terminator + atmosphereShell + future
  > star placement) share it. That's G1-02.
  >
  > **Materials** — body: `MeshBasicNodeMaterial` (library does its own
  > lighting; no scene lights). Atmosphere: second sphere ×`scale`,
  > `MeshBasicNodeMaterial` additive, `depthWrite:false`, colorNode/
  > opacityNode from `atmosphereShell(TSL, sun, opts)`, renderOrder after
  > the body. Recipe swap rebuilds materials (key per type) + dispose on
  > unmount — Lab pattern.
  >
  > **Determinism** — `ctx.clock` is `TSL.time` normally, `float(0)` when
  > `frozen` (G0's `?freeze` extended to planets). Because recipes only
  > animate via ctx.clock, frozen frames are fully deterministic ⇒ G1-37's
  > cross-backend pixel diffs work without skew tolerance.
  >
  > **Scope call** — `<Planet>` is for *lit* bodies. The star (section D)
  > is a separate `<Star>`: no terminator, emissive-only + streaks corona
  > shell; it reuses sunDir only as a position hint. Keeps the recipe
  > contract from growing a `lit:false` special case.
- [x] G1-02 Shared sun: one `sunDir` uniform (TSL `uniform(vec3)`) owned by
      the planet scene, normalized, passed into terminator +
      atmosphereShell; a tiny helper so all consumers agree.
      *`src/sun.js` (own module, amending G1-01's "in Planet.jsx" — so
      `<Star>` can import it without `<Planet>`): `sunDir =
      uniform(Vector3)` defaulting to normalize(-0.8, 0.35, 0.55), and
      `setSunDir(x,y,z)` which always re-normalizes. Node-smoked: default
      length 1.000000, setSunDir(3,4,0) → (0.60, 0.80, 0.00) len 1;
      `terminator(TSL, dir, sunDir)` → {day, shade, night} and
      `atmosphereShell(TSL, sunDir, {})` → {color, opacity} both accept
      the uniform and the combined graph builds on a node material.*
- [x] G1-03 `src/Planet.jsx`: sphere + `MeshBasicNodeMaterial`, `colorNode`
      from `recipe(TSL, { dir, spunDir, sun, clock })` — the library does
      its own lighting via terminator, no scene lights.
      *Split for testability: `src/planetMaterial.js` is the pure graph
      builder (buildPlanetMaterial — spinY sampling dir, terminator
      composition `surface·shade + nightLights·night + emissive`,
      `cfg.terminator` opts passthrough, frozen → clock float(0));
      `src/Planet.jsx` is the thin mesh wrapper (memoized material,
      dispose on unmount, mesh never rotates). Vendored-lib imports use
      explicit `.js` extensions so the builder is node-smokeable.
      Node-smoked: trigLattice stub recipe exercising all three
      composition slots builds frozen and unfrozen; surface-only recipe
      (optional slots absent) builds; terminator passthrough accepted;
      prod build green. Browser render is G1-09's smoke.*
- [x] G1-04 Spin wiring: surface pattern samples the spun dir; verify
      continents drift while the terminator stays put (screenshot two
      moments, terminator edge static).
      *Quantified with a control: patterned surface at spin 0.5, 4 s apart
      → 56.5% of interior pixels changed (surface drifts); same test with
      a flat surface (`?flat=1` lab flag — no pattern, only lighting could
      move) → **0.00%** changed. Surface moves, lighting anchored.*
- [x] G1-05 Terminator wiring: `{ day, shade, night }` — day shade
      multiplies surface color (floor keeps night readable), dawn band
      visible at the edge.
      *With a side sun (`?sun=-1,0.25,0` lab flag): day interior 115.6 vs
      night interior 44.8 (ratio 2.58), night comfortably above background
      0.33 — the 0.18 shade floor doing its job. Dawn gradient visible in
      g1-shade screenshots; city-light slot exercised by the debug recipe.*
- [x] G1-06 Atmosphere: second sphere ×~1.03, additive, depthWrite off,
      `{ color, opacity }` from atmosphereShell assigned to
      colorNode/opacityNode; day-side brightest.
      *`buildAtmosphereMaterial` in planetMaterial.js + shell mesh in
      `<Planet>` (radius ×scale, renderOrder 1). Verification lesson: the
      first day-vs-night gain measurement straddled the body and showed
      ~1:1 — ACES compresses the additive shell over the bright day
      surface. Measured on the shell-only annulus over black instead:
      day limb 140.7 vs night limb 48.7 (**ratio 2.89**) — matching the
      library's deliberate 0.5 night floor in `dayA` (a design fact worth
      knowing: the night limb is never fully dark). Not a bug, verified
      working as designed.*
- [ ] G1-07 City lights: `night` mask × a trigLattice-derived land/settlement
      pattern, warm point glow on the dark side (rocky planet only).
- [ ] G1-08 Material hygiene: recipe swap rebuilds the material (key per
      type), dispose on unmount — same pattern as the Lab.
- [x] G1-09 Core smoke: one planet renders on both backends, zero errors,
      before the type work starts.
      *Vehicle: `src/PlanetLab.jsx` behind `?planet=1` (dev-only, lazy —
      prod bundle unchanged), debug rocky recipe + harness flags (`atmo`,
      `spin`, `flat`, `sun`, `freeze`). Both backends: zero page/console
      errors, frozen disc brightness **identical to 0.01** (121.01 both) —
      the frozen-clock determinism from G1-01 already paying off.
      Screenshot: continents, day limb + atmosphere ring, night falloff.*

## B — planet types (recipes on the core)

- [x] G1-10 `src/planetRecipes.js`: one module, each recipe
      `(TSL, ctx) => colorNode` sharing the body-frame ctx from A.
      *Four recipes on the G1-01 contract (surface/nightLights/emissive),
      all sampling `spunDir`; view-dependent terms (ice's fresnel glaze)
      deliberately unspun. Educational palette, not library brand colors.
      All four + atmosphere presets node-smoke green (frozen + live).*
- [x] G1-11 Rocky: trigLattice continents (terms/freq per cfg) → ramp
      ocean/land/snow palette; polar snow via |dir.y| band.
      *trigLattice (terms 3, freq 3.2) + fbm detail octave (the tuning
      pass — pure trigLattice was too blobby) → 6-stop height ramp
      ocean→shore→lowland→highland→peaks; polar snow on |y| (spinY
      preserves y, caps stable).*
- [x] G1-12 Rocky night: G1-07 city lights integrated; tune so day side
      shows no lights.
      *Warm lights = land × trigLattice(freq 11) clusters × ¬snow, entering
      only through the `nightLights·night` composition slot — structurally
      zero on the day side (night mask is 0 there), verified visually in
      the section-A debug run.*
- [x] G1-13 Lava: magma recipe adapted to the body frame (its warped-fbm
      driver sampled by spun dir; fireRamp clamp keeps the melt orange);
      faint emissive night side — lava glows in the dark.
      *Melt + crack edges go out as `emissive` (night-glowing), cooled
      crust as lit surface. Tuning pass inverted the balance from the lab
      knot's melt-dominant look to crust-dominant (crust smoothstep
      0.38–0.52, melt remap 0.5–3.2) — dark shell laced with glowing
      networks.*
- [x] G1-14 Ice: ice recipe (worley crack veins — deliberately the fallback
      impl, it benches faster) + pale atmosphereShell tint override.
      *Kept upstream's `impl:'fallback'` choice; rimLight dropped from the
      original (the atmosphere shell owns the rim); crack veins read
      perfectly first try.*
- [x] G1-15 Gas giant: bandedFlow surface (section C) + no terminator floor
      change needed; slightly stronger limb glow.
      *Consumes the in-repo `bandedFlowProto` (G1-19 substantially
      advanced): wobbled-latitude sin bands through a tan/cream ramp,
      darkened poles. Reads Jupiter-ish first try — promotion material.*
- [x] G1-16 Per-type atmosphere presets: color/strength per planet type
      (rocky cyan, lava ember, ice pale, gas tan).
      *`ATMOSPHERES` map in planetRecipes.js, fed straight to
      buildAtmosphereMaterial via `<Planet atmosphere>`.*
- [x] G1-17 Type parity pass: all four types × both backends, brightness +
      zero errors (harness).
      *All 4 × 2: zero page/console errors, frozen disc means
      **byte-identical** across backends (delta 0.00 on every type, both
      before and after the tuning pass).*
- [x] G1-18 Eyeball pass on all four: screenshots reviewed, palette/contrast
      tuned once.
      *One pass, two fixes: rocky (detail octave + tighter ramp stops —
      was blobby with concentric shore rings) and lava (crust-dominant
      inversion — was melt-everywhere). Ice and gas shipped untouched.
      After: rocky reads Earth-like, lava reads cooled-crust-with-veins,
      screenshots kept.*

## C — `bandedFlow` (born here, promoted upstream)

- [x] G1-19 Prototype in-repo (planetRecipes): latitude bands —
      `sin(dir.y·freq + phase)` family through a 2-stop palette — warped by
      the library `warp`/`turbulence` nodes for flow turbulence.
      *Born during G1-15 (section B) as `bandedFlowProto`: wobbled-y sin
      bands, fbm turbulence wobble, driven by the gas giant.*
- [x] G1-20 Options design per upstream CONVENTIONS: factory
      `bandedFlow(TSL, dir, { bands, warpAmp, warpFreq, drift, palette })`,
      derived `source()`, doc block with @cost/@backend.
      *Final surface: `bandedFlow(TSL, dir, { bands, warpAmp, warpFreq,
      seed, drift })` → float 0..1 — `palette` dropped (callers own color,
      matching the library's field-node convention), `seed` added (vary
      per body). Doc block, `source()`, conventions-compliant.*
- [x] G1-21 Optional storm spot: worley-based oval vortex opt (Great Red
      Spot) — decide in or out of v1 of the node (keep the option surface
      small; out is fine, note it).
      *OUT of v1 — recorded in the node's doc block: callers composite
      their own ovals (worley) until real demand appears.*
- [x] G1-22 Tune on the gas giant until it reads as Jupiter-ish at a glance.
      *Achieved in the G1-18 eyeball (first try); the shipped values
      (bands 6, warpAmp 0.22, warpFreq 2.4) became the node's defaults.*
- [x] G1-23 Extract to `../tsl-lib/src/pattern/bandedFlow.js` (upstream
      working tree) per the conventions; wire a bench entry.
      *Node file + `pattern-bandedflow` bench entry (quad, uv-derived dir,
      2-point sweep) + gallery chip (Lab knot, gold/blue) + GALLERY_SOURCES.*
- [x] G1-24 Upstream gate: `node bench/verify-all.mjs bandedFlow` — parity +
      cost recorded; gen-docs; gallery chip.
      *`verify-all.mjs pattern-bandedflow`: **PASS — parity 0%, impl
      native/native, gpu 2.69 ms → class ③** (matching the doc-block
      estimate). REGISTRY.json merged, NODES.md regenerated (53 entries).
      Upstream changes left uncommitted — yours to commit/push.*
- [x] G1-25 `npm run sync:tsl` back here (gate green), gas giant switches to
      the vendored node — the first full born-here→promoted→synced loop.
      *Sync stamped upstream `0024533`+working tree; gate green (57 files
      self-contained, 27 gallery entries build). Gas recipe switched to
      the vendored node, proto deleted; render check: gas disc mean
      **151.03 on both backends — identical to the prototype's value**, a
      pixel-perfect drop-in. The promotion loop is proven end to end.*

## D — star (the El-Sol recipe)

- [x] G1-26 Star surface: turbulence/fbm driver → fireRamp plasma sphere
      (El-Sol §2 recipe), slow churn via drift.
      *`src/starMaterial.js` buildStarBodyMaterial: spun turbulence →
      remap 0.8–4.0 → fireRamp (clamp untouched), plus limb darkening
      (fresnel.oneMinus → 0.45..1) — physical and keeps the silhouette
      from blowing out. `src/Star.jsx` wraps body + corona shell; STAR
      not a <Planet> per the G1-01 scope call.*
- [x] G1-27 Corona: streaks(angle around view axis) on an additive shell —
      lobes + slow precession (`drift: clock·rate`), fresnel falloff so it
      lives at the limb.
      *The plan's "fresnel falloff" was wrong twice in practice and the
      final fix is recorded for posterity: (1) fresnel peaks at the
      SHELL's silhouette → hard-edged annulus; (2) `positionView.xy`
      lateral distance is perspective-shrunk on the shell face (a ray
      grazing the body limb hits the shell at ~0.7·R) → detached ring.
      Correct radial coordinate = the view ray's **impact parameter**
      `|C − v·(C·v)|` (C = star center in view space) — body limb and
      shell silhouette land exactly at bodyRadius/shellRadius on it.
      Streaks tuned to lobes 3 / sharpness 3 / floor 0.45 (7 lobes read
      as gear teeth).*
- [x] G1-28 Bloom interplay: the hot core should bloom naturally under the
      G0 pipeline (threshold 0.04); verify no blowout — adjust fireRamp
      gain, not bloom, if it does.
      *With bloom running: disc mean 158, std 21 (granulation structure
      survives), **0.00% saturated pixels** — no blowout at default
      fireRamp gain 2.4; nothing to adjust. Gain stays the tuning knob if
      future scenes change exposure.*
- [x] G1-29 Star renders on both backends, zero errors, screenshots kept.
      *Both backends: zero page/console errors, frozen disc stats
      identical (158.18 / 21.29 on both). Screenshots kept per backend.*
- [x] G1-30 Star educational copy: fusion, blackbody color-temperature,
      "the clamp exists because real plasma ordering inverts" is a fun fact
      candidate.
      *`STAR_INFO` exported from Star.jsx (name, label, description, 3
      facts: color-is-temperature blackbody physics, the corona-heating
      problem, granulation-as-convection) — consumed by planetData in
      G1-31.*

## E — app integration + HUD (the educational payload)

- [x] G1-31 `src/planetData.js`: PLANET_TYPES (rocky, lava, ice, gas giant,
      star) — name, class label, description, 3 facts each, cfg (seeded
      params, palette, spin rate, atmosphere preset).
      *Five entries, each recipe + atmosphere preset + spinRate (gas spins
      fastest — it's a fact AND a cfg value) + 3 facts of real physics;
      star merges STAR_INFO from Star.jsx.*
- [x] G1-32 View switcher: Galaxies | Planets in the HUD (state + `?view=`
      param); Canvas content swaps scene, renderer/bloom/badge carry over
      untouched.
      *Segmented control atop the HUD; `?view=planets` read at boot and
      kept in sync via history.replaceState (links share). Per-view index
      state preserved when switching back and forth.*
- [x] G1-33 Planet HUD: same layout as galaxies — kicker/name/class/
      description/facts/nav; Prev/Next cycles planet types.
      *Same skeleton, `label` in the class slot; nav cycles the active
      view's list (1/5 vs 1/4).*
- [x] G1-34 Camera/controls per view: planet-scale min/max distance,
      sensible default framing; galaxy view keeps its current numbers.
      *VIEWS table (galaxies [0,6,12] min4/max28 — untouched; planets
      [0,0.8,5.6] min2.6/max12) + a ViewRig that repositions the camera on
      switch (Canvas camera prop is initial-only) with OrbitControls
      makeDefault.*
- [x] G1-35 README: structure + planets section, view switcher documented.
      *Intro rewritten around the two views; structure list covers the
      whole planet pipeline + dev scenes.*

## F — verification + close-out

- [x] G1-36 Harness: planets pass — cycle all 5 types on both backends,
      brightness + errors + per-type screenshots (G0 harness pattern:
      puppeteer-core + system Chrome + `--enable-unsafe-webgpu`).
      *All 5 types cycled in the REAL app view (`?view=planets&freeze`)
      on both backends: zero page/console errors, correct HUD names,
      screenshots kept. Galaxy-view regression in the same run: spiral
      renders, zero errors.*
- [x] G1-37 Pixel parity per type across backends (freeze spin for
      determinism — extend `?freeze` to planet spin via a shared frozen-
      clock/flag so TSL drift is capture-comparable, or diff with
      animation-skew tolerance like G0-E).
      *The G1-01 frozen-clock design made this exact: full-frame diffs per
      type of 0.014–0.063/255 mean with ≤0.13% pixels over 8 — including
      the star (0.01%). No skew tolerance needed anywhere.*
- [x] G1-38 Perf: FPS with planet + atmosphere shell + bloom on both
      backends; compare against the G0 galaxy numbers.
      *Planets view live (rocky + shell + bloom, dpr 2): WebGPU 43.5 /
      WebGL2 40.8 fps vs the G0 galaxy baseline 54.7 / 45.7 — planets are
      heavier (two spheres + shell shading) but comfortably interactive,
      WebGPU still ahead.*
- [x] G1-39 Tick Phase G1 in TSL-ROADMAP.md with decisions (bandedFlow
      option surface, star/bloom balance, view-switcher shape).
      *All four roadmap bullets ticked with notes; header ✅ 2026-07-30.
      Honest caveat recorded: latlonUv went unused (procedural surfaces
      beat textures) — kept available for catalogue imagery later.*
- [x] G1-40 Commit Phase G1 on main (upstream bandedFlow commits in
      ../tsl-lib remain yours).
      *Single commit; upstream side already committed/pushed by you as
      `51f6f2c`.*

# Phase G2: galaxies go TSL

40 tasks (G2-01..40). Ground truth at init: Galaxy.jsx is already
`Sprite` + `PointsNodeMaterial` with instanced position/color (the G0
conversion) — G2 moves the remaining CPU work into the shader. Library
signatures that matter: `spriteDisc(TSL, uv, { edge, core })` takes the
raw sprite-quad uv (no texture needed); `flicker(TSL, clock, { rate,
phase, depth })` is built for a per-instance phase channel;
`cosinePalette(TSL, t, { a,b,c,d, preset })` is the ramp family the
`blackbody(temp)` candidate joins. `noise/hashChannels` exists upstream
for deriving several random channels from one seed. Three candidate
nodes get born here: `blackbody`, `spiralArm`, `densityFalloff` — same
promotion loop bandedFlow proved (upstream bench gate in ../tsl-lib;
its commits stay yours). Frozen-clock determinism (G1 discipline)
applies to every animated term from day one.

## A — TSL sprite material (per-star shading in-shader)

- [x] G2-01 Replace the CanvasTexture star sprite with `spriteDisc` on the
      sprite-quad uv — procedural disc, `useStarTexture` deleted. Eyeball
      + frozen cross-backend check before anything else changes.
      *`spriteDisc(TSL, uv(), { edge: 0.06, core: 0.4 })` as opacityNode,
      colorNode = the per-star tint attr; useStarTexture + the texture/
      vec4 wiring deleted. A/B: ~24% brighter across all four types
      (uniform exposure shift) — accepted deliberately: the pinpoint core
      resolves individual stars as glints (the shipped 500k-field look)
      and reads better than the fuzzy canvas gradient. Bonus finding:
      cross-backend diffs improved **30–100×** (0.010–0.014/255 mean,
      ≤0.02% px>8, vs 0.19–0.53 and 0.6–2.3% in the texture era) — the
      procedural disc removes texture filtering from the equation
      entirely; what remains is pure math. Also confirms reversed-edge
      smoothstep is fine in TSL (spriteDisc uses it, parity-gated) — the
      G1 corona suspicion is formally closed as my geometry error. Zero
      errors both backends; build green.*
- [x] G2-02 Redesign per-instance attributes: drop precomputed RGB; per
      star carry `temp` (0..1 blackbody driver), `sizeJitter`, `phase`
      (twinkle), packed in one interleaved or few flat attributes.
      *One vec3 `params` attribute per star: [t (core→rim — the future
      temp driver), sizeJitter 0.75–1.4, twinklePhase]. RGB buffer and
      the CPU color lerp deleted; transitional colorNode = the same
      core→arm mix done in-shader from t. Two disciplines paid off
      immediately: the shading params draw from a **separate PRNG
      stream** (`seed ^ 0x9e3779b9`) so the position stream — and every
      layout — is untouched, and the era-regression diff proved it:
      **0.000 mean / 0.00% on all four types** vs the G2-01 captures.
      In-shader linear-space mix reproduces THREE.Color.lerp exactly.
      Backend parity unchanged at the 0.010–0.014 baseline; zero errors;
      build green. sizeJitter/phase ride along unconsumed until
      G2-05/06.*
- [x] G2-03 `blackbody(t)` prototype in-repo: Planckian-locus-ish ramp
      red → white-yellow → blue-white (educational accuracy matters: cool
      stars are red, hot stars are blue). Compare against published
      color-temperature swatches, not vibes.
      *`src/blackbody.js`: 9 anchor stops from Mitchell Charity's
      published 10deg-CMF table (fetched, not remembered — memory had 5
      of 9 anchors wrong, up to 23/255 off), placed on the **mired axis**
      (1e6/T, where color shift is perceptually ~linear) and blended by
      the library's parity-gated `ramp`; `TSL.color()` handles sRGB→
      linear of the published hexes. Validated at five NON-anchor temps
      (3500/5000/7000/12000/20000 K) with a JS replica of ramp's exact
      smoothstep-mix semantics: **worst channel error 8/255, most within
      1–3** — the ramp tracks the Planckian locus. Signature
      `blackbody(TSL, T)` — Kelvin in, chromaticity out (max channel ≈ 1;
      brightness stays the caller's business).*
- [x] G2-04 Wire `blackbody(temp)` as the per-star colorNode; galaxy cfg
      maps core→rim temperature distribution (hot young blue arms, old
      red core — the astronomy the old RGB lerp faked).
      *cfg gains tempCore/tempRim per type: spiral 4200→11000 K, barred
      4000→10000, elliptical 3900→**3200** (reddening outward — old
      stars everywhere), irregular 6500→12000. colorNode =
      blackbody(mix(tempCore, tempRim, t)). The look: golden cores →
      white → pale blue-white arms (honest true-color, not cartoon
      blue), elliptical a perfect amber old-population swarm — the HUD
      copy is now literally what the shader computes. Zero errors;
      backend parity at baseline (0.009–0.016/255); build green.
      coreColor/armColor stay in cfg for the D-section nebula palettes.*
- [x] G2-05 Twinkle: `flicker(clock, { phase: instance phase, depth })` —
      subtle (depth ≤ 0.25), frozen-clock clean.
      *opacity = spriteDisc × flicker(clock, { rate 1.6, phase, depth
      0.22 }). Gotcha caught by reading the node: flicker adds phase RAW
      into sin — the 0..1 channel must scale ×2π or the whole field
      twinkles in sync. Frozen-determinism proven over wall time: two
      frozen shots 2.5 s apart diff **exactly 0.000**; live shots 1.5 s
      apart diff 15.4/255 with 28.6% px changed (the field animates).*
- [x] G2-06 Per-star size variation via `sizeNode` from `sizeJitter`
      (replaces uniform 0.09; keep the mean identical).
      *Jitter regenerated mean-1.0 (0.7–1.3; same rnd2 draw count so the
      phase channel is untouched), `sizeNode = 0.09 × jitter` replaces
      the material size. Disc means shifted ~-4% (size redistribution
      under the disc² alpha, mean size itself preserved) — accepted; the
      field gains genuine deep-sky depth (bright glints over a dust of
      faint stars). Backend parity at baseline (0.010–0.016); zero
      errors; build green.*
- [x] G2-07 Both backends, all 4 types with the new material: zero errors,
      frozen diffs at G1-37 levels.
      *Better than G1-37 levels: 0.010–0.016/255 mean, ≤0.02% px>8 on all
      four types (the procedural-disc parity dividend from G2-01 holds
      through blackbody + twinkle + sizeNode). Zero page/console errors
      on both backends.*
- [x] G2-08 Eyeball pass vs the pre-G2 look: arms bluer, core warmer,
      twinkle visible but not noisy; tune once.
      *All four reviewed; **zero tunes spent** — the physics landed right:
      spiral golden-core → pale blue-white arms (honest true-color; the
      additive wash toward white at density IS how real exposures
      behave), barred's dense bar a warm blade under bloom, elliptical an
      amber old-population swarm, irregular's blue knots literally its
      own HUD copy. Twinkle subtle at depth 0.22.*
- [x] G2-09 Perf: 24k stars with in-shader color/twinkle vs the G0/G1
      baselines, both backends.
      *WebGPU 56.7 / WebGL2 47.4 fps — **faster than the G0 texture-era
      baseline (54.7/45.7)**: dropping the CanvasTexture sample more than
      pays for blackbody ramp + flicker + sizeNode ALU.*
- [x] G2-10 Ledger note if any sprite-path divergence shows up (entry 2/6
      territory — watch `positionView`-adjacent terms in the sprite path).
      *None to record: the sprite path uses only uv + instanced
      attributes (no positionView terms), and parity improved 30–100×
      when the texture left. Nothing added upstream — the ledger records
      divergences, and there aren't any.*

## B — density/layout in-shader (CPU becomes seed only)

- [x] G2-11 Design the seed attribute layout: per star `{ u (radius
      param), branch, seed3 }` — type-independent; document how each
      current CPU branch (spiral/barred/elliptical/irregular) maps onto it.
      *Design discovery: **the layout is empty.** `hashChannels` takes
      `instanceIndex` as its seed, so every per-star random (radius
      param, branch, all scatter, size, twinkle phase) derives in-shader
      — zero attributes, zero buffers. The G2-02 attributes were deleted
      along with the concept. CPU contribution per type: a count and ~9
      uniform floats.*
- [x] G2-12 `spiralArm` prototype: `(TSL, u, branch, { arms, twist,
      radius })` → vec3 base position — the spiral/barred math from
      generateGalaxy, in-shader, driven by cfg uniforms.
      *`spiralArm(TSL, u, branchRand, h, U)` in `src/galaxyShader.js`:
      radial shaping (pow shapeExp), arm assignment from a branch random
      (statistically identical to the CPU's round-robin), winding
      (branch + r·spin), plus the barred bar branch mixed in by
      `step(r, radius·bar)` — **spiral IS barred with bar=0**, one graph
      for the whole disc family.*
- [x] G2-13 In-shader jitter: gaussian-ish scatter from `seed3` via
      `hashChannels` (mirror the CPU `gauss`/`jitter` shapes; lattice
      offset positive — upstream hash gotcha in the ledger watch list).
      *12 hash channels per star; `gauss3` (sum-of-three) and `jit`
      (cubic-biased signed) mirror the CPU shapes. Disc means landed
      within ~1% of the mulberry32 era on every type — the hash
      distributions statistically reproduce the CPU's. (The ledger's
      lattice-offset gotcha doesn't apply — instanceIndex seeds are
      already positive integers.)*
- [x] G2-14 `densityFalloff` prototype: radial amplitude shaping →
      per-star alpha/size damping (outer stars fade instead of hard
      cutoff); define semantics before code.
      *Semantics: `densityFalloff(TSL, rN, { start=0.85, end=1.02 })` →
      1 inside, easing to 0 past the rim, multiplied into opacity. The
      elliptical visibly benefits (graded halo instead of a hard shell).*
- [x] G2-15 Elliptical + irregular variants in-shader (ellipsoid power
      falloff; clump offsets from seeds) — all four types from one
      attribute layout + per-type uniforms.
      *Three family graphs (disc / elliptical / irregular) sharing one
      uniforms object; elliptical = pow-2 shaped gaussian ellipsoid,
      irregular = 5 hash-assigned clumps with gaussian scatter, both
      reproducing the CPU formulas node-for-node.*
- [x] G2-16 `generateGalaxy` reduced to seed/layout attributes only (no
      positions, no colors) — the Float32Array shrinks accordingly;
      seeded PRNG (mulberry32) stays.
      *Went further than planned: `generateGalaxy`, mulberry32, gauss,
      jitter, and the THREE import are **deleted** — galaxyData.js is
      now pure data (copy + cfg). Determinism no longer needs a CPU
      seed: hash(instanceIndex) is deterministic by the upstream
      determinism contract, frozen-clock handles time.*
- [x] G2-17 Type switching via uniform swap on one persistent sprite —
      geometry never rebuilds; decide whether a morph/crossfade between
      types ships in G2 or parks (scope call, note it).
      *`createGalaxyRig` in Galaxy.jsx: one Sprite for the app lifetime;
      spiral↔barred is a pure uniform swap (shared disc graph),
      cross-family swaps to a lazily-built cached material; count is
      per-type. **Scope call: morph/crossfade parked** — it needs a
      single cross-family graph (select chains or dual-position mix) and
      earns its keep in G3's scale journey, not here.*
- [x] G2-18 Regression: shader galaxies vs CPU-era screenshots per type —
      eyeball equivalence (exact match impossible; the shapes and palette
      character must hold).
      *All four eyeballed: spiral winds identically in character, the
      bar reads, elliptical's graded halo improves on the CPU hard rim,
      irregular clumps hold. Disc brightness within ~1% of the CPU era
      on every type.*
- [x] G2-19 Both backends, all 4 types, frozen diffs + zero errors.
      *Parity 0.010–0.015/255, ≤0.02% px>8 — the G2-01 baseline holds
      through the full in-shader generation. Zero errors, including
      through the 12-cycle switch stress.*
- [x] G2-20 Perf: uniform-swap type change vs the old rebuild (should be
      ~free); frame rate vs G2-09 numbers.
      *Switches: 25–81 ms on first family visit (one-time shader
      compile), then ~33 ms measured — which is the two-frame
      measurement wait itself, i.e. **effectively free**. Honest cost on
      the other side: FPS 48.4/39.3 vs G2-09's 56.7/47.4 — the per-frame
      position math (12 hashes + trig × 24k stars, recomputed every
      frame) buys the zero-buffer design with ~8 fps at dpr 2. Still
      comfortably interactive; candidate optimization recorded: bake
      positions once via compute pass (G3-era, when the scale journey
      needs the headroom).*

## C — candidate promotions (blackbody, spiralArm, densityFalloff)

- [x] G2-21 Promotion review: which candidates are general enough to
      promote now? (blackbody: clear yes. spiralArm/densityFalloff:
      promote if the API stands on its own without echoGalaxy context —
      decide and record.)
      *Verdicts: **blackbody PROMOTED** (published-data-backed, general —
      stars, embers, heat glow). **spiralArm PARKED** — its real
      signature consumes a raw hash-channel array plus the app's uniform
      object; a standalone API needs ~10 options for one consumer. It's
      an app-level composition; revisit at G3 or a second consumer.
      **densityFalloff PARKED** — one `smoothstep.oneMinus()`; the
      bench/registry/docs overhead of a node exceeds the value of the
      name. Both stay exported prototypes in galaxyShader.js.*
- [x] G2-22 `blackbody` options design per CONVENTIONS (factory, opts,
      derived source(), @cost/@backend) — relationship to cosinePalette
      documented (dedicated node vs preset: decide, note why).
      *Dedicated node in the ramp family, NOT a cosinePalette preset:
      it's data-anchored (published table on the mired axis), not
      parametric-cosine — a preset would fake the physics the node
      exists to keep honest. **Zero options** — the physics has no
      knobs; callers remap T before the call. Provenance + the 8/255
      validation recorded in the doc block.*
- [x] G2-23 blackbody upstream: extract + bench entry + gate
      (`verify-all.mjs`) + gallery chip + gen-docs.
      *`src/ramp/blackbody.js` upstream + `ramp-blackbody` bench entry
      (mired-linear temperature strip, 2-point sweep) + gallery chip
      (Planckian strip along the knot) + GALLERY_SOURCES. Gate: **PASS —
      parity 0%, gpu 0.68 ms → class ②** (doc block corrected from the
      estimated ① to the measured ②). NODES.md at 54 entries.*
- [x] G2-24 spiralArm options design + upstream extraction (if promoted).
      *Not promoted — see G2-21 verdict.*
- [x] G2-25 densityFalloff options design + upstream extraction (if
      promoted). *Not promoted — see G2-21 verdict.*
- [x] G2-26 Gate run for the B-section nodes promoted in 24/25; parity +
      cost recorded in REGISTRY. *Only blackbody promoted; its gate ran
      in G2-23 (parity 0%, class ②, REGISTRY merged).*
- [x] G2-27 `npm run sync:tsl` back; echoGalaxy switches to vendored
      copies; render byte-parity with the prototypes (the bandedFlow bar).
      *Sync green (58 files, 28 gallery entries — both +1); galaxyShader
      switched to `tsl-lib/ramp/blackbody.js`, in-repo prototype deleted.
      Byte-parity: **0.000 mean / 0.00% on all four types** vs the
      prototype-era captures — identical stops, identical math, perfect
      drop-in. Upstream changes uncommitted — yours (suggested message:
      "ramp/blackbody: Kelvin → Planckian-locus color — born on
      echoGalaxy G2, parity 0%, class ②").*

## D — nebula backdrops (per galaxy type)

- [x] G2-28 Design: layering (large background plane vs skysphere),
      brand-free educational palettes per type (spiral blue-pink
      star-forming veil, barred warm-core veil, elliptical faint amber
      halo, irregular patchy teal knots) — write the palette table first.
      *Layering call: the veil is the galaxy's OWN interstellar medium —
      a disc-plane circle inside the galaxy group (tilts/spins with it),
      additive, rendered before the stars. Palette table keyed to real
      emission physics: spiral Hα pink 0xd46a9e + reflection blue
      0x5a8fd6; barred warm dust 0xc98a5a; elliptical amber 0xc9a06a at
      **strength 0.05 — nearly absent, because ellipticals are gas-poor:
      the rendering itself teaches the gas budget**; irregular pink +
      teal 0x4ec9b0 patchwork.*
- [x] G2-29 `src/Nebula.jsx`: fbm veil (warp for wisps) on an additive
      backdrop, per-type cfg, behind the sprites (renderOrder/depth
      story explicit).
      *Lives in galaxyShader.js (uniform-swapped like the star material,
      no separate component): unit-circle mesh scaled to the veil radius
      per type, renderOrder −1, depthWrite off, DoubleSide. `nebula` cfg
      block per type in galaxyData.*
- [x] G2-30 Density/brightness balance: the veil must never swamp the
      stars or the bloom (measure: background mean stays ≪ disc mean).
      *Disc-mean deltas vs the star-only era: elliptical +2.3% (the
      gas-poor point as data), spiral +11%, irregular +8%, barred +17%
      worst — stars dominate everywhere.*
- [x] G2-31 Slow drift animation, frozen-clock clean.
      *Drift on clock·0.015; frozen-over-time diff **exactly 0.000**,
      live diff 13.8/255 (animates).*
- [x] G2-32 Per-type eyeball + tune once (all four).
      *All four reviewed, zero tunes: spiral wisps weave the disk,
      barred's amber hugs the bar ("funnels gas inward" made visible),
      elliptical barely-there halo, irregular Magellanic pink-teal
      patchwork.*
- [x] G2-33 Both backends: zero errors, frozen diffs.
      *Parity 0.010–0.015/255, ≤0.02% px>8 with the veil on; zero
      errors.*
- [x] G2-34 Perf: fullscreen fbm cost measured (watch class-③ territory);
      drop octaves if the frame budget complains.
      *It complained loudly and got two rounds of cuts: v1 (warp() + fbm
      = 4 fbm evals, full-bleed plane) → **15 fps**; v2 (2 evals,
      geometry shrunk to the veil disc so dead fragments stop paying) →
      25.5; v3 (3 octaves total, radius 1.2×) → **33.1/30.1 fps**.
      Veil visual quality held (soft clouds are honest for gas).
      Recorded future fix: the veil is static modulo slow drift — bake
      it to a small texture at type-switch time (G3 candidate, near-free
      at runtime).*

## E — integration + polish

- [x] G2-35 galaxyData cfg era update: per-type shader params (arms,
      twist, temp distribution, density, nebula palette) — copy/facts
      untouched, cfg becomes the single source the uniforms read.
      *temps + nebula blocks landed during A/D; close-out removed the
      orphaned coreColor/armColor fields (zero references remained).
      Byte-regression after cleanup: 0.000 on all four types. (One CRLF
      lesson: line-ending-aware regex needed on this repo.)*
- [x] G2-36 Galaxy view UX regression: HUD, nav, view switcher, camera
      numbers all unchanged; `?freeze` covers every animated term
      (twinkle, nebula drift).
      *Harness: galaxy index preserved through a galaxies→planets→
      galaxies round trip, URL sync (?view=planets) works, frozen-over-
      time diff exactly 0.000 with twinkle + drift live-verified
      animating. Zero errors.*
- [x] G2-37 README + VENDORED notes: the galaxies-go-TSL story, new
      vendored nodes listed.
      *README: GPU-generation story in the galaxies view blurb +
      structure list updated (galaxyShader.js, galaxyData as pure data).
      VENDORED.md self-updates via the sync stamp.*

## F — verification + close-out

- [x] G2-38 Full harness in the real app: 4 types × 2 backends (frozen
      diffs, errors, screenshots) + galaxy↔planets switcher regression +
      FPS vs all prior baselines.
      *Types: parity 0.010–0.015/255 both backends, screenshots per type,
      zero errors. Switcher: round trip clean, all 5 planets render.
      FPS ledger (WebGPU/WebGL2, dpr 2): G0 galaxy 54.7/45.7 → G2-A
      in-shader shading 56.7/47.4 → G2-B in-shader positions 48.4/39.3 →
      G2-D nebula 33.1/30.1 — the two recorded G3 optimizations (bake
      star positions, bake veil texture) recover most of it when needed.*
- [x] G2-39 Tick Phase G2 in TSL-ROADMAP.md with decisions (promotion
      calls, morph scope, nebula layering).
      *All three roadmap bullets ticked with decisions; header ✅
      2026-07-30.*
- [x] G2-40 Commit Phase G2 on main (upstream candidate commits in
      ../tsl-lib remain yours).
      *Bulk committed by you as `15f9cdc`; this close-out commit carries
      E/F (cfg cleanup, README, roadmap tick, TODOS log).*

# Phase G3: the universe

40 tasks (G3-01..40). Ground truth at init: two views exist (galaxies,
planets) sharing renderer/bloom/HUD; STARFIELD is a vendored
`apply(TSL, mat, { clock })` recipe over positionLocal (hash-cell stars +
faint wisp, both-backend verified in the G0 lab); the G2 FPS ledger ended
at 33.1/30.1 (WebGPU/WebGL2, dpr 2) with two recorded recoveries — bake
star positions, bake the nebula veil — and the galaxy-type morph parked.
G3 turns the two views into a four-rung scale journey: planet → star
system → galaxy → local group, with the facts ladder at every rung (the
tool's whole reason to exist).

## A — deep-space skybox (STARFIELD)

- [x] G3-01 Skybox form decision: large BackSide sphere with the STARFIELD
      recipe vs `scene.backgroundNode` — pick, note why (depth story,
      both-view reuse, frozen-clock).

  > **G3-01 decision: BackSide unit-sphere mesh, mesh-scaled to ~60 —
  > `scene.backgroundNode` rejected.** The deciding fact: STARFIELD
  > hard-samples `TSL.positionLocal` (star lattice ×7, wisp ×1.3), which
  > is geometry-space — undefined in a backgroundNode context. Using
  > backgroundNode would mean editing the do-not-edit vendored recipe or
  > duplicating its body against a view direction. The sphere gets it
  > free — plus the trick that makes the look exact: `positionLocal` is
  > **pre-scale**, so SphereGeometry(1) + `mesh.scale = 60` feeds the
  > recipe the same unit-direction domain it was tuned and lab-verified
  > on — star density per solid angle matches the gallery chip at any
  > world radius.
  > - Depth story: BackSide, depthWrite off, renderOrder −10; radius 60
  >   clears every rung's controls max (galaxy 28) and sits far inside
  >   the default far plane (1000).
  > - Both-view reuse: one material + one mesh from a shared module,
  >   built once with the frozen-or-live clock like every other material
  >   (backgroundNode couldn't take the frozen swap without the same
  >   recipe surgery).
  > - Two flagged caveats for G3-02/03: (1) the recipe's star term is
  >   `mul(2.2)` — likely over bloom threshold 0.04; the planned
  >   mechanism is post-scaling the recipe's OUTPUT
  >   (`mat.colorNode = mat.colorNode.mul(dim)` — wrapping, not editing
  >   the vendored file). (2) it uses brand palette colors; for faint
  >   sky stars ice/gold is physically fine (white-blue + rare warm),
  >   noted against the roadmap's brand-color concern.*
- [x] G3-02 Wire the skybox behind BOTH views (shared, built once);
      brightness low enough that it reads as depth, not competition.
      *`src/skybox.js` + one app-lifetime `<primitive>` in App above the
      view conditional — both views share it. Two design iterations
      recorded: (1) the G3-01 unit-domain trick is an OUTSIDE-viewing
      assumption — from inside, positionLocal magnitude is the star-
      density knob (`domainRadius` param, 7 ⇒ pinpricks; 1 made
      moon-sized blobs). (2) The full STARFIELD recipe's fbm wisp read
      as blue blotches at sky frequency AND cost 14 fps — the skybox now
      uses the recipe's star-lattice machinery only (credited adaptation,
      same precedent as the G1 magma/ice re-expressions; the vendored
      recipe stays canonical) with echoGalaxy's own ice/gold colors —
      which also resolves the G3-01 brand-palette caveat.*
- [x] G3-03 Bloom interplay: the skybox must not bloom (its stars sit
      below threshold 0.04) — verify, tune STARFIELD gains if needed.
      *Output post-scale (dim 0.5 on the stars-only field). No visible
      halos on sky stars; corner-sky mean 1.03 vs disc 93–164 — depth,
      not competition. Disc means moved ≤ 0.7 vs pre-skybox.*
- [x] G3-04 Frozen-clock clean (twinkle frozen ⇒ over-time diff 0.000).
      *Frozen-over-time diff exactly 0.000 with the sky twinkle in the
      graph; live diff 13.7/255 (animates).*
- [x] G3-05 Both backends: zero errors, parity at baseline.
      *Parity 0.010–0.016/255, ≤0.02% px>8, zero errors.*
- [x] G3-06 Perf cost of the skybox measured against the G2 ledger.
      *Ledger: 33.1/30.1 (no sky) → 18.6/16.9 (full STARFIELD — the
      wisp's 3 fullscreen fbm octaves) → **27.7/24.6** (stars-only sky).
      Remaining ~5 fps is the live star lattice — bake-eligible: the
      skybox joins the veil in the G3-10 bake plan (static modulo
      twinkle).*

## B — performance recoveries (cash the G2 cheques)

- [x] G3-07 Star-position bake decision: TSL compute pass writing a
      storage/instanced buffer (WebGPU) with the per-frame path as WebGL2
      fallback, vs CPU replay of the same hash math into an attribute —
      pick the one that keeps byte-parity with today's render.
      *Compute chosen: CPU hash replay can't guarantee bit-exact float
      parity with GPU sin/hash math; the compute path evaluates the
      IDENTICAL TSL expressions on the same GPU. `instancedArray(24000,
      'vec4')` packs xyz+rN in one buffer; reads follow ledger entry 1
      (`.toAttribute()` then `.xyz`). Elegant consequence: in baked mode
      the family lives only in which compute ran last — ONE material
      serves all four types.*
- [x] G3-08 Implement the bake; positions computed once per type switch,
      not per frame.
      *`buildGalaxyBake` in galaxyShader.js (three per-family compute
      nodes over one shared buffer + uniforms); rig dispatches on
      setType via `renderer.compute`.*
- [x] G3-09 Verify: byte-parity vs the live-math render (0.000 bar) +
      zero errors both backends.
      *WebGPU: **0.000 on all four types** — byte-perfect. WebGL2: real
      divergence found — re-dispatching a storage compute leaves
      ALTERNATE dispatches invisible (spiral ✓ barred ✗ elliptical ✓
      irregular ✗ — dispatch-parity pattern, transform-feedback
      ping-pong suspect). Gated per the G3-07 design: WebGL2 keeps the
      live-math path, verified 0.000 vs its own live era. Observation
      queued for the G3-38 upstream ledger sweep.*
- [x] G3-10 Nebula veil bake: render the veil field to a small texture at
      type-switch (it's static modulo drift — drift becomes a cheap uv
      scroll or stays live if the bake can't carry it losslessly; decide).
      *Veil field → 512² HalfFloat RT via QuadMesh at type-switch (RT
      re-render, no ping-pong — works on BOTH backends); colors/mask/
      falloff stay live so only worldFreq changes force the rebake.
      **Drift decision: dropped in baked mode** — uv-scroll would seam on
      the non-tiling field, and the group's spin already provides motion.
      Bonus bake: the SKYBOX star field → 2048×1024 equirect at boot,
      sampled back through the library's `latlonUv` (G1's unused node
      finally pays off); twinkle survives via per-cell phase in the
      texture's alpha channel (rate variety flattens to a constant —
      documented trade).*
- [x] G3-11 Verify veil bake: visual parity within AA tolerance, both
      backends.
      *vs the pre-bake era: 0.64–0.69/255 mean, ≤0.81% px>8 — the
      expected resampling signature, visually indistinguishable (no
      seams). Cross-backend parity at baseline (0.010–0.016);
      frozen-over-time still exactly 0.000; zero errors.*
- [x] G3-12 FPS ledger after both bakes — target: recover toward the
      48/40 neighborhood at dpr 2.
      *27.7/24.6 → **38.8/33.0** (+11 fps). Remaining gap to 48 is star
      fragment shading + bloom itself. Notable: the star-position bake
      alone moved FPS ~0 — fragment work dominated — the texture bakes
      did the recovering. Ledger: 33.1 (pre-sky) → 27.7 (sky live) →
      38.8 (all bakes) — the app now renders MORE than pre-skybox for
      +5.7 fps net.*

## C — star system scene (the new second rung)

- [x] G3-13 Design: the G1 Star at center + the four planet types on
      orbits (scaled-down <Planet> instances), slow orbital motion from
      the shared clock, subtle orbit rings; sunDir per planet points at
      the sun (the shared uniform earns its keep).
      *Design refinement: not ONE shared sun — each orbiting planet owns
      a per-planet sun uniform aimed at the origin, updated as it moves,
      so every terminator tracks its orbit (the Planet `sun` prop from
      G1-01 pays off). Orbit order teaches the frost line: lava
      innermost, rocky, gas, ice outermost.*
- [x] G3-14 `src/System.jsx`: scene layout, per-planet orbit cfg
      (radius, period, size) — Kepler-flavored (outer = slower).
      *Better than flavored — LITERAL Kepler third law: period =
      K·r^1.5. The inner molten world visibly laps the outer ice world,
      and a HUD fact points at it. Faint additive orbit rings (plain
      basic material — the node pipeline converts classics fine).*
- [x] G3-15 Planet materials at system scale: same recipes, smaller
      radii; atmosphere shells still legible or gated by size.
      *Same recipes at radii 0.3–0.62, spinRate 0.15; atmosphere shells
      read as soft halos at small scale — kept, no gating needed.*
- [x] G3-16 Camera framing + controls range for the system rung.
      *[0, 4.5, 11] fov 50, controls 3–24 — whole system incl. the ice
      orbit in frame. Dev route `?system=1` (SystemLab) mounts the full
      rung (skybox + bloom + system) exactly as the ladder will.*
- [x] G3-17 System facts (educational payload): AU as the yardstick,
      period-distance law, habitable zone, "the sun is 99.86% of the
      system's mass".
      *SYSTEM_INFO in System.jsx — four facts, one of which describes
      what the scene is literally doing (Kepler live).*
- [x] G3-18 Frozen-clock covers orbital motion (deterministic frames).
      *Frozen places every body at t=0 exactly; frozen-over-time diff
      **0.000** with orbits + spins + twinkle + corona in the graph.*
- [x] G3-19 Both backends: zero errors, parity.
      *Zero errors both; parity 0.093/255 mean, 0.51% px>8 — higher than
      the galaxy view's 0.015 because five curved silhouettes + shells
      accumulate sphere-edge AA (upstream ledger entry 5's exact
      domain), well within the fresnel-family tolerance.*
- [x] G3-20 Perf at the system rung (5 bodies + shells + bloom).
      *33.2 fps WebGPU at dpr 2 — five bodies + four shells + corona +
      baked sky + bloom, comfortably interactive.*

## D — local group scene (the top rung)

- [x] G3-21 Design: real Local Group members, minutes-of-arc honesty —
      Milky Way + Andromeda (M31) + Triangulum (M33) + a scatter of dwarf
      companions, correct relative sizes/positions-ish, each an instance
      of the galaxy rig at reduced count OR baked impostors — decide from
      the B-section results.
      *Decision from B: **live-math members with per-member uniforms** —
      the compute bake's one-shared-buffer design doesn't extend to
      concurrent members, and under the G3-23 budget the live path costs
      what one galaxy costs; identical on both backends. Membership is
      real: barred MW (rendered as what it IS), M31 slightly larger,
      M33 half-size, LMC/SMC irregulars hugging the MW, M32/M110
      ellipticals hugging M31. Distances compressed ~10× — declared in
      the HUD description, not hidden. Veils skipped at group distance.*
- [x] G3-22 Implement `src/LocalGroup.jsx`: 3 majors + dwarfs, varied
      types/orientations, one shared skybox behind.
      *Seven members, per-member tilts; group transforms work because
      PointsNodeMaterial's positionNode rides the model matrix while the
      star quads still billboard. In the render, M32 sits against M31's
      disc — as it does in real photographs.*
- [x] G3-23 Per-member scale/count budget: total stars across the group
      within the single-galaxy budget (spread it, don't multiply it).
      *8000+9000+3000+1200+800+1000+1000 = **exactly 24,000**. One tune
      pass: `sizeScale: 1.8` (new buildGalaxyMaterial option) so members
      read dense at group distance, plus a layout nudge clearing the HUD.*
- [x] G3-24 Group facts: gravity binds it, Andromeda approaches (blueshift
      — the collision in ~4.5 Gyr), dwarfs orbit the majors, the group is
      ~10 Mly across.
      *GROUP_INFO — including "a view no probe we have ever built will
      live to photograph" for the outside-the-Milky-Way vantage.*
- [x] G3-25 Camera framing for the group rung.
      *[0, 16, 40] fov 50, controls 12–90, skybox radius 140 for this
      rung; dev route `?group=1` (LocalGroupLab) mounts the full rung.*
- [x] G3-26 Both backends: zero errors, parity.
      *Zero errors; frozen-over-time 0.000; parity 0.032/255, 0.04%
      px>8 — the cleanest rung yet (no veils, no shells).*
- [x] G3-27 Perf at the group rung.
      ***44.7 fps** — the fastest rung in the app: the budget rule works
      (24k stars spread, not multiplied) and the baked sky carries the
      backdrop.*

## E — the scale journey (navigation + facts ladder)

- [x] G3-28 Architecture: SCALES = [planet, system, galaxy, group] —
      one state machine over the existing view logic; per-scale scene
      mount, per-scale camera/controls preset, per-scale object nav
      (planets cycle, system bodies focus, galaxy types cycle, group
      members focus).
      *SCALES table (id/camera/min/max/sky per rung) + one state machine in App.jsx; per-rung scene mount, per-rung indices preserved (planet + galaxy cycles). Scope note: per-member focus nav inside system/group rungs was scoped out — rung-level facts carry the ladder; member focus is a post-roadmap idea.*
- [x] G3-29 Ladder UI: the two-button switcher grows into a four-rung
      scale ladder (HUD top), current rung highlighted.
      *The two-button switcher became the four-rung ladder (same .views styling, active rung highlighted).*
- [x] G3-30 Zoom-through navigation decision: scroll past the controls'
      max distance nudges a rung up (debounced), min distance nudges
      down — or ladder-buttons-only; decide, implement, note.
      *Zoom-through SHIPPED (not buttons-only): wheel-out while parked at the outer stop climbs a rung, wheel-in at the inner stop descends; 700 ms debounce. Harness-proven: 30 wheel ticks from the galaxy rung landed on The Local Group, zero errors.*
- [x] G3-31 Scale transitions: simple and legible (snap + brief fade
      beats a broken zoom animation; decide scope).
      *Snap + fast fade (60 ms in, 220 ms out via .scale-fade overlay) — legible beats broken zoom animation.*
- [x] G3-32 `?scale=` URL param (replaces/extends `?view=`),
      history.replaceState sync, old `?view=planets` links keep working.
      *?scale= with history.replaceState; legacy ?view=planets verified to land on Rocky Planet; unknown values fall back to the galaxy home rung.*
- [x] G3-33 Facts ladder wiring: every rung has kicker/name/label/
      description/facts in the same HUD skeleton — the ladder IS the
      product.
      *One HUD skeleton, four payloads: PLANET_TYPES / SYSTEM_INFO / GALAXY_TYPES / GROUP_INFO; nav renders only where a list exists.*
- [x] G3-34 UX regression: galaxy and planet rungs behave exactly as
      their G2-era views (parity screenshots + switch round trips).
      *Region-split regression settled it rigorously: scene pixels right of the HUD diff **exactly 0.000** vs the pre-ladder captures — every changed pixel is the intentional ladder UI. All mounts correct incl. legacy links; galaxy backend parity 0.016 unchanged.*
- [x] G3-35 README: the scale journey story.

## F — verification + close-out

      *README leads with the scale journey; system + group rungs described.*
- [x] G3-36 Full harness: all four rungs × both backends — frozen diffs,
      zero errors, screenshots, rung-switch round trips.
      *All four rungs x both backends: zero page/console errors everywhere, frozen shots captured per rung, ladder walk + zoom-through + legacy links all green in one harness run.*
- [x] G3-37 Final FPS ledger: every rung, both backends, against the
      G0→G2 history.
      *Final ledger (dpr 2, live): WebGPU planet 33.5 / system 31.9 / galaxy 38.5 / group 44.6; WebGL2 31.9 / 27.3 / 30.6 / 34.9. History: G0 galaxy 54.7 -> G2 nadir 33.1 -> G3 with THREE more rungs, a skybox, and bakes holding 33-45.*
- [x] G3-38 Ledger sweep: any new backend divergences from compute/bake
      work → upstream BACKEND-NOTES.md; otherwise record clean.
      *Upstream watch-list entry written: WebGL2 storage-compute re-dispatch shows alternate-dispatch-stale contents (dispatch-parity pattern; ping-pong suspect, mechanism unconfirmed; rule: repeated compute-into-render-buffer is WebGPU-only with live fallback). Upstream commit remains yours.*
- [x] G3-39 Tick Phase G3 in TSL-ROADMAP.md — the roadmap's last phase;
      note what the library gained end-to-end.
      *Roadmap Phase G3 ticked — the roadmap is complete: G0/G1/G2/G3 all green.*
- [x] G3-40 Commit Phase G3 on main. The universe ships.

      *The universe ships.*