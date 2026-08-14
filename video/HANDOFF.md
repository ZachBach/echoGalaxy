# echoGalaxy — promotion video handoff

**State verified on disk 2026-08-11 (evening).** This supersedes the morning
version of this file, which is now wrong in its headline claim. Where this
contradicts `ZACHTODOS.md` or `HANDOFF-design.md`, this file is newer.

Companion document: [`HANDOFF-design.md`](HANDOFF-design.md) carries the
per-shot beats and timing cues — read it for **how to cut**, this for **what
exists and what to run**.

---

## 0. Where the media actually is

**None of it is in this repository, and it cannot be.** `.gitignore` excludes
every frame, master and screencast deliberately — only `video/*.md` is
tracked. The numbers are the reason:

Measured on disk 2026-08-13, after the prune:

| What | Size | Why it stays out |
|---|---|---|
| `video/frames-*` (2 sets) | **8.22 GB**, 8,304 PNGs | GitHub's repo soft limit is ~5 GB, 1 GB recommended. This alone would break the repo. |
| `video/promo/` | 173 MB | 15 screencasts; weight most readers never need. |
| the four delivery masters | 170 MB total | Would fit individually, but committed files live in history forever: every future clone pays for them, and next week's re-render adds another 170 MB that cannot be taken back out. |

> **Mind the unit.** The now-deleted `echogalaxy-9x16-v2.mp4` was *101 MB*
> decimal and *96.7 MiB* binary, and GitHub's ceiling is 100 **MiB**
> (104,857,600 bytes) — it cleared the hard limit by 3.3 MiB, and a slightly
> longer cut would not have. Read the decimal figure against the binary limit
> and you would conclude a push is rejected when it is not, or, more
> dangerously, the reverse. `ls -l` gives bytes; compare those.

So the repo link carries the *instructions*; the footage travels beside it.

**→ Delivery channel: GitHub Releases.** Release assets live outside git
history, so clones stay small and nothing is permanent, while design still
gets everything from one URL. Limit is 2 GB per asset, which comfortably
covers the masters and `promo/` if wanted.

```
github.com/ZachBach/echoGalaxy/releases/new     tag: promo-2026-08-11
```

> **EDIT: paste the published release URL here once it exists**, so this
> document resolves to something real instead of describing a plan.

**Send these — all four, and they are the only mp4s left in the folder.** All
are cut from the 2026-08-12 frame sets, so design works from one app state
rather than compositing across two. Every figure below was probed on
2026-08-13, after the astronomy cuts were re-encoded:

| File | Aspect | Duration | Frames | Size | Status |
|---|---|---|---|---|---|
| `echogalaxy-9x16-feed-v3.mp4` | 1080×1920 | 61.400000 s | 1842 | 64.1 MiB | ✅ probed |
| `echogalaxy-4x5-feed.mp4` | 1080×1350 | 61.400000 s | 1842 | 65.9 MiB | ✅ probed — **no earlier delivery had a 4:5** |
| `echogalaxy-9x16-astro-v3.mp4` | 1080×1920 | 36.600000 s | 1098 | 22.1 MiB | ✅ probed |
| `echogalaxy-4x5-astro.mp4` | 1080×1350 | 36.600000 s | 1098 | 17.6 MiB | ✅ probed |
| `stills-4x5/` (30 PNG) + `contact-sheet-4x5.png` | — | — | — | ~33 MB | ✅ built |

Both astronomy cuts carry `29-aurora`. Both aspects now exist for both cuts,
which is the first delivery where that is true.

Both 61.4 s figures are exact, not rounded: they probe at `61.400000`, which
is `sum(seconds) − 0.4 × 14` to the frame.

**The do-not-send list is now empty, because the files are gone** (pruned
2026-08-13). Every mp4 in this folder is current and safe to hand over —
the four superseded cuts this section used to warn about have been deleted
from disk, so the delivery can no longer be got wrong by picking the wrong
filename. Recorded here rather than dropped, because the reasoning is the
useful part if any of them is ever re-encoded:

