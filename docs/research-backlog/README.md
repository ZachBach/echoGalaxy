# docs/research-backlog

Provenance for the astronomy content. One JSON of record ([`sources.json`](sources.json)),
this schema note, and a [CHANGELOG](CHANGELOG.md) of batch acceptances and rejections.

Nothing here is imported by the app. It is QA metadata about `src/*Data.js`,
joined to it by entry id — never a copy of it.

---

## Why this directory exists

[BACKLOG.md](../../BACKLOG.md) § "Research standards" requires, per task:
**minimum 3 authoritative sources · source citations · confidence score ·
validation status**.

[BACKLOG-COVERAGE.md](../../BACKLOG-COVERAGE.md) records the result: across
3,342 committed lines of astronomy content there are roughly seven source
references, and **zero of 485 tasks meet that bar**. `DRAFTED` means the prose
exists. `scripts/check-astronomy-content.mjs` checks ids, both facts rungs,
the exact 88, and placeholder text — structure, not truth.

This directory is where truth gets attached.

---

## Part A — the schema decision

### The unit of verification is a claim, not an entry

"Sirius" cannot be verified. **"Sirius V = −1.46 (Johnson)"** can. That single
observation decides the whole shape.

An entry-level `sources: [...]` array is the cheap answer and it fails on its
first real test. Batch STB-H-001 found `starData.js#procyon` carrying
`mag: 0.34` while all three independent photometric lineages give 0.37, 0.38
and 0.40. An entry-level array would have stamped Procyon
`sources: [SIMBAD, BSC5, Hipparcos]` — three Tier-1 citations attached to a
number **none of them supports**. That is `DRAFTED` again, one level of
indirection higher, and now with a green badge on it.

So: **claims carry sources; entries carry claims.**

### Where it lives: a sidecar, not `*Data.js`

Two reasons, both already settled precedent in this repo.

1. `src/starAstrometry.js` is exactly this move: positions that `starData.js`
   cannot hold, joined by echoGalaxy star id, with an `ASTROMETRY_SOURCE`
   block carrying `name · tier · url · citation · queried · frame`, and
   `astrometryFor(id)` as the read point. It even records
   `impliedLy / catalogueLy / disagreesPct` where a source disagrees with the
   catalogue, and refuses to overwrite `starData`. That file is the model.
   The proposal is `sourcesFor(id)` beside `astrometryFor(id)`.
2. Provenance changes on a different clock from prose. Re-checking a
   catalogue bumps `checked:` on sixty claims and touches no educational copy.
   Keeping them in one file guarantees merge conflicts between the
   content-writer and whoever re-runs the fetch.

The two inline citations that exist today — the `// ST-151.` and `// ST-153.`
comments above `hadar` and `acrux` in `starData.js` — are accurate and were
re-verified in this batch. They are also **comments**, which means no
validator can ever assert on them. That is the gap the sidecar closes.

### Facts stay strings

`factsFor()` returns `string[]`. `check-astronomy-content.mjs` section [4]
asserts `typeof s === 'string' && s.trim().length >= 10`. Every future HUD
consumer will render strings. Promoting facts to `{ text, sources }` objects
breaks the ladder contract, the validator, and every consumer, to serve a
shape nothing has asked for — and `BACKLOG-COVERAGE.md` notes that nothing
imports these modules yet, so there is no consumer to ask.

A fact claim therefore addresses its target positionally,
`{ rung, index }`, and guards the address with `textPrefix` — the first 48
characters of the fact as recorded. Reorder or reword the array and the gate
fails loudly instead of silently re-pointing the citation at a different
sentence.

### Proposed shape

`src/starSources.js` (pure data, no rendering imports, node-smokeable):

```js
/** sourceId -> descriptor. Interned once, cited many times. */
export const SOURCES = {
  'simbad-flux': {
    tier: 1,                                    // BACKLOG "Approved source priorities"
    name: 'SIMBAD Astronomical Database — CDS, Strasbourg',
    url: 'https://simbad.cds.unistra.fr/simbad/sim-tap/sync',
    locator: "TAP/ADQL: SELECT i.id,fl.filter,fl.flux,fl.bibcode FROM basic b "
           + "JOIN ident i ON i.oidref=b.oid JOIN flux fl ON fl.oidref=b.oid "
           + "WHERE fl.filter='V'",
    provenance: 'V magnitudes carry bibcode 2002yCat.2237....0D '
              + '= Ducati (2002), VizieR II/237',
    citation: 'Wenger et al. 2000, A&AS 143, 9',
    readDepth: 'table',                         // full | abstract | table | search-snippet
    checked: '2026-08-14',
  },
  // ...
}

/** One record per verifiable claim. */
export const CLAIMS = [
  {
    entry: 'procyon',                  // joins src/*Data.js by id
    field: 'mag',                      // ...or fact: { rung:'advanced', index:0, textPrefix:'…' }
    repoValue: 0.34,                   // what src/ says today
    citedValue: 0.38,                  // what the sources support
    unit: 'mag (Johnson V)',
    tol: 0.02,                         // same tolerance section [8] already uses
    sources: ['simbad-flux', 'bsc5-vizier', 'hipparcos-vizier'],
    measurements: [                    // the value each source actually gives
      { source: 'simbad-flux',      value: 0.37 },
      { source: 'bsc5-vizier',      value: 0.38 },
      { source: 'hipparcos-vizier', value: 0.40 },
    ],
    agreement: 'spread',               // unanimous | spread | contested
    confidence: 0.9,
    validation: 'FAIL',                // BACKLOG DoD field
    tasks: ['ST-148', 'ST-156'],
    origin: 'generated',               // generated | hand
  },
]
```

