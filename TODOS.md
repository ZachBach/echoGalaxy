# TODOS — echoGalaxy phase logs

Task breakdowns of [TSL-ROADMAP.md](TSL-ROADMAP.md) phases into concrete,
verifiable steps, with evidence recorded per task.

- **Phase G0 — plumbing (the WebGPU bridge): ✅ complete**, committed
  `740b727` (2026-07-29).
- **Phase G1 — planets: in progress** (initialized 2026-07-29, tasks below
  after the G0 log).

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