- `echogalaxy-9x16.mp4` — the 2026-08-11 midday cut, rendered *before* the
  Jupiter fix and *before* the sky tripled. Its filename was the least
  specific of the set, which is exactly how it kept getting picked.
- `echogalaxy-9x16-v2.mp4` — correct footage, but 122.7 s: past every Reels
  ceiling. A library reel, not a post.
- `echogalaxy-9x16-astro.mp4` — the 32.5 s astronomy cut, from the
  pre-aurora frame set. Superseded by `-astro-v3`.
- `echogalaxy-9x16-feed.mp4` — near-identical to `-feed-v3`, same byte size
  to three figures, differing in exactly one shot of fifteen. It was the
  most dangerous file in this folder for precisely that reason. See the
  determinism note below for how it differed.

**Never re-encode a superseded cut back into this folder under a name that
differs from a current one by a suffix.** That collision is what made the
list necessary in the first place.

### The rig is deterministic, and that is why the diff is readable

The v2 frames (21:27) and the v3 frames (00:13) were rendered three hours and
two commits apart. Comparing the midpoint frame of every shot the two sets
share:

```
identical: 18 shots
differ:     1 shot  -> 05-system
```

Eighteen of nineteen are **byte-identical under sha256**. The one that moved
is `05-system`, and it moved because it is the only shot in that range that
contains Earth — the body `9e61653` changed when it gave the planet its
auroral oval. The change landed exactly where it should have and nowhere
else.

Two things follow. First, the capture rig's determinism is not a claim in a
README, it is a measurement you can repeat. Second, `echogalaxy-9x16-feed.mp4`
and `-feed-v3.mp4` differ in **one shot out of fifteen** — which is why the
old file is a trap rather than an obvious mistake, and why the v3 file is
still the one to send.

---

## 1. ✅ Resolved — the stale 9:16 master is gone

> **Nothing to act on here.** `echogalaxy-9x16.mp4`, its frame set
> `video/frames-9x16/`, and `video/frames-4x5-new/` were all deleted on
> 2026-08-13; §0's delivery list is current. Kept because the *mechanism* is
> the lesson, and it will recur: a master goes stale not because anything
> broke but because the app keeps growing underneath it.

The morning version of this file said `echogalaxy-9x16.mp4` was ready to ship
that day. **It was not, and the reason was not a bug — it is that the app grew.**

Every frame in `video/frames-9x16/` and `video/frames-4x5-new/` was rendered on
**2026-08-03**. The master was assembled at **12:39 on 2026-08-11**. The
astronomy content layer landed *after* that, between **15:45 and 15:52** the
same day:

| Commit | Landed | What it added |
|---|---|---|
| `eba37d1` | 15:45 | the star catalogue — 8,355 real stars to naked-eye magnitude |
| `ce93ab5` | 15:51 | the real Solar System: eight planets, real obliquities, moons |
| `f0e94f9` | 15:51 | the real sky — constellation figures and the ecliptic |
| `c843454` | 15:52 | the content gate's cross-referencing |

So the cut you hold shows an app that no longer exists. Concretely:

- **`05-system` is the worst case.** That rung used to hold a generic
  four-body system. It now holds the real Solar System, out to Neptune at
  12.55 units — and the old camera path topped out at a half-width of 6.2,
  which frames as far as Jupiter and crops everything past it.
- **Every planet-rung and system-rung shot** now has real constellation
  figures and the ecliptic behind it. `02-rocky`, `03-gas`, `04-star`,
  `11-blackhole`, `12-godshands` all look materially different today.
- Shader-driven rungs — galaxies, Pillars, Crab, Coma, Local Group — are
  **unaffected**. Those shots are still accurate.

**Do not ship the existing `echogalaxy-9x16.mp4`.** It has been superseded —
§4 lists the three cuts that replace it, all rendered against current source.

---

## 2. What the shot list covers now — 29 shots, up from 15

`src/capture/shots.js` is the source of truth. Total runtime 122.7 s, 4,017
frames at 30 fps.

