> **⚠ 2026-08-12 — start at §0, "The delivery".** That section is current and
> describes files that exist and have been probed. §1 and §4 below are the
> **2026-08-03 delivery** and are kept for history only: §1's frame sets have
> been superseded by a complete thirty-shot re-render, and §4's clock-bug
> advisory is moot twice over — the bug was fixed on 2026-08-03 and every
> frame in this delivery post-dates it. Per-shot beats for the astronomy
> layer are in §7; the title-card gaps are in §8.

## ⚠ If you arrived here from the repo link, the video is not in the repo

Cloning this repository gets you the source, the shot list, and these two
handoff documents — **and no footage at all.** `.gitignore` excludes every
frame, master and screencast on purpose: the frame sets run to **7.2 GB across
three sets (6,650 PNGs)**, and a public repository is the wrong place for them.
Only `video/*.md` is tracked. The media arrives as a **GitHub Release**, whose
assets sit outside git history — same link, no clone weight.

What the repo alone *is* good for: reading the beats below, reading
`HANDOFF.md` for what exists and what to run, checking `src/capture/shots.js`
as the source of truth for shot ids and durations, and — if you want to
re-render rather than wait — running the app yourself. `npm install`, then
`npm run dev`, and `HANDOFF.md` §4 has the capture command. Budget ~2h and
7 GB of disk for a full thirty-shot pass.

## 0. The delivery — what is in the release, 2026-08-12

**Every asset below comes from one app state**, rendered after the last
content commit of 2026-08-11. That is the point of re-rendering rather than
patching: you are not compositing a cut from two different versions of the
app, which is what the previous delivery would have forced.

### Cuts

Four files are finished and probed. One more is still rendering; it is listed
last so nobody waits on a file that is not there yet.

| File | Aspect | Duration | Size | What it is |
|---|---|---|---|---|
| `echogalaxy-9x16-feed-v3.mp4` | 1080×1920 | 61.400 s | 64.1 MiB | the fifteen-shot montage — Reels / Shorts |
| `echogalaxy-4x5-feed.mp4` | 1080×1350 | 61.400 s | 65.9 MiB | **new** — same cut, feed aspect. LinkedIn and the Instagram feed. This did not exist in any earlier delivery. |
| `echogalaxy-4x5-astro.mp4` | 1080×1350 | 36.600 s | 17.6 MiB | **the astronomy cut, and the only delivered file containing `29-aurora`.** Read the aurora note below before you build around it. |

All h264 / yuv420p, 30 fps, `moov` ahead of `mdat` so they stream without a
full download. Durations are not rounded — they probe at `61.400000` and
`36.600000`, which are `sum(seconds) − 0.4 × (shots − 1)` exactly.

**Still rendering — not in this delivery:**

| File | Why it is missing |
|---|---|
| `echogalaxy-9x16-astro-v3.mp4` | The 9:16 pass is 25 of 30 shots in, and `29-aurora` is the **last** shot in the list, so this cut genuinely has to wait for the end of the render. The 4:5 astronomy cut above is the same edit in the other aspect and is finished — use it for timing, beats and approval, and swap the 9:16 in when it lands. |

The 4:5 frame set is complete and verified: 30 shots, 4,152 frames, every
shot exactly `seconds × 30`, zero mismatches. That is why the 4:5 cuts are
the ones that exist first — the aspect that was missing entirely a day ago is
now the aspect that is furthest ahead.

### Stills

- **`stills-4x5/`** — 30 PNGs, 1080×1350, ~30 MB. **The midpoint frame of
  every shot**, midpoint rather than first because most shots open mid-move
  and the opening frame is the least characteristic thing in them. Named by
  shot id, so `stills-4x5/23-ecliptic.png` is the thesis shot's key frame.
- **`contact-sheet-4x5.png`** — 1666×1730, all thirty in one image, six
  across, in authored order. Start here; it is the fastest way to see the
  whole piece.

### Do not use — still on the shipyard machine, and both look plausible

