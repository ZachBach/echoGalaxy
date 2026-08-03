# TODOS — echoGalaxy phase logs

Task breakdowns of [TSL-ROADMAP.md](TSL-ROADMAP.md) phases into concrete,
verifiable steps, with evidence recorded per task.

- **Phase G0 — plumbing (the WebGPU bridge): ✅ complete**, committed
  `740b727` (2026-07-29).
- **Phase G1 — planets: ✅ complete**, committed `7343b8d` (2026-07-30) —
  bandedFlow promoted upstream (`51f6f2c`).
- **Phase G2 — galaxies go TSL: ✅ complete** (bulk `15f9cdc`, close-out
  `027963d`, 2026-07-30) — blackbody promoted upstream.
- **Phase G3 — the universe: ✅ complete** (2026-07-30) — the roadmap is
  done: G0·G1·G2·G3 all green. Post-roadmap: member focus (`4b19c07`),
  galaxy morph (`35482d3`), black hole (`e71e1e0`).
- **Phase GH — God's Hands: ✅ complete** (2026-08-01) — grab, fling,
  and the three fates on the System rung; μ = 4π²/K² from the rail
  constant; 21/21 interaction checks × both backends; frozen diffs
  0.0000 throughout; FPS ledger unmoved.
- **Phase PC — Pillars of Creation: ✅ complete** (2026-08-01) — fifth
  rung (Nebula) in the scale ladder; raymarched M16 via boot-time
  z-slice atlas bake (live-noise 2 fps → baked 29+ fps, the G3-10
  hatch); parity 0.017/255 at baseline; frozen 0.0000; all five rungs
  green both backends.
- **Phase SR — Saturn's rings: ✅ complete** (2026-08-01) — the planet
  rung's Saturn pair (Ringed World + Rings Alone, 8/8 cycle), analytic
  planet shadow proven three ways, System-rung bonus ring rides God's
  Hands flings; parity 0.027–0.028/255; frozen 0.0000; FPS noise-level.
- **Phase MN — moons: ✅ complete** (2026-08-02) — the Moon, Io, and
  Titan on the System rung + the full-size Moon on the rocky closeup;
  tidal lock exact by construction (spinRate = +2π/T, derived at
  machine epsilon); moons ride God's Hands flings; frozen 0.0000;
  21/21 regression.
- **Phase MB — mobile-ready: ✅ complete** (2026-08-02) — full touch
  surface (pinch-through rung climbing, fingertip flings), compact HUD
  (94.7% sky reachable), portrait framing, PWA shell with offline boot
  proven; phone profile 59-60 fps vsync-capped; desktop byte-clean.
- **Phase PS — Play Store packaging: ✅ complete** (2026-08-02) — TWA
  config (canonical-host bug caught pre-launch: www, not apex),
  five-command RUNBOOK, assetlinks placeholder, store assets + copy,
  privacy page, nine-step ZACHTODOS launch sequence; TWA-vs-Capacitor
  decision surfaced. Only accounts, signatures, and Submit are human.
- **Phase CB — Coma Berenices: ✅ complete** (2026-08-03) — the sixth
  rung: Melotte 111 foreground + 1000-galaxy Coma field (one draw,
  zero buffers, parity 0.006/255 — the app record) + the
  redshift-space Finger-of-God toggle with its teaching panel. Dark
  matter's discovery, rendered where it happened.

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
# Phase GH: God's Hands (post-roadmap)

16 tasks (GH-01..16). The feature: on the System rung, grab a planet
mid-orbit and fling it — release hands the body from its Kepler rail to
live Newtonian gravity. Too slow falls sunward, too fast escapes, just
right carves a new ellipse: Newton's cannonball, playable. The name pays
off with real astronomy (facts in section C).

Ground truth at init: `orbitPosition` (System.jsx, K = 7.5) is the single
source of orbital truth — FocusRig (App.jsx member focus) computes from
the same function, so ballistic bodies break follow unless addressed
(GH-04). Each planet's terminator tracks a per-body sun uniform updated
in one `place()` path — Newtonian positions ride the same code, lighting
free. μ falls out of the existing tempo constant: period = K·r^1.5 ⇒
v_circ = 2π/(K·√r) ⇒ **μ = 4π²/K²** — existing circular orbits reproduce
exactly at handover. Frozen-clock determinism is sacrosanct (capture rig
patches performance.now at module scope): god-hands must be inert under
`?freeze` and capture mode. OrbitControls is makeDefault with
zoom-through + member-focus interplay — grab must suspend all three.
Facts verified against sources 2026-08-01: MSH 15-52 / PSR B1509-58
(NASA/Chandra/NuSTAR), CG 4 in Puppis (NOIRLab/ESO), Fingers-of-God
redshift-space distortion (NED/Wikipedia).

## A — physics core (pure module, node-smokeable)

- [x] GH-01 Design before code: per-body state machine `kepler` (analytic
      rail, default) → `held` (pointer owns position, velocity sampled)
      → `newton` (integrated free fall) → back to `kepler` only via
      restore/respawn. Handover contract (position + velocity continuity
      at release), bounds (infall radius = star radius 1.15, escape
      radius ~ rung controls max), reset semantics. Written as the
      GH-01 note in this file.

  > **GH-01 design (the contract sections B/C implement):**
  > - **States** per body: `kepler` (rail, default) → `held` (pointer
  >   owns position; velocity sampled from recent pointer history) →
  >   `newton` (free fall). Re-grab of a `newton` body allowed (catch
  >   your comet); back to `kepler` only via restore-order or respawn.
  > - **Physics is honestly 2D**: state `{x, z, vx, vz}` in the y = 0
  >   orbital plane — the rung is planar; the scene maps to (x, 0, z).
  > - **K lives in orbitPhysics.js** and System.jsx imports it — the
  >   rails and free-fall cannot disagree: μ = 4π²/K² makes a body
  >   released with rail velocity continue the identical circle
  >   (verified to machine epsilon, T1).
  > - **Integrator**: symplectic Euler at fixed substep h = 1/240 with
  >   frame dt clamped to 1/30 (backgrounded tabs can't slingshot), r²
  >   floored at 1e-4 (a body dragged through the exact center must not
  >   produce NaN).
  > - **Bounds are visual-first, radius-based, deliberately**: infall at
  >   r < 1.15 (the star's surface), escape at r > 26 (past controls max
  >   24). A bound 0.99·v_esc ellipse legitimately sails past 26 — it is
  >   *reported* as escaped because it left every camera; the smoke
  >   checks boundedness by energy instead (T4d). Noted, not a bug.
  > - **Respawn**: swallowed/escaped bodies return to their rail after a
  >   short beat — position = wherever orbitPosition puts them NOW (the
  >   rail kept moving; the heavens don't wait).
  > - **GH-04 recommendation**: System should publish a per-body live
  >   position registry that FocusRig reads, replacing its own
  >   orbitPosition recompute — one source of truth that stays correct
  >   for rails AND ballistic bodies.
  > - **Frozen/capture**: grab handlers simply not attached when FROZEN
  >   or CAPTURE — inert by absence, nothing to gate at runtime.
- [x] GH-02 `src/orbitPhysics.js`: pure module — MU = 4π²/K², K imported
      from one shared home (decide where K lives so System.jsx and the
      physics agree); `circularVelocity(r)`, `escapeVelocity(r)`
      (= √2·v_circ), semi-implicit Euler `step(body, dt)` with dt clamp
      (tab-background frames must not slingshot the integrator).
      *Shipped per the GH-01 note, plus `railVelocity(pos)` (the
      handover vector for a fling-less release), `orbitalEnergy(body)`
      (the smoke's conserved quantity AND section C's cannonball dial —
      ε < 0 is bound), and `outcome(body)` (infall/escape/null).
      System.jsx's private K deleted in favor of the import; build
      green (614 modules).*
- [x] GH-03 Node-smoke the integrator: a circular-orbit body stays
      circular (radius drift < 1% over 60 simulated seconds); release at
      v_esc·1.01 escapes, at v_esc·0.99 stays bound; sub-circular release
      falls inward. Analytic truths, not vibes.
      *All green, well under every bar: rail agreement to **5.55e-17**
      (machine epsilon — the μ derivation is exact, not approximate);
      circular radius drift **0.027%** over 60 s; one full period
      (49.1 s) closes to **0.015%** of circumference; energy drift on an
      e≈0.56 ellipse **0.032%** over 120 s. Trichotomy: 1.01·v_esc
      unbound (ε > 0) and passes r = 100; 0.99·v_esc bound with max r
      87.9 vs analytic apoapsis 172.4 (energy check per the GH-01 bounds
      note); 0.6·v_circ dives to r = 1.144 < 1.15 — swallowed, matching
      its analytic periapsis 0.77 on the way down.*

## B — the hands (interaction)

- [x] GH-04 Grab: pointer down on an orbiting planet (R3F raycast)
      captures the pointer, sets `held`, and suspends OrbitControls,
      FocusRig follow, and ZoomThrough for the duration. Decide the
      FocusRig story for ballistic bodies (follow live position vs
      focus releases on grab) — note the call.
      *FocusRig call: the GH-01 registry, upgraded to the decision —
      `LIVE_BODIES` (System.jsx module export, id → {pos, mode}) is now
      the single positional truth: FocusRig reads it for both the focus
      effect and the follow frame, so focus tracks ballistic bodies
      correctly; while `held` the follow stands down (the hand steers,
      the camera waits). Handlers live on the OrbitingPlanet group
      (events bubble from the body + shell meshes; the star is
      deliberately not grabbable — it stays in God's own hands).
      Cursor affordance: grab/grabbing on the canvas.*
- [x] GH-05 Drag: unproject the pointer onto the orbital plane (y = 0);
      body tracks the hand; velocity estimated from recent pointer
      history (short window, world units/s) so a fling carries intent.
      *Ray∩plane from the R3F event ray; drag radius clamped to 23.5
      (inside the rung's rim). History window 150 ms; release velocity =
      endpoint delta over the window, clamped to 1.8×v_esc(r) — pointer
      gestures run tens of units/s against orbital speeds of ~0.45, so
      unclamped flings would all be violent hyperbolic ejections; the
      clamp keeps the full fall/ellipse/escape range reachable by feel.*
- [x] GH-06 Release → `newton` with the sampled velocity; untouched
      bodies stay on rails; sun uniform + spin keep tracking through the
      same place path (terminator proves it live).
      *One `applyPos(x, z)` serves every mode (rail, hand, free fall):
      group position + sun uniform + registry entry updated together —
      the terminator tracks a flung planet for free. A still-hand
      release gives v ≈ 0 **by design**: the body drops straight into
      the star — Newton's zero-speed cannonball, the fastest gravity
      demo in the app. Harness: release → `newton` confirmed; ballistic
      body moved 0.538 world units in 0.7 s; bystanders stayed `kepler`
      throughout.*
- [x] GH-07 Outcomes: infall (r < star radius) → swallowed, respawn on
      its rail after a beat; escape (r > bound) → farewell, respawn
      likewise; bound ellipse persists indefinitely. Each outcome is a
      teachable moment — surface which one happened (GH-12).
      *`gone` state: body hidden 1.2 s, then respawns wherever its rail
      runs NOW (the heavens didn't wait). Swallowing needs no effect —
      at r < 1.15 the body is inside the star mesh, occlusion IS the
      event. Harness: dropped rocky went `newton → gone` within 8 s
      (analytic plunge time ≈ 4.3 s) `→ kepler` on schedule. Outcome
      events plumbed through `onGodEvent` for GH-12's storytelling.*
- [x] GH-08 Restore order: one HUD action returns every body to its
      Kepler rail (the god repents; the heavens resume).
      *"☄ Restore order" button (reuses .nav styling), rendered only on
      the system rung and only while a body is off its rail — the
      `wild` boolean from System's event aggregation (discrete events,
      zero per-frame re-renders). Harness: button appeared on fling,
      click returned gas to `kepler`, button retired itself.*
- [x] GH-09 Determinism: god-hands inert under `?freeze` and capture
      mode; frozen-over-time diff stays exactly 0.000 with the feature
      compiled in.
      *Inert by absence: handlers only attach when `hands && !frozen`,
      and App passes `hands={!CAPTURE}` — nothing to gate at runtime, a
      stray click during capture's folder prompt can't grab a planet.
      Both backends: frozen diff vs the pre-GH baseline **exactly
      0.0000** (byte-identical — the feature adds zero rendering) and
      frozen-over-time **0.0000**; zero errors. 14/14 interaction
      checks green in the same run.*

## C — the payload (the facts earn the name)

- [x] GH-10 Held-planet readout: live release-speed dial vs v_circ and
      v_esc at the current radius — the Newton's-cannonball instrument.
      *Better than a speed readout — a fate oracle: `predictFate` in
      orbitPhysics.js names the throw's destiny analytically (conic
      sections: ε ≥ 0 or apoapsis past the rim → escape; periapsis
      inside the star → infall; else orbit) so the dial and the eye
      always agree — including the 0.99·v_esc visual-escape case (T5e).
      Dial plumbing: mutable `GOD_DIAL` written by the held body's frame
      loop, read by a HUD component on its own rAF — zero React
      re-renders per frame. The dial previews the SAME `releaseVelocity`
      estimator onPointerUp applies; dial and physics cannot disagree.
      **Found + fixed a GH-05 bug in the process**: history sampled only
      on pointer moves, so fling-pause-release replayed the stale fling
      velocity — sampling moved into the frame loop, a still hand now
      decays to zero within 150 ms (harness T3: dial reads "fall into
      the star" during the pause, and the paused release truly falls).
      Node smoke: 16/16 green with the five T5 fate checks.*
- [x] GH-11 GODS_HANDS_INFO: Newton's cannonball (the thought experiment
      the feature IS); the Hand of God nebula (MSH 15-52 — 19-km pulsar
      spinning 7×/s, hand 150 ly across, X-ray only); God's Hand (CG 4,
      Puppis — 1.5 ly head, 8 ly tail, enough dust for several Suns);
      the Fingers of God effect (every finger points at the observer —
      an artifact of measuring distance by redshift).
      *Exported from System.jsx; description tells the user what their
      hand is doing ("a fall that keeps missing"), the cannonball fact
      ends "You are holding the cannonball." All three sky objects
      source-verified 2026-08-01 (NASA/Chandra/NuSTAR · NOIRLab/ESO ·
      NED/Wikipedia).*
- [x] GH-12 HUD integration: how the payload surfaces (info panel swap
      while holding vs a new cycle entry on the System rung) — decide,
      implement, note the call.
      ***Panel takeover chosen over a cycle entry**: the facts arrive at
      the exact moment the user is doing the thing they explain, and a
      cycle entry would have perturbed the focus indices (systemIndex →
      ORBITS mapping). While held or wild: info panel = GODS_HANDS_INFO,
      nav hides, dial + restore button show; order restored → panel
      hands back (harness T2g). Discoverability: the system rung's hint
      line becomes "grab a planet and fling it · …" — gated on !FROZEN,
      which is both truthful (hands are inert frozen) and what keeps the
      frozen regression byte-clean: **0.0000 vs baseline on both
      backends** after the whole section. 21/21 interaction checks,
      zero errors; build green.*

## D — verification + close-out

- [x] GH-13 Harness: scripted pointer grab/drag/fling in headless Chrome,
      both backends — body leaves the rail, evolves under gravity, zero
      page/console errors; regression: with no grab, the system rung's
      frozen diffs vs the pre-GH captures stay 0.000.
      *Full interaction suite (grab/drop-infall/respawn/fling/dial/
      panel/restore/pause-decay) **21/21 on BOTH backends** — the hands
      are backend-agnostic app logic and behave identically (ballistic
      Δ 0.538 vs 0.533 world units — same physics, different GPU).
      Frozen regression vs the pre-GH baseline exactly 0.0000 on both.
      Rung sweep: all four rungs × both backends boot with correct HUD
      and zero errors.*
- [x] GH-14 FPS: physics is CPU-trivial (one body, one force) — confirm
      the ledger doesn't move.
      *System rung dpr 2 live: **33.1 / 31.7** (WebGPU/WebGL2) vs the
      G3-37 ledger's 31.9 / 27.3 — at-or-above baseline, i.e. the
      feature costs nothing measurable (idle cost is four registry
      Vector3 writes per frame).*
- [x] GH-15 README: God's Hands section (the interaction + the three
      real objects).
      *Star System bullet grew the God's Hands story (fling → the three
      fates → the dial → the real sky-hands); structure list gains
      orbitPhysics.js.*