**The fifteen already in the old master** — `01-hook`, `02-rocky`, `03-gas`,
`04-star`, `05-system`, `05b-pillars`, `06-spiral`, `07-barred`,
`08-elliptical`, `09-irregular`, `10-group`, `11-blackhole`, `12-godshands`,
`13-crab`, `14-coma`. All re-rendered against the current app.

**Eight authored but never once rendered** until now — `15-lava`, `16-ice`,
`17-ringed`, `18-rings`, `19-desert`, `20-ocean`, `21-cloud`, `22-ice-giant`.
These complete the planet rung: the old montage showed four of its twelve
bodies. Framing on all eight was verified on a contact sheet before this
render, which is the first time anyone has looked at them.

**Six new, written for the astronomy layer** — these are the additions, and
they are the reason to re-cut rather than patch:

| Shot | s | What it is for |
|---|---|---|
| `23-ecliptic` | 5.5 | The plane, stated once. Three degrees off it, so the Sun's annual path and every orbital rail collapse onto one horizontal line through the frame. They coincide because they are the same plane — and this is the single clearest frame in the whole library. |
| `24-zodiac` | 5.0 | All 88 constellation figures, swept across 65° of azimuth. Real stars at real positions in real colours. |
| `25-saturn-real` | 5.5 | Saturn at its true 26.7° obliquity, rings riding the equator, Titan drifting below, the Sun raking in from frame left. |
| `26-earth-real` | 5.5 | Earth's 23.44° tilt and the tidally-locked Moon holding one face through the whole move. |
| `27-uranus-tilt` | 4.5 | Uranus at 97.77° — pole aimed at camera, so its bands read as concentric rings while every other banded world in the cut has horizontal stripes. Cut it next to `28` and it needs no caption. |
| `28-jupiter-moons` | 5.0 | Jupiter, near-upright at 3.13°, with all four Galileans inside one frame. |

`05-system` was **re-authored**, not merely re-rendered: it now opens low and
close on the inner worlds and pulls back to 33 units, revealing all eight. By
the end Mercury has swept a third of its year while Neptune has barely moved,
which states Kepler's third law as motion instead of as a caption.

---

## 3. Two things the capture rig gained, and two things it found

### Gained

- **`follow: '<orbit id>'`** — a shot can now ride an orbiting body. Its
  `from`/`via`/`to` become offsets from that body and the camera aims at it.
  This is what makes `25`–`28` possible: Earth laps its orbit in 60 s, so at
  close range it walks out of a fixed frame in about two seconds. Positions
  come from `System.orbitPosition` on the capture clock — the same function
  and the same time source the drawn rails use, so the camera and the body
  cannot disagree. A `follow` naming an unknown id fails the capture loudly
  rather than silently mis-framing.
- **`sky: 'off' | 'stars' | 'zodiac' | 'all'`** — per-shot override of the
  real-sky mode. `24-zodiac` pins `all`, which was meaningful when the shipping
  default was the thirteen zodiac figures. **The default became `all` before
  this render**, so that override is now redundant and every shot in the
  delivery carries all 88 — the override remains only so the shot keeps its
  intent if the default ever moves back.

### Found — two content gaps, one fixed and one still open

1. **Jupiter rendered Saturn's rings — fixed.** `systemData.js` said in a
   comment that Jupiter's rings are "gossamer dust… a visual hint, not
   Saturn", but only the comment said so: the entry carried a tilt alone, and
   `buildRingMaterial`'s default is Saturn's density profile. Jupiter was
   rendering a bright ice ring complete with a **Cassini Division it has no
   business having**.

   `buildRingMaterial` now takes `profile` (`'saturn' | 'dust'`) and `gain`,
   both defaulting to Saturn's so the two existing callers are untouched.
   Jupiter's entry is `{ tilt: 0.35, profile: 'dust', gain: 0.14 }` — a main
   ring plus gossamer skirt, no gaps, dropped to a hint. Verified against a
   re-render: Jupiter's ring is now translucent enough to see stars and the
   orbit rails through, and Saturn's is pixel-unchanged.

