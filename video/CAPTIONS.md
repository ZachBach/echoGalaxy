# echoGalaxy — launch captions

Paste-ready copy for the four delivered cuts. Written 2026-08-14 against the
delivery table in [`HANDOFF.md`](HANDOFF.md) §0 and the per-shot beats in
[`HANDOFF-design.md`](HANDOFF-design.md) §7.

**Every factual claim below is sourced to a module in this repo.** The
provenance table is at the bottom (§5) — it is not paste material, it is the
audit trail. If you edit a line, check it against that table first. A caption
is a public factual claim and this app's whole premise is that its facts hold.

---

## 0. Placement

Per `ZACHTODOS.md` § "Launch video — publishing":

| Post | Platform | File | Aspect | Length |
|---|---|---|---|---|
| A | Instagram Reels | `echogalaxy-9x16-feed-v3.mp4` | 9:16 | 61.4 s |
| A | Facebook Reels | `echogalaxy-9x16-feed-v3.mp4` | 9:16 | 61.4 s |
| A | LinkedIn | `echogalaxy-4x5-feed.mp4` | 4:5 | 61.4 s |
| A | Facebook feed | `echogalaxy-4x5-feed.mp4` | 4:5 | 61.4 s |
| A | X | either; 9:16 reads better in-timeline | — | 61.4 s |
| B | Instagram Reels | `echogalaxy-9x16-astro-v3.mp4` | 9:16 | 36.6 s |
| B | Facebook Reels | `echogalaxy-9x16-astro-v3.mp4` | 9:16 | 36.6 s |
| B | LinkedIn | `echogalaxy-4x5-astro.mp4` | 4:5 | 36.6 s |
| B | X | either | — | 36.6 s |

**Check for `-v3` on both 9:16 filenames.** `HANDOFF.md` §0 records that the
superseded `echogalaxy-9x16-feed.mp4` differed from `-feed-v3.mp4` in exactly
one shot of fifteen and was byte-identical in size to three figures. Those
files are deleted, but the naming trap is worth remembering if anything is
ever re-encoded.

**A and B are two posts, not one post twice.** A is the montage — the scale
ladder. B is the astronomy block and closes on the aurora. Post them on
different days.

Link in every post: `https://www.aureliusdynamic.com/galaxy/`

### Reading the character counts

Counts are **hand-counted** (no shell in the authoring session) and cover the
**body only** — spaces and line breaks included, hashtag block excluded.
Verify in the composer before posting. Only X's limit actually binds; the
others have a factor of two or more of headroom.

Platform limits below come from general knowledge, **not** from this repo, and
platform rules move. Confirm before you rely on one.

---

## 1. POST A — the montage (61.4 s, 15 shots)

### A1 · Instagram Reels — 9:16

**Body — ≈901 characters** (limit 2,200; first ~125 shown before "more", so
the hook is the whole first line at 51)

```
The first shot is the Milky Way, seen from outside.

No probe we have ever built will live to photograph that, so the app computes it instead — a barred spiral with the Magellanic Clouds orbiting alongside, Andromeda across the frame, and gravity holding the Local Group together while the wider universe recedes.

Then it cuts hard down to a rocky world and climbs back out. Sixty-one seconds, six rungs: city lights coming up on the night side, the Solar System on real Kepler timing, the Pillars of Creation, four Hubble classes of galaxy, a black hole whose approaching side really is brighter, and the Coma Cluster — where Fritz Zwicky measured the galaxies swarming far too fast for their visible mass in 1933 and named what was missing dunkle Materie.

No photographs, no video textures. Every frame is computed live, and you can fly all of it yourself.

https://www.aureliusdynamic.com/galaxy/
```

**Hashtags — 158 characters, drop freely**

```
#astronomy #space #galaxy #milkyway #darkmatter #pillarsofcreation #webgpu #threejs #creativecoding #shaders #realtimerendering #scicomm #stem #generativeart
```

---

### A2 · Facebook Reels — 9:16

Different hook from A1 on purpose — this one leads on the blueshift.

**Body — ≈676 characters** (Facebook truncates around 125 characters on
mobile; the hook is the first line at 70)

