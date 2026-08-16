# Cosmic Timeline — research + architecture

**Status:** design only. No code written, nothing committed.
**Scope:** a catalogue covering the whole history of the universe, from the
Planck epoch to the end of time, in the same data-layer idiom as
`stellarData.js` / `constellationData.js`.
**Author role:** content-writer. Shader, HUD and `App.jsx` work is described
here as a handoff, not performed.

---

## 1. The ask, and the one hard problem

"Big Bang to the end of time" spans **10⁻⁴³ seconds to 10¹⁰⁰ years**. That is
roughly **153 orders of magnitude**. Every naive approach to a timeline dies on
that number:

- A linear axis renders all of cosmic history as a single pixel at the far left
  and nothing else.
- "Percent of the way through" is meaningless when the denominator is unbounded.
- Auto-formatting durations breaks down: no `Intl` formatter has an opinion
  about 10⁶⁷ years.
- Sorting by a `Date`, a millisecond count, or any float in seconds overflows
  conceptually long before it overflows numerically.

Everything below follows from taking that dynamic range seriously rather than
quietly truncating it — which is what most "timeline of the universe" graphics
do when they stop at the heat death, or start at the CMB.

There is a second problem, less obvious and more damaging: **the confidence
level is wildly uneven across the span, and formatting flattens it.** A row
reading `10⁻⁴³ s — Planck epoch` sits visually identical to `13.787 Gyr — now`,
but one is a placeholder for physics that does not exist and the other is
measured to four significant figures. A timeline that presents both in the same
typeface is lying by layout. Per the project's "never a simplification that has
to be un-learned later" rule, confidence has to be **data**, not a footnote.

---

## 2. Seven design decisions

### 2.1 `logT` — log₁₀(seconds since the Big Bang) is the canonical key

One number orders the entire catalogue, positions it on an axis, and never
overflows.

| Moment | seconds | `logT` |
| --- | --- | --- |
| Planck time | 10⁻⁴³ | **−43** |
| Electroweak symmetry breaking | 10⁻¹² | **−12** |
| Neutrino decoupling | ~1 | **0** |
| Recombination (380,000 yr) | 1.2 × 10¹³ | **13.08** |
| Now (13.787 Gyr) | 4.35 × 10¹⁷ | **17.64** |
| Last stars (10¹⁴ yr) | 3.2 × 10²¹ | **21.5** |
| Supermassive black holes evaporate (10¹⁰⁰ yr) | 10¹⁰⁷·⁵ | **107.5** |

Because seconds-per-year is 3.156 × 10⁷, the conversion is a constant offset:
`logT = log₁₀(years) + 7.499`. Nothing else is needed.

Two properties make this the right key rather than merely a workable one:

- **It stays finite where the quantity does not.** Poincaré recurrence at
  10^(10^10) years has a `logT` of 10¹⁰ — a plain JavaScript number. Storing
  seconds directly would have hit `Infinity` around 10³⁰⁸.
- **It reveals the honest shape of the story.** The axis runs −43.5 → 110, so
  "now" at 17.64 sits **just under 40% of the way across**. Everything that has
  ever happened occupies the first two-fifths of the log axis. On a logarithmic
  clock the universe is an infant, and the graphic says so without a caption.

