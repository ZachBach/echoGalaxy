# ZACHTODOS — the human's list

The machine side is done: roadmap G0–G3 complete, capture rig verified
deterministic, framing approved. Everything left needs your hands, your
eyes, or your accounts. Ordered by dependency.

---

# Phase 0 — do these four, in this order

Everything below Phase 0 is older and parts of it are stale. **If you only
read one section, read this one.**

> ### ✅ Answered by the machine, not by the list: you already chose C
>
> **The A-or-B box that used to sit here was obsolete the moment it was
> written.** It went in at **01:00**. A full thirty-shot 9:16 re-render had
> been running since **00:13:37** — 47 minutes earlier. The box asked which
> of two compromises to take while the uncompromised option was already
> 40% done on disk.
>
> The correction matters beyond this one box: **check `video/frames-*` before
> trusting any claim in this file about what has and has not been rendered.**
> The folders are the truth; the prose is a snapshot.
>
> #### What is actually on disk
>
> | Set | Shots | fps | State |
> |---|---|---|---|
> | `video/frames-4x5-v2/` | **all 30**, incl. `29-aurora` | 30 | **complete**, finished 00:13 — never assembled |
> | `video/frames-9x16-v3/` | all 30 when it lands | 30 | **rendering now**, started 00:13:37 |
> | `video/frames-9x16-v2/` | 29 — no aurora | 30 | superseded by v3 |
>
> So `29-aurora` **has** been rendered — in 4:5, at 00:09–00:13, 135 frames
> (4.5 s × 30). The old claim that it "has never been rendered at all" was
> true only of the 9:16 set, and is now not true of that either.
>
> #### Two consequences you get for free
>
> 1. **The aurora needs no special handling.** v3 was launched with no
>    `--shots` filter, so it sweeps all thirty. No `cp` step, no patching a
>    shot into someone else's folder.
> 2. **The 4:5 cut is no longer blocked** — the thing this file calls "your
>    LinkedIn and Instagram-feed placement, which you currently do not have."
>    The frames are sitting there complete. It is one `assemble.mjs` away and
>    it does not have to wait for v3.
>
> #### The one trap that survives
>
> A full thirty-shot cut is **~138 s** (4,152 frames ÷ 30). That is past
> every Reels ceiling — Facebook enforces 90 s. **`--only` is mandatory**,
> not stylistic. Assembling the whole folder produces a file no platform
> will take.
>
> And the old warning still stands: **`--fps 30` and `--aspect` are not
> optional.** The defaults are 60 and 4x5. Wrong fps encodes fine, plays
> wrong, and says nothing while it does it.
>
> - [x] Decided — **C: both aspects re-rendered complete.** Superset of B,
>       and it also delivers the 4:5 that A and B both left missing.

### 1. Watch both videos, start to finish

```
video\echogalaxy-9x16-astro.mp4     32.5 s   ← watch this one first
video\echogalaxy-9x16-feed.mp4      61.4 s
```

Nobody has watched either end to end. I checked frames at five timestamps,
which proves the title cards land and the maths is right — it proves nothing
about pacing, or about a dissolve that lands badly mid-shot. **This is the
only step that cannot be done for you**, and doing it after design starts
cutting is how a flaw gets built on.

Two things to watch for specifically: the Pillars shot (~20 s in the feed
cut) has a hard-edged slab at the base of the pillars that may or may not be
intentional, and `05-system` is the shot that changed most.

- [ ] Watched the astronomy cut
- [ ] Watched the feed cut

### 2. Put the two files on a GitHub Release

The repo is public and design can read it, **but the video is not in it** —
`.gitignore` excludes 7.2 GB of frames and every master on purpose. A repo
link alone hands them instructions to footage they cannot see.

1. Go to **github.com/ZachBach/echoGalaxy/releases/new**
2. Tag: `promo-2026-08-11`  ·  Title: `Promotion cuts — 2026-08-11`
3. Drag in **both** mp4s from step 1
4. Publish, copy the URL
5. Paste it into `video/HANDOFF.md` §0, where it says
   *"EDIT: paste the published release URL here"*
6. Commit and push that one-line change

Release assets live outside git history, so this does not bloat the repo and
is not permanent. **Do not `git add` the mp4s** — 84 MiB committed to a
public repo can never be taken back out, and next week's re-render adds
another 84.

- [ ] Release published
- [ ] URL pasted into HANDOFF.md §0 and pushed

### 3. Send design one link

The repo URL plus the release URL. They need nothing else — `HANDOFF.md`
tells them what exists and what to run, `HANDOFF-design.md` has the per-shot
beats and the suggested order for the astronomy cut.

**Do not send `echogalaxy-9x16.mp4`.** It is the pre-Jupiter-fix, pre-sky
cut from midday, and it has the least specific filename of the four, which
makes it the one most likely to get grabbed by mistake.

- [ ] Sent

### 4. Write the captions

Still the last thing between a finished file and an actual post. The HUD copy
is ready-made source — the blueshift line and "a view no probe will ever
photograph" were always the hooks, and `23-ecliptic` now gives you a better
one: every planet on a single line, because the zodiac and the orbits are the
same plane.

- [ ] Instagram Reels + Facebook Reels captions written

---

## Not blocking the video, worth doing next

- ~~The auroral oval never renders.~~ **Fixed 2026-08-11 22:31** (`9e61653`).
  Earth now carries the `aurora` key and `29-aurora` was written as its own
  shot rather than a re-frame of `26-earth-real`. The giants are deliberately
  left off — their aurorae are a planet-wide glow, not an oval, and drawing
  one would be drawing it wrong. It landed *after* the delivered cuts were
  assembled, so it is absent from those two files — but it **is** rendered in
  `frames-4x5-v2/` and is included in the 9:16 v3 pass. See Phase 0.