Verified against disk as this was written, so the list is what actually
exists rather than what once did:

- **`echogalaxy-9x16-astro.mp4`** (19.4 MiB, 32.5 s) and
  **`echogalaxy-9x16-feed.mp4`** (64.1 MiB, 61.4 s) — the 22:xx cuts. The
  footage is correct, but it is drawn from the **pre-aurora** frame set, so
  the astronomy one ends on `28-jupiter-moons` and the pair straddles two
  different renders. The trap is the naming: `echogalaxy-9x16-feed.mp4` and
  `echogalaxy-9x16-feed-v3.mp4` differ by three characters and only one of
  them is in this delivery. **Check for `-v3`.**

The two files earlier drafts warned about — `echogalaxy-9x16.mp4` and
`echogalaxy-9x16-v2.mp4` — **have been deleted** and can no longer be picked
by mistake. Nothing to do about them.

### Two things to look at with your own eyes

1. **The aurora is subtle, and turning it up will not fix that.** Sampled at
   34.0 s in `echogalaxy-4x5-astro.mp4`: the oval is a thin green thread on
   the upper limb, and you have to be told it is there. An earlier draft of
   this note said brightness was "a shader parameter, not a re-shoot" — that
   is backwards, and acting on it would waste a render.

   The oval is placed correctly. The problem is what it is placed *against*:
   it sits on a **blown-out white polar haze** with the Sun blazing in the
   top-right corner, so a faint green emission has almost no contrast to
   work with. `strength` is already 3. Pushing it higher yields a brighter
   thread on a white background, not a readable aurora — an aurora needs the
   **night side** to glow against, and this frame is nearly all dayside.

   So the real fix is re-aiming the shot at Earth's night side: a keyframe
   change in `shots.js` plus a 135-frame re-render, minutes rather than
   hours. **Say the word and it happens; do not budget a shader tweak for
   it.** As delivered, treat `29-aurora` as a quiet closing beat rather than
   as the aurora reveal.
2. **Two cuts end on cardless footage.** See §8.

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

## 7. The astronomy cut — the six new shots (2026-08-11)

Beats for the shots written against the astronomy layer. All are in
`video/frames-9x16-v2/`. Framing on every one was checked on a contact sheet
and adjusted before the delivery render — the notes below describe what the
verified frames actually contain, not what was hoped for.

**The sky behind every planet- and system-rung shot changed on the final
render**, so this affects far more than `24-zodiac`:

- **25,199 stars, up from 8,355.** The Bright Star Catalogue stops at the
  naked-eye limit, so the faint band 6.5–7.5 comes from Hipparcos. The
  background is roughly three times denser than in any earlier delivery.
- **All 88 constellation figures now draw by default**, not the thirteen
  zodiac ones. They are deliberately soft — opacity dropped from 0.38 to 0.22
  — so they read as texture behind the subject rather than as a diagram over
  it. If a shot needs them stronger for a particular beat, say so and it is
  one number.
- The **ecliptic keeps its own brighter orange line**, which is what still
  separates it from the figure lines now that there are so many more of them.

Practical consequence for the edit: these shots have more going on in the
background than the 2026-08-03 delivery, so lower-third copy sits better over
the darker quadrants. `23-ecliptic` and `24-zodiac` have the most legible
lower thirds; `05-system` is busiest at the bottom.

- **`23-ecliptic` (5.5 s) — the thesis shot.** The camera sits three degrees
  off the orbital plane, which collapses two separate things onto one
  horizontal line: the orange ecliptic ring, and the orbital rails of the
  planets. Around the midpoint the Sun, Mercury, Mars, Jupiter, Neptune and
  Saturn are all strung along that single line across the frame. **If the cut
  gets one caption, put it here** — the visual argument is already complete
  and the copy only has to name it. Neptune passes close in the foreground as
  a depth marker, sitting on the very line the shot is about.
