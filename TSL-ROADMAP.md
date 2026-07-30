# echoGalaxy × tsl-lib — planets, galaxies, the universe

echoGalaxy (free, open, educational) becomes the second consumer of the
Aurelius TSL library — and its proving ground: **every reusable visual trick
born here gets promoted upstream into `../tsl-lib/src`, bench-gated, and
registered before it counts as done.** The library grows with the universe.

## Ground rules

- echoGalaxy is its own product and repo (own remote, own deploys). The
  library is *vendored in*, never referenced across repo boundaries:
  `scripts/sync-tsl-lib.mjs` copies `../tsl-lib/src` → `src/tsl-lib/`
  (one-way; edits happen upstream, new nodes are born upstream, then synced).
  Deploy stays self-contained — no `file:` deps that break Vercel.
- **Version portability**: tsl-lib is verified on r178; echoGalaxy runs three
  **r184**. This is the library's first cross-version test — any TSL API
  divergence gets recorded in `tsl-lib/docs/BACKEND-NOTES.md` under a new
  "version portability" section.
- Educational mission first: every visual ships with a HUD fact. Keep it
  free, keep it light, keep it separate from the business projects.

## Phase G0 — plumbing (the WebGPU bridge) ✅ 2026-07-29

Task-level detail and evidence live in TODOS.md (G0-01..40).

- [x] WebGPURenderer in R3F v9: `gl` async factory (`three/webgpu`,
  `await renderer.init()`), WebGL2 auto-fallback — same dual-backend story
  the library is verified for.
  *`src/renderer.js`. Fallback is three's own (no app code); test flags
  `?backend=webgl` (forceWebGL) and `?simulate-no-webgpu` (dev, hides the
  adapter — same trick as the upstream bench, ledger entry 4). Dev badge
  shows the active backend. Cross-backend parity: channel means identical
  to ±0.01 on all four galaxy types; WebGPU ~20% faster headless.*
- [x] Bloom decision: current `@react-three/postprocessing` is WebGL-only.
  Replace with three/webgpu's own PostProcessing + bloom node (preferred) or
  gate bloom to the WebGL path during transition.
  *Preferred path taken — no gating needed; the old composer hard-crashes
  the Canvas under WebGPURenderer, so it's gone entirely. Note: r183
  renamed PostProcessing → `RenderPipeline`, and `bloom` is an addon
  (`three/addons/tsl/display/BloomNode.js`) speaking strength/radius/
  threshold — tuned to 0.55/0.25/0.04 in `src/Effects.jsx` to match the
  old look. Runs on both backends, numerically equivalent.*
- [x] `scripts/sync-tsl-lib.mjs` + first vendored copy; smoke: v0.1 galaxy
  renders unchanged under WebGPURenderer on both backends.
  *"Unchanged" needed one structural fix: WebGPU can't size point
  primitives, so `<points>` drew nothing — the galaxy is now instanced
  sprites (`Sprite` + `PointsNodeMaterial`), which is also G2's base
  (ledger entry 6). Sync grew into a full vendor gate: `npm run sync:tsl`
  = sync → self-containment + TSL-surface checks → 26-entry runtime smoke
  → build, upstream commit stamped in VENDORED.md.*
- [x] Version-portability smoke: a test scene cycling library nodes (fbm,
  worley, fresnel, trigLattice, curtain) on r184 — divergences → upstream
  ledger.
  *`?lab=1` (dev-only) cycles all 26 gallery entries, not just the five —
  zero errors, zero dark renders on both backends. Verdict recorded
  upstream (BACKEND-NOTES.md "Version portability"): **r184 clean, no
  library-code changes** — the dependency-injection design paid off.*

## Phase G1 — planets (mostly already in the library) ✅ 2026-07-30

The hero's Terra/sun work came *from* these nodes; now they make worlds.
Task-level detail and evidence: TODOS.md (G1-01..40).

- [x] `<Planet>` component: sphere + library nodes — `trigLattice`
  continents, `terminator` day/night + city lights, `latlonUv` texture
  mapping, `atmosphereShell` limb glow, `spinY` rotation.
  *Body-frame pipeline (`planetMaterial.js`): sampling dir spins, mesh and
  terminator stay world-anchored; terminator composition lives in the core
  once (`surface·shade + nightLights·night + emissive`); atmosphere is a
  ×1.03 additive shell. latlonUv unused so far (procedural surfaces beat
  textures here) — stays available for catalogue imagery later.*