```
Almost everything in the sky is moving away from us. Andromeda is not.

Its light is blueshifted: it is coming toward us at about 110 km/s, and in roughly 4.5 billion years the two great spirals will merge. It is already the farthest thing human eyes can see unaided — a smudge of light that left home 2.5 million years ago.

Watch for it in the wide pull-back about two-thirds of the way through this clip. The rest of the minute opens on the Local Group, cuts hard down to a planet, and climbs back out to a cluster of a thousand galaxies.

All of it computed live on the device — no photographs, no video. Free, no ads, no accounts.

https://www.aureliusdynamic.com/galaxy/
```

**Hashtags — 96 characters**

```
#astronomy #space #andromeda #milkyway #galaxy #stargazing #scicomm #stem #science #universe
```

---

### A3 · LinkedIn — 4:5

Different audience, different register: this is the rendering-engineering
story. Same footage.

**Body — ≈1,337 characters** (limit 3,000; ~140 shown before "see more", so
the hook is the first line at 44)

```
A galaxy in this app has no particle buffer.

Every star's position, blackbody colour, size and twinkle is derived in-shader from its instance index. Nothing is uploaded per star, so switching Hubble class is a uniform swap rather than a re-upload — and 24,000 stars cost the same whether they are one galaxy or the entire Local Group, which is budgeted to exactly one galaxy's worth.

The colour is not art direction either. Each star's temperature drives the published Planckian-locus ramp: red near 3,000 K, our Sun's white-yellow near 5,800 K, blue giants past 20,000 K. On the real-sky rung the temperature itself is derived, converting each catalogue star's B−V colour index through Ballesteros' formula.

It runs on three.js's WebGPU renderer with the WebGL2 backend as a real fallback, and a browser gate compiles and draws every shader node and material on both before anything ships. The capture rig that rendered this 61-second cut is deterministic: two runs three hours and two commits apart came back byte-identical on 18 of the 19 shots they shared. The one that moved was the only shot containing Earth, on the commit that gave Earth an auroral oval.

Vite, React 19, react-three-fiber, three.js. Free, no accounts, no data collection, and it boots offline after the first visit.

https://www.aureliusdynamic.com/galaxy/
```

**Hashtags — 62 characters** (LinkedIn convention is 3–5; more reads as spam)

```
#webgpu #threejs #realtimerendering #creativecoding #astronomy
```

---

### A4 · X

**Body — 242 characters as X counts it** (limit 280; X wraps any URL to 23
characters via t.co, so the raw string is 258 but posts at 242 — confirm in
the composer)

```
The first shot is the Milky Way from outside — a view no probe we have ever built will live to photograph. So it is computed instead.

61 seconds, planet to galaxy cluster, every frame generated live in a browser tab.

https://www.aureliusdynamic.com/galaxy/
```

**Hashtags — none.** There is no room, and the crow's-nest register does not
want them. If one is wanted, `#webgpu` (7) is the only one that earns its
characters here.

---

## 2. POST B — the astronomy cut (36.6 s, 8 shots)

Hook for the whole post is `23-ecliptic`, which `HANDOFF-design.md` §7 calls
the thesis shot: *"If the cut gets one caption, put it here — the visual
argument is already complete and the copy only has to name it."*

### B1 · Instagram Reels — 9:16

**Body — ≈870 characters** (hook is the first line at 84)

```
Look along the Solar System's orbital plane and every world collapses onto one line.

That is what this shot does. The camera sits three degrees off the plane, so the planets' orbital rails and the ecliptic — the Sun's annual path across the sky — land on the same line across the frame. They coincide because they are the same plane: a fossil of the flat disc the planets formed from.

It is also why the zodiac exists, and that turns out to be measurable rather than decorative. In this app's catalogue, zodiac constellation stars sit a median 6.1° from the ecliptic. Every other constellation: 39.6°.

There are thirteen on that ring, not twelve. The Sun spends about 18 days a year in Ophiuchus — more than it spends in Scorpius. It just never got a horoscope.

25,199 real stars, all 88 figures, real positions, real colours:
https://www.aureliusdynamic.com/galaxy/
```

**Hashtags — 140 characters**

```
#astronomy #zodiac #ecliptic #constellations #ophiuchus #stargazing #solarsystem #saturn #uranus #jupiter #scicomm #stem #webgpu #threejs
```

---

### B2 · Facebook Reels — 9:16

Leads on Ophiuchus — the wryest line in the set and the most likely to be
argued with in the comments, which is the point.

**Body — ≈794 characters** (hook is the first line at 123, so the "not twelve"
lands inside the truncation)

