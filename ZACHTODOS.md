# ZACHTODOS — the human's list

The machine side is done: roadmap G0–G3 complete, capture rig verified
deterministic, framing approved. Everything left needs your hands, your
eyes, or your accounts. Ordered by dependency.

## Launch video — production

- [ ] **Install ffmpeg** (it is not on your PATH; assembly needs it):
      `winget install ffmpeg`, then confirm with `ffmpeg -version`.
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
- [ ] **Assemble the master**:
      `node scripts/assemble.mjs --frames ./frames --out echogalaxy-4x5.mp4 --titles`
      Watch it end to end. Check the title-card timings read well against
      the actual cut (they're set in `scripts/assemble.mjs` → `TITLES`).
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

- [ ] **`git push`** in echoGalaxy — main is ahead 1 (the capture-rig
      commit isn't on origin). No redeploy needed: capture mode is
      dev-only and stripped from the production bundle.
- [ ] Stray `package-lock.json` sitting at the AureliusDynamicSolutons
      root (outside both repos) — looks like an accidental npm run in the
      parent folder; delete it or gitignore it.
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