2. **The auroral oval never renders — still open.** `Aurora.jsx` and
   `spaceWeather.js` are complete and `System.jsx` mounts the oval under
   `orbit.aurora` — but no orbit in `systemData.js` defines an `aurora` key,
   so the condition is never true. The feature is wired end to end and
   switched off by absent data. `26-earth-real` is framed for the tilt and the
   Moon instead; if that data lands, it is the shot to re-frame for it.

---

## 4. ✅ The re-render landed — four cuts are on disk

**Superseded 2026-08-13.** This section used to describe the v2 era: three
masters cut from `frames-9x16-v2/`. All three of those mp4s and that frame set
have been pruned. What follows is the current state; the delivery list in §0
is the authority.

Two complete frame sets remain, both **4,152 frames across all 30 shots**,
every shot verified exact and contiguous (first and last index present, count
equal to `seconds × 30`):

| Set | Aspect | Size |
|---|---|---|
| `video/frames-9x16-v3/` | 1080×1920 | 4.48 GB |
| `video/frames-4x5-v2/` | 1080×1350 | 3.74 GB |

Four masters are encoded, h264/yuv420p with `moov` ahead of `mdat` so they
stream without a full download — see §0 for the probed table. Frame arithmetic
checks end to end: a full 30-shot cut is 4,152 − (29 dissolves × 12 frames) =
3,804 = **126.8 s**, which is past every Reels ceiling and is why no full-set
master exists. `--only` subsets are the deliverable, not a convenience.

Spot-checked by eye, not just by arithmetic: at 15.5 s the astronomy cut shows
the all-88 sky sweep under "25,199 real stars", at 11.0 s `23-ecliptic` puts
every world on one line under "One plane. Every world.", and Jupiter carries
the corrected faint dust ring — so the §3 fix survived into the delivered
encode.

**The star card was wrong once and is now gated.** It read "8,355 real stars"
after the catalogue tripled to 25,199, because the sky grew and the copy did
not. `npm run check:shots` step 7 now compares any `N real stars` claim in
`assemble.mjs` against `skyCatalog.STARS.length` and fails on a mismatch — a
title card is a factual claim burned into the footage, and one the footage
contradicts is worse than no card at all.

To re-cut a different subset, see `--only` below; to re-render from scratch:

```bash
npm run capture:social -- --aspect 9x16 --fps 30 --out video/frames-9x16-v3
npm run capture:social -- --aspect 4x5  --fps 30 --out video/frames-4x5-v2
```

Measured rate on this machine is about **1,960 frames/hour** — roughly 2.1
hours per 30-shot set.

`assemble.mjs --only` cuts a subset straight out of a full frame folder — no
copying, no second render. These four commands reproduce exactly the four
masters in §0:

```bash
# Feed cut, 9:16 — 61.400 s, fifteen shots
node scripts/assemble.mjs --frames ./video/frames-9x16-v3 \
  --out video/echogalaxy-9x16-feed-v3.mp4 --aspect 9x16 --fps 30 --titles \
  --only 01-hook,02-rocky,03-gas,04-star,05-system,05b-pillars,06-spiral,07-barred,08-elliptical,09-irregular,10-group,11-blackhole,12-godshands,13-crab,14-coma

# Feed cut, 4:5 — same fifteen, same 61.400 s
node scripts/assemble.mjs --frames ./video/frames-4x5-v2 \
  --out video/echogalaxy-4x5-feed.mp4 --aspect 4x5 --fps 30 --titles \
  --only 01-hook,02-rocky,03-gas,04-star,05-system,05b-pillars,06-spiral,07-barred,08-elliptical,09-irregular,10-group,11-blackhole,12-godshands,13-crab,14-coma

# Astronomy cut, 9:16 — 36.600 s, eight shots, closes on 29-aurora
node scripts/assemble.mjs --frames ./video/frames-9x16-v3 \
  --out video/echogalaxy-9x16-astro-v3.mp4 --aspect 9x16 --fps 30 --titles \
  --only 01-hook,05-system,23-ecliptic,24-zodiac,25-saturn-real,27-uranus-tilt,28-jupiter-moons,29-aurora

# Astronomy cut, 4:5
node scripts/assemble.mjs --frames ./video/frames-4x5-v2 \
  --out video/echogalaxy-4x5-astro.mp4 --aspect 4x5 --fps 30 --titles \
  --only 01-hook,05-system,23-ecliptic,24-zodiac,25-saturn-real,27-uranus-tilt,28-jupiter-moons,29-aurora
```

