# RESEARCH — solar-system accuracy, space weather, and the real sky

Deep-research dossier commissioned 2026-08-11. Covers four asks:

1. Make the Solar System rung more scientifically accurate, and place it
   honestly inside the Milky Way.
2. Add solar flares / CMEs, and geomagnetic storms + aurorae on the
   bodies that actually have them.
3. Put the real zodiac constellations in the sky.
4. Work out how (and whether) JWST / probe imagery can enter the app.

**Method.** Every number below was fetched during the research pass, not
recalled — the same discipline the G2-03 blackbody work established after
memory got 5 of 9 Planckian anchors wrong. Where a figure is volatile
(moon counts, mission dates, solar-cycle state) it is marked ⚠ **VOLATILE**
and should be re-verified before it becomes shipped HUD copy, or phrased
so it cannot go stale. Where I could not reach a primary source, that is
said outright rather than papered over.

---

## Part A — Audit of the current build

Fourteen findings, graded: **[ERR]** factually wrong · **[GAP]** missing
science the app already claims or implies · **[SIMP]** deliberate
simplification worth revisiting · **[OK]** checked and correct.

### A1 [ERR] Titan is a moon of Jupiter in the data

[`systemData.js:95`](src/systemData.js#L95) puts `sol-titan` inside
Jupiter's `moons` array. **Titan orbits Saturn.** It is Saturn's largest
moon and ~96% of the mass in orbit around Saturn.

Compounding it: Saturn — the planet that actually owns Titan, and which
leads the Solar System in moon count — has **no moons at all** in the
scene, while Jupiter has two.

This is the single clearest error in the build and the one the request
named directly.

### A2 [ERR] Mercury and Mars share one recipe, so Mercury is the wrong colour

Both use `PLANET_RECIPES.desert` ([`systemData.js:42`](src/systemData.js#L42),
[`:79`](src/systemData.js#L79)), whose ramp runs through rust-oranges
(`0x6e3420` → `0xb65e31` → `0xd99a60`). That is Mars. **Mercury is grey**
— its surface is dark, iron-poor silicate regolith closer to the Moon's
palette than to Mars's iron oxides. The existing `moon` recipe is much
closer to Mercury than `desert` is.

### A3 [GAP] No axial tilt exists in the engine, but the HUD teaches it

[`Planet.jsx`](src/Planet.jsx) never rotates the mesh — spin lives
entirely in the material's sampling direction via `spinY`, which is a
rotation about **+y only**. There is no obliquity anywhere in the
pipeline.

Yet Uranus's own fact text reads *"Uranus rotates with an axial tilt of
about 98 degrees"* ([`systemData.js:126`](src/systemData.js#L126)) — the
app states a fact its renderer contradicts. Uranus should visibly lie on
its side. Axial tilt is also the *cause* of seasons and the reason the
terminator sits where it does, so it is load-bearing teaching, not
decoration.

### A4 [ERR] Every planet spins at the same rate, including retrograde Venus

[`System.jsx:283`](src/System.jsx#L283) passes `spinRate={0.15}` to every
body. Real rotation periods span **9.9 hours (Jupiter) to 243 days
(Venus)** — a factor of ~590. And Venus rotates **retrograde**: its
`spinRate` should be *negative*, as should Uranus's.

Again the HUD already says so: *"A Venus year is shorter than a Venus
day"* — a claim the uniform spin actively disproves on screen.

### A5 [GAP] The Sun has no activity of any kind

[`starMaterial.js`](src/starMaterial.js) gives a turbulence→`fireRamp`
plasma sphere plus a `streaks` corona. There are no sunspots, no
prominences, no flares, no CMEs, and no differential rotation. The
star is the one body in the app with nothing happening *to* it.

### A6 [GAP] No magnetospheres or aurorae anywhere

Nothing in the app represents a magnetic field, a radiation belt, a bow
shock, or an aurora. This is the largest single piece of missing physics
relative to the request, and it is the mechanism that connects A5 (the
Sun's activity) to the planets — without it, flares have nowhere to land.

### A7 [SIMP] Orbits are perfect circles — Kepler's 1st law is absent

`orbitPosition()` ([`System.jsx:37`](src/System.jsx#L37)) advances an
angle at fixed radius `orbit.r`. The app therefore demonstrates Kepler's
**third** law (the `r^1.5` timing, which it does honestly and well) while
silently denying the **first** (orbits are ellipses, with the star at one
focus) and the **second** (equal areas in equal times).

Worth noting: [`orbitPhysics.js`](src/orbitPhysics.js) *already does full
conic-section mathematics* — `predictFate()` computes semi-major axis and
eccentricity properly. The physics core understands ellipses; only the
rails are circular. Mercury's real eccentricity is 0.206, which is
visibly non-circular.

### A8 [SIMP] All orbits are exactly coplanar

Every body sits at `y = 0`. Real inclinations to the ecliptic run from
Mercury's 7.0° down to Earth's 0° by definition. The scene's own copy
already hedges this correctly (*"close to one plane"*), so this is a
defensible simplification — but a few degrees of tilt would cost nothing
and would make the "fossil of a flat disk" fact visible rather than
asserted.

### A9 [SIMP] Jupiter renders Saturn-style rings

Jupiter carries `ring: { tilt: 0.35 }` ([`systemData.js:92`](src/systemData.js#L92))
through the same `ringMaterial` as Saturn. Jupiter *does* have a ring
system, so this is not strictly false — but Jupiter's rings are dusty and
so faint they were unknown until Voyager 1 in 1979, and rendering them at
Saturn's visual weight teaches the wrong thing. Uranus and Neptune also
have real (faint, narrow) rings and currently show none.

### A10 [GAP] The sky is procedural — there are no real stars

[`skybox.js`](src/skybox.js) generates a hash-lattice star field and bakes
it to a 2048×1024 equirect. It is a beautiful *texture* and a completely
fictional *sky*. No constellation, zodiac or otherwise, can exist in it.
This is the substrate the entire constellation ask needs.

### A11 [GAP] Nothing places the Solar System inside the Milky Way

The Galaxy rung offers four generic Hubble types
([`galaxyData.js`](src/galaxyData.js)). The Milky Way is *mentioned* in
the spiral and barred fact lists but is not a selectable object, and
there is no indication of where the Sun sits in it, or that the band of
the Milky Way in the sky and the galaxy on the Galaxy rung are the same
object seen from inside and outside. That connection is the most
valuable single idea the scale ladder could deliver and it is currently
absent.

### A12 [SIMP] Venus's colour is the enhanced view, not the visible one

The `cloud` recipe ramps browns→ambers→cream. In **visible light Venus is
a nearly featureless pale cream-yellow**; the dramatic swirled banding is
a *UV* view, and the orange surface imagery is Soviet Venera lander /
radar data. All three are legitimate, but the app should say which one it
is showing. (This is an editorial fix, not necessarily a shader one.)

### A13 [OK] Moon tidal locking is exact, and correctly derived

[`Moon.jsx`](src/Moon.jsx) sets `spinRate = 2π/period` so the sampling
spin composes with the orbit to hold the same hemisphere facing home. The
MN-01 derivation is sound and verified to machine epsilon. No change
needed. Relative sizing is also good: the Moon renders at 0.263 × Earth's
radius against a true ratio of **1737.4 / 6371 = 0.273**.

### A14 [OK] Kepler timing, and the honesty of the compressed scale

The `K·r^1.5` rails are real Kepler third-law behaviour, `μ = 4π²/K²` is
derived rather than tuned, and the HUD explicitly tells the user the
distances are compressed and that this is "a physics demonstration, not a
scale model." That disclosure is exactly right and should survive every
change below.

---

## Part B — Verified reference data

### B1 Planetary physical parameters

Source: **NASA JPL Solar System Dynamics**, fetched 2026-08-11.

| Planet | Equat. radius (km) | Mean radius (km) | Mass (10²⁴ kg) | Density (g/cm³) | Rotation (d) | Albedo | Surf. gravity (m/s²) |
|---|---|---|---|---|---|---|---|
| Mercury | 2440.53 | 2439.4 | 0.330103 | 5.4289 | 58.6462 | 0.106 | 3.70 |
| Venus | 6051.8 | 6051.8 | 4.86731 | 5.243 | **−243.018** | 0.65 | 8.87 |
| Earth | 6378.1366 | 6371.0084 | 5.97217 | 5.5134 | 0.99726968 | 0.367 | 9.80 |
| Mars | 3396.19 | 3389.50 | 0.641691 | 3.9340 | 1.02595676 | 0.150 | 3.71 |
| Jupiter | 71492 | 69911 | 1898.125 | 1.3262 | 0.41354 | 0.52 | 24.79 |
| Saturn | 60268 | 58232 | 568.317 | 0.6871 | 0.44401 | 0.47 | 10.44 |
| Uranus | 25559 | 25362 | 86.8099 | 1.270 | **−0.71833** | 0.51 | 8.87 |
| Neptune | 24764 | 24622 | 102.4092 | 1.638 | 0.67125 | 0.41 | 11.15 |

Negative rotation = **retrograde** (Venus and Uranus). This table alone
fixes A4.

### B2 Axial tilt, eccentricity, inclination

JPL's physical-parameters page does **not** carry obliquity; these come
from the NASA NSSDC planetary fact sheet, whose canonical URL now 307s to
a landing page. ⚠ **Re-verify each of these against a primary source
before it becomes shipped copy** — they are the standard textbook values
and I am confident in them, but they did not come from a fetch this pass.

| Planet | Obliquity | Orbital ecc. | Incl. to ecliptic |
|---|---|---|---|
| Mercury | 0.03° | 0.2056 | 7.00° |
| Venus | 177.4° | 0.0068 | 3.39° |
| Earth | 23.44° | 0.0167 | 0.00° |
| Mars | 25.19° | 0.0934 | 1.85° |
| Jupiter | 3.13° | 0.0484 | 1.30° |
| Saturn | 26.73° | 0.0542 | 2.49° |
| Uranus | **97.77°** | 0.0472 | 0.77° |
| Neptune | 28.32° | 0.0086 | 1.77° |

Venus's 177.4° is the formal way of stating "upside down" — equivalent to
a retrograde spin, and consistent with B1's negative rotation period.

### B3 Moon counts ⚠ VOLATILE

This is the fastest-moving number in planetary science right now and any
hard count the app prints **will** be wrong within a year:

- NASA's own moons page said Saturn had **274** confirmed moons as of
  **25 March 2025**.
- Wikipedia, tracking IAU Minor Planet Center announcements, has Saturn at
  **293 with confirmed orbits as of 17 June 2026**, and Jupiter at **115
  as of 9 April 2026**.
- I could not reach the IAU announcement directly — `iau.org` returned
  **403 Forbidden** to the fetch. Search results claiming "285" and "292"
  came from low-quality aggregator sites and disagreed with each other;
  I discarded them.

**Recommendation: never print an exact count.** Write copy that stays
true — *"Saturn's confirmed moon count passed 290 in 2026 and is still
climbing; the number in your textbook is probably already out of date."*
That is both accurate and a better teaching point than any integer.

Major moons, for scene work:

| Moon | Parent | Diameter (km) | Period (d) |
|---|---|---|---|
| Ganymede | Jupiter | 5268.2 | 7.16 |
| **Titan** | **Saturn** | **5149** | **16** |
| Callisto | Jupiter | 4820.6 | 16.69 |
| Io | Jupiter | 3642.6 | 1.77 |
| Moon | Earth | 3474.8 | 27.32 |
| Europa | Jupiter | 3121.6 | 3.55 |
| Rhea | Saturn | 1527 | 4.5 |
| Iapetus | Saturn | 1470 | 79 |
| Dione | Saturn | 1123 | 2.7 |
| Tethys | Saturn | 1062 | 1.9 |
| Enceladus | Saturn | 504 | 1.4 |
| Mimas | Saturn | 396 | 0.9 |

Ganymede and Titan both exceed **Mercury** (4879 km) in diameter.

### B4 The Milky Way

- Disk diameter ~**100,000 ly**; disk thickness ~**1,000 ly**; central
  bulge ~**10,000 ly** across.
- Sun's distance from the Galactic Centre: ~**8 kpc ≈ 26,000–28,000 ly**.
- The Sun sits in the **Orion Spur** (Orion–Cygnus Arm), roughly
  3,500 ly wide × 10,000 ly long, between the **Sagittarius** arm
  (~1 kpc inward) and the **Perseus** arm (~2 kpc outward).
- ⚠ Note for copy: the 2025 Gaia-era view no longer cleanly splits arms
  into "major" and "minor" — the Orion Spur's old billing as a mere spur
  is being revised. Phrase arm structure with that caveat.
- Galactic Centre = galactic longitude 0°, in **Sagittarius**. The
  **anticentre** = 180°, in **Auriga**, at RA ≈ 05h 46m, Dec ≈ +28° 56′.
- The visible band crosses ~30 constellations, from Cassiopeia in the
  north to Crux in the south.

**The zodiac connection worth teaching:** the ecliptic and the galactic
plane are inclined ~60° to each other and cross in two places — near
**Sagittarius** (looking straight into the Galactic Centre) and near
**Taurus/Gemini** (looking straight out toward the anticentre). So two
of the four constellations the request named sit exactly where the
Solar System's plane cuts the Galaxy's plane. That is a genuinely
beautiful thing to be able to show, and it ties asks 1, 3 and the scale
ladder into one idea.

### B5 The Sun

- Photosphere effective temperature **5772–5780 K**; corona **1.5–2
  million K** — the coronal heating problem, still unsolved, and already
  a fact in `STAR_INFO`.
- Solar wind: ~**400 km/s** at low latitudes, ~**750 km/s** from polar
  coronal holes.
- Sunspot magnetic field: ~**3000 gauss (0.3 T)**, ~1000× the quiet
  photosphere.
- Differential rotation: ~**25 days** at the equator, ~**35 days** near
  the poles. (Standard values; not fetched this pass — ⚠ verify.)
- ⚠ **VOLATILE:** NOAA SWPC announced in January 2026 that Solar Cycle 25
  likely reached its highest sunspot number in over 20 years. A figure of
  "at least 299" appeared in search results but I could not confirm
  whether that is a monthly or smoothed value, and the two are routinely
  confused. **Do not ship that number without checking SWPC directly.**
  The safe, durable framing: Cycle 25 substantially overshot its 2019
  forecast.

### B6 Solar flares and CMEs

Flare classes are **peak GOES 1–8 Å X-ray flux**, each letter a factor of
ten:

| Class | Peak flux (W/m²) |
|---|---|
| A | < 10⁻⁷ |
| B | 10⁻⁷ – 10⁻⁶ |
| C | 10⁻⁶ – 10⁻⁵ |
| M | 10⁻⁵ – 10⁻⁴ |
| X | > 10⁻⁴ |

Within a class the digit is linear: X2 is twice X1. X10 and above happen,
which is why the scale has no ceiling.

**CMEs:** speeds from **< 250 km/s to ~3000 km/s**. The fastest
Earth-directed events arrive in **15–18 hours**; a typical ~500 km/s CME
takes **3–4 days**; the usual range is 1–5 days.

**Structure** — this is what a shader should actually build: a CME has a
canonical **three-part structure** — a bright **frontal loop** (leading
edge), a dark **cavity** behind it, and a bright **core** which is the
erupting prominence itself. Prominences are cool (5000–8000 K) dense
plasma suspended in the million-K corona by twisted magnetic flux ropes,
stable for days to weeks before they erupt. Same object, two names:
**filament** seen dark against the disk, **prominence** seen bright at
the limb. That day/limb duality is a lovely thing to render literally.

### B7 NOAA space weather scales

Fetched from spaceweather.gov 2026-08-11.

**Geomagnetic storms (G):**

| Scale | Kp | Frequency per cycle | Effect |
|---|---|---|---|
| G1 | 5 | 1700 (900 days) | Weak grid fluctuations |
| G2 | 6 | 600 (360 days) | High-latitude voltage alarms |
| G3 | 7 | 200 (130 days) | Voltage corrections; satellite drag |
| G4 | 8 | 100 (60 days) | Widespread voltage control problems |
| G5 | 9 | **4 (4 days)** | Possible complete grid collapse |

**Radio blackouts (R):** R1 = M1 (10⁻⁵ W/m²), R2 = M5, R3 = X1 (10⁻⁴),
R4 = X10 (10⁻³), R5 = X20 (2×10⁻³). R5 occurs **less than once per
cycle**.

**Solar radiation storms (S):** S1–S5 at ≥10 MeV proton flux of
10¹ through 10⁵ pfu; S4 is an "unavoidable radiation hazard to
astronauts."

The G-scale frequencies are the best fact here: **a G5 happens about four
days per eleven-year cycle.** That is why the May 2024 storm mattered.

### B8 Geomagnetic storms and aurorae

- **Gannon Storm, 10–11 May 2024** — G5, Kp 9, from active region AR3664.
  Strongest since the Halloween storms of 2003. Aurorae reached below
  54°N (central/southern England) and correspondingly far north in the
  south. Named for space-weather scientist Jennifer Gannon.
- **Carrington Event, 1859** — the benchmark extreme case.

**Aurora emission physics** — directly usable as a shader palette,
because auroral colour is genuinely a function of altitude and species:

| Colour | λ (nm) | Species | Altitude |
|---|---|---|---|
| Green | 557.7 | atomic O | ~100 km (0.7 s lifetime) |
| Red | 630.0 | atomic O | > 200 km |
| Blue/violet | 427.8 | N₂⁺ | 400 km+ |

Typical displays live between **110 and 200 km**. Green dominates because
the 557.7 nm transition is fast enough to emit before collisions quench
it; red only survives where the air is thin enough for the much slower
630.0 nm transition to complete. **That is why aurora is green at the
bottom and red at the top** — a real, visual, teachable causal chain.

### B9 Magnetospheres — which bodies get aurorae, and why

**Intrinsic (dynamo) fields:** Mercury, Earth, Jupiter, Saturn, Uranus,
Neptune.
**Induced only (solar wind on atmosphere, no dynamo):** Venus, Mars.

- **Jupiter** — strongest planetary field in the Solar System, dipole
  moment ~**20,000×** Earth's, magnetosphere millions of km across.
  Critically, Jupiter's and Saturn's magnetospheres are driven by **fast
  rotation and internally supplied plasma** — from **Io** at Jupiter and
  **Enceladus** at Saturn — not primarily by the solar wind. So Jovian
  aurorae are *permanent*, not storm-driven, and Io paints a literal
  **auroral footprint** on Jupiter. This is a much better story than
  Earth's, and the app already has Io in the scene.
- **Uranus and Neptune** — fields both strongly **tilted and offset**
  from the spin axis, giving wildly asymmetric magnetospheres unlike
  anything else. On Uranus, whose spin axis is already at 98°, the
  result is close to chaotic.
- **Mercury** — weak field, small magnetosphere, real substorms.
- **Mars** — no global dynamo; retains patchy **crustal** magnetism and
  shows diffuse/proton aurorae. Its lost dynamo is the leading suspect in
  its lost atmosphere, which is the single most important fact about
  Mars and is currently nowhere in the app.

**Design consequence:** the request said "geomagnetic storms to rocky
planets etc." The honest version is more interesting than the uniform
one — **rocky planets are exactly where aurorae mostly *aren't*.** Earth
has them because it has a dynamo; Venus and Mars largely don't, and
that difference is why one of them is habitable. Building the feature
per-body from B9 rather than uniformly across "rocky planets" turns a
visual effect into the app's best comparative-planetology lesson.

### B10 Titan

- Second-largest moon in the Solar System, **5149 km** diameter — larger
  than Mercury. Orbits **Saturn** in ~16 days.
- Surface pressure **~1.5 bar** — the only moon with a substantial
  atmosphere, and denser than Earth's at the surface.
- Composition **94.2% N₂, 5.65% CH₄**, 0.099% H₂, 0.0043% Ar.
- Surface temperature **~94 K**; water is bedrock-hard ice.
- The only world besides Earth with **stable surface liquid** — lakes and
  seas of liquid methane and ethane, concentrated near the north pole
  (Kraken Mare, Ligeia Mare, Punga Mare).
- **Dragonfly**: nuclear-powered rotorcraft, JHU APL. Entered integration
  and test January 2026; ⚠ launch currently **July 2028** on Falcon
  Heavy, ~6-year cruise, 3+ years of flight operations across multiple
  Titan sites. (Slipped from earlier 2026/2027 dates — verify before
  shipping.)

The existing `titan` recipe already gets the haze and the north polar
hood right. It is attached to the wrong planet, and it is missing the
lakes.

### B11 The Moon

- Radius **1737.4 km**, 0.273 × Earth — the app's 0.263 is good.
- **Libration** reveals **~59%** of the surface over time despite tidal
  locking; 18% of the far side is occasionally visible. The remaining
  82% was unseen by anyone until **Luna 3, 1959**.
- Receding at **3.8 cm/yr**.
- Sidereal month **27.3 d**, synodic **29.53 d** — and the difference
  between those two numbers *is* why the phase cycle is longer than the
  orbit.
- **Maria** cover ~16% of the surface, overwhelmingly on the near side.
  The near/far asymmetry is real and dramatic, and the current `moon`
  recipe distributes maria uniformly — a fixable inaccuracy now that
  tidal locking already guarantees which hemisphere faces us.

### B12 Probes worth citing

- **Parker Solar Probe** — closest approach **3.8 million miles** from
  the solar surface, first achieved 24 December 2024, repeated 22 March
  and 19 June 2025 (24th and final perihelion of the primary mission).
  WISPR imaged the corona and solar wind from inside it. Findings: solar
  wind **switchbacks** traced to magnetic "funnels" on the surface, and
  the discovery that **not all CME material escapes** — some flows back
  into the Sun and alters later eruptions. Directly relevant to A5/B6.
- **Cassini–Huygens** — Huygens landed on Titan 14 January 2005; Cassini
  mapped the Saturn system 2004–2017.
- **JWST**, **Voyager**, **Juno**, **New Horizons** — see Part C4.

---

## Part C — Feasibility of the new systems

### C1 The real sky — PROVEN, and it plugs into physics the app already has

I built and ran the full pipeline this pass. It works end to end:

- **Star positions:** Yale **Bright Star Catalogue** (5th Revised Ed.,
  Hoffleit+ 1991) via **VizieR** (`V/50/catalog`). Query returns HR
  number, name, RA/Dec J2000, V magnitude, **B−V colour index**, and
  spectral type. **2,847 stars brighter than V = 5.5** for the whole sky
  — about the naked-eye limit under a dark sky.
- **Constellation figures:** `MarcvdSluys/ConstellationLines`, **CC BY
  4.0**, 17 KB, keyed by BSC/HR number so it joins to the catalogue on a
  single integer.
- **Join result — all 13 zodiac constellations resolved with ZERO
  unresolved stars: 168 line segments over 142 distinct stars.**

| | Segments | Brightest star |
|---|---|---|
| Aries | 5 | α Ari (Hamal) V 2.00 |
| **Taurus** | 9 | **α Tau (Aldebaran) V 0.85, K5III** |
| **Gemini** | 25 | **β Gem (Pollux) V 1.14, K0III** |
| Cancer | 5 | β Cnc V 3.52 |
| Leo | 15 | α Leo (Regulus) V 1.35, B7V |
| **Virgo** | 5 | **α Vir (Spica) V 0.98, B1III-IV** |
| Libra | 8 | β Lib V 2.61 |
| Scorpius | 16 | α Sco (Antares) V 0.96, M1.5Iab |
| Ophiuchus | 8 | α Oph (Rasalhague) V 2.08 |
| Sagittarius | 30 | ε Sgr V 1.85 |
| Capricornus | 10 | δ Cap V 2.87 |
| **Aquarius** | 14 | **β Aqr (Sadalsuud) V 2.91, G0Ib** |
| Pisces | 18 | η Psc V 3.62 |

All four constellations named in the request are present and clean.

**The part that makes this genuinely good:** B−V converts to effective
temperature by Ballesteros' formula,
`T = 4600·(1/(0.92·BV + 1.70) + 1/(0.92·BV + 0.62))`, and temperature is
exactly what **the app's existing `blackbody(TSL, T)` node already
consumes** — the one validated against Mitchell Charity's published
10-degree CMF table in G2-03 to a worst-case 8/255. Verified on real
data this pass:

```
Sirius     B−V  0.00 → 10,125 K  (A1Vm)
Aldebaran  B−V  1.54 →  3,734 K  (K5+III)
Pollux     B−V  1.00 →  4,743 K  (K0IIIb)
Spica      B−V −0.23 → 14,354 K  (B1III-IV)
Sadalsuud  B−V  0.83 →  5,192 K  (G0Ib)
```

So the real sky would render **through the app's own already-verified
colour physics**, with real stars at real positions in real colours at
real brightnesses. Nothing new needs to be invented — this is a data
problem, not a shader problem. Aldebaran will come out orange because it
*is* 3,700 K, not because anyone picked orange.

Total shipped data after pruning to what is drawn: **well under 100 KB**,
smaller than the skybox texture it augments.

Licensing is clean: BSC is CDS/VizieR public catalogue data (acknowledge
CDS), constellation lines are CC BY 4.0 (credit Marc van der Sluys, DOI
10.5281/zenodo.10397192). Both are attribution-only. **Note: echoGalaxy
currently has no `LICENSE` file** — worth adding one regardless, and
required before this data ships cleanly.

### C2 Solar activity — fits the existing shader vocabulary

Everything B6 describes is buildable from nodes already vendored and
verified on r184: `fbm`/`warp`/`turbulence` for the granulation the star
already has, `worley` for supergranulation cells and sunspot placement,
`fireRamp` for the temperature ramp, and the `streaks`/impact-parameter
corona geometry from G1-27 for loops and prominences. Sunspots are
*dark* against the photosphere — a subtraction, not an addition, which is
cheap.

The CME three-part structure (front / cavity / core) maps onto the
`volumeAtlas` raymarching machinery already built for Pillars and reused
byte-identically for the Crab — a third consumer is exactly the pattern
that codebase has established.

### C3 Aurorae — new work, but well-defined

An auroral oval is a ring around the magnetic pole, emitting in the
557.7/630.0/427.8 nm palette with altitude-dependent colour (B8). Render
as an additive shell segment above the atmosphere shell that already
exists, gated by magnetic latitude, with the green→red gradient driven by
height. Intensity and oval size driven by a "storm level" parameter that
the Sun's CME events feed — which is what wires A5 to A6 and makes the
whole feature one causal system rather than two decorations.

### C4 Imagery — the real question ⚠

**Licensing is not the obstacle.** JWST/STScI material is public domain
("no claim to copyright is being asserted by STScI... may be freely used
as in the public domain"), with acknowledgement of NASA/STScI requested;
ESA/CSA co-branding conventions apply. NASA imagery generally likewise.
Access via MAST (`astroquery.mast`), the AWS Open Data registry mirror,
or simply the published press-release JPEGs.

**The obstacle is architectural, and it is real.** This app deliberately
has no textures. G2-01 *deleted* its only one — the CanvasTexture star
sprite — for a procedural disc, and the payoff was measured: cross-backend
parity improved **30–100×** (0.010–0.014/255, from 0.19–0.53) because
"what remains is pure math." Bundling photographs would:

- push a currently ~1.7 MB bundle up by megabytes per image;
- break the PWA's proven offline boot if fetched at runtime instead;
- reintroduce texture filtering into the parity story that G2-01 bought;
- and sit oddly against a Play Store TWA build.

There are three coherent strategies and they are genuinely different
products. This is the one decision I am not making unilaterally — see
Part E.

---

## Part D — Proposed implementation phases

Ordered by dependency. Each is a normal echoGalaxy phase: numbered tasks,
evidence per task, both backends, frozen-diff parity, TODOS.md log.

**Phase SS — Solar System truth** (fixes A1, A2, A4, A9, A12)
Move Titan to Saturn. Give Saturn its major moons and Mars its two.
Split Mercury off the Mars recipe onto a grey regolith one. Per-body
`spinRate` from B1 including retrograde Venus and Uranus. Demote
Jupiter's rings, add faint Uranus/Neptune rings. Editorial pass on
Venus's colour. **Pure data + one recipe; no engine change. Highest
value per unit risk — this is where the actual errors are.**

**Phase AX — Axial tilt and orbital shape** (fixes A3, A7, A8)
Obliquity through `<Planet>` (the body frame's first real change since
G1-01 — needs care, and the frozen-diff harness will catch drift).
Uranus on its side. Then elliptical rails: `orbitPosition` from true
anomaly, feeding the conic mathematics `orbitPhysics.js` already has.
Small inclinations. **Kepler's three laws instead of one.**

**Phase SW — Space weather** (fixes A5, A6)
Sunspots, differential rotation, prominences/filaments, flare events on
the B6 class scale, CMEs with the three-part structure. Then
magnetospheres per B9 — intrinsic vs induced, Jupiter's Io footprint,
Uranus's tilted mess — and aurorae per B8 with real emission colours.
The Sun's events drive the planets' storms: one causal chain.

**Phase ZD — The real sky** (fixes A10)
BSC + ConstellationLines ingest to a compact generated asset. Real stars
at real RA/Dec, coloured by B−V through the existing `blackbody` node.
Zodiac figures drawable on demand, ecliptic line, the Sun's actual
position against them. Ophiuchus included, because it is true and it is a
better story than leaving it out. Add `LICENSE` + attribution.

**Phase MW — Our galaxy** (fixes A11)
The Milky Way as a real object on the Galaxy rung: barred spiral, arms
per B4, the Sun marked in the Orion Spur. The payoff: connect the Galaxy
rung to the Sky — same object, outside and inside — and show the ecliptic
crossing the galactic plane at Sagittarius and Taurus/Gemini.

**Phase IM — Imagery** — *blocked on the Part E decision.*

---

## Part E — Decisions needed

1. **Imagery strategy.** Bundle real photographs (heavy, breaks the
   procedural/parity story, best fidelity), fetch at runtime (light
   bundle, breaks offline boot, needs network), or use imagery as
   *reference* to tune procedural recipes and cite the missions in
   HUD copy (keeps every existing property, no photographs on screen)?
2. **Phase order.** SS first is my recommendation — it is where the
   real errors are and it needs no engine change.
3. **Volatile facts.** Confirm the "never print an exact moon count"
   editorial rule, and whether B2/B5's unfetched values should be
   re-verified before or during implementation.

---

## Sources

Fetched 2026-08-11 unless noted.

- NASA JPL Solar System Dynamics — planetary physical parameters:
  https://ssd.jpl.nasa.gov/planets/phys_par.html
- NASA — Moons overview (Saturn 274 @ 2025-03-25):
  https://science.nasa.gov/solar-system/moons/facts/
- Wikipedia — Moons of Saturn (293 @ 2026-06-17), Moons of Jupiter
  (115 @ 2026-04-09)
- NOAA SWPC — Space Weather Scales:
  https://www.spaceweather.gov/noaa-scales-explanation
- NOAA SWPC — Solar flares / radio blackouts, CMEs:
  https://www.spaceweather.gov/phenomena/solar-flares-radio-blackouts ·
  https://www.spaceweather.gov/phenomena/coronal-mass-ejections
- NOAA SWPC — Solar Cycle 25 progression ⚠ verify:
  https://www.swpc.noaa.gov/news/solar-cycle-25-likely-reached-highest-sunspot-number-over-20-years
- Gannon Storm (May 2024): Copernicus GC 7:297 ·
  https://gc.copernicus.org/articles/7/297/2024/
- Aurora emission: NOAA SWPC aurora tutorial · AuroraWatch UK · NPS
- Planetary magnetospheres: JHU APL Tech Digest V7 N4 ·
  https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7146418/
- Titan atmosphere & Dragonfly: https://dragonfly.jhuapl.edu ·
  https://science.nasa.gov/blogs/dragonfly/2026/03/10/ ·
  Wikipedia, Atmosphere of Titan
- Parker Solar Probe: https://science.nasa.gov/science-research/heliophysics/nasas-parker-solar-probe-snaps-closest-ever-images-to-sun/
- Bright Star Catalogue via VizieR (V/50, Hoffleit+ 1991):
  https://vizier.cds.unistra.fr — acknowledge CDS
- ConstellationLines, Marc van der Sluys, CC BY 4.0:
  https://github.com/MarcvdSluys/ConstellationLines ·
  DOI 10.5281/zenodo.10397192
- Ballesteros B−V→Teff: Ballesteros (2012), EPL 97, 34008
- STScI content use policy (JWST public domain):
  https://www.stsci.edu/copyright
- Galactic anticentre / Milky Way structure: Wikipedia; Gaia EDR3
  spiral structure arXiv:2103.01970