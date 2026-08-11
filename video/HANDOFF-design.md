# echoGalaxy → design claude: capture handoff (2026-08-03)

From the shipyard (Claude Code). Your capture-task manifest is complete —
both required shots, both nice-to-haves, plus a screencast library. One
critical advisory about the existing master is at the bottom; read it
before you cut anything from the old footage.

## 1. Deliverables

All paths relative to the echoGalaxy repo root. Media is gitignored by
design — it travels by hand, not by git.

### Frame sets (PNG sequences, 30 fps, `<shot>.%04d.png`, 4-digit padding)

**`video\frames-4x5-new\`** — 1080×1350 (4:5), the four new shots, 648
frames total. These extend the existing ten-shot master set:

| Shot | Frames | Seconds |
|---|---|---|
| 11-blackhole | 150 | 5.0 |
| 12-godshands | 180 | 6.0 |
| 13-crab | 138 | 4.6 |
| 14-coma | 180 | 6.0 |

**`video\frames-9x16\`** — 1080×1920 (9:16), the COMPLETE fifteen-shot
montage, 1,980 frames. This is the full Reels/Shorts cut: the original
ten launch shots plus the four new ones, all freshly rendered and free
of the clock bug described in §4. Frame counts all verify at
seconds × fps.

### Screencast library — `video\promo\`

Fifteen clips, each as both `.webm` (VP9 source) and `.mp4` (H.264
yuv420p, faststart — drop straight into any editor). 1600×900, real-time
captures with live interaction:

- `godshands-hud` / `godshands-clean` — grab-and-fling with and without
  the HUD. The HUD take shows the cannonball fate dial live (see §3).
- `blackhole`, `saturn`, `rings-alone`, `moon`, `pillars`, `crab`,
  `coma-redshift`, `galaxy-morph` (the star-migration morph between
  Hubble classes, 49 MB source), `desert`, `ocean`, `cloud`,
  `ice-giant`, `scale-climb` (the six-rung zoom-through).

## 2. Shot notes for the edit

- **11-blackhole** — the arc you specified: photon ring pinned, the
  Doppler-bright side of the disc visibly trades places (camera-right →
  camera-left) across the swing, lensed far-side arc overhead
  throughout. Action is center-vertical; a 16:9 center-crop survives.
- **12-godshands** — scripted Newton's cannonball on TRAPPIST-1.
  Timing beats for your cut: the hand grabs the molten innermost world
  at **t = 0.5 s**, carries it outward on a bowed arc for one second,
  releases at **t = 1.5 s** at 1.30 × circular velocity — from there
  it's the real integrator, a bound ellipse drifting off the rails for
  the remaining 4.5 s. The camera pulls up and back as it flies.
- **13-crab** — Hα filament web over the blue synchrotron ghost;
  the pulsar heart pulses at 2 Hz (~9 beats in the dwell). Gentle
  lateral drift, volume reads well.
- **14-coma** — real space until **t = 2.2 s**, then the redshift-space
  morph glides in (~1.2 s) and the Finger of God stretches toward the
  viewer for the rest of the shot. The before/after is the story; a
  caption cut at the cue lands well.

## 3. Known limitation (flagged in your manifest)

Capture mode disables the interactive hands and hides the HUD, so the
**cannonball fate dial does not appear in 12-godshands frames**. The
dial's story is covered by `godshands-hud.mp4` — if the dial matters to
the cut, composite from that clip or use it as a picture-in-picture.

## 4. ⚠ Advisory: the existing 4:5 master

While building your shots we found a clock bug that has existed since
the capture rig was born: everything reading `clock.elapsedTime` under
capture ran 1000× fast. Individual frames look perfect — but in motion,
the **05-system shot's planets teleport around their rails** frame to
frame, and **02-rocky's moon does the same**. The 4:5 master you hold
(`echoGalaxy-4x5.mp4`, 40.4 s) was rendered before the fix.

**Do not ship 02-rocky or 05-system from the old master.** Zach has the
re-render recipe (top of ZACHTODOS.md); corrected 4:5 frames for those
two shots take ~10 minutes of machine time on request. Every frame in
this delivery (both new sets) is post-fix and verified.

## 5. Assembly options

- `scripts/assemble.mjs --frames <dir> --out <file> --titles` builds a
  dissolve-joined montage with title cards (0.4 s cross-dissolves —
  the shot list's `ease` values are authored so momentum reads
  continuously across those cuts). Works on any of the frame folders.
- Or cut manually: shots are designed to dissolve in listed order, but
  every shot also stands alone. `01-hook` is built for the mute
  autoplay stop; `10-group`'s final frame is the intended feed still.

## 6. On request from the shipyard

Re-renders at any fps, `1x1` (1080×1080) versions of any shot, new
shots (author keyframes in `src/capture/shots.js` — contact sheet
turnaround is minutes), or scripted-interaction variants via the
choreography system. Frame counts, determinism, and framing come
verified with every delivery.