**`--fps 30` and `--aspect` are not optional.** The defaults are 60 and `4x5`.
Wrong fps encodes without complaint and plays at half the intended duration
while the dissolve offsets stay computed from `seconds`; wrong aspect selects
the other title-card layout. Neither fails loudly.

**`--only` does not let you reorder.** Shots always run in the order they are
authored in `shots.js`, whatever order you list them on the command line —
deliberately, because the shot list encodes which moves dissolve into each
other and a command-line reorder would break momentum across the cuts
silently. So the astronomy cut ends on `28-jupiter-moons`. Adding `10-group`
to it would place that shot **third**, not last, because that is where it sits
in the authored list. If you want a wide pull-back to close, the shot list
itself has to change.

Title cards anchor to shot ids rather than to absolute time, so they cannot
drift when the cut changes; a card whose shot is absent is dropped and
reported. Four new cards were added for the astronomy shots, and `02-rocky`'s
card was corrected from "Five shader worlds" to "Twelve" — the montage used to
show four of the planet rung's twelve bodies and now shows all of them.

---

## 5. The 4:5 master is no longer blocked

The morning file said producing 4:5 meant a manual browser session, one URL at
a time, clicking a folder picker for each of eleven shots. **That is no longer
true, and appears not to have been true for a while** — `scripts/capture-social.mjs`
drives headless Chrome over the DevTools protocol and receives frames on a
loopback sink. It needs no interaction at all:

```bash
npm run capture:social -- --aspect 4x5 --fps 30 --out video/frames-4x5-v2
```

Same 29 shots, same unattended run, 1080×1350. Worth queueing after the 9:16
finishes — running both at once just makes them compete for the CPU, since
the renderer is software rasterised.

`1x1` (1080×1080) is a third aspect the rig already supports, same way.

### The three assembly traps still apply

Every one produces a file that encodes fine and looks wrong.

1. **`--fps` defaults to 60.** These sets are 30. Omit it and every duration
   halves while dissolve offsets stay computed from `seconds`.
2. **`--aspect` defaults to `4x5`** and selects the title-card layout.
3. **The path is `./video/frames-…`, not `./frames-…`.**

**ffmpeg 8.1.2 is installed and now resolves on PATH** — verified this session
with `Get-Command ffmpeg`. Earlier notes in this file said it did not; that is
no longer true, and `assemble.mjs` (which shells out to a bare `ffmpeg`) runs
without any path juggling. If it ever stops resolving, it lives at:

```
%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg_*\ffmpeg-8.1.2-full_build\bin
```

### Cutting a subset — `--only`

The full list is 29 shots and **122.7 s**, past the 90 s Facebook Reels
ceiling and longer than most viewers will watch. `--only` cuts any subset
from the same shot list, so one authored source yields several reels:

```
node scripts/assemble.mjs --frames ./video/frames-9x16 \
  --only 01-hook,02-rocky,03-gas --out video/short.mp4 \
  --aspect 9x16 --fps 30 --titles
```

Three things it does on purpose:

- **Authored order always wins.** `--only 14-coma,01-hook` still cuts
  01-hook first. The shot list encodes which moves dissolve into each
  other; letting a command line reorder them would break momentum across
  the cuts without any error.
- **An unknown id is fatal**, never skipped. Silently dropping a typo
  gives you a shorter film and no reason why.
- **Title cues whose shot is absent are dropped and reported by name.** A
  subset that excludes `10-group` loses "The Local Group. Free + open." —
  which is correct, but you should hear about it rather than notice at
  upload.

Verified end to end: a three-shot cut computed 9.8 s and encoded to
exactly 294 frames at 30 fps = 9.800000 s. The degenerate single-shot cut
emits a valid graph with no dangling dissolve.

---