```
There are thirteen constellations on the zodiac, not twelve. Ophiuchus is on the ring too — it just never got a horoscope.

The Sun passes through it for about 18 days a year, which is more time than it spends in Scorpius. And precession has dragged the signs off the constellations by roughly one sign in 2,000 years, so the Sun is not in the constellation your birth sign names.

Both of those follow from the one thing this clip is actually about: the zodiac is a ring because every planet travels through the same flat band of sky. Look along that plane, as the camera does here, and the worlds line up.

25,199 real stars from the Yale Bright Star Catalogue and Hipparcos, at their real positions in their real colours. Free, no ads, no accounts.

https://www.aureliusdynamic.com/galaxy/
```

**Hashtags — 102 characters**

```
#astronomy #zodiac #ophiuchus #constellations #stargazing #space #science #scicomm #solarsystem #stem
```

---

### B3 · LinkedIn — 4:5

The engineering read on the same shot: the zodiac's crowding is a number that
fell out of a coordinate conversion, not a design decision.

**Body — ≈1,220 characters** (hook is the first line at 130)

```
Zodiac constellations hug the ecliptic. In this app that is not a layout decision — it is a number that fell out of the catalogue.

The sky here is the Yale Bright Star Catalogue (Hoffleit+ 1991) down to visual magnitude 6.5, which is both the naked-eye limit and that catalogue's own completeness limit, with the 6.5 to 7.5 band filled in from Hipparcos. 25,199 stars. To draw them in the same scene as the planets, the whole catalogue is converted from equatorial to ecliptic coordinates, which puts the ecliptic at y = 0 — the same plane as the orbital rails.

Which makes the claim measurable. Zodiac figure stars sit at a median 6.1 degrees from the ecliptic. Every other constellation: 39.6. That is why a camera placed three degrees off the plane collapses the Sun's annual path and every planet's orbit onto a single line.

The tilts are real too, and derived rather than typed twice: Saturn at 26.73 degrees with its rings riding the equator because both come from one obliquity call, Uranus at 97.77, Jupiter at 3.13. Cut Uranus against Jupiter and the concentric banding against horizontal banding needs no annotation at all.

36 seconds, computed live in a browser.

https://www.aureliusdynamic.com/galaxy/
```

**Hashtags — 60 characters**

```
#astronomy #dataviz #webgpu #threejs #creativecoding #scicomm
```

---

### B4 · X

**Body — 259 characters as X counts it** (raw string 275; posts at 259 with
t.co wrapping)

```
Look along the Solar System's orbital plane and every world collapses onto one line — the same line the zodiac rings, because they are the same plane.

Zodiac stars sit a median 6.1° off the ecliptic. Every other constellation: 39.6°.

https://www.aureliusdynamic.com/galaxy/
```

**Hashtags — none.** No room.

---

## 3. Optional add-ons, and one thing not to build on

### The aurora line — optional, and read the warning first

Post B **closes** on `29-aurora`, under the burned-in card "The solar wind,
made visible". If someone asks about the last shot, this is the reply, and it
is fully sourced:

```
That last ring is the auroral oval. Aurorae happen around the magnetic pole, not the spin pole, and Earth's magnetic axis leans about 11° off its spin axis — so the ring sits visibly off-centre and wobbles as the planet turns. The colours are a spectrum, not a palette: oxygen at 557.7 nm green low down, oxygen at 630.0 nm red higher up, ionised nitrogen at 427.8 nm violet at the top.
```
(391 characters)

**Do not hook a post on the aurora.** `HANDOFF-design.md` §0 is explicit: as
delivered, the oval is a thin green thread on a blown-out white polar limb and
"you have to be told it is there". It is a quiet closing beat. Naming it in a
reply works; promising it in a hook does not, and the fix is a re-framed shot,
not a brighter shader.

### Spare hooks, all sourced, if any caption needs a swap

- *"You are wreckage, rearranged."* — the Crab's closing fact, on the iron in
  your blood and the calcium in your bones being made in explosions like that
  one. Strongest single line in the repo. It is in Post A's cut (`13-crab`)
  but I kept it out of the body copy: it is a **whole post on its own**, and
  burying it in a list wastes it.
- *"Every star you can see at night is a sun. Many of them have planets of
  their own."*
- *"Stars do not twinkle in space. Twinkling is our air wobbling the light on
  its way down."*
- *"The arms are density waves — stars drift through them like cars through a
  traffic jam."*