`readDepth` is deliberate. `search-snippet` means a search result was seen and
the page was not opened; it is not a citation, it is a lead. Nothing in a
batch may reach `validation: 'PASS'` on `search-snippet` alone.

### Hybrid authoring

Catalogue fields (`mag`, `distance`, `spectral`, `rank`, RA/Dec, HR/HIP/HD)
should be **generated** by `scripts/fetch-star-sources.mjs`, built the way
`scripts/fetch-star-astrometry.mjs` is: derived target list, one TAP query,
`checked:` stamped from the run rather than typed by hand. Re-verification
then costs one command, and the date is honest by construction.

Prose claims are **hand**-authored, because "the Great Dimming was caused by a
dust cloud" has no catalogue column. Those are the ones the staleness gate
really polices.

---

## What `check:content` would have to assert

A new section [9], ~120 lines, no new dependency, same node-smoked style as
the existing eight.

| # | Assertion | Why |
| --- | --- | --- |
| 9.1 | every `sources[]` id resolves in `SOURCES` | referential integrity |
| 9.2 | every descriptor has `tier ∈ {1,2,3}`, non-empty `url`, non-empty `locator`, ISO `checked` | **"NASA" is not a locator.** The page, table, query or row is |
| 9.3 | `checked` warns past 365 days, fails past 730 | the only assertion that makes a date load-bearing; distances get re-measured |
| 9.4 | `claim.entry` resolves in the `globalIds` map section [3] already builds | no orphan claims |
| 9.5 | for a `field` claim: field exists on the entry and `|entry[field] − citedValue| <= tol` | **this is the whole point.** Section [8] compares the repo to itself; 9.5 compares it to a cited external value |
| 9.6 | for a `fact` claim: `factsFor(entry, rung)[index]` exists and starts with `textPrefix` | reordering a facts array can no longer silently re-point a citation |
| 9.7 | `sources.length >= 3` **and** at least one has `tier === 1` | the BACKLOG bar, finally executable |
| 9.8 | `validation ∈ {PASS,FAIL}`, `confidence ∈ [0,1]`; a `FAIL` fails the build unless the entry is in `KNOWN_DEFECTS` with a task id | a contradiction can be recorded without being tolerated |
| 9.9 | cited-claim count `>= MIN_CITED_CLAIMS`, a floor that only rises | stops the citation pass stalling at one batch |
| 9.10 | ranking `rank` order is monotone in cited `mag`; ties carry a `note` | `BRIGHTNESS_RANKING` has an unremarked Deneb/Mimosa tie at 1.25 |

9.5 is the assertion that changes the repo's category. Everything else is
hygiene around it.

### Alternatives weighed

| Option | Verdict |
| --- | --- |
| `entry.sources = [...]` | Rejected — certifies the entry, not the number. Would have passed Procyon's wrong magnitude with three Tier-1 citations attached. |
| facts as `{text, sources}` objects | Rejected — breaks `factsFor`'s `string[]` contract and validator section [4], for a shape no consumer has requested. |
| fully generated sidecar | Right for catalogue fields, impossible for prose. Adopted as the **hybrid** above. |
| inline `//` comments (status quo) | Rejected — invisible to every validator. This is how the repo got here. |

---

## Batch intake bar

Before a batch enters this directory, grade a random sample of **at least 20**
tasks: each needs a source, a deliverable, and an acceptance criterion a
machine or the lead could actually check. Report the sample's pass rate.
**Under ~80% the batch bounces with notes, not into the repo.** Record the
grade in [CHANGELOG.md](CHANGELOG.md) either way.

Dedupe before grading. A task restating a fact already in `src/*Data.js` is
noise — flag it rather than research it.

## Source priorities (from BACKLOG.md)

- **Tier 1** — NASA · ESA · JPL · NOIRLab · ESO · SIMBAD · CDS · IAU
- **Tier 2** — Britannica · Sky & Telescope · Astronomy Magazine · Royal Astronomical Society
- **Tier 3** — university astronomy departments · peer-reviewed journals · textbooks

Aggregators are not on the list. Where a repo value traces to one, that is
recorded as a **defect**, not a citation — see `alpha-centauri-a` in
`sources.json`.