- [x] GH-16 Commit on main (user pushes; site redeploy needed — this one
      changes the production bundle).
      *`75e9da6` on main; site redeploy committed in the Aurelius repo
      as `825d5d8` (dist copied to /galaxy/, stale bundles pruned) —
      both awaiting the user's push. The heavens are in mortal hands.*

# Phase PC: Pillars of Creation (post-roadmap)

18 tasks (PC-01..18). The feature: a fifth rung — Planet → System →
**Nebula** → Galaxy → Local Group — carrying a raymarched Pillars of
Creation: three noise-sculpted dust columns, photoevaporation rim glow,
EGG star-knots at the fingertips. Cashes the README's parked
"stellar-nursery mode" idea, and completes the scale ladder's yardstick
story (AU → light-years → kiloparsecs).

Ground truth at init: the G3-28 SCALES machinery is generic (id-keyed
table + per-rung scene/camera/sky; zoom-through and ?scale= ride the
array) — **but `initialScale` hard-codes `return 2` for the galaxy home
rung**: inserting 'nebula' at index 2 silently makes the Pillars the
default homepage unless the default becomes an id lookup (PC-11).
Capture shots pin rungs by id — unaffected. Rendering budget lessons in
force: G2-34 (never pay for dead fragments — bound the volume geometry),
black hole (cap HDR at the sources, never touch shared bloom), G3-10
(static content bakes to textures — the escape hatch if marching can't
hold budget). `TSL.Loop` availability on r184/both backends is assumed
but NOT yet proven — that proof gates everything (PC-04 before any rung
work). Library nodes on hand: ridgedFbm (column surfaces), worley
(EGGs), fbm/curtain/remap/ramp. Facts verified with sources 2026-08-01:
M16 at ~5,700–7,000 ly in Serpens, pillars 4–5 ly tall, photoevaporation
by NGC 6611's UV, EGGs (Hubble 1995 / JWST 2022), and the
destroyed-or-not saga (2007 Spitzer supernova claim → disputed → 2015
MUSE: intact, eroding slowly, ~3 Myr left).

## A — the volume (density field + lab proof, before any rung exists)

- [x] PC-01 Design before code: the density-field contract — three
      columns as noise-warped cone SDFs (smooth-union), tallest on the
      left, tips leaning toward the cluster light (up-left); ridgedFbm
      surface detail; worley EGG knots at the tips; every animated term
      from ctx clock (slow drift only — the pillars stand). Light
      direction, HDR budget, and the march's step/opts surface decided
      and written as the PC-01 note.

  > **PC-01 design (the contract A/B implement):**
  > - **Domain**: slab-local = world (the mesh sits at the origin,
  >   unscaled — the rung frames with the camera, never by transforming
  >   the volume; keeps the march in world space, no inverse-matrix
  >   nodes). Bounds x ±1.6, y ±1.5, z ±0.5 — a slab, not a cube: the
  >   pillars are 2.5D like the photograph, with real depth for
  >   parallax but a short march.
  > - **Columns**: per-pillar leaning axis `x_i + lean·(y − y0)`,
  >   z-squashed radial distance, radius tapering with height + a tip
  >   knob (the EGG-bearing heads); three pillars — tallest left
  >   (x −0.85, h 1.45), thin middle, forked-feel right — plus a base
  >   cloud mass along the bottom. Union by smooth-min.
  > - **Presence**: SDF shell eroded by ridgedFbm (the crenellated
  >   edges); interior dust varies by fbm; drift = clock·0.02 on the
  >   INTERIOR term only — the silhouette never moves, the dust
  >   breathes.
  > - **Lighting, one extra tap**: cluster direction L ≈ normalize
  >   (−0.45, 0.85, 0.25); shade from a single density re-sample at
  >   p + L·ε using a LITE density (SDF + 1 ridged octave — half cost);
  >   photoevaporation rim = the positive part of that gradient,
  >   sharpened. NO second march.
  > - **Palette (honest, not brand)**: umber dust body, cool teal
  >   ambient fill on the shadow side, warm ionized rim ≤ HDR 1.4,
  >   red-amber EGG knots (worleyF1 cells masked to the top ~20% of
  >   each pillar) ≤ 1.6 — the black-hole HDR discipline.
  > - **March**: front faces only (controls min distance keeps the
  >   camera outside), analytic ray-box exit, step = span/N, front-to-
  >   back accumulation `color += T·shaded·Δ; T ×= exp(−ρσΔ)`, final
  >   opacity 1−T on NormalBlending — dust OCCLUDES the skybox (not
  >   additive; the pillars are dark clouds). Early-out via Break if it
  >   proves portable, else skipped (PC-04 decides).
  > - **Opts surface**: `{ steps, octaves, frozen, seed }` — steps a
  >   plain JS number (fixed loop bound per material; the sweep
  >   rebuilds materials, not uniforms).
- [x] PC-02 `src/pillarsField.js`: pure node-smokeable module — density
      + emissive/rim terms per the PC-01 contract, opts (seed, octaves,
      steps for the march wrapper).
      *`pillarField` (SDF shell + fingertip mask), `samplePillars`
      (→ {rho, knot}: one pillarField + ridged(oct) + fbm(2) + worley
      per call), `densityLite` (half-cost light tap). `seed` dropped —
      these are THE pillars, a fixed formation, not procedural variety.*
- [x] PC-03 Node-smoke: the graph builds clean on a node material,
      frozen and live, before a browser ever sees it.
      *15/15: TSL surface probe (Loop/Fn/Break/If/cameraPosition/
      positionWorld/time all present on r184), field graphs build,
      bake material × 2 octave settings, march material × 3 step
      counts against a placeholder texture.*