- *"Saturn is less dense than water."* (The repo is careful here: "though no
  ocean could ever be large enough to float it." Keep the second clause — the
  bathtub version without it is the version people correct you on.)
- *"Newton explained orbits with a cannon on a mountaintop... You are holding
  the cannonball."* — for anything built around `12-godshands`.

### Comment-thread ammunition

Two claims in these captions reliably get argued with. Both hold:

- **"Thirteen, not twelve."** The Sun really does cross Ophiuchus, ~18 days a
  year, more than the ~6 it spends in Scorpius. The astrological zodiac uses
  twelve equal 30° signs, which stopped matching the constellations once
  precession moved them.
- **"Every world on one line."** It is a projection, and that is the argument
  — looking *along* a plane is the only way a camera can show that two things
  occupy the same one. Say so; it is a better answer than defending it.

---

## 4. Things deliberately left out

- **No emoji, no hype stack.** House voice.
- **No "open source" claim.** There is no `LICENSE` file at the repo root. The
  README says "a free, open educational tool" and the burned-in title card
  says "Free + open" — the captions say **free**, which is unambiguous, and
  leave licensing alone until a licence file exists.
- **No star-count claim other than 25,199.** That number is gated:
  `npm run check:shots` step 7 compares any `N real stars` claim in
  `assemble.mjs` against `skyCatalog.STARS.length` and fails on a mismatch. It
  is also burned into the footage on `24-zodiac`. Do not write a different
  one; the video will contradict you.
- **Nothing about the app's shot count, runtime or file sizes.** Nobody
  outside the project cares, and every one of those numbers changes.

---

## 5. Provenance — every claim, and where it lives

Not paste material. This is how you check a line before you edit it.

