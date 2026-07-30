# TODOS — Phase G0: plumbing (the WebGPU bridge)

40 tasks breaking down [TSL-ROADMAP.md](TSL-ROADMAP.md) Phase G0 into concrete,
verifiable steps. Repo state at writing: `scripts/sync-tsl-lib.mjs` and the
first vendored copy of `src/tsl-lib/` exist; the app still runs the default
WebGL renderer with `@react-three/postprocessing` bloom (three r184, R3F v9).

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