- ~~**The 4:5 cut** — no longer blocked.~~ **Frames complete 2026-08-12 00:13**
  — all 30 shots at 30 fps in `video/frames-4x5-v2/`, aurora included. Your
  LinkedIn and Instagram-feed placement is now one `assemble.mjs` away, and it
  does not have to wait for the 9:16 v3 render to finish.
- **A fresh signing keystore** — the burned one is verifiably gone from disk
  *and* from git history, but `android/keystore.properties` has never been
  created, so a Play Store build cannot sign. You said Play Store is later;
  this is the first step whenever later arrives.

> **Stale below this line.** The ⚠ RE-RENDER item that used to open this file
> described a clock bug fixed on 2026-08-03 and a 4:5 master that no longer
> exists. `video/HANDOFF.md` supersedes this file wherever the two disagree.

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
      **⚠ Correction 2026-08-11: that file is no longer at that path** —
      there is no mp4 anywhere in the repo except the fifteen screencasts
      in `video/promo/`. `video/HANDOFF-design.md` says the master "you
      hold" and that media "travels by hand, not by git", so it most
      likely left with a hand-delivery rather than being lost — but do
      not plan on swapping shots into a master that is not on this
      machine. If it cannot be found, the 4:5 cut is a full re-assemble,
      not a two-shot patch.
- [x] **Assemble the 9:16 Reels cut** — no capture session was needed:
      `video/frames-9x16/` already held the complete fifteen-shot montage
      (1,980 frames at 1080×1920), rendered *after* the clock fix.
      **Encoded 2026-08-11 → `video/echogalaxy-9x16.mp4`.** Probed clean:
      h264 / yuv420p, 1080×1920 exact, 30 fps, 1,812 frames,
      **60.400000 s** (matches the computed timeline exactly), 8.5 Mbps,
      61.3 MB, `moov` ahead of `mdat` so it streams without a full
      download. Sampled at 1.2 / 14 / 20.5 / 37 / 57 s: all six title
      cards burn in on their intended shots (echoGalaxy over the hook,
      Real Kepler orbits over the system rails, Pillars of Creation,
      The Local Group), and 14-coma closes title-free as designed.
      **The end-to-end watch is still your eyes' job.**

      **⚠ Two traps in the command this list used to give.** The path is
      `./video/frames-9x16`, not `./frames-9x16`. And `assemble.mjs`
      defaults to `--fps 60` while these frames are **30 fps** — every
      shot's frame count is exactly `seconds × 30` against `shots.js`.
      Omitting `--fps 30` halves every duration while the dissolve
      offsets stay computed from `seconds`, so the transitions land in
      the wrong places and the cut is silently ruined. The command that
      actually works:
      `node scripts/assemble.mjs --frames ./video/frames-9x16 --out video/echogalaxy-9x16.mp4 --aspect 9x16 --fps 30 --titles`
      (`--aspect 9x16` matters too — it selects the title layout;
      the 4x5 default would misplace the cards.) ffmpeg is installed but
      its winget shim is **not on PATH** — it lives at
      `%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg_*\ffmpeg-8.1.2-full_build\bin`.

      Because these frames are post-fix, this cut is **not** affected by
      the strobing bug at the top of this file — it can ship first, and
      it is the only asset not blocked on the missing 4:5 master.

- [ ] **Capture the eight new world shots** (authored 2026-08-11). The
      montage showed four of the twelve planet-rung bodies; `shots.js`
      now carries the other eight as `15-lava` … `22-ice-giant`, geometry
      verified (every camera position inside the rung's 2.6–12 clamp; the
      two ring shots use `fovLock: 'h'` and sit at 6.8–7.2 / 9.0–9.2
      because the disc is twice a bare planet's width). Same one-at-a-time
      browser flow as before, all into the **existing** `frames-9x16/`
      folder:
      ```
      localhost:5173/?capture=15-lava&aspect=9x16&fps=30&backend=webgl
      localhost:5173/?capture=16-ice&aspect=9x16&fps=30&backend=webgl
      localhost:5173/?capture=17-ringed&aspect=9x16&fps=30&backend=webgl
      localhost:5173/?capture=18-rings&aspect=9x16&fps=30&backend=webgl
      localhost:5173/?capture=19-desert&aspect=9x16&fps=30&backend=webgl
      localhost:5173/?capture=20-ocean&aspect=9x16&fps=30&backend=webgl
      localhost:5173/?capture=21-cloud&aspect=9x16&fps=30&backend=webgl
      localhost:5173/?capture=22-ice-giant&aspect=9x16&fps=30&backend=webgl
      ```
      Contact-sheet them at `&fps=6` first — these are authored keyframes,
      not verified framing, and that loop is the whole point of putting the
      camera path in code.

      **⚠ Two consequences of adding them, both real:**

      1. **`assemble.mjs` now expects all 23 shots.** It iterates the whole
         `SHOTS` array, so re-running it against `frames-9x16/` (which holds
         only the original 15) will fail on the eight missing inputs until
         they are rendered. The already-encoded
         `video/echogalaxy-9x16.mp4` is a finished file and is unaffected.
      2. **The montage would grow from 60.4 s to 93.1 s.** That is past the
         90-second ceiling Facebook Reels enforces; Instagram Reels allows
         up to about three minutes, so it would still post there. Verify
         both limits before relying on this — platform rules move. If the
         one-cut-fits-both property matters, the cleaner answer is a small
         `--only` filter on `assemble.mjs` so these eight can be cut as a
         separate "worlds" reel instead of bloating the main montage.
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
