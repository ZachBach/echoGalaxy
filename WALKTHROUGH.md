# echoGalaxy — walkthrough

How to start, run, and drive the app, from zero to the Local Group.

## 1. Prerequisites

- **Node.js 20+** (developed on Node 24) and npm.
- Any modern browser. **WebGPU** (current Chrome/Edge) gets the fast
  backend; everything else falls back to **WebGL2 automatically** — no
  configuration, same visuals (verified pixel-equivalent).
- Windows/macOS/Linux all fine; the repo itself is developed on Windows.

## 2. Install and run

```bash
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:5173`). That's it — the
app boots on the **Galaxy** rung with a spiral galaxy.

For a production build:

```bash
npm run build      # outputs dist/
npm run preview    # serves the built bundle locally
```

The bundle is fully self-contained (no CDN or runtime downloads).

## 3. Driving the app — the scale journey

Four rungs, smallest to largest: **Planet → System → Galaxy → Local
Group.**

- **Ladder buttons** (top of the HUD panel) jump straight to any rung.
- **Zoom-through**: scroll *out* while parked at a rung's outer zoom stop
  to climb a scale; scroll *in* at the inner stop to descend. One wheel
  gesture per rung.
- **Orbit**: drag to rotate, scroll to zoom (within each rung's range).
- **Prev / Next** cycles the objects on rungs that have a catalogue:
  five worlds on the Planet rung, four Hubble classes on the Galaxy rung.
  System and Local Group are single scenes.
- Every rung and object carries its facts in the HUD — that's the point
  of the tool.

### Shareable links

| URL | Lands on |
| --- | --- |
| `/` | Galaxy rung (home) |
| `/?scale=planet` | Planet rung |
| `/?scale=system` | Star System rung |
| `/?scale=galaxy` | Galaxy rung |
| `/?scale=group` | Local Group rung |
| `/?view=planets` | legacy link — still works, lands on Planet |

The URL updates as you move, so the address bar is always shareable.

## 4. Backend selection

- Automatic: WebGPU if the browser has it, otherwise three.js swaps in
  its WebGL2 backend during init (you'll see a console note).
- Force WebGL2 for comparison in any build: **`?backend=webgl`**.
- In dev, the active backend shows as a badge in the top-right corner.

## 5. Dev-only flags and scenes

These exist only on the dev server (`npm run dev`) — they are stripped
from production builds.

| Flag / route | What it does |
| --- | --- |
| `?freeze` | Freezes every animation (spin, orbits, twinkle, drift) — deterministic frames, used by the verification harnesses |
| `?simulate-no-webgpu` | Hides `navigator.gpu` so the real WebGL2 fallback path runs in a WebGPU browser |
| `?lab=1` | tsl-lib portability lab: cycles all 28 library gallery nodes on a sphere (←/→ keys) |
| `?planet=1` | Planet lab: cycles the planet recipes (extra flags: `&type=`, `&atmo=0`, `&spin=`, `&flat=1`, `&sun=x,y,z`) |
| `?system=1` | Star-system rung in isolation |
| `?group=1` | Local Group rung in isolation |

## 6. The vendored library (tsl-lib)

`src/tsl-lib/` is a **vendored copy** of the Aurelius TSL library — never
edit it here. If you have the upstream repo as a sibling (`../tsl-lib`):

```bash
npm run sync:tsl    # copy upstream src → src/tsl-lib, then run the full gate
npm run check:tsl   # gate only: self-containment + TSL-surface checks + runtime smoke
```

The gate fails loudly if a vendored module imports anything external or
uses a TSL member the installed three.js doesn't export.
`src/tsl-lib/VENDORED.md` records which upstream commit the copy came
from. New shader nodes are born in this app, promoted upstream through
the bench gate there, then synced back — see `TSL-ROADMAP.md` for the
full story and `TODOS.md` for the task-level history.

## 7. Troubleshooting

- **Port already in use** on `npm run dev`: a previous vite instance may
  survive its parent on Windows. Find and kill it:
  `Get-NetTCPConnection -LocalPort 5173 -State Listen` → `Stop-Process -Id <pid>`.
- **Black canvas on an old browser**: WebGL2 is the floor — anything that
  can't do WebGL2 can't run the app. Everything WebGL2+ works.
- **Performance**: the app targets ~30–45 fps at devicePixelRatio 2. On
  weaker GPUs the biggest lever is display scaling (the canvas renders at
  up to 2× your CSS pixels). WebGPU browsers are consistently faster.
- **Console warning about `THREE.Clock` deprecation**: harmless, comes
  from a dependency, tracked upstream.

## 8. Where things live

- `README.md` — feature overview + source-tree map.
- `TSL-ROADMAP.md` — the four-phase plan (all complete) and its decisions.
- `TODOS.md` — the full 160-task engineering log with per-task evidence.
- `scripts/` — the vendor sync + gate scripts.