## 6. The screencast library — `video/promo/`

Fifteen real-time interaction captures, 1600×900, each as `.webm` (VP9) and
`.mp4` (H.264 yuv420p, faststart). **These predate the astronomy layer too** —
`saturn`, `moon`, `rings-alone`, `godshands-*` and `scale-climb` all show the
old system rung. The galaxy, nebula and black-hole clips are unaffected and
remain good B-roll.

`blackhole` · `cloud` · `coma-redshift` · `crab` · `desert` · `galaxy-morph` ·
`godshands-clean` · `godshands-hud` · `ice-giant` · `moon` · `ocean` ·
`pillars` · `rings-alone` · `saturn` · `scale-climb`

- **`godshands-hud`** is still the only asset showing the cannonball fate dial
  live — capture mode hides the HUD.
- **`galaxy-morph`** (49 MB) is the star-migration morph between Hubble
  classes. Stars physically migrate; it is not a crossfade.

---

## 7. Captions

Still unwritten, and the well is now much deeper. The astronomy layer carries
**834 facts across 171 entries**, each at two reading levels, in
`src/stellarData.js`, `src/starData.js`, `src/constellationData.js` and
`src/skyCultureData.js`. Run `npm run check:content` for the inventory.

The `factsKids` rung is already tuned for short, punchy, non-specialist copy —
that is the register social captions want. Strongest hooks on hand:

- "Every star you can see at night is a sun."
- "One teaspoon of it would weigh about as much as an elephant."
- "Stars do not twinkle in space. Twinkling is our air wobbling the light on
  its way down."
- "There are thirteen constellations on that ring, not twelve. Ophiuchus is on
  it too — it just never got a horoscope." (pairs with `23-ecliptic`)
- "A view no probe will ever photograph."

For `23-ecliptic` specifically, the measured claim in `Sky.jsx`'s `SKY_INFO` is
the caption: zodiac figure stars sit a median **6.1°** from the ecliptic,
against **39.6°** for every other constellation. The zodiac hugging that plane
is a result, not a layout choice.

Link the deployed app in every post.

---

## 8. Disk

| Folder | Size | Keep? |
|---|---|---|
| `video/frames-9x16-v3/` | 4.48 GB | The delivered 9:16 set, all 30 shots. **Keep until design has signed off** — every `--only` re-cut comes out of here in seconds, and without it a different shot selection costs a ~2.1 h re-render. |
| `video/frames-4x5-v2/` | 3.74 GB | The delivered 4:5 set, all 30 shots. Same reasoning. |
| the four masters | 170 MB | The deliverable. |
| `video/stills-4x5/`, `video/stills-9x16/` | 33 MB each | 30 stills per aspect + contact sheet, so design can see every shot without pulling 8 GB. |
| `video/promo/` | 173 MB | Keep — though the Solar-System clips are pre-additions (§6). |

**Pruned 2026-08-13, 7.11 GB reclaimed** (`video/` went 15.73 → 8.62 GB):
`frames-9x16-v2/` (4.33 GB, superseded by v3 — 29 shots, no aurora),
`frames-9x16/` (2.23 GB, pre-additions), `frames-4x5-new/` (0.47 GB, four
shots), and the two stale masters `echogalaxy-9x16-feed.mp4` and
`echogalaxy-9x16-astro.mp4`. Together with the two deleted earlier, that
clears the entire do-not-send list from disk.

The two surviving frame sets are deliberately **not** pruned. ZACHTODOS says
to delete frame folders once the masters are encoded, and that is right in
general — but design has not received the delivery yet, and until they have,
these 8.22 GB are the difference between a re-cut taking seconds and taking an
afternoon.

---

## 9. Still your eyes' job

Frame counts, determinism, and framing come verified. **Watching the assembled
cut end to end does not.** Sampled frames confirmed framing on all 29 shots
before this render, but sampling is not watching, and the two shots that
carried the 2026-08-03 clock bug (`02-rocky`, `05-system`) are exactly the kind
that look perfect as stills and wrong in motion. That bug is fixed and every
frame here is post-fix — but check those two first anyway.