- **`24-zodiac` (5.0 s).** All 88 figures, a 65° azimuth sweep at low
  elevation. Pure sky; no single subject. Good under a voice-over or as the
  bed for a title card.
- **`25-saturn-real` (5.5 s).** Opens near the ring plane and climbs, so the
  disc opens through the move — the same grammar as `17-ringed`, on the real
  body. Titan sits below frame-centre, the Sun rakes in from frame left.
  Reads well in a 1:1 or 16:9 centre-crop.
- **`26-earth-real` (5.5 s).** Earth and the Moon held together for the whole
  move, Sun from frame right. Still **not** an aurora shot — the oval is not
  what this one is about — but the sentence that used to follow here ("the
  oval does not currently render anywhere in the app") **is no longer true.**
  It landed at 22:31 on 2026-08-11 in `9e61653`, after this file's last
  revision. See `29-aurora` below.
- **`27-uranus-tilt` (4.5 s).** Uranus pole-on, so its bands read as
  concentric rings. **Cut this directly against `28-jupiter-moons`** — the
  contrast between concentric and horizontal banding is the entire point, and
  it lands with no annotation. This pairing is worth building the sequence
  around.
- **`28-jupiter-moons` (5.0 s).** Jupiter near-upright with all four Galileans
  in frame, Io innermost and fastest. Jupiter's ring was rendering as a bright
  Saturn copy when this shot was first framed; it now uses a dust profile and
  reads as a faint translucent band, so the shot is safe to caption and safe
  to cut against Saturn without the two looking like the same planet.
- **`29-aurora` (4.5 s) — new, and it did not exist when you last read this
  file.** Earth's auroral oval, on its own shot with a camera close enough to
  resolve it, rather than as a re-frame of `26-earth-real`. The gas giants are
  deliberately excluded: their aurorae are a planet-wide glow rather than an
  oval, and drawing one on them would be drawing it wrong. Last in authored
  order, so it closes any cut containing it. Read §0's note on how faintly it
  currently reads before you build a beat on it.

Cut as their own piece, they run `01-hook` (wide cold open) → `05-system` (the
reveal) → `23-ecliptic` (the plane) → `24-zodiac` (the sky) → `25-saturn-real`
→ `27-uranus-tilt` → `28-jupiter-moons` → `29-aurora`. **36.6 s** — the figure
was 32.5 s before the aurora existed. The `--only` command is in
`ZACHTODOS.md` §0.5, cut B.

Note that `assemble.mjs --only` always emits shots in **authored** order and
ignores the order you type, so this arc is the one the shot list already
encodes. A closing wide pull-back would mean adding `10-group`, which the
authored order would place third rather than last — that needs a change to
`shots.js`, not a change to the command line.

## 8. Two title cards that are not there

`TITLE_CUES` in `scripts/assemble.mjs` covers eleven shots. A cue whose shot
is absent from the cut is **dropped rather than raised as an error** — that is
deliberate, it is what lets `--only` subsets work at all — and the only notice
you get is a `titles: N cue(s) dropped` line on stdout. Consequences you
should know before cutting:

1. **The astronomy cut closes on 9.5 s of cardless footage.** Neither
   `28-jupiter-moons` nor `29-aurora` has a cue, so the last two shots run
   with nothing on screen. The feed cut closes title-free on `14-coma` by
   design; this is the same gesture at twice the length. It may read as a
   breath before the end card, or as an ending that forgot to say anything —
   that call is yours, and adding a cue is a two-line change.
2. **A worlds-only cut (`15-lava`…`22-ice-giant`) has no cards at all.** None
   of those eight appear in `TITLE_CUES`, so `--titles` is silently a no-op
   there. If you want that set as its own piece, the copy has to be written
   first.

## 6. On request from the shipyard

Re-renders at any fps, `1x1` (1080×1080) versions of any shot, new
shots (author keyframes in `src/capture/shots.js` — contact sheet
turnaround is minutes), or scripted-interaction variants via the
choreography system. Frame counts, determinism, and framing come
verified with every delivery.