| Claim in a caption | Source |
|---|---|
| Milky Way from outside, "no probe we have ever built will live to photograph" | `src/LocalGroup.jsx` — `GROUP_INFO.facts[1]` |
| Magellanic Clouds orbit the Milky Way; M32/M110 orbit Andromeda | `src/LocalGroup.jsx` — `GROUP_INFO.facts[2]`, `MEMBERS` |
| Gravity holds the Group together while the wider universe recedes | `src/LocalGroup.jsx` — `GROUP_INFO.facts[3]` |
| Andromeda blueshifted, approaching ~110 km/s, merger in ~4.5 billion years | `src/LocalGroup.jsx` — `GROUP_INFO.facts[0]` and the `andromeda` member |
| Farthest thing visible to the unaided eye; light left 2.5 million years ago | `src/LocalGroup.jsx` — `andromeda.info.facts[0]` |
| City lights only on the night side; the terminator | `src/planetData.js` — `rocky.facts[1]`; shot beat in `src/capture/shots.js` `02-rocky` |
| Real Kepler timing, inner worlds faster than outer | `src/systemData.js` — `solarSystem.info` description + facts; title card "Real Kepler orbits" |
| Pillars of Creation | `src/Pillars.jsx` — `NEBULA_INFO` |
| Four Hubble classes | `src/galaxyData.js` — `GALAXY_TYPES`; title card |
| Black hole's approaching side is brighter (Doppler beaming) | `src/BlackHole.jsx` — `BLACK_HOLE_INFO.facts[1]` |
| Coma: ~1,000 galaxies; Zwicky 1933; galaxies swarming too fast for visible mass; *dunkle Materie* | `src/Cluster.jsx` — `CLUSTER_INFO.label`, `facts[3]` |
| Nothing is a photograph or video — computed live | `README.md`; `playstore/LISTING.md` ("no photos, no videos") |
| Six rungs | `README.md` — the scale journey |
| Zero per-star buffers; position, blackbody colour, size, twinkle from instance index; type switch is a uniform swap | `README.md` — Galaxies section; `CLAUDE.md` (shader-driven rungs derive from `instanceIndex`) |
| 24,000 stars per galaxy; whole Local Group on one galaxy's budget | `src/galaxyData.js` — `cfg.count`; `src/LocalGroup.jsx` budget-rule comment ("counts below sum to exactly 24,000") |
| Planckian-locus ramp; red ≈3,000 K, Sun ≈5,800 K, blue giants past 20,000 K | `src/Star.jsx` — `STAR_FACTS[1]`; `README.md` |
| B−V colour index → effective temperature via Ballesteros' formula | `src/Sky.jsx` — `SKY_INFO.factsAdvanced[1]` |
| WebGPU renderer, WebGL2 as a real fallback | `README.md` — Stack; `CLAUDE.md` |
| A browser gate compiles and draws every node and material on both backends | `CLAUDE.md` — `npm run check:shaders` |
| Determinism: 18 of 19 shots byte-identical across runs three hours and two commits apart; the one that moved was the only shot containing Earth, changed by the aurora commit | `video/HANDOFF.md` §0, "The rig is deterministic" |
| Vite, React 19, react-three-fiber, three | `CLAUDE.md` |
| Free, no accounts, no ads, no data collection, boots offline after first visit | `playstore/LISTING.md`; `README.md` (PWA boots offline) |
| Camera three degrees off the orbital plane | `src/capture/shots.js` — `23-ecliptic`; `video/HANDOFF-design.md` §7 |
| Ecliptic = the Sun's annual path; it is the same plane as the orbital rails | `src/Sky.jsx` — module header and `SKY_INFO.description` |
| A fossil of the flat disk the planets formed from | `src/systemData.js` — `solarSystem.info.facts[1]` |
| Zodiac stars a median 6.1° off the ecliptic vs 39.6° for every other constellation; equatorial→ecliptic conversion puts the ecliptic at y = 0 | `src/Sky.jsx` — `SKY_INFO.factsAdvanced[3]` |
| Thirteen on the ring, not twelve; Ophiuchus never got a horoscope | `src/Sky.jsx` — `SKY_INFO.factsKids[4]` |
| Sun spends ~18 days a year in Ophiuchus; ~6 in Scorpius | `src/constellationData.js` — `ophiuchus.factsAdvanced[0]`, `scorpius.factsAdvanced[1]` |
| Precession moved the signs by ~one sign in 2,000 years; the Sun is not in the constellation your birth sign names | `src/Sky.jsx` — `SKY_INFO.factsAdvanced[4]` |
| 25,199 stars; Yale Bright Star Catalogue (Hoffleit+ 1991) to V 6.5, Hipparcos for 6.5–7.5; all 88 figures | `src/Sky.jsx` — `SKY_INFO.label`, `factsAdvanced[0]`; gated by `npm run check:shots` step 7 |
| The zodiac rings because the planets travel the same flat band of sky | `src/Sky.jsx` — `SKY_INFO.factsKids[3]` |
| Saturn 26.73°, Uranus 97.77°, Jupiter 3.13°, Earth 23.44° | `src/solarBodies.js` — `PLANETS[*].obliquityDeg` |
| Saturn's rings ride the equator because globe tilt and ring tilt come from one obliquity call | `src/systemData.js` — `SATURN_RING_TILT` and its comment |
| Uranus concentric banding vs Jupiter horizontal — needs no annotation | `src/capture/shots.js` — `27-uranus-tilt`; `video/HANDOFF-design.md` §7 and §8 |
| Auroral oval rings the magnetic pole, not the spin pole; Earth's magnetic axis leans ~11° | `src/systemData.js` — `sol-earth.info.facts[3]`; `src/spaceWeather.js` — `buildAuroraMaterial` `magPoleTilt` |
| Aurora colours: O I 557.7 green, O I 630.0 red, N2+ 427.8 violet | `src/spaceWeather.js` — emission-colour block |
| "You are wreckage, rearranged"; the Crab, the guest star of 1054 | `src/Crab.jsx` — `CRAB_INFO.facts[3]` |
| "Every star you can see at night is a sun" | `src/stellarData.js` — `factsKids` |
| "Stars do not twinkle in space" | `src/Sky.jsx` — `SKY_INFO.factsKids[2]` |
| Spiral arms are density waves, cars through a traffic jam | `src/galaxyData.js` — `spiral.facts[0]` |
| Saturn less dense than water, but no ocean large enough to float it | `src/systemData.js` — `sol-saturn.info.facts[2]` |
| Newton's cannonball; "You are holding the cannonball" | `src/System.jsx` — `GODS_HANDS_INFO` |

### Not sourced to this repo — flagged

- **Platform character limits and truncation points** (IG 2,200 / ~125 shown;
  LinkedIn 3,000 / ~140 shown; X 280; Facebook ~125 before "See more") and
  **X's t.co rule that any URL counts as 23 characters**. These are general
  knowledge, they move, and nothing in this repo asserts them. Confirm in each
  composer.
- **All character counts in this file were counted by hand**, not by a tool.
  Only X's limit binds; re-check that one specifically.