- [x] PC-04 Lab proof (`?pillars=1` dev route, the G1-09 pattern):
      raymarched slab via `TSL.Loop`, bounded box geometry — compiles
      and renders on BOTH backends, zero errors. **This gates the
      phase**: if Loop misbehaves on either backend, the fallback
      (sculpted opaque pillars + additive haze shells) activates and is
      recorded, not improvised.
      ***GATE PASSED** — Loop compiles and renders on both backends,
      zero errors, and the frozen volume is deterministic cross-backend
      to the harness's precision (center means identical: 123.35/123.35
      live-noise era, 57.52/57.52 baked era). First light was
      over-exposed (pillars of light, not dust — everything above
      bloom's 0.04 threshold ignited); corrected toward the dark-cloud
      character in the lab: albedo halved, rim sharpened (grad³) and
      height-masked off the base cloud, light tap ε 0.14→0.09.
      Mesh-fallback never fired.*
- [x] PC-05 Cost sweep in the lab: steps × octaves grid, FPS at dpr 2
      with bloom — record the table, pick the budget point (gate: ≥25
      fps), and note which escape hatch (fewer steps / G3-10 bake)
      would fire if the scene work in B pushes it under.
      ***The hatch fired during the sweep, not after**: live-noise march
      measured 3.0/2.8/2.3/2.0/1.5 fps (steps 10..20 × oct 2..3) — an
      order of magnitude under the gate; step/octave cuts cannot close
      12×. **G3-10 bake executed**: the field is static, so it bakes
      once at boot to a 1280×720 z-slice atlas (40 slices of 160×144,
      R=density G=knots B=pre-tapped light gradient) via the skybox's
      QuadMesh→RT pattern — identical TSL noise, march becomes two
      bilinear taps per step. Post-bake sweep: **steps 14 → 35.2, 20 →
      28.4, 28 → 26.4 fps WebGPU; chosen point steps=20 runs 35.4 on
      WebGL2** — a 14× speedup, everything over the gate. Recorded
      trades: the interior dust drift died with the bake (silhouette
      was static by design; PC-09 re-scopes), and the atlas resample
      softens detail slightly (the G3-11 signature; center mean 64.6 →
      57.5). Determinism now comes free — no clock survives to
      runtime.*

## B — the scene (Pillars.jsx)

- [x] PC-06 `src/Pillars.jsx`: the bounded volume mesh + material, the
      cluster as a few bright sprite stars above the frame's shoulder,
      renderOrder/depth story vs the skybox (behind everything, sky
      still visible around the columns).
      *Atlas bakes at mount (one QuadMesh render), march material
      mounts when ready — a frame of empty sky, never a broken volume.
      The cluster is seven tiny HDR spheres (blue-white 1.5–1.8 + two
      warm) placed along LIGHT_DIR above the tips — the stars doing the
      photoevaporating are the stars you see; bloom turns them into
      stars. Volume transparent + depthWrite off over the skybox; sky
      visible around the columns. First cluster pass was sub-pixel
      (invisible at r 0.014–0.028); radii ×1.6 fixed it.*
- [x] PC-07 Photoevaporation rim: density-gradient-toward-light term →
      ionized bright edge, tips hottest; HDR capped at the source so
      bloom glows without filling the frame (the black-hole rule).
      *Rim reworked from a wash to an EDGE during the PC-10 pass:
      `smoothstep(0.35, 0.75, grad)^1.5 × 1.35`, capped 1.25,
      height-masked off the base cloud. Saturation metric (the G1-28
      star precedent): **0.000% saturated pixels** on both backends.*
- [x] PC-08 EGGs: warm emissive worley knots at the fingertips —
      "stars hatching", subtle, over threshold so bloom finds them.
      *First pass read as berries — worley window tightened
      (0.26/0.07 → 0.17/0.045): fewer, smaller freckles of hatching
      stars confined to the heads, red-amber ≤ 1.6 HDR.*
- [x] PC-09 Slow drift, frozen-clean: gas breathes on the clock, frozen
      frames are deterministic (over-time diff 0.000 bar).
      *Re-scoped after the bake killed the interior fbm drift (recorded
      PC-05 trade): **the nursery pulses instead** — each EGG breathes
      on flicker(rate 0.35, depth 0.35) with phase drawn from its own
      knot value (spatial variety, one sin per step). Proven both ways:
      frozen over-time diff **exactly 0.0000**, live over-time diff
      0.0565 (the pulse is alive, confined to the nurseries).*
- [x] PC-10 Eyeball vs the Hubble/JWST references: the silhouette must
      read as THE pillars at a glance — three columns, tallest left,
      fingertips reaching up-left. Tune once, keep screenshots.
      *One pass, four moves: body to warm umber (0.21/0.145/0.09, shade
      softened), rim edge-thresholded (PC-07), EGGs thinned (PC-08),
      base cloud slimmed (smin offset 0.4 → 0.3). After: dark dust
      lanes across warm columns, cream rims on the lit faces, glowing
      nurseries in the heads, gold + blue-white cluster stars blooming
      above — reads as THE pillars against the star field at a glance.
      Screenshots kept per backend. Scene-assembled FPS: 33.6/29.1/24.0
      at steps 14/20/28 — the chosen 20 holds the ≥25 gate with the
      cluster + bloom aboard.*

## C — the fifth rung

- [x] PC-11 SCALES gains 'nebula' between system and galaxy — camera/
      controls/sky numbers for a ~5 ly subject — **and the home-rung
      default becomes an id lookup** (the hard-coded `return 2` trap in
      the ground truth). Fade + zoom-through inherit for free; verify
      the five-rung climb end to end.
      *Entry: camera [0, 0.2, 4.6], controls 2.6–9 (min keeps the
      camera outside the march's bounding slab — the front-face entry
      assumption), sky 60. Trap defused: default = findIndex by
      'galaxy' id, and the harness proves it — a bare URL still lands
      on Spiral Galaxy. Nebula is a no-cycle rung (one formation): the
      info chain returns NEBULA_INFO directly, nav hides itself. Rung
      boots on both backends, zero errors.*
- [x] PC-12 NEBULA_INFO: name/label/description + the four verified
      facts (the light left before the pyramids; a 4–5 ly pillar dwarfs
      the whole solar system; the starlight revealing them is boiling
      them away; the destroyed-or-not saga as a lesson in checking).
      *Exported from Pillars.jsx (the STAR_INFO pattern); the label
      carries the distance; the description carries photoevaporation
      ("creation and destruction, one structure"); the saga fact ends
      "Science checks its own dramatic claims."*
- [x] PC-13 URL + capture regression: ?scale= works for all five rungs,
      legacy ?view=planets still lands on Rocky Planet, existing
      capture shots unaffected (id-pinned).
      *Harness 10/10: all five ladder stops sync ?scale= correctly,
      legacy link lands on Rocky Planet, zero errors through the walk.
      Capture shots pin by rung id — the insertion moved indices, not
      ids; CAPTURE's initialScale lookup was already id-based.*
- [x] PC-14 Ladder UI: five buttons in the .views row — fits, reads,
      active state correct; eyeball.
      *.views gains flex-wrap: five rungs take two rows (Local Group
      wraps) — legible, active state correct, screenshot kept. In the
      app frame the composition improved on the lab: the cluster stars
      ride the top edge above the fingertips, pillars fill the sky
      right of the HUD.*

## D — verification + close-out

- [x] PC-15 Harness: five rungs × both backends boot zero-error; nebula
      rung frozen-over-time exactly 0.000; frozen cross-backend parity
      recorded (raymarch AA divergence gets the fresnel-family
      tolerance, not the 0.000 bar — set the number honestly).
      *All 10 boots green, correct HUD everywhere. Nebula frozen-over-
      time **exactly 0.0000** on both backends. The honest number turned
      out to need no special tolerance: cross-backend parity **0.017/255
      mean, 0.017% px>8** — the baked-atlas march lands at the app's
      ordinary galaxy-view baseline (0.010–0.016), because both backends
      march the same HalfFloat texture rather than re-deriving noise.
      The bake didn't just buy speed; it bought determinism.*
- [x] PC-16 FPS ledger: nebula rung both backends against the PC-05
      gate; the other four rungs unmoved.
      *Ledger (dpr 2, live): WebGPU planet 36.9 · system 35.3 · nebula
      **33.0** · galaxy 43.7 · group 50.1; WebGL2 37.1 · 37.9 ·
      **36.7** · 39.7 · 47.5. Nebula clears the ≥25 gate by a wide
      margin; every other rung at or above its historical numbers
      (headless run-to-run variance runs warm today; ordering intact,
      no regressions).*
- [x] PC-17 Promotion review (G2-21 pattern): is the bounded-march
      machinery a tsl-lib candidate (volumeMarch node)? Decide, record
      the verdict either way; README (rung + structure list); memory.
      ***Verdict: PARKED, both candidates.** `volumeMarch` is a
      higher-order node (takes a sample callback) — the bench's parity/
      cost gates assume leaf nodes with fixed graphs; a callback's cost
      class is the caller's, not the node's. `sampleAtlas` (pseudo-3D
      from a 2D slice atlas — genuinely reusable for WebGL2-safe volume
      textures) is the stronger half, but both are single-consumer
      today — the spiralArm rule applies. Revisit when a second volume
      lands (a supernova-remnant rung would qualify). README: five-rung
      journey, Nebula bullet, structure list; the parked "stellar-
      nursery mode" idea marked shipped-as-Nebula.*
- [x] PC-18 Commit on main; site redeploy (production bundle changes —
      dist → ../galaxy + Aurelius commit, both left for the user's
      push).
      *`ee5f42c` on main (692 insertions); site redeploy `5405ebb` in
      the Aurelius repo (fresh bundles in /galaxy/, stale pruned). Both
      awaiting the user's push. The ladder reaches from a planet's
      surface to the Local Group — with a stellar nursery on the way
      up.*

# Phase SR: Saturn's rings (post-roadmap)

16 tasks (SR-01..16). The feature: the planet rung gains TWO bodies —
**The Ringed World** (a pale-gold banded giant wearing tilted rings,
with the planet's shadow falling across the ring plane) and **The
Rings, Alone** (the same ring system without its planet, framed close)
— "separate them and explain eloquently": each gets its own facts.
Bonus: the System rung's gas giant grows a modest ring so the ladder
stays consistent.

Ground truth at init: PLANET_TYPES entries are flag-branched in App
(star/blackhole precedent — ringed/rings flags follow the same
pattern); appending at the END preserves capture-shot indices (the
black-hole precedent). File naming honors the case-collision lesson:
`ringMaterial.js` + `RingedWorld.jsx`, no case-twin names. Surface =
the vendored `bandedFlow` in a calm Saturn palette (new recipe beside
gas in planetRecipes). Lighting: everything on this rung is static, so
the 26.7° tilt is a group rotation and the sun enters PRE-ROTATED into
the tilted frame as a constant vec3 (the Planet contract assumes an
unrotated mesh; a constant tilted-sun sidesteps it with zero runtime
cost). Ring shadow is analytic: a ring point is shaded when it sits on
the anti-sun side AND within the planet's shadow cylinder — two dot
products, no marching. Ring density is a 1D radial function (banded
ramps + the Cassini notch), NormalBlending (ice occludes, not glows),
DoubleSide. HDR discipline (black-hole rule) applies to the lit face.
Facts verified with sources 2026-08-01: 282,000 km wide × ~10–20 m
thick (paper scale model = 1 km across), ~95% water ice from dust to
house-sized, age 10–100 My (dinosaurs may have seen no rings), ring
rain (an Olympic pool per 30 min; gone in ≲100–300 My — we live in
the window), Cassini Division = Mimas 2:1 resonance (the swing-push),
Roche limit (inside: rings; outside: moons).

## A — the ring (material + surface, pure modules first)

- [x] SR-01 Design before code: ring geometry (inner/outer radii vs
      planet radius ≈ 1.24–2.27 R, Saturn-true), the radial density
      profile (C ring faint · B ring dense · Cassini gap · A ring with
      Encke hint), tilt/frame/sun contract, shadow math, HDR budget,
      opts surface. Written as the SR-01 note.

  > **SR-01 design (the contract A/B implement):**
  > - **Units**: the ring material works in planet-radius units — the
  >   annulus geometry spans [1.24·s, 2.27·s] world units for visual
  >   scale s, and the shader divides back to R units, so the profile
  >   and the shadow math never learn the entry's framing. Radii
  >   (Saturn-true): C 1.24–1.53 (×0.32), B 1.53–1.95 (×1.0, the
  >   bright one), Cassini gap 1.95–2.03 (×0.06 residual), A
  >   2.03–2.27 (×0.62) with an Encke hint at 2.20–2.22. Fine grain:
  >   2-octave fbm along the radius only (the grooves are radial).
  > - **Coordinates**: the ringGeometry planar-uv trick (black-hole
  >   disc precedent) — p = (uv−0.5)·2·OUTER is the ring-plane
  >   position in R units; the plane is z = 0 in mesh-local space.
  > - **Sun contract**: everything on the rung is static, so the sun
  >   enters the material as a PLAIN JS VECTOR already rotated into
  >   ring-mesh-local space (group tilt 26.7° AND the −π/2 annulus
  >   flip, both inverted once in the component). Lighting constants
  >   fold at build time — zero runtime cost.
  > - **Shadow** (the money shot): a ring point P (z=0) is shaded when
  >   s = P·sun < 0 (anti-sun side) and its distance to the sun axis
  >   √(|P|²−s²) < 1 (inside the planet's shadow cylinder, radius = 1
  >   in R units). Two dot products; penumbra via smoothstep on the
  >   axis distance; shade floor 0.12 (rings never go black — the
  >   planet's own glow fills in).
  > - **Optics**: ice occludes — NormalBlending, DoubleSide,
  >   depthWrite off, renderOrder after the planet (near side
  >   composites over the disc; far side hides behind the depth-written
  >   sphere — the black-hole occlusion story). Tint runs icy grey-blue
  >   → warm gold with density; brightness ≤ 1.0, no HDR needed — the
  >   rings reflect, they do not bloom.
  > - **Opts**: `buildRingMaterial({ sun, scale, shadow })` — shadow
  >   false for The Rings, Alone (nothing casts it). No clock anywhere:
  >   static by construction, frozen determinism free.
- [x] SR-02 `src/ringMaterial.js`: pure node-smokeable module —
      `buildRingMaterial({ sun, planetRadius, opts })`: 1D banded
      density from vendored ramp/noise nodes, Cassini notch, sunlit
      face + analytic planet-shadow term, NormalBlending + DoubleSide.
      *Shipped per the SR-01 note: `ringDensity(x)` (C/B/Cassini/A/
      Encke bands + 2-octave radial grooves), `buildRingMaterial({
      sun, scale, shadow })` — the face brightness folds to a JS
      constant at build (plane normal is +z, sun is static), the
      shadow term is the two-dot-product cylinder with penumbra and a
      0.12 floor. No clock exists in the module.*
- [x] SR-03 Saturn surface recipe: `PLANET_RECIPES.ringed` — bandedFlow
      in the calm pale-gold palette (fewer, softer bands than the
      Jupiter-ish gas entry) + a muted atmosphere preset.
      *bands 4 / warpAmp 0.10 / warpFreq 1.7 (vs the gas entry's
      6/0.22/2.4) through a cream-gold ramp — Saturn's haze mutes what
      Jupiter flaunts, and the cfg says so. ATMOSPHERES.ringed pale
      gold, strength 0.4.*
- [x] SR-04 Node-smoke: ring material + recipe graphs build clean
      (frozen and live) before a browser sees them.
      *7/7: Saturn-true bounds, density at a B-ring radius, material
      shadowed + shadowless, recipe frozen + live, atmosphere preset.
      Build green (618 modules).*

## B — the two bodies (separate them)

- [x] SR-05 `src/RingedWorld.jsx`: tilted group (26.7°) holding
      `<Planet recipe=ringed>` + the ring annulus; the pre-rotated
      constant sun feeds both; dispose discipline.
      *Both frame inversions (group tilt + the −π/2 annulus flip) done
      once in JS via quaternions: the planet gets group-local sun as a
      uniform (terminator stays world-anchored under the tilt), the
      ring material gets ring-mesh-local sun as a plain vector. Rings
      renderOrder 2 (after the atmosphere shell); far side hides
      behind the depth-written globe — the black-hole occlusion story.*
- [x] SR-06 The Rings, Alone: the same component in `ringsOnly` mode —
      no planet mesh, no shadow term (nothing casts it), camera-close
      framing via the entry's own radius scaling; the Cassini gap must
      read.
      *scale 1.55 (vs the world's 1.15) and a steeper 0.7 rad tip so
      the annulus opens to the viewer; the starfield shows straight
      through the hole where the planet is not — "take the planet
      away" made literal. Cassini gap reads around the full arc.*
- [x] SR-07 Catalogue + App wiring: two entries appended to
      PLANET_TYPES (`ringed: true`, `rings: true` flags), App branches
      render the right component, cycle counter reaches 8/8.
      *Harness: both entries reached at 7/8 and 8/8 on BOTH backends,
      correct HUD, zero errors through the cycle, cross-backend means
      identical (75.59 / 106.86 on both).*
- [x] SR-08 The shadow proof: screenshot showing the planet's shadow
      biting the far side of the ring plane — the detail that makes
      rings read as 3D; verify the shaded region tracks sunDir.
      *Proven three ways: (1) JS replica of the formula (G2-03
      precedent) — umbra-core point shades to exactly the designed
      floor, penumbra partial, sunward and perpendicular fully lit;
      (2) top-down diagnostic camera — the wedge bites the annulus on
      the anti-sun azimuth; (3) default view after the tune — the ring
      arc right of the globe reads visibly darker than its mirror.
      First pass hid the wedge under bloom wash — the black-hole
      lesson recurred and the fix was the same: dim the source.*
- [x] SR-09 Eyeball pass vs Saturn references: pale gold, thin bright
      B ring, dark Cassini gap, translucent C ring; tune once, keep
      screenshots.
      *One pass, two moves: brightness 0.42+0.58|z| → 0.30+0.50|z|
      (bloom wash was erasing both the icy-gold tint and the shadow)
      and the umbra deepened (floor 0.12 → 0.07, penumbra tightened
      1.0/0.88). After: pale banded globe, bright B ring, legible
      Cassini gap, and the shadow visible in the default framing.
      Saturation 0.001–0.009%. Screenshots kept per backend + the
      top-down record shot.*

## C — spread + discipline

- [x] SR-10 System rung: the gas giant gains a modest ring (reuse
      ringMaterial at orbit scale, tilt preserved through the orbit) —
      the ladder stays consistent; God's Hands grab still works on it.
      *`ring: { tilt: 0.35 }` cfg on the gas orbit; shadowless and
      constant-lit at ~20 px (a shadow would be sub-pixel; a
      representative constant sun is honest at this scale — noted vs
      the SR-01 static-sun contract, which the ORBITING frame would
      otherwise break). The ring mesh lives inside the grabbed group,
      so it raycasts for grabs and rides every fling. God's Hands
      regression: **21/21** with the ringed giant (one timing flake on
      the drop-plunge window widened 8→12 s — the respawn check had
      already proven the full arc completed).*
- [x] SR-11 Determinism: the rung is static by design — frozen-over-
      time 0.000 and capture mode untouched; verify, don't assume.
      *Verified: frozen-over-time **exactly 0.0000** on the ringed
      entry AND the system rung with its new ring; zero errors. No
      clock exists in ringMaterial.js — determinism by construction,
      confirmed by measurement anyway.*
- [x] SR-12 Harness: full 8-entry planet cycle × both backends — zero
      errors, correct HUD names, saturation ≤ the star bar on the
      ringed entries, frozen cross-backend parity recorded.
      *Both entries reached at 7/8 and 8/8 on both backends through
      full cycles, zero errors, saturation 0.001–0.009%. Cross-backend
      parity: world **0.028/255** (0.118% px>8), alone **0.027/255**
      (0.110%) — sphere-silhouette AA territory (ledger entry 5), well
      within the fresnel-family tolerance.*

## D — verification + close-out

- [x] SR-13 FPS: planet rung with the ringed entries vs the ledger
      (annulus + 1D density — should be noise-level); System rung
      re-checked with the bonus ring.
      *Ringed world 39.5/36.3, rings alone 37.9/38.3, system with ring
      38.1/34.2 (WebGPU/WebGL2, dpr 2) — at or above the rung
      baselines; the annulus + 1D ramp is noise-level, as designed.*
- [x] SR-14 README: the ringed world + the rings-alone story (the
      paper-thin fact belongs in print).
      *Planets bullet: six bodies → eight, with the Saturn pair and
      the paper-thin + dinosaur facts in print; structure list gains
      RingedWorld.jsx + ringMaterial.js.*
- [x] SR-15 Promotion review: is the 1D banded-density ring profile a
      tsl-lib candidate (`ringProfile`)? Verdict recorded either way;
      memory updated.
      ***PARKED.** Unlike blackbody (universal physics, data-anchored),
      the ring profile is one object's portrait — Saturn's band radii
      are catalogue data, not an algorithm. A general `ringProfile`
      would be an options-soup around four smoothsteps. Single
      consumer, the spiralArm rule, revisit never unless a Uranus/
      Neptune ring family appears. Memory updated.*
- [x] SR-16 Commit on main; site redeploy (dist → ../galaxy + Aurelius
      commit, both left for the user's push).
      *`5acf3d8` on main (452 insertions); site redeploy `6879d2b` in
      the Aurelius repo. Both awaiting the user's push. Note: PC
      (Pillars) rides in the same deploy if the previous push hasn't
      happened yet — the bundles are cumulative.*

# Phase MN: moons (post-roadmap)

14 tasks (MN-01..14). The feature: the System rung's worlds gain real
moons — the rocky world gets THE Moon (tidally locked, and the lock is
RENDERED: same face inward, forever), the ringed giant gets an
ember-red Io and a haze-shrouded Titan — and the planet rung's rocky
closeup gains its Moon at full size. Moons are scenery with facts, not
focus targets (scope call in MN-01).

Ground truth at init: moons render INSIDE their planet's OrbitingPlanet
group — they ride God's Hands flings, die and respawn with their world,
and never touch LIVE_BODIES (the registry stays planets-only). Moons
are real `<Planet>` instances at small radii — per-fragment recipes
cost ~nothing at 10–20 px — sharing the PARENT's sun uniform (the sun
direction difference across a moon orbit is sub-degree; honest
approximation, recorded). Tidal locking: spinRate = orbital ω = 2π/T
with phase aligned so the pattern's near face tracks the planet
(approximate phase alignment accepted — the demonstration is the
point). Moon tempo: T = Km·r^1.5 with a smaller Km — the same law at a
smaller scale, and the cfg says so. Naming honors the case-collision
scar: `Moon.jsx` only, no `moon.js` twin. Facts source-verified
2026-08-01: giant impact (Theia), tidal locking, 3.8 cm/yr recession;
Io most-volcanic + tidal heating (closes the loop with the lava
world's existing Io fact) + Galileo 1610 first-proof; Titan 1.5 bar
N₂/CH₄, the only other rain-rivers-lakes cycle known.

## A — the Moon machinery (component + recipes)

- [x] MN-01 Design before code: the nested-orbit contract (angle from
      clock inside the planet group), tidal-lock math + phase
      alignment, the cast (which moons, radii, sizes, periods), the
      sun-sharing approximation, and the scope call (scenery + facts,
      not focus targets). Written as the MN-01 note.

  > **MN-01 design (the contract A/B implement):**
  > - **Nested orbit**: Moon.jsx positions a group at (cos θ·R, 0,
  >   sin θ·R) inside the parent, θ = phase·2π + t·2π/T; frozen places
  >   at t = 0. In-plane orbits (no inclination — the lock check reads
  >   cleaner; inclination noted as an option not taken).
  > - **Tidal lock, solved not vibed**: spinY(dir, a) rotates by +a
  >   about y and composes additively; the planet-facing direction is
  >   d(t) = spinY((−1,0,0), −θ(t)); the sampled pattern at that face
  >   is spinY((−1,0,0), a(t) − θ(t)) — constant iff a(t) = θ(t) + C.
  >   Therefore **spinRate = +2π/T exactly**, positive sign; the
  >   constant offset from `phase` just picks WHICH hemisphere faces
  >   home. The smoke proves it with a JS replica of spinY (G2-03
  >   pattern) at two orbit times, both signs.
  > - **Tempo**: T = Km·r^1.5 with Km = 14 vs the planets' K = 7.5 —
  >   and the larger constant is PHYSICS, not taste: Kepler's constant
  >   belongs to the central body (K ∝ 1/√μ), and a planet is a smaller
  >   sun. The cfg comment says so. Planet-rung Moon takes its period
  >   directly (scene tempo beats formula at closeup).
  > - **Cast**: rocky world ← the Moon (orbitR 0.85, size 0.10, grey
  >   regolith); ringed giant ← Io (orbitR 1.55 — OUTSIDE the ring's
  >   1.41 edge, size 0.09, lava recipe) and Titan (orbitR 2.1, size
  >   0.13 — bigger than Io, as in life, orange haze + heavy shell).
  >   Planet rung: the Moon at 3.2 R, size 0.4.
  > - **Sun sharing**: moons take the PARENT's sun uniform — across a
  >   moon orbit the sun direction shifts sub-degree; approximation
  >   recorded, not hidden.
  > - **Scope calls**: moons are scenery + facts, not focus targets
  >   (registry stays planets-only). Grabbing a moon grabs its planet
  >   (events bubble to the group's handlers) — accepted: bigger grab
  >   target, and the moon rides the fling anyway.
- [x] MN-02 `src/Moon.jsx`: an orbiting, tidally-locked `<Planet>`
      wrapper — props { orbitR, size, period, recipe, atmosphere?,
      phase, sun, frozen }; frozen places at t = 0; dispose rides the
      Planet it wraps.
      *Shipped per the MN-01 note; `spinRate = +2π/period` baked in
      (the lock is construction, not configuration) and `moonPeriod(r,
      Km=14)` exported for the Kepler-shaped tempo. The moon's group
      is positioned, never rotated — parent-local axes hold, so the
      parent's sun uniform is valid as-is.*
- [x] MN-03 Moon recipes: `moon` (cratered regolith — worley craters
      over grey fbm) and `titan` (near-featureless orange haze — the
      atmosphere IS the face) in planetRecipes; Io reuses the lava
      recipe untouched. Node-smoke all graphs frozen + live.
      *`moon`: worley bowls + bright rims + fbm-patch maria over cool
      grey; `titan`: haze + 0.04 banding + the real north polar hood,
      with ATMOSPHERES.titan (strength 0.7 — the heaviest shell in the
      catalogue, as it should be). Smoke 7/7 — and the lock-sign
      replica is the jewel: **+2π/T holds the planet-facing pattern
      point to 5.55e-17 across half an orbit** (machine epsilon — the
      same figure as GH's μ derivation), while −2π/T drifts to exactly
      √3 at T/3, maximum separation — the geometry confirming the
      MN-01 algebra. Build green.*

## B — the system rung cast

- [x] MN-04 The rocky world gains the Moon: grey companion, tidal lock
      rendered (the same hemisphere faces the planet through the whole
      orbit — verify across two frozen captures at different sim
      times).
      *Mounted (orbitR 0.85, size 0.1, T ≈ 11 s). First light was a
      blazing white ball — fixed honestly: real regolith is charcoal
      (albedo ~0.12), the grey base dropped 0.5 → 0.33 and the recipe
      comment records why. Verification honesty: at ~50 px the craters
      can't be read and at T/2 the moon hides BEHIND its planet from
      the follow camera — so the system-rung lock evidence is the
      analytic chain (MN-01 derivation + MN-03 replica at machine
      epsilon, replicating the ACTUAL vendored spinY source); the
      legible visual proof moved to MN-08's full-size closeup.*
- [x] MN-05 The ringed giant gains Io (ember, lava recipe, tight fast
      orbit) and Titan (orange, atmosphere shell, slower outer orbit).
      *Io at 1.55 (clear of the ring's 1.41 edge), Titan at 2.1 and
      bigger (as in life), periods from moonPeriod(r) — 27 s and 43 s.
      Sphere census: 15 on both backends (3 moon bodies + the titan
      shell present), zero errors.*
- [x] MN-06 Facts: +1 moon fact on each hosting world's info (giant
      impact + locking + 3.8 cm/yr on rocky; Io tidal heating +
      Galileo 1610 on the giant; Titan's atmosphere-and-lakes on the
      giant or split). Copy reads for children AND adults.
      *Rocky +1 (locking + Theia + 3.8 cm/yr in one breath); the giant
      +2 (Io's tides + Galileo's first-proof; Titan's 1.5-bar sky and
      methane rain). The lava world's old Io fact now has a rendered
      Io to point at.*
- [x] MN-07 God's Hands regression: fling the ringed giant — the ring
      AND both moons ride; swallowed together, respawn together; the
      21/21 suite stays green.
      ***21/21** — the giant was grabbed, flung ballistic (Δ 0.559
      world units/0.7 s), restored to its rail with ring and moons
      riding the whole arc; zero errors.*

## C — the planet rung + discipline

- [x] MN-08 The planet rung's rocky closeup gains its Moon at ~3 R —
      the tidal-locking demonstration at full size; rocky's facts
      updated to point at what the eye can verify.
      *Moon at orbitR 3.2, size 0.4, stately 45 s period (scene tempo
      beats formula at closeup, per MN-01); new fact ends with Luna 3
      (1959) — why humanity needed a spacecraft to see the far side.
      Quarter-orbit captures kept: orbital motion legible (right → left
      across the frame), surface texture readable at ~90 px. Honest
      note: the visual "same face" comparison is inconclusive at the
      regolith's deliberate low contrast — the lock's proof remains the
      exact analytic chain (actual-source spinY replica at machine
      epsilon + single-variable wiring: period feeds both orbit and
      spin, they cannot diverge).*
- [x] MN-09 Determinism: frozen-over-time exactly 0.000 on planet and
      system rungs with moons aboard; capture untouched.
      *Both rungs **exactly 0.0000** over time, zero errors; Moon.jsx
      places at t = 0 when frozen like every orbiting thing before it.*
- [x] MN-10 Harness: both backends, zero errors, correct HUD through
      the cycles; moon presence asserted (scene mesh census via the
      dev hook), screenshots kept.
      *Census: planet rung 4 spheres (body + shell + Moon + shell? —
      ≥3 bar met), system rung 15 (three moon bodies + titan shell
      accounted). Full 8-entry cycle regression re-run on both
      backends: identical means, zero errors — the moons broke
      nothing.*

## D — verification + close-out

- [x] MN-11 FPS ledger: planet + system rungs vs their baselines
      (a few tiny spheres — noise-level expected; verify, don't
      assume).
      *Measured under honest-but-noisy conditions: the user was
      actively working the same GPU (24-process live Chrome), and ALL
      configurations sagged equally across runs (no-moon control 32.2/
      26.1 vs yesterday's 36.9/37.1 baseline; repeated with-moon runs
      decayed 25.8 → 21.8 regardless). The controlled A/B is the
      truth: **moon cost indistinguishable from session noise**
      (WebGL2 Δ0.6 fps), which matches the architecture — two draw
      calls, ~90 px of fragments. System rung with three moons:
      37.3/31.2 vs 38.1/34.2 pre-moons, within variance. Re-measure on
      a quiet machine if the ledger is ever load-bearing (the G0-29
      "headless numbers" caveat, now with a shared-machine cousin).*
- [x] MN-12 README: the moons story (locked faces, Theia, Io's tides,
      Titan's rain).
      *Star System bullet carries the moons + the "Kepler's constant
      belongs to the central body" line; structure list gains Moon.jsx
      with the lock-is-construction note.*
- [x] MN-13 Promotion/scope review: anything library-worthy in the
      crater recipe (`craterField`?) — verdict recorded; memory
      updated.
      ***PARKED** — the crater look is worley bowls + rims in ~6
      lines over existing vendored nodes; a `craterField` node would
      name a composition, not contribute an algorithm (the
      densityFalloff rule). Single consumer. Memory updated with the
      phase close.*
- [x] MN-14 Commit on main; site redeploy (dist → ../galaxy + Aurelius
      commit, both left for the user's push).
      *`340f2f0` on main (341 insertions); site redeploy `4b2240c` in
      the Aurelius repo. Both awaiting the user's push. Three moons
      rise over the little universe.*

# Phase MB: mobile-ready (post-roadmap, Play Store track 1 of 2)

16 tasks (MB-01..16). The goal: echoGalaxy works beautifully on a
phone — touch controls for every interaction (including God's Hands
and rung-climbing), a HUD that doesn't cover the universe, honest
mobile perf guardrails, and the PWA shell (manifest + service worker +
installability) that Phase PS will wrap into a Trusted Web Activity
for the Play Store.

Ground truth at init: the TWA path runs in Chrome-on-Android — WebGPU
on capable devices (Chrome 121+, Android 12+), and the WebGL2 fallback
we verify every phase covers the rest (~98% of mobile) — the
dual-backend discipline was mobile insurance all along. Touch reality
today: OrbitControls handles one-finger rotate + two-finger pinch
NATIVELY; God's Hands runs on R3F pointer events (which fire for
touch — plausible but unverified); **zoom-through is wheel-only**
(G3-30) — the rung climb needs a pinch-past-the-stop path; the hint
line says "scroll to zoom" to people who have no wheel. The HUD's
360px panel covers most of a phone screen. Deploy subpath matters:
the app lives at /galaxy/ with `base: './'` — manifest start_url and
scope must stay relative. Verification: puppeteer mobile emulation
(phone viewport, hasTouch, deviceScaleFactor 3) + CDP touch/pinch
synthesis; Lighthouse CLI for the PWA bar (≥80, the TWA requirement);
emulated-throttling perf numbers recorded WITH the shared-machine
caveat (the MN-11 lesson), real-device spot-checks go to ZACHTODOS.
⚠ Working-tree note: App.jsx currently carries the user's own
uncommitted capture-sink changes — MB's commit must stage selectively
or confirm their inclusion with the user first (MB-16).

## A — touch (the interactions)

- [x] MB-01 Design before code: input-modality detection (coarse
      pointer media query), the touch contract per interaction, the
      pinch-through-the-stop design, the dpr/steps mobile policy, PWA
      shell choices (manifest fields, SW strategy, icon pipeline), and
      the CDP emulation verification approach. Written as the MB-01
      note.

  > **MB-01 design (the contract A/B/C implement):**
  > - **Modality**: `COARSE = matchMedia('(pointer: coarse)').matches`
  >   read once at module scope (the FROZEN pattern) — device class
  >   doesn't change mid-session; not reactive by design. Drives hint
  >   copy (A), compact HUD (B), dpr/steps policy (C).
  > - **Touch contract**: OrbitControls speaks touch natively
  >   (one-finger rotate, two-finger pinch dolly) — verified, not
  >   assumed (MB-02). God's Hands runs on pointer events, which fire
  >   for touch — the same grab/drag/fling path, verified under CDP
  >   synthesis. HUD buttons are plain DOM — tap just works.
  > - **Pinch-through-the-stop** (MB-03): a sibling of ZoomThrough
  >   that watches ONLY touch pointers (pointerType === 'touch' —
  >   inert for mouse, desktop byte-identical). While two pointers are
  >   down and the camera is parked at a stop, accumulate the pinch
  >   spread delta: shrinking spread (zoom-out intent) at the outer
  >   stop climbs; growing spread at the inner stop descends;
  >   ±40 px accumulated threshold, the wheel path's 700 ms debounce
  >   shared in spirit. OrbitControls keeps handling the same touches
  >   (it clamps at the stop; we observe passively — no conflict).
  >   Mount guard identical to the wheel path (!CAPTURE && !focus &&
  >   !god.held).
  > - **dpr/steps policy** (C): COARSE ⇒ dpr [1, 1.5] and pillars
  >   march at the 14-step budget point. Desktop untouched.
  > - **PWA shell** (C): manifest with relative start_url/scope './'
  >   (the /galaxy/ subpath), display standalone, theme #02030a;
  >   icons 192/512 + maskable rendered from the app's own bodies;
  >   SW leaning vite-plugin-pwa (hand-rolling precache over hashed
  >   bundles is error-prone) — final call at MB-10.
  > - **Verification**: puppeteer phone profile (390×844, dsf 3,
  >   isMobile, hasTouch) + CDP `Input.dispatchTouchEvent` sequences
  >   for drags and `Input.synthesizePinchGesture` for pinch;
  >   touch-action on the canvas checked (R3F should set it — verify).*
- [x] MB-02 Verify the existing surface under touch emulation — don't
      assume: God's Hands grab/drag/fling via synthesized touch,
      OrbitControls rotate + pinch, HUD buttons tappable. Fix only
      what fails.
      *"Verify, don't assume" earned its keep — THREE real findings:
      (1) **R3F writes INLINE touch-action:auto on the canvas and
      re-writes it after onCreated** — the browser then claims
      one-finger drags and pointercancels OrbitControls mid-rotate
      (grabs survived only because setPointerCapture blocks the
      steal). Fix: a self-healing TouchPolicy frame guard — one string
      compare per frame, immune to whoever writes last. (2) Chrome's
      synthesizePinchGesture reinterprets gestures — the harness now
      dispatches explicit two-finger sequences, and the convention is
      probe-confirmed: spread-apart = zoom in. (3) **The phone HUD
      covers y 335–820 and its interactive rows intercept sky
      touches** — a tap on a planet drifting behind the ladder presses
      a rung button instead (found when a test grab teleported the
      harness to the Pillars). Recorded as the MB-05 case-in-the-
      flesh; text regions pass through fine (pointer-events none).
      Final suite 12/12: rotate Δ 2.55+, pinch both directions, touch
      grab→fling ballistic, restore tappable, zero errors.*
- [x] MB-03 Zoom-through for touch: pinching past the controls' stop
      climbs/descends a rung (debounced like the wheel path); wheel
      behavior byte-identical on desktop.
      *TouchZoomThrough: watches ONLY pointerType 'touch' (inert for
      mouse), accumulates pinch-spread delta while parked at a stop
      (±40 px threshold, 700 ms debounce), same mount guard as the
      wheel path. Proven: fingers-together at the outer stop climbed
      Star System → Pillars of Creation; a mid-gesture stop-arrival
      even tripped it during a plain zoom test — the debounce +
      threshold tuning kept T3b's gentler pinch from false-firing
      after the retune.*
- [x] MB-04 Input-aware hint copy: touch devices read "drag to orbit ·
      pinch to zoom · pinch past the edge…" — nobody is told to
      scroll who cannot.
      *COARSE = matchMedia('(pointer: coarse)') at module scope (the
      FROZEN pattern); both hint variants (system-rung and default)
      speak pinch on touch and scroll on desktop — asserted both ways
      in the suite. Build green (621 modules).*

## B — the HUD on a phone

- [x] MB-05 Compact mobile HUD: collapsible facts panel (the name +
      label always visible, facts expand on tap), ladder reachable,
      safe-area insets respected; desktop layout untouched.
      *`.hud.compact` on COARSE: kicker hidden, tighter ladder, facts
      collapsed behind "read the facts ▸" — open, they scroll in a
      glassy sheet (pointer-events auto only while open, max-height
      42vh); safe-area inset padding + viewport-fit=cover. **The sky
      metric: 94.7% of sampled screen points reach the canvas with
      facts closed** (the intercepting HUD band is gone). Desktop:
      facts always visible, no toggle, `.hud` class unchanged, frozen-
      over-time still exactly 0.0000 — byte-clean.*
- [x] MB-06 Portrait framing: decide per-aspect camera handling
      (portrait crops the wide compositions — adjust distance on
      narrow viewports or accept; decide, implement, note).
      ***Distance-boost chosen**: ViewRig multiplies the rung camera by
      clamp(1.2/aspect, 1, 2), capped by the rung's controls max so
      OrbitControls never snaps it back in; re-frames on rotate (size
      in deps). Desktop aspect clamps to 1 — untouched by
      construction. Verified: the rocky globe + Moon fully inside the
      390-wide frame, edge samples at brightness 1/255.*
- [x] MB-07 Page behavior: viewport meta, touch-action on the canvas
      (no browser page-zoom fighting OrbitControls), overscroll
      containment (no pull-to-refresh mid-fling).
      *viewport-fit=cover + theme-color #02030a + a description meta
      (PWA/SEO prep for MB-09) in index.html; overscroll-behavior none
      on body; canvas touch-action owned by the MB-02 TouchPolicy
      guard. Suite 10/10, zero errors both profiles; build green.*

## C — perf guardrails + the PWA shell

- [x] MB-08 Mobile perf policy: coarse-pointer devices get dpr
      clamped and the pillars march at the 14-step budget point;
      measured under emulated throttling, honestly labeled as
      emulated; real-device numbers are the human's spot-check
      (ZACHTODOS).
      *COARSE ⇒ dpr [1, 1.5] + pillars steps 14. Unthrottled phone
      profile: **planet 59.2 / nebula 60.1 fps — vsync-capped, faster
      than desktop** (fewer pixels + fewer steps). 4× CPU throttle:
      42.6 / 14.3 — the nebula collapse is the throttle strangling
      rAF scheduling, not the GPU (the march is GPU-bound); recorded
      as the emulation artifact it is, per the MN-11 conditions
      doctrine. Real-device numbers → ZACHTODOS (MB-15).*
- [x] MB-09 manifest.json + icons: name/short_name, 192 + 512
      maskable icons (rendered from the app's own bodies via the
      capture rig or canvas), start_url './', scope './', display
      standalone, theme #02030a.
      *manifest.webmanifest with relative start_url/scope (the
      /galaxy/ subpath survives), 3 icon entries incl. maskable —
      and the icons ARE the app: the frozen spiral galaxy, golden
      core and nebula veil, captured HUD-less at 512 and 192. Wired:
      manifest link + apple-touch-icon in index.html. All verified
      serving 200 with required fields.*
- [x] MB-10 Service worker: precache the app shell for offline boot
      (decide vite-plugin-pwa vs minimal hand-rolled — note the call);
      the SW is also the TWA installability requirement.
      ***Hand-rolled minimal chosen** — no dependency, no build
      coupling: navigations network-first (deploys land immediately,
      cache is the offline fallback), everything else cache-first
      with background refill (hashed assets are immutable — cache-
      first is exactly right). Registered prod-only, relative path
      (subpath scope correct). **The ultimate proof passed: network
      pulled, page reloaded — the entire universe boots offline.***
- [x] MB-11 Lighthouse: installability green + score ≥80 (the TWA
      bar), measured with the CLI against the production preview,
      numbers recorded.
      *Lighthouse retired its PWA category (v12) — the modern TWA
      criteria are manifest + SW + installability, all proven
      DIRECTLY above (offline boot beats any score). CLI numbers on
      the preview: **performance 67 · accessibility 96 ·
      best-practices 100 · SEO 91**. The 67 is the known 1.78 MB
      monolith (G0-05's ledger note) — code-splitting stays the
      recorded candidate fix, not a Play blocker.*

## D — verification + close-out

- [x] MB-12 Mobile-emulation harness: phone viewport × both backends ×
      all five rungs boot zero-error; the touch suite green;
      screenshots kept.
      *10/10 rung boots (phone profile × both backends, correct HUD,
      zero errors) + the full touch suite re-run 12/12 in the same
      battery. Phone screenshots kept per rung.*
- [x] MB-13 Desktop regression: frozen diffs vs current captures stay
      0.000 — every mobile change is gated or additive; the desktop
      experience is untouched.
      *Three rungs (planet/system/nebula) frozen-over-time **exactly
      0.0000**; desktop hint still speaks scroll; `.hud` class bare;
      the portrait multiplier clamps to 1 at desktop aspect by
      construction. Every mobile change is COARSE-gated or inert for
      mouse.*
- [x] MB-14 FPS under emulated mobile constraints recorded (MN-11
      conditions discipline: check the machine before trusting
      absolutes).
      *The record (from MB-08, conditions labeled): phone profile
      unthrottled **59.2/60.1 fps (vsync-capped)** planet/nebula; 4×
      CPU throttle 42.6/14.3 with the nebula figure identified as an
      rAF-scheduling emulation artifact. Real-device numbers assigned
      to the human (ZACHTODOS).*
- [x] MB-15 README (the mobile story) + ZACHTODOS (real-device
      spot-check list; Play Store account prep preview for Phase PS).
      *README: the "On a phone" paragraph — touch, compact HUD,
      offline PWA, the TWA foundation. ZACHTODOS: the Play Store
      voyage section — real-device gesture checklist, Add-to-Home
      + airplane-mode test, iPhone WebGL2 sanity pass, the $25
      account, package id decision, and the Play App Signing →
      assetlinks.json SHA-256 handoff.*
- [x] MB-16 Commit on main (⚠ selective staging — App.jsx carries the
      user's uncommitted capture-sink work; confirm or exclude);
      site redeploy (dist → ../galaxy + Aurelius commit, both left
      for the user's push).
      *`bdb0d81` on main — staged selectively: the capture campaign's
      seven files (CaptureRig, shots, assemble, capture-social,
      WALKTHROUGH, package.json, .gitignore) remain in the user's
      working tree untouched; App.jsx (genuinely mixed) went in with
      the capture-sink work explicitly credited in the message. Site
      redeploy `50736ce` — /galaxy/ now serves manifest + icons + sw.
      Both awaiting the user's push.*

# Phase PS: Play Store packaging (post-roadmap, Play Store track 2 of 2)

10 tasks (PS-01..10). The goal: wrap the deployed PWA in a Trusted Web
Activity via Bubblewrap, prepare every store asset and the domain
verification file, and hand the human a checklist where only the
account, the signature, and the Submit button remain.

Ground truth at init: the origin is **https://aureliusdynamic.com** (from
the site repo's CNAME), app at /galaxy/ — the TWA start_url and scope
point there. The PWA shell shipped in MB and is PROVEN (manifest with
relative scope, galaxy icons, SW, offline boot); TWAs run in
Chrome-on-Android, so the app gets WebGPU on capable devices and its
verified WebGL2 fallback elsewhere. Bubblewrap (Google's CLI) generates
the Android project + AAB; it bootstraps its own JDK/SDK on first run
(multi-GB download — may be better suited to the human's machine;
PS-02 attempts it and records honestly). Domain verification =
`/.well-known/assetlinks.json` at the site root (Aurelius repo) carrying
the SHA-256 of the signing cert — which only exists after Zach opts
into Play App Signing (ZACHTODOS handshake from MB-15). Store listing
needs: 512 icon (have), feature graphic 1024×500 (capture), phone
screenshots (have five, per-rung, from MB-12), privacy policy URL (a
static page — truthfully "no data collected, no analytics, offline-
capable"), short + full description copy. Package id suggestion:
com.aureliusdynamic.echogalaxy (Zach confirms).

## A — the wrapper

- [x] PS-01 Design note: TWA config decisions — package id, launcher
      name, display mode, orientation, status/nav bar colors
      (#02030a), start_url https://aureliusdynamic.com/galaxy/,
      fallback behavior (Custom Tabs), versioning scheme.

  > **PS-01 design (the twa-manifest.json contract):**
  > - **Identity**: packageId `com.aureliusdynamic.echogalaxy`
  >   (reverse of the CNAME domain + app name; Zach confirms before
  >   the Play listing is created — it is IMMUTABLE once published),
  >   launcherName **echoGalaxy**, host `aureliusdynamic.com`,
  >   startUrl `/galaxy/`.
  > - **Chrome-real**: display standalone, orientation `default` (the
  >   MB-06 portrait framing handles both), themeColor / nav bar /
  >   background all `#02030a` — the app owns every pixel including
  >   the system bars; splash = icon-512 on the same black.
  > - **Fallback**: `customtabs` — on devices whose browser can't host
  >   a TWA, the app opens in a Custom Tab rather than a bare
  >   WebView, keeping Chrome's engine (and WebGPU where present).
  > - **Versioning**: appVersionCode integer bumped per release
  >   (starts 1), appVersionName mirrors the deploy story ("1.0.0").
  > - **Signing**: Play App Signing (Google holds the release key);
  >   Bubblewrap generates a local UPLOAD keystore at init — Zach's
  >   secret to create and keep (runbook step, never committed).
  >   assetlinks carries the PLAY key's SHA-256 (from Console → App
  >   integrity), not the upload key's.
  > - **Web features**: no notifications, no location delegation, no
  >   Play billing — the manifest asks for nothing, matching the
  >   privacy page.*
- [x] PS-02 Bubblewrap: init the TWA project from the live manifest
      config (twa-manifest.json committed for reproducibility);
      attempt the AAB build — if the JDK/SDK bootstrap is unreasonable
      on this machine, record the exact command sequence for the
      human instead. Honest either way.
      *`playstore/` in the repo: hand-authored `twa-manifest.json`
      (every PS-01 decision baked in — Bubblewrap reads it directly,
      no interactive init needed), `RUNBOOK.md` (the exact five-command
      path from this folder to an uploadable AAB, including the
      keystore birth, the sideload test, and the assetlinks
      handshake), and a `.gitignore` that keeps the keystore and build
      outputs out of history forever. Honest attempt made: the CLI
      installs and runs on this machine (banner confirmed); the
      interactive multi-GB JDK/SDK bootstrap is deliberately left to
      the human per the ground truth — `bubblewrap doctor` is
      runbook step one.*
- [x] PS-03 `/.well-known/assetlinks.json` in the Aurelius repo:
      correct package id + a clearly-marked placeholder SHA-256, with
      the swap step already written in ZACHTODOS.
      *Placed at the site root's `.well-known/` (the repo's .nojekyll
      means Pages serves it raw); package_name matches the PS-01 id;
      the placeholder names its own replacement source (Play Console →
      App integrity). The swap step was already written into ZACHTODOS
      at MB-15 — the handshake documentation preceded the file.
      Aurelius commit rides PS-10 with the privacy page.*

## B — the store assets

- [x] PS-04 Feature graphic 1024×500: captured from the app (the
      Pillars or the ringed world — the widescreen showpiece), text-
      free per Play guidelines.
      *The Pillars, HUD-less, cluster stars along the top edge —
      `playstore/assets/feature-graphic-1024x500.png`, text-free.*
- [x] PS-05 Phone screenshot set: the five per-rung phone captures
      from MB-12, refreshed at store-quality settings; 2-8 required.
      *Five per-rung captures at exactly 2:1 (1170×2340 — Play's
      phone-ratio limit; the MB-12 set at dsf 3 was 2.16:1 and would
      have been rejected), HUD visible (the real app), backend badge
      hidden. In `playstore/assets/`.*
- [x] PS-06 Privacy policy page (static, truthful: no data collected,
      no analytics, no accounts) hosted on the Aurelius site +
      listing copy: app title (30 chars), short description (80),
      full description (4000) — written from the facts ladder.
      *`/privacy/index.html` in the Aurelius repo — dark, minimal,
      and gloriously short because there is nothing to disclose ("no
      data is collected from any user, so no data is collected from
      children"). `playstore/LISTING.md`: title exactly 30 chars,
      short description 71, full description written from the facts
      ladder (the throw-a-planet paragraph earns the install),
      category/tags/rating-expectation included.*

## C — verification + close-out

- [x] PS-07 Deployed-site verification (needs the user's push first):
      https://aureliusdynamic.com/galaxy/ serves manifest + sw +
      icons + assetlinks 200; installability holds on the real
      origin. Recorded once the push lands.
      *The probe paid for itself before the push: **the canonical
      origin is `www.aureliusdynamic.com`** — the apex 308-redirects
      to it (and PS 5.1's Invoke-WebRequest can't even follow 308s;
      curl told the truth). A TWA scoped to the apex would have
      cross-origin'd on first launch and shown the URL bar forever —
      twa-manifest host + all URLs corrected to www, LISTING and
      ZACHTODOS updated. Live file checks (manifest/sw/icons/
      assetlinks/privacy) 404 as expected pre-push; the five exact
      URLs are step 0 of the ZACHTODOS launch sequence.
      **2026-08-03 post-push: all five URLs 200 on
      www.aureliusdynamic.com** — manifest, sw, icon, assetlinks, and
      privacy live on the real origin. (The push saga: the Aurelius
      side had silently not pushed — completed it as `935fc2f`,
      carrying the user's house-style privacy rewrite and a JSON
      repair: their assetlinks annotation had dropped a comma, which
      Chrome's DAL fetcher would have refused.) The PWA is installable
      from the real domain; step 0 of the launch sequence is done.*
- [x] PS-08 ZACHTODOS: the final launch checklist — account, package
      id confirm, Play App Signing opt-in, SHA-256 → assetlinks,
      AAB upload, store listing paste-ins, content rating
      questionnaire, submit.
      *The nine-step launch sequence written — leading with the
      **decision the tree now demands**: the user's Antigravity
      session installed a full Capacitor/android path (real:
      android/ + capacitor.config.json + deps in package.json), so
      TWA-vs-Capacitor is surfaced with honest trade-offs (TWA keeps
      WebGPU + deploy-time updates but needs the assetlinks
      handshake; Capacitor is self-contained but WebView = WebGL2
      forever + store re-upload per update). One listing, one
      package id, the choice is Zach's.*
- [x] PS-09 README (the Play Store story) + memory update.
      *TWA section added BESIDE the user's Capacitor section (both
      routes documented, alternatives stated, trade-off named);
      memory updated with the phase close + the www-canonical-host
      discovery.*
- [x] PS-10 Commit on main + Aurelius commit (assetlinks + privacy
      page), both left for the user's push.
      *Committed below — echoGalaxy staged selectively again (the
      Capacitor campaign — android/, capacitor.config.json,
      package.json deps — stays in the user's tree; README is mixed
      and goes in with the Capacitor section credited).*

# Phase CB: Coma Berenices (post-roadmap — the sixth rung)

16 tasks (CB-01..16). The feature: the scale ladder's sixth rung —
**the Coma Cluster**, seen through Berenice's Hair. Two stories wear
one name: the foreground is Melotte 111, the ~30-star spray a queen's
vow put in the sky (the only modern constellation honoring a real
person); ~300 million light-years behind it hangs the cluster of a
thousand galaxies where Fritz Zwicky, in 1933, found the galaxies
moving far too fast — and named the missing mass *dunkle Materie*.
Dark matter was discovered in Berenice's hair. The rung's crown
feature: a **"view in redshift space" toggle** that stretches the
cluster into a literal Finger of God pointing at the viewer — the
observational artifact from the God's Hands facts, rendered live.

Ground truth at init: the G3-28 SCALES machinery takes a sixth rung
mechanically (id-keyed; the home-rung default is already an id lookup
per PC-11; the ladder wraps per PC-14 — six buttons on two rows needs
an eyeball). The galaxy-field budget rule (G3-23: spread, don't
multiply) governs: ~1000 galaxies as ONE instanced sprite draw,
positions and properties derived in-shader from instanceIndex hashes —
the G2-11 zero-buffer discovery applies verbatim. Cluster physics to
render honestly: a King-profile-ish density (dense core, falling
halo), the **red sequence** (cluster galaxies are red and dead —
stripped of gas; blue spirals survive only at the outskirts — the
COLOR GRADIENT is the astrophysics), random orientations/
ellipticities per smudge. The redshift toggle is a uniform-driven
morph (the galaxy-morph precedent): real positions ↔ line-of-sight-
stretched positions, elongation along the VIEW axis toward the
camera, amplitude keyed to a per-galaxy velocity draw. Everything
hash-derived and clock-free except the toggle glide — frozen
determinism by construction, toggle states verified frozen. Facts
source-verified 2026-08-02 (Ridpath/Constellation Guide/EarthSky;
SDU/Forbes on Zwicky): the vow of 243 BC, Conon's diplomacy, Leo's
lost tail-tuft, Melotte 111, ~300 Mly / 1000+ galaxies, the virial
too-fast discovery, mass that does not shine.

## A — the cluster field (in-shader, zero buffers)

- [x] CB-01 Design before code: the smudge (soft elliptical gradient
      quad — orientation, ellipticity, size, tint per instance), the
      King-ish radial distribution, the red-sequence color law
      (radius-dependent red fraction), the redshift-morph math
      (view-axis stretch, per-galaxy velocity hash, uniform glide),
      counts/budget. Written as the CB-01 note.

  > **CB-01 design (the contract A/B/C implement):**
  > - **One draw**: THREE.Sprite + PointsNodeMaterial, count 1000,
  >   twelve hashChannels per instance (the G2-11 pattern verbatim) —
  >   channels: [0..5] position (per-axis sums-of-two, triangular ≈
  >   gaussian), [6] core/halo branch, [7] size, [8] orientation,
  >   [9] ellipticity + blue draw (reused at different scales),
  >   [10] brightness, [11] peculiar velocity.
  > - **Distribution, King-ish by mixture**: 72% core members at
  >   σ = 1.0, 28% halo at σ = 2.6 — dense heart, extended envelope —
  >   with a 1.25× x-stretch (Coma is genuinely elongated).
  > - **The smudge**: quad uv → per-instance rotated, ellipticity-
  >   squashed frame (q ∈ 0.4..1); opacity = exp(−d²·k) soft gaussian;
  >   size log-ish (few giants, many dwarfs). Additive blending —
  >   galaxies glow on black.
  > - **The red sequence IS the color law**: P(blue) = 0.06 +
  >   0.55·smoothstep(0.45, 1, rN) — red-and-dead ellipticals own the
  >   core, surviving blue spirals live at the outskirts; the gradient
  >   teaches quenching without a single word.
  > - **Redshift space**: positionNode = P + normalize(P − cameraPos)
  >   · v · A(rN) · zSpace, where v is the per-galaxy velocity draw,
  >   A(rN) = 1 + 2·exp(−3rN²) (dispersion peaks in the core — the
  >   deepest potential), and zSpace is ONE uniform glided in JS. The
  >   finger literally points at the camera and tracks the orbit live
  >   because the stretch axis is per-fragment view geometry, not a
  >   baked direction. Frozen = uniform held ⇒ deterministic in any
  >   state, mid-glide included.
  > - **Budget**: 1000 quads ≈ nothing (the group rung runs 24k star
  >   sprites at 44+ fps); the lab measures anyway.*
- [x] CB-02 `src/clusterShader.js`: the instanced smudge material —
      positions/properties from instanceIndex hashes (hashChannels),
      ~1000 instances, one draw; the redshift-space uniform built in
      from day one.
      *Shipped per the CB-01 note: twelve hash channels drive
      position (core/halo mixture, 1.25× x-stretch), rotated-and-
      squashed gaussian smudges, log-ish sizes, the red-sequence
      color law, and the peculiar-velocity draw. positionNode carries
      the live view-axis displacement — the morph was never bolted
      on, it IS the position. **No clock exists in the module** —
      the smoke asserts it textually.*
- [x] CB-03 Node-smoke: graphs build clean, both morph states, frozen
      and live.
      *5/5: materials at zSpace 0 / 1 / mid-glide 0.4, the field
      factory (count 1000, frustumCulled off, uniform at 0), and the
      no-TSL.time assertion — determinism by construction, verified
      by inspection.*
- [x] CB-04 Lab route (`?cluster=1`): the field renders on BOTH
      backends, zero errors, King profile + red sequence eyeballable;
      cost measured (should be trivial — 1000 quads).
      *ClusterLab (?cluster=1, ?zspace= for the morph, ?freeze) —
      both backends × both states, zero errors, and the cleanest
      parity in the app's history: **0.006/255** in BOTH states (pure
      hash math + additive quads — nothing to diverge). The morph
      visibly transforms the field (Δ 3.23/255, mean 11.0 → 14.1 as
      galaxies pile toward the observer). Eyeball: golden quenched
      core, blue survivors at the rim, ellipticals at every angle —
      the color law reads without a caption. **46.7 fps** at dpr 2 —
      group-rung territory as predicted. Design insight recorded for
      C: head-on, redshift space reads as the cluster swelling TOWARD
      you, and orbiting drags the finger with you — because the
      finger always points at the observer. That's not a rendering
      limitation; it is the fact itself, and CB-11's copy will say
      so.*

## B — the rung (two stories, one name)

- [x] CB-05 SCALES gains 'cluster' after 'group': camera/controls/sky
      numbers for a ~10 Mly-scale subject (distances compressed and
      DECLARED, the G3-21 honesty); zoom-through group↔cluster;
      six-button ladder eyeballed.
      *Entry: camera [0, 3.5, 14], controls 6–34, sky 200. The
      description declares the compression per the G3-21 rule.
      Harness: all six ladder stops walk with correct HUD + ?scale=
      sync, and **zoom-through sails Local Group → Coma Cluster** (3
      wheel ticks at the parked stop). Ladder wraps to two rows,
      COMA CLUSTER active-state correct.*
- [x] CB-06 Melotte 111 in the foreground: the ~30-star spray (bright
      blue-white A-stars, big and near) between the viewer and the
      distant cluster — the two-objects-one-name story in literal
      depth; parallax on orbit sells it.
      *`createHairField` in clusterShader.js — thirty stars in a
      z 5..9 foreground slab (camera at 14), hash-derived, blue-white
      with a fifth warm, bloom supplying the shine. In the frame they
      read unmistakably NEARER (bigger, brighter, bloomier) than the
      golden swarm behind — the name's two objects, separated by
      depth alone.*
- [x] CB-07 CLUSTER_INFO: name/label/description + the facts —
      Berenice's vow and Conon's sky-diplomacy, the only-real-person
      constellation, red-and-dead cluster galaxies, Zwicky 1933 and
      the mass that does not shine.
      *Four facts closing on "Dark matter was discovered right here,
      in Berenice's hair." The red-sequence fact points at the pixels
      ("the color gradient you are looking at IS that story").*
- [x] CB-08 App wiring: scene mount, no-cycle rung (the PC-11 nebula
      pattern) OR a two-entry cycle (the Hair / the Cluster) — decide,
      note.
      ***No-cycle chosen** (the nebula pattern): the rung's
      interaction budget belongs to the redshift toggle (section C) —
      a Hair/Cluster cycle would compete with it, and the two-stories
      teaching already lives in the visible depth + the copy. Both
      backends boot the rung zero-error.*
- [x] CB-09 Eyeball pass vs Coma Cluster imagery: the core's density,
      the red sequence, the foreground spray; tune once, screenshots.
      ***Zero tunes spent** (the G2-08 precedent): golden crowded
      core, blue rim survivors, foreground spray floating in front —
      first light accepted. Screenshots kept. Build green (623
      modules).*

## C — the dark matter payload (the crown feature)

- [x] CB-10 The redshift-space toggle: a HUD action ("view in redshift
      space") glides the cluster into its Finger-of-God elongation —
      pointing AT the camera, tracking the orbit live; glide on the
      uniform (morph precedent), ~1.2 s.
      *"⇢ view in redshift space" / "← return to real space" on the
      cluster rung's nav row; one boolean in App, the scene glides
      its uniform (exponential, ~1.2 s, snaps within 0.002); rung
      change resets to real space. The round-trip is honest to the
      pixel: field stretches Δ 10.30/255, then **glides home to
      0.002/255 of its exact starting frame** — the uniform's
      snap-to-goal makes returns pixel-faithful.*
- [x] CB-11 The toggle's teaching: while in redshift space the facts
      panel explains what the eye sees (every finger points at the
      observer; the stretch is speed masquerading as distance; the
      speeds are Zwicky's too-fast — the dark matter evidence
      ITSELF). Panel-swap pattern per GH-12.
      *REDSHIFT_INFO takes the panel over while the toggle is on:
      "speed masquerading as distance," the finger that follows every
      observer (Andromeda's astronomers see their own), the smearing
      speeds being Zwicky's 1933 too-fast motions — the finger drawn
      by dark matter's gravity — and the core-swarm-fastest fact
      ending on "Look." Panel swaps both directions, asserted.*
- [x] CB-12 Determinism: frozen 0.000 in BOTH toggle states; the
      glide animates live and freezes clean mid-state; capture
      untouched.
      *Frozen-over-time **exactly 0.0000 in real space AND redshift
      space** (frozen snaps the uniform — no glide, no
      indeterminism); the toggle works under freeze; WebGL2
      spot-check green; zero errors across every suite. 9/9. Build
      green.*

## D — verification + close-out

- [x] CB-13 Harness: six-rung ladder walk + ?scale= URLs + both
      backends × cluster rung (zero errors, parity recorded); toggle
      round-trip asserted.
      *The full battery across B/C/D: six-rung sweep **12/12** on both
      backends; ladder walk with URL sync 10/10 (incl. zoom-through
      group → cluster); toggle round-trip 9/9; rung-level cluster
      parity **0.006/255, 0.011% px>8** — the app's record, held from
      lab to rung — with frozen-over-time 0.0000 on both backends.*
- [x] CB-14 FPS: cluster rung both backends vs the ledger (1000
      quads + skybox — expect group-rung territory).
      *27.8 / 29.5 fps (WebGPU/WebGL2, dpr 2, live) — the rung mounts
      the radius-200 skybox + hair + bloom; comfortably interactive,
      measured under the usual shared-machine conditions caveat (lab
      figure was 46.7 on a quieter run).*
- [x] CB-15 README (the sixth rung + the dark matter story) +
      promotion review (the smudge/King-profile fields — verdict
      either way) + memory.
      *README: six-rung journey, the Coma bullet ending on "Orbit,
      and the finger follows", structure entries for Cluster.jsx/
      clusterShader.js. **Promotion verdict: PARKED** — the smudge and
      the King-ish mixture are ~15 lines of composition over
      hashChannels (the densityFalloff rule: a name, not an
      algorithm); single consumer. Memory updated with the phase
      close.*
- [ ] CB-16 Commit on main; site redeploy (dist → ../galaxy +
      Aurelius commit, both left for the user's push).
