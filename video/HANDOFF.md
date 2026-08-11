# echoGalaxy — promotion video handoff

**State verified on disk 2026-08-11.** Everything below was checked against
the actual files, not against the older notes. Where this contradicts
`ZACHTODOS.md`, this file is newer — see §2, which is the one that matters.

Companion document: [`HANDOFF-design.md`](HANDOFF-design.md) is the capture
delivery from the design side (per-shot beats, timing cues, the black-hole and
Finger-of-God story cues). Read it for **how to cut**; read this for **what
exists and what to run**.

Media is gitignored by design — it travels by hand, not by git.

---

## 1. The 9:16 Reels cut is finished and shippable today

`video/echogalaxy-9x16.mp4` — **64.2 MB, 1080×1920, 30 fps, 60.4 s, h264/yuv420p,
`moov` ahead of `mdat` so it streams without a full download.**

Fifteen shots, dissolve-joined, six title cards burned in. Every frame is
post-clock-fix (§2), so this cut is **not** affected by the strobing bug. The
arithmetic checks out end to end: 1,980 source frames − (14 dissolves × 12
frames at 0.4 s) = 1,812 encoded frames = exactly 60.4 s.

Shot order and durations:

| # | Shot | s | # | Shot | s |
|---|---|---|---|---|---|
| 1 | 01-hook | 1.4 | 9 | 08-elliptical | 3.2 |
| 2 | 02-rocky | 5.0 | 10 | 09-irregular | 3.2 |
| 3 | 03-gas | 4.2 | 11 | 10-group | 6.0 |
| 4 | 04-star | 3.0 | 12 | 11-blackhole | 5.0 |
| 5 | 05-system | 7.0 | 13 | 12-godshands | 6.0 |
| 6 | 05b-pillars | 4.6 | 14 | 13-crab | 4.6 |
| 7 | 06-spiral | 3.6 | 15 | 14-coma | 6.0 |
| 8 | 07-barred | 3.2 | | | |

**The only outstanding task on this cut is watching it end to end.** That is
your eyes' job and nobody else's — sampled frames at 1.2 / 14 / 20.5 / 37 / 57 s
confirmed the title cards land on their intended shots, but sampling is not
watching.

→ **Ship this to Instagram Reels and Facebook Reels. It is ready.**

---

## 2. ⚠ The 4:5 cut is a full capture session, not a patch

`ZACHTODOS.md` opens with "RE-RENDER 05-system + 02-rocky and re-assemble the
4:5 master". **That plan is no longer possible, and the reason is worse than
the missing mp4 already noted there.**

What is actually on disk for 4:5:

| Asset | Status |
|---|---|
| `echoGalaxy-4x5.mp4` (the master) | **Gone.** No mp4 anywhere in the repo except `echogalaxy-9x16.mp4` and the fifteen screencasts in `promo/`. |
| `video/frames-4x5-new/` | Present — **but only the four new shots**: 11-blackhole (150), 12-godshands (180), 13-crab (138), 14-coma (180). 648 frames, 1080×1350. |
| 4:5 frames for shots 01 → 10-group | **Do not exist on this machine.** |

So there is nothing to patch two shots *into*, and no source frames to
re-assemble *from*. Producing a 4:5 master now means capturing shots
**01-hook through 10-group plus 05b-pillars — eleven shots, ~45 s of footage**
— from scratch, then assembling those together with the four existing 4:5
shots.

`HANDOFF-design.md` §4 assumed you still held the old master and advised
against shipping 02-rocky and 05-system from it. That advice is now moot: there
is no old master to ship anything from.

### The capture session, if you want the 4:5

`npm run dev`, then one URL at a time in Chrome or Edge, **all frames into one
folder**. Click the page when prompted. Free ~4–8 GB first.

```
localhost:5173/?capture=01-hook&aspect=4x5&fps=30&backend=webgl
localhost:5173/?capture=02-rocky&aspect=4x5&fps=30&backend=webgl
localhost:5173/?capture=03-gas&aspect=4x5&fps=30&backend=webgl
localhost:5173/?capture=04-star&aspect=4x5&fps=30&backend=webgl
localhost:5173/?capture=05-system&aspect=4x5&fps=30&backend=webgl
localhost:5173/?capture=05b-pillars&aspect=4x5&fps=30&backend=webgl
localhost:5173/?capture=06-spiral&aspect=4x5&fps=30&backend=webgl
localhost:5173/?capture=07-barred&aspect=4x5&fps=30&backend=webgl
localhost:5173/?capture=08-elliptical&aspect=4x5&fps=30&backend=webgl
localhost:5173/?capture=09-irregular&aspect=4x5&fps=30&backend=webgl
localhost:5173/?capture=10-group&aspect=4x5&fps=30&backend=webgl
```

**Use `fps=30`, not 60.** The old instructions said 60 to match the original
frame folder — that folder is gone, and the four surviving 4:5 shots are 30 fps.
Mixing rates inside one folder silently ruins the assembly (see §3).

Then copy the four existing shots in alongside and assemble:

```bash
cp video/frames-4x5-new/*.png <your-capture-folder>/
node scripts/assemble.mjs --frames <your-capture-folder> --out video/echogalaxy-4x5.mp4 --aspect 4x5 --fps 30 --titles
```

Cheap sanity pass first, strongly recommended: run the same eleven URLs with
`&fps=6` and glance at every clip. Framing was only ever reviewed on
01 / 02 / 04 / 05 / 10 — **03-gas, 06-spiral, 07-barred, 08-elliptical, and
09-irregular have never been eyeballed by anyone.** Keyframes live in
`src/capture/shots.js`; the loop is minutes.

---

## 3. Three traps in `assemble.mjs` that silently ruin a cut

Every one of these produces a file that encodes fine and looks wrong.

1. **`--fps` defaults to 60.** These frame sets are 30. Omit the flag and every
   duration halves while the dissolve offsets stay computed from `seconds`, so
   transitions land in the wrong places.
2. **`--aspect` defaults to `4x5`.** It selects the title-card layout. Assemble
   a 9:16 set without `--aspect 9x16` and the cards are misplaced.
3. **The path is `./video/frames-…`, not `./frames-…`.** Older notes give the
   wrong one.

**ffmpeg is installed (8.1.2 via winget) but is not on PATH.** It lives at:

```
%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg_*\ffmpeg-8.1.2-full_build\bin
```

The command that is known to work, for reference:

```bash
node scripts/assemble.mjs --frames ./video/frames-9x16 --out video/echogalaxy-9x16.mp4 --aspect 9x16 --fps 30 --titles
```

---

## 4. The clock bug, for context

The capture rig once wrote raw millisecond timestamps into `clock.elapsedTime`,
so every consumer ran 1000× fast. **Stills looked perfect** — which is why the
framing review missed it — but in motion, 05-system's planets teleport around
their rails frame to frame and 02-rocky's moon does the same. Shader-driven
shots (galaxies, star, Pillars) were never affected.

`CaptureRig` now owns the clock and the fix is verified frame by frame. Every
frame currently on disk, in both folders, is post-fix. Any new capture is too.
This section exists only so nobody re-introduces footage from an old backup.

---

## 5. The screencast library — `video/promo/`

Fifteen real-time interaction captures, 1600×900, each as both `.webm` (VP9
source) and `.mp4` (H.264 yuv420p, faststart — drops straight into any editor).
These are **not** part of either montage; they are B-roll and standalone posts.

`blackhole` · `cloud` · `coma-redshift` · `crab` · `desert` · `galaxy-morph` ·
`godshands-clean` · `godshands-hud` · `ice-giant` · `moon` · `ocean` ·
`pillars` · `rings-alone` · `saturn` · `scale-climb`

Two worth knowing:

- **`godshands-hud`** is the only asset showing the cannonball fate dial live.
  Capture mode hides the HUD, so the dial does **not** appear in the
  12-godshands montage frames. If the dial matters to a cut, composite it from
  here or use picture-in-picture.
- **`galaxy-morph`** (49 MB source) is the star-migration morph between Hubble
  classes — stars physically migrating, not a crossfade. It is the single most
  "how did they do that" clip in the library.

---

## 6. Publishing

| Platform | Asset | Status |
|---|---|---|
| Instagram Reels | `echogalaxy-9x16.mp4` | **Ready** |
| Facebook Reels | `echogalaxy-9x16.mp4` | **Ready** |
| LinkedIn | 4:5 master | Blocked on §2 |
| Facebook feed | 4:5 master | Blocked on §2 |

Link the deployed app in every post.

**Captions are not written yet.** The HUD facts are ready-made copy and were
authored to be quotable — the blueshift line and "a view no probe will ever
photograph" are the strongest hooks. As of today there is also a much deeper
well to draw from: the astronomy content layer in `src/stellarData.js`,
`src/starData.js`, `src/constellationData.js`, and `src/skyCultureData.js`
carries **834 facts across 171 entries**, each written at two levels. The
`factsKids` rung is already tuned for short, punchy, non-specialist copy —
"Every star you can see at night is a sun", "One teaspoon of it would weigh
about as much as an elephant" — which is exactly the register social captions
want. Run `npm run check:content` to see the inventory.

---

## 7. Cleanup, once both masters are encoded

The frame folders are the disk hogs; the mp4s are the keepers.

| Folder | Size |
|---|---|
| `video/frames-9x16/` | 2.3 GB |
| `video/frames-4x5-new/` | 488 MB |

**Do not delete `frames-4x5-new/` until the 4:5 master exists.** Those 648
frames are the only 4:5 footage left, and re-rendering them costs another
capture session. `frames-9x16/` is safe to delete as soon as you have watched
`echogalaxy-9x16.mp4` end to end and are happy with it.

---

## 8. Available on request

Re-renders at any fps, `1x1` (1080×1080) versions of any shot, new shots
(23 are authored in `src/capture/shots.js`; only 15 have ever been rendered —
`15-lava` through `22-ice-giant` exist as keyframes and have never been
captured), or scripted-interaction variants through the choreography system.
Frame counts, determinism, and framing come verified with every delivery.