`eta` (Adams & Laughlin's *cosmological decade*, log₁₀ of **years**) is
`logT − 7.499` and must be **derived, never stored**. Check [8] in
`check-astronomy-content.mjs` exists because Antares' magnitude was written
down twice and the two copies disagreed. Do not create a second instance of
that bug.

### 2.2 Epochs are intervals, not instants

Big Bang nucleosynthesis is not "10 seconds"; it is 10 s → ~20 min, and the
duration is the physically interesting part. Every entry carries an optional
`tRange: [logT, logT]`, with the scalar `logT` as the representative anchor
inside it. Instantaneous-enough events omit the range.

### 2.3 `confidence` is a first-class field

Six tiers, ordered from strongest to weakest:

| Tier | Meaning | Example |
| --- | --- | --- |
| `observed` | We have direct data of the event itself | CMB, JWST galaxies, the geological record |
| `established` | Not seen directly, but the physics is lab-tested and its predictions confirmed | BBN abundances; electroweak scale at the LHC |
| `modeled` | Reliable extrapolation from tested physics | The Sun's red-giant phase |
| `contested` | Live disagreement in the current literature | Milky Way–Andromeda merger; evolving dark energy |
| `speculative` | Extrapolation orders of magnitude beyond any test | Proton decay; Hawking evaporation of a supermassive black hole |
| `unknown` | No accepted physics at all | The Planck epoch |

This is the field that earns the whole catalogue. It drives a visual treatment
(solid → dashed → ghosted), it gives the `factsAdvanced` rung something real to
say, and it makes the timeline defensible as an educational artifact rather
than a poster. It also means the honest entries — "we do not know what happened
before 10⁻⁴³ s, and this row is a placeholder for a missing theory" — become
*content* instead of an omission.

### 2.4 The future branches; the past does not

Past entries form a single ordered spine. After `NOW_LOG`, the timeline is a
**tree**, because the ending genuinely depends on the dark-energy equation of
state — and as of DESI DR2 that is an open question, not a hypothetical.

| Branch id | Condition | Ending |
| --- | --- | --- |
| `lambda-cdm` | w = −1 exactly | Eternal de Sitter expansion → heat death. The default spine. |
| `evolving-de` | w₀wₐ, w crossing −1 near z ≈ 0.5 | DESI DR2's preferred fit; weakens the far-future case for eternal acceleration |
| `big-rip` | w < −1 (phantom) | Bound structures torn apart at a finite time |
| `big-crunch` | Some w₀wₐ fits with w → more negative | Recollapse |
| `vacuum-decay` | Metastable Higgs vacuum | Can occur at any time, including during this sentence |

Entries carry `branch`. The gate should require `branch` to be **absent** for
`logT <= NOW_LOG` and **present** above it — a structural rule that makes it
impossible to quietly assert one future as fact.

### 2.5 Temperature is the through-line

The single number that makes 153 decades feel like one continuous story rather
than a list: **the temperature of the universe**, falling monotonically from
10³² K to the de Sitter floor.

```
10³² K  Planck epoch
10¹⁵ K  electroweak symmetry breaking
10¹² K  quark confinement
10⁹  K  nucleosynthesis
9400 K  matter–radiation equality
3000 K  recombination — the CMB is released
2.7255 K  now
0.0026 K  +100 Gyr, when the other galaxies are gone
10⁻³⁰ K  the floor
```

That floor is worth an entry of its own. The universe does **not** cool to
absolute zero: a de Sitter horizon has a Gibbons–Hawking temperature
T = ħH/2πk_B ≈ **2.6 × 10⁻³⁰ K**. Heat death is a universe in equilibrium with
its own horizon, not one at zero. This is exactly the kind of fact the
`factsAdvanced` rung exists for, and it is the natural closing line of the
whole catalogue.

Monotonic cooling is also a **cross-reference the gate can check**, in the
spirit of check [8]. There is precisely one legitimate exception — reheating at
the end of inflation, where the universe genuinely warms back up. Encode that
exception explicitly (`reheating: true`) so that any *other* non-monotonic
temperature is a hard failure. A structure check cannot see a wrong
temperature; a monotonicity check can.

### 2.6 The timeline indexes the rungs that already exist

**This is the cheapest and highest-leverage integration in the design.**

echoGalaxy already has a *spatial* scale ladder — six rungs in `SCALES`:
`planet · system · nebula · galaxy · group · cluster`. A cosmic timeline is its
**temporal dual**, and it does not need new scenes. Most of its important
moments already have a rung built:

| Timeline entry | Rung (`SCALES` id) |
| --- | --- |
| First stars, star formation | `nebula` |
| Massive-star death, heavy elements | `nebula` |
| Galaxy assembly, cosmic noon | `galaxy` |
| Local Group; the Andromeda merger | `group` |
| Large-scale structure | `cluster` |
| Solar System formation | `system` |
| Earth, the biosphere, the red giant | `planet` |

Note that Pillars and Crab are **dev routes** (`?pillars=1`, `?crab=1`), not
ladder rungs — both are reached through `nebula`, which already cycles star
birth and star death (SN-07). `rungLink` must validate against `SCALES` ids, not
route names.

So each entry carries an optional `cfg.rungLink`, and the timeline becomes a
**navigation spine over content that already ships**. Build cost is a data file
plus a HUD surface; payoff is a through-line tying every existing scene into
one story.

### 2.7 Two modes, one clock — the toggle

**Decided: the timeline is both a destination and an overlay, and a toggle
switches between them.** This is better than either alone, and the reason is
the state model rather than the UI.

Three pieces of state, and the invariant that makes it work:

```js
timeMode: 'off' | 'overlay' | 'view'   // the toggle
logT:     number                        // scrub position — SHARED by both modes
scale:    number                        // the existing SCALES index — untouched
```

**`logT` and `scale` are independent, and both survive a mode change.** That is
the whole design. Scrub to "first stars" in `view` mode, toggle to overlay, and
you are standing in the `nebula` scene *at that moment*. Toggle back and the
clock has not moved. The toggle changes which axis you are steering, not where
you are — so the two views read as one instrument rather than two features.

| Mode | Viewport | Scrubber | Purpose |
| --- | --- | --- | --- |
| `off` | The app exactly as it ships today | — | Zero change; the default |
| `overlay` | Current rung's scene, plus a time strip | Stepped, **only this rung's entries** (3–6) | "Where does what I'm looking at sit in cosmic history?" |
| `view` | A dedicated full-viewport timeline; `logT` drives a global backdrop | Continuous log scrub, detented to all ~42 entries | "What was the universe doing then?" |

`view` mode is a **dedicated surface — its own component file, its own route,
full viewport, opened by an explicit click.** Not a panel wedged into the
existing HUD chrome. The timeline needs room the HUD does not have: 42 entries,
era bands, a confidence legend, and the branch tree of §2.4 do not fit in a
strip beside a wrapping six-rung ladder.

**It is emphatically not a detached browser window** (`window.open`). That was
considered and rejected on five counts, each of which is a real failure rather
than a preference:

1. **Mobile has no windows.** The whole responsive pass of 2026-08-16 targeted
   phones; a detached window degrades to a new tab there.
2. **One renderer, one context.** `renderer.js` owns a single WebGPU/WebGL
   context (`window.__gl`). A second window means a second adapter — memory,
   and a real chance of failing to acquire one.
3. **Popup blockers** eat `window.open` without a direct user gesture.
4. **State sync.** The `logT`-survives-the-toggle invariant would need
   BroadcastChannel or storage events across windows — complexity bolted onto
   the single property that makes this design cohere.
5. **`harness-cdp.mjs` drives one page.** A second window breaks `check:frozen`,
   `check:parity`, and the capture rig.

Same page, own route, full viewport gets every benefit and incurs none of
these. `main.jsx` already lazy-routes query flags to standalone scenes, so the
pattern is established.

**The timeline must not become a seventh entry in `SCALES`.** `SCALES` is a
spatial ladder ordered by size; "Time" has no size and no correct slot in that
ordering. It is an orthogonal axis, so it gets orthogonal state. This also
respects PC-11 — rungs are addressed by id and inserting one must not move the
front door. A separate `timeMode` cannot disturb `?scale=` links at all.

This resolves **open question 2** as well: the scrubber argument was
unresolvable because it was being asked of one control doing two jobs. `view`
mode wants the full 153-decade sweep; overlay mode wants a handful of stops,
because scrubbing to 10⁶⁷ years while looking at a planet is not a meaningful
gesture. Different modes, different controls, same `logT`.

**URL and capture.** Follows the existing `?scale=` / `?system=` / `?sky=`
idiom: `?t=<logT>` and `?time=overlay|view`. That makes a moment in cosmic
history **linkable**, which for an educational tool is a feature and not a
detail — a teacher sends "the universe at recombination" as a URL. `check:shots`
and `CAPTURE` will need a `t` field if any social shot is to be taken in time
mode.

#### What overlay mode needs from the data — and the staged answer

Overlay raises a question `view` mode does not: **does the scene respond to the
clock?** Honestly, for most rungs that is a shader job per rung — a younger,
bluer, smaller galaxy is real work, six times over.

**Agreed approach: ship the informational version, design for the animated one.**

- **v1 — informational.** The overlay highlights the current rung's *temporal
  span* on the axis, greys out the time before its subject existed, and
  surfaces the entries that fall inside it. No scene animation. This works for
  all six rungs on day one.
- **v2 — responsive.** A rung opts in with a `temporal: true` flag and starts
  reading `logT`. One rung at a time, in whatever order is convenient.

Without that split, the whole feature blocks on six shader jobs landing
together. With it, overlay ships with the data file.

The data this needs is a **reverse index**. `cfg.rungLink` points entry → rung;
overlay needs rung → entries, plus each rung's lifespan:

```js
export const RUNG_EPOCHS = {
  planet:  { born: 17.46, dies: 17.78, temporal: false },
  system:  { born: 17.46, dies: 17.79, temporal: false },
  nebula:  { born: 15.75, dies: 21.5,  temporal: false },
  galaxy:  { born: 16.3,  dies: 21.5,  temporal: false },
  group:   { born: 16.5,  dies: 27.5,  temporal: false },
  cluster: { born: 16.8,  dies: 27.5,  temporal: false },
}
export function entriesForRung(rungId)   // derived from cfg.rungLink
```

`nebula` is the interesting row: it is the only rung whose subject is a
*recurring process* rather than an object, so its span is the entire
Stelliferous Era — nebulae have been forming and dispersing since the first
stars and will until the last. Every other rung has a birth and a death. Worth
saying out loud in its copy.

#### The build order this implies

`view` mode depends on **nothing that does not already exist** — it reads
`cosmicTimelineData.js` and renders. Overlay mode depends on per-body ages
that, as of today, **are not in the repo at all** (§7, Q5). So the sequencing
is forced, and pleasantly so:

1. **`cosmicTimelineData.js` + the gate** — pure content, no UI dependency.
2. **`view` mode** — the dedicated route. Ships standalone and useful.
3. **Age data** in `planetData.js` / `systemData.js` — the content work Q5
   turned up.
4. **`overlay` mode** — lights up on top of 1–3.
5. **`temporal: true`** per rung, one at a time, forever optional.

No stage blocks on another stage's content, and stages 1–2 deliver a complete
feature on their own. If the project stops after step 2, nothing is half-built.

---

## 3. Schema

```js
/**
 * One epoch in the history of the universe.
 *
 * Pure data — no rendering imports (the *Data.js rule). Carries the two-rung
 * facts ladder from factsLadder.js, so it reads through factsFor(entry, aud).
 */
{
  id: 'recombination',              // unique across ALL catalogues (gate [3])
  era: 'primordial',                // FK → COSMIC_ERAS[].id
  name: 'Recombination',
  label: 'z = 1089 · the universe turns transparent',   // stellarData idiom

  // --- time -------------------------------------------------------
  logT: 13.08,                      // log10(seconds since Big Bang). CANONICAL.
  tRange: [12.9, 13.2],             // optional; epochs are intervals
  t: '380,000 years',               // authored display string, never generated

  // --- physical state ---------------------------------------------
  tempK: 3000,                      // universe temperature. Monotone ↓ (gate)
  redshift: 1089.92,                // only where defined (past light cone)
  reheating: false,                 // the ONE licensed temperature exception

  // --- epistemics --------------------------------------------------
  confidence: 'observed',           // observed|established|modeled|
                                    //   contested|speculative|unknown
  branch: undefined,                // absent for past; required for future
  source: 'Planck 2018 VI, Table 2',// required when a hard number is claimed

  // --- content ------------------------------------------------------
  description: '…',                 // one authored paragraph
  factsKids: ['…', '…', '…'],
  factsAdvanced: ['…', '…', '…'],

  // --- render hook (galaxyData.js precedent) -------------------------
  cfg: {
    palette: ['#ff8a3d', '#ffd08a'],// era colour, keyed to blackbody where real
    rungLink: null,                 // a SCALES id: planet|system|nebula|
                                    //   galaxy|group|cluster — never a dev route
    density: 0.9,                   // opacity/particle hint for the backdrop
  },
}
```

Module exports:

```js
export const COSMIC_ERAS        // 7 coarse eras (§4)
export const COSMIC_TIMELINE    // ~42 entries, sorted ascending by logT
export const FATE_BRANCHES      // the 5 endings of §2.4
export const NOW_LOG   = 17.639 // log10 s at 13.787 Gyr — the origin marker
export const PLANCK_LOG = -43.27
export const AXIS = [-43.5, 110]

export function etaOf(entry)          // cosmological decade — DERIVED
export function timelineAt(logT)      // nearest entry ≤ logT
export function entriesInEra(eraId)
export function axisFraction(logT)    // 0..1 position, for the scrubber
```

### Worked entries

Three, chosen to exercise the ends and the middle of the confidence range.

```js
{
  id: 'planck-epoch',
  era: 'quantum',
  name: 'The Planck Epoch',
  label: 'Before 10⁻⁴³ s · no theory reaches here',
  logT: -43.27,
  tRange: [-Infinity, -43.27],   // note: gate must special-case the open end
  t: 'the first 10⁻⁴³ seconds',
  tempK: 1.4e32,
  confidence: 'unknown',
  source: 'Planck units; ħ, c, G — no observational constraint exists',
  description:
    'The earliest interval anyone can name, and the only one on this timeline ' +
    'with no physics behind it. At these densities gravity is as strong as the ' +
    'other three forces, so describing the universe requires a quantum theory ' +
    'of gravity — which does not yet exist. The Planck epoch is not a ' +
    'description of what happened. It is a label for where our descriptions stop.',
  factsKids: [
    'This is the very beginning — and it is the one part of the story scientists honestly cannot tell you.',
    'Our best theories of the very big and the very small disagree here, and nobody has worked out how to fix that yet.',
    'That is not a failure. Knowing exactly where your knowledge runs out is one of the most useful things science does.',
  ],
  factsAdvanced: [
    'The Planck time, √(ħG/c⁵) ≈ 5.39 × 10⁻⁴⁴ s, is where the Compton wavelength and the Schwarzschild radius of a mass coincide — general relativity and quantum field theory both apply and are mutually inconsistent.',
    'The Planck temperature is ~1.4 × 10³² K. Every energy scale the LHC probes (~10⁴ GeV) is fifteen orders of magnitude below the Planck scale (~10¹⁹ GeV).',
    'Inflation erases essentially all information about this era, so it is plausibly not merely unknown but unobservable in principle.',
  ],
  cfg: { palette: ['#ffffff', '#c9b8ff'], rungLink: null, density: 1.0 },
},
```

```js
{
  id: 'nucleosynthesis',
  era: 'radiation',
  name: 'Big Bang Nucleosynthesis',
  label: '10 s – 20 min · the first elements',
  logT: 2.2,
  tRange: [1.0, 3.08],
  t: '10 seconds to ~20 minutes',
  tempK: 1e9,
  confidence: 'established',
  source: 'Planck 2018 VI; Fields et al., PDG BBN review',
  description:
    'For about twenty minutes the whole universe was a working fusion reactor. ' +
    'Protons and neutrons bound into deuterium, then helium, and then the ' +
    'expansion pulled the density out from under the reaction and it stopped. ' +
    'Almost every helium nucleus in existence was made in that window; ' +
    'everything heavier than lithium waited another hundred million years for stars.',
  factsKids: [
    'In the first twenty minutes the universe built the first atoms — mostly hydrogen and helium, and almost nothing else.',
    'The helium in a party balloon is mostly older than every star in the sky.',
    'Then it stopped, because the universe spread out and cooled too fast to keep going.',
  ],
  factsAdvanced: [
    'BBN yields ~24–25% helium-4 by mass and traces of D, ³He and ⁷Li, set almost entirely by the baryon-to-photon ratio η ≈ 6 × 10⁻¹⁰ — one number, independently measured from the CMB, that predicts four abundances.',
    'It is a genuine test, not a fit: D/H is measured in high-redshift absorbers to a few percent and agrees with the Planck baryon density. This is why the confidence tier is "established" rather than "modeled".',
    'The lithium problem is the open exception — observed ⁷Li in metal-poor halo stars sits a factor of ~3 below prediction, and it is still unresolved.',
  ],
  cfg: { palette: ['#ffd45e', '#ff6a3d'], rungLink: null, density: 0.85 },
},
```

```js
{
  id: 'milkomeda',
  era: 'stelliferous-future',
  name: 'The Milky Way Meets Andromeda',
  label: '+4–6 Gyr · probably',
  logT: 17.75,
  tRange: [17.70, 17.83],
  t: '4–6 billion years from now',
  tempK: 1.4,
  confidence: 'contested',
  branch: 'consensus',            // survives in every dark-energy branch
  source: 'Sawala et al. 2025 Nat. Astron. 9, 1206; Wu et al. 2026 arXiv:2603.22863',
  description:
    'The textbook version says the collision is certain. It is not. Gaia ' +
    'astrometry made the Milky Way–Andromeda approach velocity measurable, ' +
    'and the answer turned out to depend sharply on the Large Magellanic ' +
    'Cloud and M33 — whose pull runs across the line of approach. Recent ' +
    'analyses land anywhere from a coin flip to near-certain.',
  factsKids: [
    'Andromeda, the nearest big galaxy, is heading our way at about 110 km every second.',
    'If they do collide, almost nothing will actually hit anything — galaxies are mostly empty space, so the stars slide past each other.',
    'Scientists used to say it was definitely going to happen. Newer measurements say maybe. That change is science working, not science failing.',
  ],
  factsAdvanced: [
    'Sawala et al. (2025) found ~50% merger probability within 10 Gyr once LMC and M33 are included with realistic mass and proper-motion uncertainties; Wu et al. (2026) recover 90% in their fiducial model with a median merger time of 6.5₋₁.₅⁺¹.³ Gyr, spanning 64.7–100% across proper-motion choices.',
    'The disagreement is dominated by M31\'s transverse velocity, which is small, hard to measure, and decides whether the encounter is a merger or a wide pass.',
    'A merger remnant would be pressure-supported and elliptical — the same process that built the giant ellipticals in galaxyData.js, observed from the inside.',
  ],
  cfg: { palette: ['#d46a9e', '#5a8fd6'], rungLink: 'group', density: 0.6 },
},
```

---

## 4. The seven eras

Adams & Laughlin's five ages are the standard framework and the second half
adopts them directly. Their Primordial Era is subdivided into three, because
lumping the Planck epoch with reionization is exactly the flattening §1
objects to.

| id | Name | `logT` span | A&L η | Character |
| --- | --- | --- | --- | --- |
| `quantum` | Quantum Era | −43 → −12 | — | Unknown physics; inflation |
| `radiation` | Radiation Era | −12 → 13.1 | — | Particle soup → first nuclei → CMB |
| `dark-ages` | The Dark Ages | 13.1 → 15.9 | — | Neutral hydrogen; no light sources |
| `stelliferous` | Stelliferous Era | 15.9 → 17.64 | 6–14 | Galaxies, stars, planets, us |
| `stelliferous-future` | Stelliferous Era (ahead) | 17.64 → 21.5 | –14 | Same era; the far side of now |
| `degenerate` | Degenerate Era | 21.5 → 47.5 | 15–39 | Remnants only; possible proton decay |
| `black-hole` | Black Hole Era | 47.5 → 107.5 | 40–100 | Black holes evaporating |
| `dark` | Dark Era | > 107.5 | > 101 | Maximum entropy; the horizon floor |

`stelliferous` and `stelliferous-future` are the **same physical era**, split at
`NOW_LOG` only so the UI has a clean anchor and the branch rule of §2.4 has a
boundary to enforce. The copy should say so — the reader should not come away
thinking the present is a physical transition. It isn't. It's just where we
happen to be standing.

---

## 5. The epoch spine — research output

Verified against the sources in §9. `C` = confidence tier.

### Quantum Era

| `logT` | Moment | T (K) | C | Note |
| --- | --- | --- | --- | --- |
| −43.27 | Planck epoch | 1.4 × 10³² | `unknown` | No theory. The honest gap. |
| −36 | Grand unification | 10²⁸ | `speculative` | Strong force separates; GUT scale untested |
| −36 → −32 | **Inflation** | — | `established` | ≥ 10²⁶× expansion |
| −32 | Reheating | ~10²⁷ | `established` | **The one temperature rise** |

Inflation earns `established`, not `speculative`: it made a falsifiable
prediction — a nearly scale-invariant, slightly *red*-tilted spectrum of
adiabatic Gaussian fluctuations — and Planck measured n_s = 0.965 ± 0.004,
excluding exact scale invariance at >8σ. Primordial B-modes remain undetected
(r < 0.036), which is the honest caveat and belongs in `factsAdvanced`.

### Radiation Era

| `logT` | Moment | T (K) | C | Note |
| --- | --- | --- | --- | --- |
| −32 → −12 | Quark–gluon plasma | 10²⁷ → 10¹⁵ | `established` | **Recreated at RHIC and the LHC** |
| −12 | Electroweak symmetry breaking | 10¹⁵ | `established` | ~100 GeV; the Higgs scale, measured |
| −11 → −6 | Baryogenesis | — | `speculative` | ~1 excess baryon per 10⁹ pairs; **mechanism unknown** |
| −6 | Quark confinement | 2 × 10¹² | `established` | Protons and neutrons form (~150 MeV) |
| 0 | Neutrino decoupling | 10¹⁰ | `established` | The CνB — indirect only, via N_eff ≈ 3.04 |
| 0.8 | e⁺e⁻ annihilation | 5 × 10⁹ | `established` | Why T_ν/T_γ = (4/11)^⅓ |
| 1.0 → 3.08 | **Nucleosynthesis** | 10⁹ | `established` | See worked entry |
| 12.2 | Matter–radiation equality | 9400 | `observed` | z = 3402 ± 26; structure can grow |
| 13.08 | **Recombination / CMB** | 3000 | `observed` | z = 1089.92; the oldest light |

The quark–gluon plasma row is a standout for the kids rung: this is not
inference, it is a substance that has been *made in a laboratory*. Heavy-ion
collisions reproduce the state the universe was in at a microsecond.

### The Dark Ages

| `logT` | Moment | T (K) | C | Note |
| --- | --- | --- | --- | --- |
| 13.1 → 15.7 | The Dark Ages | 3000 → 60 | `modeled` | Neutral H; **essentially unobserved** |
| 15.75 | First stars (Pop III) | ~50 | `speculative` | z ≈ 20–30; **never yet observed** |
| 15.95 | First galaxies | ~45 | `observed` | MoM-z14, z = 14.44, 280 Myr — JWST |
| 16.0 → 16.5 | Reionization | 40 → 20 | `observed` | τ = 0.054; ends z ≈ 5.3–6 |

The Dark Ages and Pop III stars are the timeline's best "here is the frontier"
material — a 21 cm signal that would open this window is the target of current
instruments, and the EDGES absorption claim remains disputed. Do not write
these as settled.

### Stelliferous Era — behind us

| `logT` | Moment | Lookback | C |
| --- | --- | --- | --- |
| 17.02 | Cosmic noon — peak star formation (z ≈ 2) | 10.5 Gyr | `observed` |
| ~16.3 | Earliest supermassive black holes | ~13 Gyr | `observed` (formation route **unsolved**) |
| 17.1 | Milky Way's thick disk; oldest stars ~13 Gyr | — | `observed` |
| 17.36 | **Expansion begins accelerating** (z ≈ 0.65) | ~6 Gyr | `observed` |
| 17.46 | Solar System forms — 4.568 Gyr ago | 4.57 Gyr | `observed` |
| 17.47 | Earth; oldest life evidence ~3.5–3.7 Gyr ago | — | `observed` |
| 17.61 | Great Oxidation, Cambrian, and everything since | — | `observed` |
| **17.639** | **Now** — 13.787 ± 0.020 Gyr, T = 2.7255 K | 0 | `observed` |

Two things to make sure the copy lands:

- **Acceleration onset (z ≈ 0.65, transition redshift 0.65₋₀.₁₇⁺⁰·¹⁹) is not the
  same as matter–Λ equality (z ≈ 0.3).** These are routinely conflated. Get
  them right in `factsAdvanced` and pick one for `factsKids`.
- **All of recorded human history is 5,000 years — `logT` 11.2 on an axis where
  now is 17.64.** It is over six orders of magnitude thinner than a pixel. The
  timeline should refuse to zoom to it, and say why.

### Stelliferous Era — ahead

| `logT` | When | Moment | C |
| --- | --- | --- | --- |
| 17.64 | +600 Myr | Last total solar eclipse — the Moon recedes 3.8 cm/yr | `modeled` |
| 17.67 | +1 Gyr | Rising luminosity locks up CO₂; C3 photosynthesis fails | `modeled` |
| 17.69 | +1.5–2 Gyr | Oceans evaporate; the habitable zone passes Mars | `modeled` |
| 17.75 | +4–6 Gyr | **Milky Way–Andromeda** — see worked entry | `contested` |
| 17.77 | +5 Gyr | Sun leaves the main sequence | `modeled` |
| 17.78 | +7.6 Gyr | Red-giant tip; Earth very likely engulfed | `modeled` |
| 17.79 | +7.8 Gyr | Planetary nebula; a 0.54 M☉ white dwarf remains | `modeled` |
| 18.55 | +100 Gyr | **Every galaxy outside the Local Group is beyond the horizon** | `modeled` |
| 21.5 | 10¹⁴ yr | Last red dwarfs burn out. The Stelliferous Era ends. | `modeled` |

The +100 Gyr row is the most philosophically loaded entry in the catalogue and
should be written as such. Once the accelerating expansion carries everything
outside the Local Group past the cosmological horizon, an astronomer in
Milkomeda sees one galaxy in a static void. No redshift-distance relation, no
CMB (redshifted below any conceivable detection), no evidence the universe
expands or ever began. **The correct conclusion from their best available data
would be a static, eternal, single-galaxy cosmos — and they would be wrong.**
Krauss & Scherrer's point, and the strongest argument this timeline can make
for why we should record what we can see now.

Note also that the 1 Gyr biosphere figure has moved: Haqq-Misra et al. (2026,
*JGR Atmospheres*) argue the vegetative biosphere may persist substantially
longer than the classic Schröder & Smith (2008) estimate. Write the range, cite
both, and tag `modeled`.

### Degenerate Era — 10¹⁴ → 10⁴⁰ yr

| `logT` | When | Moment | C |
| --- | --- | --- | --- |
| 21.5 | 10¹⁴ yr | Only white dwarfs, brown dwarfs, neutron stars, black holes | `modeled` |
| 22.5 | 10¹⁵ yr | White dwarfs cool to black dwarfs — no light left | `modeled` |
| ~23 | 10¹⁵ yr | Brown-dwarf collisions ignite the last, rare new stars | `speculative` |
| 27.5 | 10²⁰ yr | Remnants scatter out of galaxies or spiral into the centre | `speculative` |
| 41.5 → 47.5 | 10³⁴–10⁴⁰ yr | **Proton decay, if it happens at all** | `speculative` |

Proton decay is the single most important `speculative` entry, and the one
where the confidence tier does the most work. Grand unified theories predict
it; **it has never been observed.** Super-Kamiokande, over 0.45 megaton-years,
sets τ/B(p → e⁺π⁰) > **2.4 × 10³⁴ years** at 90% CL — a lower bound that has
already excluded the simplest SU(5) predictions. If the proton is stable, the
Degenerate Era does not end this way, and matter instead dissolves via far
slower channels (virtual black hole formation, ~10²⁰⁰ yr). **Both branches
belong in the data.**

### Black Hole Era — 10⁴⁰ → 10¹⁰⁰ yr

| `logT` | When | Moment | C |
| --- | --- | --- | --- |
| 74.5 | 10⁶⁷ yr | A stellar-mass black hole finishes evaporating | `speculative` |
| 107.5 | 10¹⁰⁰ yr | A 10⁹ M☉ black hole finishes evaporating | `speculative` |

Hawking evaporation goes as M³, so the biggest objects last longest and the
universe's final structures are its largest. Worth stating plainly that Hawking
radiation has never been detected, and that the information-paradox physics
governing the endpoint is unresolved — `speculative` is doing honest work here,
not hedging.

### Dark Era — beyond 10¹⁰⁰ yr

| `logT` | Moment | C |
| --- | --- | --- |
| > 107.5 | Photons, neutrinos, and stray electrons and positrons | `speculative` |
| — | Positronium atoms light-years across, decaying over 10^10^76 yr | `speculative` |
| — | **The floor: T → 2.6 × 10⁻³⁰ K, not zero** (§2.5) | `modeled` |
| ~10¹⁰ (η) | Poincaré recurrence — 10^(10^10) yr | `speculative` |
| any | Vacuum decay — could occur at any moment, including now | `speculative` |

The recurrence and vacuum-decay rows have no meaningful axis position and
should render **off-axis**, as annotations rather than points. Placing
10^(10^10) years on the same scrubber as 10¹⁰⁰ years implies a comparison that
does not exist.

---

## 6. Extending the gate

`check-astronomy-content.mjs` needs `cosmicTimelineData.js` added to `MODULES`,
which gets checks [1]–[5] and [7] free. New checks in the spirit of [6] and [8]:

1. `logT` strictly ascending across `COSMIC_TIMELINE` — the file is a timeline;
   out-of-order is a content bug, not a style issue.
2. Every `era` resolves to a `COSMIC_ERAS` id, and `logT` falls inside that
   era's declared span.
3. `tRange[0] <= logT <= tRange[1]` where present (special-case the open
   `-Infinity` lower bound on the Planck entry).
4. `confidence` ∈ the six tiers. No default — an unset tier must fail.
5. **`branch` present iff `logT > NOW_LOG`.** Structurally prevents asserting
   one future as settled.
6. `tempK` monotonically decreasing, **except** where `reheating === true`.
   The cross-reference check of §2.5 — this is the one that catches a wrong
   number rather than a wrong shape.
7. Any entry with a numeric `redshift` or `tempK` carries a non-empty `source`.
   BACKLOG-COVERAGE.md already flags that 3,342 lines of existing content carry
   roughly seven source references against a standard demanding three per task.
   Do not add to that debt.
8. `etaOf(entry)` agrees with `logT − 7.499` — cheap, and guards the derived
   field from becoming a stored one.
9. `rungLink`, where set, is one of the six `SCALES` ids — **not** a dev-route
   name. `pillars` and `crab` are routes reached through `nebula`; a
   string-typed field makes that confusion easy and a gate check makes it
   impossible.
10. Every key in `RUNG_EPOCHS` is a `SCALES` id and every `SCALES` id has an
    entry — the overlay greys out time using this map, and a missing rung would
    fail open (showing the whole axis as valid) rather than closed.
11. `entriesForRung(id)` is non-empty for every rung. A rung the timeline never
    references is a rung whose overlay is blank.

Add to `check:content`, which is already in `check:all`. Node-smoked, no
browser, consistent with the project convention.

---

## 7. Handoff — what this design needs from other people

I have not touched rendering code, `App.jsx`, or any shader, per role. These
are the pieces someone else has to build:

**For a shader-dev:**
- A backdrop driven by a single continuous `logT` uniform, reading `cfg.palette`
  and `cfg.density`. The temperature through-line (§2.5) is a blackbody ramp
  from 10³² K to 10⁻³⁰ K and should reuse the existing Planckian-locus
  machinery rather than a new gradient — echoGalaxy already computes blackbody
  colour correctly, and inventing a second path would let the two drift.
- Interpolation between entries is in **log space**, not linear. Worth stating
  in the uniform's comment, because it is the obvious thing to get wrong.

**For the lead / App.jsx owner:**
- The `timeMode` state machine of §2.7 — three states, and the invariant that
  `logT` and `scale` are independent and both survive the toggle. `timeMode`
  lives **beside** `scale`, not inside `SCALES`.
- Two scrubbers, not one: continuous-detented in `view` mode, stepped over
  `entriesForRung()` in overlay mode.
- `view` mode is a new route + component file, following the `main.jsx`
  lazy-route pattern — **not** a `window.open`. §2.7 lists the five reasons.
- The compact-HUD rule from CLAUDE.md applies, and **overlay mode is the real
  risk**: it adds a time strip to a HUD that already has a wrapping six-rung
  ladder and a facts pane, against a 68dvh sky-visibility cap. The mobile audit
  found 11 controls under the hamburger on every device tested; this adds more.
  Run `check:mobile` when the strip first renders, not at the end.
- `rungLink` (§2.6) implies timeline → rung navigation, which is a routing
  decision and therefore yours, not mine.
- Decide whether `?t=` and `?time=` participate in `CAPTURE` before any social
  shot is planned in time mode.

**Open questions I could not settle from the data layer alone:**
1. ~~New rung or overlay?~~ **Resolved — both, via the §2.7 toggle.**
2. ~~Scrubbable or stepped?~~ **Resolved — mode-dependent; see §2.7.**
3. Does the `contested` tier need a visual distinct from `speculative`? They
   mean different things — active disagreement vs. untested extrapolation — and
   collapsing them loses the distinction that makes the tier list worth having.
4. Where does this sit in BACKLOG.md? It is not Stars & Constellations
   (ST-001 → ST-500, all 500 allocated). It reads as a new phase — suggest
   **Phase CT, CT-001 → CT-100** — but numbering is the lead's call.
5. ~~What does the overlay clock mean for an exoplanet with no known age?~~
   **Resolved, and the problem was larger than stated.** A grep for age data
   found **none** — `planetData.js` and `systemData.js` carry no age field for
   any body, not even the Solar System. So there is no wrong value to fix;
   there is a field to author, and it must be able to say "unknown" natively:

   - **Solar System bodies** — `4.568 Gyr`, from CAI dating. Well constrained.
   - **Exoplanets** — inherit the **host star's** age *with its uncertainty*,
     flagged as inherited rather than measured. TRAPPIST-1 is ~7.6 ± 2.2 Gyr;
     that error bar is the content, not a defect to hide.
   - **Everything else** — `null`, rendered by the overlay as an explicit
     "age unknown" **state**, never as a blank or a guess.

   This is authoring work in the planet/system catalogues — content-writer
   scope, taken at step 3 of the build order in §2.7.

---

## 8. Why this is worth building

echoGalaxy already answers *how big*. It has no answer for *how long*, and the
two questions are the same question asked along different axes — the scale
ladder and the time ladder are duals. The timeline costs one data file and a
HUD surface, reuses every scene already built, and carries the project's
strongest available educational payload: a universe measured honestly, with the
places we do not know marked as clearly as the places we do.

---

## 9. Sources

Cosmological parameters, recombination, matter–radiation equality, n_s, τ:
- [Planck 2018 results. VI. Cosmological parameters](https://www.aanda.org/articles/aa/pdf/2020/09/aa33910-18.pdf)
- [Planck 2018 results. I. Overview and cosmological legacy](https://www.aanda.org/articles/aa/full_html/2020/09/aa33880-18/aa33880-18.html)

Dark energy, and whether it evolves:
- [Did DESI DR2 truly reveal dynamical dark energy? — Eur. Phys. J. C](https://link.springer.com/article/10.1140/epjc/s10052-025-15076-y)
- [Evidence for evolving dark energy from DESI DR2 (talk)](https://indico.in2p3.fr/event/36640/contributions/164744/attachments/97357/149854/DESI_DR2_results_2025.pdf)
- [A Bayesian Perspective on Evidence for Evolving Dark Energy](https://arxiv.org/pdf/2511.10631)
- [Hubble-parameter constraints on the deceleration–acceleration transition redshift](https://arxiv.org/pdf/1301.5243)

The Milky Way–Andromeda question:
- [Sawala et al. 2025, *No certainty of a Milky Way–Andromeda collision*, Nature Astronomy 9, 1206](https://www.nature.com/articles/s41550-025-02563-1)
- [Apocalypse When? No Certainty of a Milky Way–Andromeda Collision (arXiv:2408.00064)](https://arxiv.org/abs/2408.00064)
- [Wu et al. 2026, *The Fate of the Milky Way–Andromeda System: To Merge or Not?* (arXiv:2603.22863)](https://arxiv.org/abs/2603.22863)

The early universe, observed:
- [MoM-z14 at z = 14.44 — the most distant spectroscopically confirmed galaxy](https://phys.org/news/2025-05-farthest-galaxy-jwst-million-years.html)

Proton decay:
- [Super-Kamiokande, p → e⁺π⁰ and p → μ⁺π⁰, enlarged fiducial volume (arXiv:2010.16098)](https://arxiv.org/abs/2010.16098)
- [Search for proton decay with 0.37 Mton-yr exposure — Phys. Rev. D 110, 112011](https://link.aps.org/doi/10.1103/PhysRevD.110.112011)

The Sun, the Earth, and the far future:
- [Schröder & Connon Smith 2008, *Distant future of the Sun and Earth revisited*, MNRAS 386, 155](https://articles.adsabs.harvard.edu/pdf/2008MNRAS.386..155S)
- [Haqq-Misra et al. 2026, *Maximum Lifetime of the Vegetative Biosphere*, JGR Atmospheres](https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2025JD045586)
- [Adams & Laughlin, *The Five Ages of the Universe* — the era framework and cosmological-decade notation](https://en.wikipedia.org/wiki/The_Five_Ages_of_the_Universe)