- [x] Planet types: rocky (trigLattice + ramp), lava (magma recipe), ice
  (ice recipe), gas giant — **new node candidate: `bandedFlow`** (latitude
  bands + warp turbulence — born here, promoted upstream).
  *All four shipped; `bandedFlow` completed the first full promotion loop —
  upstream `51f6f2c`, parity 0%, gpu 2.69 ms → class ③, then consumed back
  vendored as a pixel-perfect drop-in.*
- [x] Star: fireRamp plasma sphere (El-Sol recipe) + corona streaks.
  *Separate `<Star>` (no terminator). Corona lesson recorded in TODOS: the
  falloff coordinate is the view ray's impact parameter, not fresnel and
  not positionView.xy. Zero saturated pixels under bloom.*
- [x] HUD facts per planet type (educational payload).
  *planetData.js catalogue + Galaxies|Planets switcher (`?view=planets`);
  all five worlds byte-stable across backends in the real app view.*

## Phase G2 — galaxies go TSL ✅ 2026-07-30

Task-level detail and evidence: TODOS.md (G2-01..40).

- [x] Points → TSL sprite material: per-star color via `cosinePalette`
  (blackbody-ish preset — **candidate: `blackbody(temp)` ramp node**),
  twinkle via `flicker`, soft discs via `spriteDisc`.
  *`blackbody` became a dedicated ramp node, not a preset — anchored to
  the published 10deg-CMF table on the mired axis, validated to 8/255
  worst error, promoted upstream (parity 0%, class ②). spriteDisc killed
  the CanvasTexture and improved cross-backend parity 30–100×; flicker
  twinkle + sizeNode depth. Faster than the texture era.*
- [x] Density done in-shader — **candidates: `spiralArm(p, {arms, twist})`,
  `densityFalloff`** — CPU `generateGalaxy` becomes seed/layout only.
  *Went further: generateGalaxy is DELETED — every per-star quantity
  derives from instanceIndex via hashChannels, zero attributes, and type
  switching is a uniform swap on one persistent sprite (spiral IS barred
  with bar=0). spiralArm/densityFalloff reviewed and PARKED as in-app
  prototypes (app-level composition / one-liner — below the node bar);
  morph/crossfade parked for G3.*
- [x] Nebula backdrop per galaxy type (fbm veil, brand-free palette —
  educational colors, not Aurelius gold).
  *Disc-plane veil = the galaxy's own gas, emission-physics palettes (Hα
  pink, reflection blue, warm dust, teal knots) — and the elliptical's
  veil nearly absent because ellipticals ARE gas-poor. Frame budget
  enforced (3 fbm octaves, veil-disc geometry); veil bake-to-texture
  recorded as the G3 optimization.*

## Phase G3 — the universe ✅ 2026-07-30

Task-level detail and evidence: TODOS.md (G3-01..40). The roadmap is done.

- [x] STARFIELD material (already in the library) as the deep-space skybox.
  *BackSide sphere with the recipe's star-lattice machinery (its
  fullscreen fbm wisp cost 14 fps for a sub-perceptual term — credited
  adaptation, recipe stays canonical upstream), baked to an equirect at
  boot and sampled back through `latlonUv` — G1's unused node earning its
  keep. Twinkle survives the bake via phase-in-alpha.*
- [x] Scale journey: planet → system → galaxy → local group (drei controls +
  staged LOD scenes).
  *Four rungs, one state machine; ladder UI + `?scale=` links + literal
  zoom-through (scroll past a rung's stop to climb). New rungs: a star
  system on literal Kepler-third-law orbits with per-planet sun uniforms,
  and the real Local Group (barred Milky Way, Andromeda + companions,
  Triangulum) inside a single 24k-star budget. Performance bakes landed
  first: star positions via compute (WebGPU, byte-perfect; WebGL2 gated
  by a real re-dispatch divergence → ledger watch list), veil + sky to
  textures. Final FPS: 33–45 WebGPU / 27–35 WebGL2 across all rungs.*
- [x] Facts ladder at every scale — the tool's whole reason to exist.
  *Every rung feeds the same HUD skeleton: planets (5 entries), system
  (Kepler live, AU, 99.86%), galaxies (4 Hubble classes, blackbody-true
  colors), Local Group (blueshift collision, "a view no probe we have
  ever built will live to photograph"). The library gained three nodes
  end-to-end (bandedFlow, blackbody + the STARFIELD/latlonUv payoffs),
  one confirmed backend divergence, one watch-list entry, and an r184
  clean bill — the proving ground did its job.*

## Promotion checklist (per new node born here)

1. Extract to `../tsl-lib/src/<family>/<name>.js` (conventions apply:
   factory shape, options, derived `source()`, doc block).
2. Bench entry + `node bench/verify-all.mjs <name>` — parity + cost.
3. `gen-docs`, gallery chip if it's showable, then `sync-tsl-lib` back here.
