# echoGalaxy — promotion video handoff

**State verified on disk 2026-08-11 (evening).** This supersedes the morning
version of this file, which is now wrong in its headline claim. Where this
contradicts `ZACHTODOS.md` or `HANDOFF-design.md`, this file is newer.

Companion document: [`HANDOFF-design.md`](HANDOFF-design.md) carries the
per-shot beats and timing cues — read it for **how to cut**, this for **what
exists and what to run**.

Media is gitignored by design — it travels by hand, not by git.

---

## 1. ⚠ Read this first: the finished 9:16 master is stale

The morning version of this file said `echogalaxy-9x16.mp4` was ready to ship
today. **It is not, and the reason is not a bug — it is that the app grew.**

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

**Do not ship the existing 9:16 master.** A re-render is in progress; see §4.

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
  real-sky mode. Only `24-zodiac` uses it (`all`); everything else renders the
  shipping default.

### Found — two content gaps, both flagged not fixed

Both touch shared files that `CLAUDE.md` says to coordinate on before editing,
and both are judgement calls rather than obvious bugs. **Neither blocks the
video**; they affect what the footage claims.

1. **The auroral oval never renders.** `Aurora.jsx` and `spaceWeather.js` are
   complete and `System.jsx:292` mounts the oval under `orbit.aurora` — but no
   orbit in `systemData.js` defines an `aurora` key, so the condition is never
   true. The feature is wired end to end and switched off by absent data.
   Earth's shot is framed for the tilt and the Moon instead; if that data
   lands, `26-earth-real` is the shot to re-frame for it.
2. **Jupiter renders Saturn's rings.** `systemData.js:146` says, in a comment,
   "Jupiter's rings are gossamer dust… a visual hint, not Saturn" — but
   `System.jsx:69` calls `buildRingMaterial` identically for both, varying only
   `scale`. In `28-jupiter-moons` Jupiter wears a bright, broad, banded ring
   system. A science-literate audience will catch it.

---

## 4. The re-render, and what to do when it lands

Running now, unattended:

```bash
npm run capture:social -- --aspect 9x16 --fps 30 --out video/frames-9x16-v2
```

29 shots, 4,017 frames. Measured steady-state rate on this machine is about
**1,960 frames/hour**, so roughly **2.5 hours** including the per-shot browser
launch. Output is `video/frames-9x16-v2/`, about 4.8 GB. Then assemble:

```bash
node scripts/assemble.mjs --frames ./video/frames-9x16-v2 \
  --out video/echogalaxy-9x16-v2.mp4 --aspect 9x16 --fps 30 --titles
```

At 122.7 s the full 29-shot cut is **longer than a Reels slot wants**.
`assemble.mjs --only` cuts a subset straight out of the full frame folder —
no copying, no second render:

```bash
# Feed cut (61.4 s) — the original fifteen, with 05-system now correct
node scripts/assemble.mjs --frames ./video/frames-9x16-v2 \
  --out video/echogalaxy-9x16-feed.mp4 --aspect 9x16 --fps 30 --titles \
  --only 01-hook,02-rocky,03-gas,04-star,05-system,05b-pillars,06-spiral,07-barred,08-elliptical,09-irregular,10-group,11-blackhole,12-godshands,13-crab,14-coma

# Astronomy cut (32.5 s) — what shipped today. 23-ecliptic is the thesis frame.
node scripts/assemble.mjs --frames ./video/frames-9x16-v2 \
  --out video/echogalaxy-9x16-astro.mp4 --aspect 9x16 --fps 30 --titles \
  --only 01-hook,05-system,23-ecliptic,24-zodiac,25-saturn-real,27-uranus-tilt,28-jupiter-moons
```

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
| `video/frames-9x16/` | 2.3 GB | **Stale** — superseded by `-v2`. Safe to delete once `-v2` is assembled and watched. |
| `video/frames-4x5-new/` | 486 MB | **Stale** — four shots, pre-additions. Its "only 4:5 footage left" status no longer matters now that 4:5 is one unattended command. |
| `video/frames-9x16-v2/` | ~4.8 GB | The new set. |
| `video/promo/` | 172 MB | Keep — the mp4s are the deliverable. |

86 GB free at the start of this session, so nothing needs deleting to proceed.

---

## 9. Still your eyes' job

Frame counts, determinism, and framing come verified. **Watching the assembled
cut end to end does not.** Sampled frames confirmed framing on all 29 shots
before this render, but sampling is not watching, and the two shots that
carried the 2026-08-03 clock bug (`02-rocky`, `05-system`) are exactly the kind
that look perfect as stills and wrong in motion. That bug is fixed and every
frame here is post-fix — but check those two first anyway.
