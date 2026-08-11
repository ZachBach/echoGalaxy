# ZACHTODOS — the human's list

The machine side is done: roadmap G0–G3 complete, capture rig verified
deterministic, framing approved. Everything left needs your hands, your
eyes, or your accounts. Ordered by dependency.

## Launch video — production

- [ ] **⚠ RE-RENDER 05-system + 02-rocky and re-assemble the 4:5 master
      before posting it.** Found 2026-08-03 while probing the promo shots:
      R3F's `advance(ts)` writes the raw millisecond timestamp into
      `clock.elapsedTime`, so under the old rig every `elapsedTime`
      consumer ran 1000× fast — the System rung's planets STROBE around
      their rails frame-to-frame, and the rocky world's moon does the
      same. Stills look fine (that's why the framing review missed it);
      only motion shows it. CaptureRig now owns the clock and the fix is
      verified frame-by-frame. Shader-driven shots (galaxies, star,
      Pillars) were never affected. Fresh, correct 4:5 frames for the
      launch shots can be re-rendered with:
      `npm run capture:social -- --aspect 4x5 --fps 60 --shots 02-rocky,05-system --out video\frames-4x5-relaunch`
      (fps 60 to match your original frames folder), then swap them in
      and re-run assemble.
- [x] **Install ffmpeg** (it is not on your PATH; assembly needs it):
      `winget install ffmpeg`, then confirm with `ffmpeg -version`.
      *(ffmpeg 8.1.2 via winget — 2026-08-03.)*
- [ ] *(Recommended, ~10 min)* **Full contact sheet at fps=6** before the
      real run: all ten shots at `&fps=6`, glance at every clip. I
      verified framing on 01/02/04/05/10 — shots 03-gas, 06-spiral,
      07-barred, 08-elliptical, 09-irregular you'll see here first.
      Adjust keyframes in `src/capture/shots.js` if anything bothers you;
      the loop is cheap.
- [ ] **Capture the 4:5 master set** — `npm run dev`, then one URL at a
      time in Chrome/Edge, all into ONE `frames/` folder (click the page
      when prompted; ~4–8 GB free disk first):
      ```
      localhost:5173/?capture=01-hook&aspect=4x5&fps=60&backend=webgl
      localhost:5173/?capture=02-rocky&aspect=4x5&fps=60&backend=webgl
      localhost:5173/?capture=03-gas&aspect=4x5&fps=60&backend=webgl
      localhost:5173/?capture=04-star&aspect=4x5&fps=60&backend=webgl
      localhost:5173/?capture=05-system&aspect=4x5&fps=60&backend=webgl
      localhost:5173/?capture=06-spiral&aspect=4x5&fps=60&backend=webgl
      localhost:5173/?capture=07-barred&aspect=4x5&fps=60&backend=webgl
      localhost:5173/?capture=08-elliptical&aspect=4x5&fps=60&backend=webgl
      localhost:5173/?capture=09-irregular&aspect=4x5&fps=60&backend=webgl
      localhost:5173/?capture=10-group&aspect=4x5&fps=60&backend=webgl
      ```
- [x] **Assemble the master**:
      `node scripts/assemble.mjs --frames ./frames --out echogalaxy-4x5.mp4 --titles`
      Watch it end to end. Check the title-card timings read well against
      the actual cut (they're set in `scripts/assemble.mjs` → `TITLES`).
      *(video/echoGalaxy-4x5.mp4 — probed clean: h264, 1080×1350 exact
      4:5, 30 fps, 40.4 s, ~6 Mbps, 29 MB; frames sampled at 2/20/38 s
      show the rocky open, the Pillars mid-cut, and the Local Group
      close card. The end-to-end watch is still your eyes' job.)*
- [ ] **Capture + assemble the 9:16 Reels cut** — same ten URLs with
      `aspect=9x16` into a `frames-9x16/` folder, then:
      `node scripts/assemble.mjs --frames ./frames-9x16 --out echogalaxy-9x16.mp4 --titles`
- [ ] **Delete the frame folders** once both masters are encoded (they're
      the disk hogs; the mp4s are the keepers).

## Launch video — publishing

- [ ] Write captions per platform (the HUD facts are ready-made copy —
      the blueshift line and "a view no probe will ever photograph" are
      the hooks). Link the deployed app in every post.
- [ ] Post: **LinkedIn + Facebook** get the 4:5 master; **Instagram +
      FB Reels** get the 9:16 cut.

## Repo housekeeping

- [x] **`git push`** in echoGalaxy — main is ahead 1 (the capture-rig
      commit isn't on origin). No redeploy needed: capture mode is
      dev-only and stripped from the production bundle.
      *Done — `main` verified 0 ahead / 0 behind `origin/main` (2026-08-11).*
- [x] Stray `package-lock.json` sitting at the AureliusDynamicSolutons
      root (outside both repos) — looks like an accidental npm run in the
      parent folder; delete it or gitignore it.
      *Deleted in the Aurelius repo's `prune:` commits; the path is gone
      from disk (verified 2026-08-11).*
- [x] tsl-lib upstream — nothing pending; watch-list entry committed
      (`58e1935`) and pushed. ✓

## Parked ideas (post-roadmap, whenever a new voyage calls)

- [x] Member-focus nav on the System/Local Group rungs — SHIPPED: both
      rungs now cycle overview → each body (8 group entries with real
      facts for the Milky Way, Andromeda, Triangulum, LMC, SMC, M32,
      M110; 6 system entries with an orbit-following camera). Bonus per
      the father's suggestion: a child-scale fact on the star — if the
      Sun were a bowling ball, Earth would be a peppercorn; 1.3 million
      Earths fit inside.
- [x] Galaxy type morph/crossfade — SHIPPED (WebGPU): the compute bake's
      two buffers ping-pong per type switch and the material glides
      positions, rN, and temperatures over ~1.1 s — stars physically
      migrate between Hubble classes, the veil fades in alongside.
      WebGL2 keeps the instant swap (its live path can't afford all
      families resident); frozen mode snaps for determinism. End state
      byte-identical (0.000) to the pre-morph app on both backends.
- [ ] Real catalogue imagery (Messier/NGC) mapped via `latlonUv` — the
      original README roadmap idea that's still open.
- [x] Refresh the README "roadmap ideas" list — done ("Ideas for future
      voyages").
- [ ] Consider writing up the bandedFlow/blackbody promotion story — the
      born-here→bench-gated→synced-back loop is a good engineering tale.

## Play Store voyage — your side (Phases MB ✅ / PS)

Phase MB (mobile-ready) is done and verified under emulation: touch
controls, compact HUD, PWA shell, offline boot. Emulation is honest but
not a phone — these need your actual hands:

- [ ] **Real-device spot-check** (any modern Android, Chrome): load the
      deployed site — orbit, pinch, pinch-past-the-edge to change
      scale, grab-and-fling a planet on the System rung, toggle the
      facts sheet. Then Chrome menu → "Add to Home screen" — confirm
      the galaxy icon appears and the app opens standalone (no browser
      chrome). Airplane mode → reopen: it should boot offline.
- [ ] **iPhone sanity pass** (Safari): same gestures; iOS has no WebGPU
      in Safari yet, so the badge-free WebGL2 path carries it — that's
      by design.
- [ ] **Google Play developer account** — play.google.com/console,
      one-time $25. (Needed before any Phase PS upload.)
- [ ] Decide the **package id** (suggest `com.aureliusdynamic.echogalaxy`)
      — Phase PS will bake it into the TWA config.
- [ ] When PS produces the app bundle: opt into **Play App Signing**
      (Google holds the key), copy the SHA-256 certificate fingerprint
      from Play Console → App integrity into `assetlinks.json` (PS
      prepares the file with a placeholder), redeploy the site, then
      submit.

## Play Store — the launch sequence (Phase PS ✅, your hands from here)

Everything below is prepared; only accounts, signatures, and Submit
remain. Assets: `playstore/assets/` (feature graphic + 5 screenshots),
copy: `playstore/LISTING.md` (paste-ready, char-counted), build:
`playstore/RUNBOOK.md`.

**Target API deadline (checked 2026-08-03):** Google Play requires
target API 36 for new apps by 2026-08-31. The Capacitor path already
complies — `android/variables.gradle` sets compile + target SDK 36, so
the downloads-brief warning about Capacitor defaults doesn't apply to
this repo. TWA path: Bubblewrap generates its Android project at build
time — run it via a current `npx @bubblewrap/cli` and confirm the
generated project targets 36 before upload (add it to the RUNBOOK
five-command check).

**⚠ Decision first — TWO packaging paths now exist:**

- **TWA (Bubblewrap, `playstore/`)** — wraps the DEPLOYED site in
  Chrome itself: WebGPU on capable phones, ~1 MB app, updates ship by
  deploying the website (no store review per update). Needs the
  assetlinks handshake below. *This is Phase PS's recommendation — it's
  the only path that keeps WebGPU.*
- **Capacitor (`android/`, from your Antigravity session)** — bundles
  the app into a WebView APK: fully self-contained from install, no
  domain handshake, but **no WebGPU** (Android WebView doesn't ship
  it — the app runs its WebGL2 fallback forever) and every update
  needs a store re-upload. Commands are in the README's Capacitor
  section.

One listing = one package id = one path (you can switch later, but the
id is forever). Pick, then:

- [ ] 0. Push both repos (echoGalaxy + Aurelius) — PS-07's live checks
      are waiting on it: `www.aureliusdynamic.com/galaxy/` must serve
      `manifest.webmanifest`, `sw.js`, `icon-512.png`; the root must
      serve `/.well-known/assetlinks.json` and `/privacy/`.
- [ ] 1. Play Console account ($25, play.google.com/console).
- [ ] 2. Create the app: name from LISTING.md, Education category,
      free. Package id `com.aureliusdynamic.echogalaxy` (already baked
      into both the TWA config AND matching what Capacitor should
      use — check `capacitor.config.json` agrees if you go that road).
- [ ] 3. Build the AAB — TWA: RUNBOOK.md five commands (first run
      creates your upload keystore — back it up, it's gitignored).
      Capacitor: the README section's three commands.
- [ ] 4. Upload to Internal testing first; opt into **Play App
      Signing** when asked.
- [ ] 5. (TWA path only) Console → Setup → App integrity → copy the
      **App signing key** SHA-256 → paste into
      `.well-known/assetlinks.json` (placeholder is marked) → commit,
      push, wait for Pages → relaunch the app: the URL bar vanishes.
- [ ] 6. Store listing: paste from LISTING.md; upload
      `playstore/assets/*` + `public/icon-512.png`; privacy URL
      `https://www.aureliusdynamic.com/privacy/`.
- [ ] 7. Content rating questionnaire (no ads/data/UGC → Everyone),
      Data safety form ("no data collected" — gloriously short).
- [ ] 8. Promote Internal → Production. Submit. 🚀

## ⚠ Security: the burned keystore (2026-08-03)

An accidental `git add -A` briefly committed `android/app/release.keystore`
WITH its passwords in build.gradle. The history was rewritten before any
push — nothing ever left this machine — but treat that keystore as
burned anyway:

- [x] Delete `android/app/release.keystore` from disk and generate a
      fresh one (command in `android/keystore.properties.example`).
      *Half done — the burned keystore is gone from disk (verified
      2026-08-11: no `android/app/release.keystore`, and nothing matching
      `keystore` is tracked besides the `.example`). **Generating the
      replacement is still open** and is folded into the two items below,
      which stay unchecked.*
- [ ] Fill `android/keystore.properties` (gitignored) with the new
      credentials — build.gradle now reads from it and will never
      accept hardcoded passwords again.
- [ ] Back the new keystore up somewhere that is not a git repo.
