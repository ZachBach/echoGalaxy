# BACKLOG coverage — what is already built

Reconciliation of [BACKLOG.md](BACKLOG.md)'s 485 received tasks against what
the repo actually contains, as of 2026-08-11.

**Why this exists.** Commit `7fdc7e9` ("the sky, written down") landed 3,342
lines of astronomy content whose module headers cite this backlog's phases by
name. Nobody could tell which task IDs that satisfied. Starting at ST-001 would
have redone work that already exists; starting anywhere else was guesswork.
This file removes the guess.

It also discharges the dedupe expectation in
[claudeteam/m365-salvage/RESUME-HANDOFF.md](claudeteam/m365-salvage/RESUME-HANDOFF.md):
*"Tasks that restate shipped facts are noise — check `src/*Data.js` and the
`*_INFO` exports first."*

---

## Status vocabulary

| Status | Meaning |
| --- | --- |
| **DRAFTED** | A catalogue entry in `src/*Data.js` covers this task's subject. Content exists. **Not the same as done** — see the citation gap below. |
| **PARTIAL** | The subject is addressed inside a broader entry but has no entry of its own, or only one facet of the task is covered. |
| **DOSSIER** | Researched in [RESEARCH.md](RESEARCH.md) but not yet in any data module. |
| **OPEN** | Nothing in the repo addresses it. |
| **PROCESS** | Produces a dataset, index, graph, validation or export artifact rather than research prose. A data module cannot satisfy it by existing. |

## Headline

| Status | Tasks | Share |
| --- | ---: | ---: |
| DRAFTED | 200 | 41% |
| PARTIAL | 92 | 19% |
| DOSSIER | 6 | 1% |
| OPEN | 133 | 27% |
| PROCESS | 54 | 11% |
| **Received total** | **485** | |

**Zero tasks meet the backlog's own definition of done.** Every phase requires a
minimum of 3 authoritative sources, a confidence score, and a validation status
per task. Across the 3,342 committed lines there are roughly seven source
references. `DRAFTED` means the prose exists, not that it is verified.

## Source inventory

| Module | Entries | Serves |
| --- | ---: | --- |
| [src/stellarData.js](src/stellarData.js) | 30 | STA (ST-001 → ST-100) |
| [src/starData.js](src/starData.js) | 34 | STB (ST-101 → ST-200) |
| [src/constellationData.js](src/constellationData.js) | 88 | STC (ST-201 → ST-300) |
| [src/skyCultureData.js](src/skyCultureData.js) | 19 | STD (ST-301 → ST-400) |
| [src/factsLadder.js](src/factsLadder.js) | — | the two-rung facts contract |
| [src/blackbody.js](src/blackbody.js) | — | ST-036, ST-462, ST-463 (G2-03 work, cited to Charity's CMF table) |
| [RESEARCH.md](RESEARCH.md) | A1–A14 + Parts B–E | solar activity, space weather, real-sky placement |
| — | **none** | **STE (ST-401 → ST-500)** |

**Nothing imports any of the four data modules.** No component reads them, so
none of this content reaches a user yet.
[scripts/check-astronomy-content.mjs](scripts/check-astronomy-content.mjs)
validates structure — ids, both facts rungs, the exact 88, no placeholders — not
truth.

---

# Phase STA — Stellar Foundations (85 received)

**39 DRAFTED · 29 PARTIAL · 10 OPEN · 7 PROCESS**

### Section A — Astronomy fundamentals (ST-001 → ST-020)
- **DRAFTED (12):** ST-001, ST-002, ST-005, ST-006, ST-007, ST-008, ST-009, ST-010, ST-011, ST-012, ST-015, ST-019
- **PARTIAL (7):** ST-003, ST-004 (gas/dust composition — inside `molecular-clouds`, no entry of their own) · ST-013, ST-014 (radiation/convection zones — inside `energy-transport`) · ST-016, ST-017, ST-018 (photosphere/chromosphere/corona — inside `stellar-atmosphere`)
- **PROCESS (1):** ST-020

### Section B — Stellar measurements (ST-021 → ST-040)
- **DRAFTED (12):** ST-021, ST-023, ST-026, ST-027, ST-029, ST-030, ST-031, ST-033, ST-035, ST-036, ST-037, ST-038
- **PARTIAL (7):** ST-022, ST-024 (solar standards — stated as a header convention, not an entry) · ST-025, ST-028, ST-032, ST-034, ST-039
- **PROCESS (1):** ST-040

### Section C — Stellar classification (ST-041 → ST-060)
- **DRAFTED (9):** ST-042, ST-043, ST-044, ST-045, ST-046, ST-047, ST-048 (the seven `class-*` entries), ST-055, ST-057
- **PARTIAL (3):** ST-041 (MK system — the spectral half only) · ST-049 · ST-053
- **OPEN (5):** ST-050, ST-051, ST-052, ST-054, ST-056 — **the entire luminosity-class axis is missing.** `class-o` … `class-m` cover spectral type; nothing covers I–V, so hypergiants, supergiants, subgiants and subdwarfs have no home. `red-giant` is an evolutionary phase, not a luminosity class.
- **PROCESS (3):** ST-058, ST-059, ST-060

### Section D — H-R diagram (ST-061 → ST-080)
- **DRAFTED (3):** ST-064, ST-067, ST-077
- **PARTIAL (10):** ST-061, ST-065, ST-066, ST-068, ST-070, ST-071, ST-073, ST-074, ST-076, ST-079
- **OPEN (5):** ST-062 (Hertzsprung), ST-063 (Russell) — the two people the diagram is named after have no entry · ST-069, ST-072, ST-075
- **PROCESS (2):** ST-078, ST-080

### Section E — Main sequence (ST-081 → ST-085 of 20)
- **DRAFTED (3):** ST-081, ST-082, ST-083
- **PARTIAL (2):** ST-084, ST-085

> **Evidence about the missing tasks.** `stellarData.js` carries `supernova` and
> `nucleosynthesis` entries that match **no task in the received range**. Both
> belong to high-mass evolution and stellar death — which is exactly where the
> paste cut off ("ST-086 Research high-mass…"). Whoever wrote the module had the
> full list. The missing ST-086 → ST-100 almost certainly covers high-mass
> evolution, supernovae, and remnants, and at least two of them are already
> drafted.

---

# Phase STB — Major Stars & Stellar Systems (100 received)

**49 DRAFTED · 20 PARTIAL · 6 DOSSIER · 5 OPEN · 20 PROCESS**

### Section F — The Sun (ST-101 → ST-120)
One `sol` entry serves twenty tasks.
- **DRAFTED (2):** ST-101, ST-118
- **PARTIAL (8):** ST-104, ST-105, ST-106, ST-107 (via `energy-transport`), ST-108, ST-109, ST-110 (via `stellar-atmosphere`), ST-111 (via `magnetic-fields`)
- **DOSSIER (6):** ST-112, ST-113, ST-114, ST-115, ST-116, ST-117 — [RESEARCH.md](RESEARCH.md) A5/A6 and Part B researched solar activity and space weather; none of it has reached a data module.
- **OPEN (2):** ST-102, ST-103
- **PROCESS (2):** ST-119, ST-120

### Section G — Closest stellar systems (ST-121 → ST-140)
- **DRAFTED (11):** ST-122, ST-123, ST-124, ST-126, ST-127, ST-129, ST-130, ST-131, ST-132, ST-133, ST-136
- **PARTIAL (2):** ST-121 (A and B exist; no system-level entry) · ST-125 (Proxima b sits inside the star entry)
- **OPEN (3):** ST-128 (Lalande 21185), ST-134 (Luyten's Star), ST-135 (Ross 128)
- **PROCESS (4):** ST-137, ST-138, ST-139, ST-140

### Section H — Brightest stars (ST-141 → ST-160)
- **DRAFTED (14):** ST-141, ST-142, ST-143, ST-145, ST-146, ST-147, ST-148, ST-149, ST-150, **ST-151**, ST-152, **ST-153**, ST-154, ST-155
- **PARTIAL (1):** ST-144 (α Cen A and B separately; not the combined −0.27 pair that earns the ranking)
- **PROCESS (5):** ST-156, ST-157, ST-158, ST-159, ST-160

> **Closed 2026-08-11.** ST-151 (Hadar) and ST-153 (Acrux) were the two top-16
> stars the catalogue claimed to cover and did not. Both now carry profiles
> sourced from SIMBAD parallaxes cross-checked against the tabulated ranking,
> with the fetch date recorded inline. `check:content` now fails if a top-16
> ranked star has no profile, so this cannot silently regress.

### Section I — Navigation stars (ST-161 → ST-180)
- **DRAFTED (11):** ST-161, ST-164, ST-165, ST-167, ST-168, ST-169, ST-170, ST-171, ST-172, ST-173, ST-175
- **PARTIAL (4):** ST-162, ST-163, ST-166, ST-174
- **PROCESS (5):** ST-176, ST-177, ST-178, ST-179, ST-180

### Section J — Giants & supergiants (ST-181 → ST-200)
- **DRAFTED (11):** ST-181, ST-182, ST-184, ST-185, ST-186, ST-187, ST-188, ST-189, ST-190, ST-192, ST-193
- **PARTIAL (5):** ST-183, ST-191, ST-194, ST-195, ST-196
- **PROCESS (4):** ST-197, ST-198, ST-199, ST-200

---

# Phase STC — The 88 IAU Constellations (100 received)

**88 DRAFTED · 3 PARTIAL · 3 OPEN · 6 PROCESS** — the best-covered phase.

- **DRAFTED (88):** every `Research <Constellation>` task — ST-201 → ST-224,
  ST-226 → ST-249, ST-251 → ST-274, ST-276 → ST-288, ST-289 → ST-291.
  `check-astronomy-content.mjs` enforces that the list is *exactly* the 88 IAU
  constellations, so this mapping is machine-guaranteed, not eyeballed.
- **PARTIAL (3):** ST-294 (a `brightest` field exists per entry — the index is
  derivable, not built) · ST-295 (same for `notable` DSOs) · ST-299 (the
  validator checks structure, not facts)
- **OPEN (3):** ST-292, ST-293, ST-298
- **PROCESS (6):** ST-225, ST-250, ST-275, ST-296, ST-297, ST-300

> **The sky has no coordinates.** `constellationData.js` entries carry
> `id · english · brightest · notable · factsKids · factsAdvanced` — and nothing
> positional. No RA/dec, no boundary geometry, no seasonal visibility field.
> ST-292 (boundaries), ST-293 (season mapping) and ST-298 (observer guide) are
> therefore genuinely OPEN, and so are the downstream ST-467/ST-468. This is
> also what blocks RESEARCH.md's A10 finding ("the sky is procedural — there are
> no real stars") and its zodiac ask: **you cannot place a constellation in the
> sky from this data.** Acquiring positions is one task that unblocks many.

---

# Phase STD — Cultural Astronomy & Navigation (100 received)

**24 DRAFTED · 35 PARTIAL · 20 OPEN · 21 PROCESS** — 19 entries against 100
tasks. The thinnest coverage of the four content phases.

### Section P — Ancient foundations (ST-301 → ST-320)
- **DRAFTED (4):** ST-301, ST-306, ST-307, ST-310
- **PARTIAL (9):** ST-302, ST-303, ST-304, ST-305, ST-308, ST-309, ST-311, ST-312, ST-314
- **OPEN (3):** ST-313, ST-315, ST-316
- **PROCESS (4):** ST-317, ST-318, ST-319, ST-320

### Section Q — Mesopotamian, Egyptian & Greek (ST-321 → ST-340)
- **DRAFTED (4):** ST-321, ST-326, ST-327, ST-330
- **PARTIAL (6):** ST-324, ST-325, ST-328, ST-333, ST-334, ST-336
- **OPEN (6):** ST-322 (Sumerian), ST-323 (Assyrian), ST-329 (pyramid alignments), ST-331 (Hipparchus), ST-332 (Ptolemy / the *Almagest*), ST-335 (Hellenistic mapping) — **the two figures who built the Western star catalogue have no entry**, while the constellation list they produced is 100% drafted.
- **PROCESS (4):** ST-337, ST-338, ST-339, ST-340

### Section R — Chinese, Indian, Japanese & Korean (ST-341 → ST-360)
- **DRAFTED (4):** ST-341, ST-347, ST-351, ST-353
- **PARTIAL (8):** ST-342, ST-343, ST-344, ST-345, ST-348, ST-352, ST-354, ST-355
- **OPEN (4):** ST-346, ST-349, ST-350, ST-356
- **PROCESS (4):** ST-357, ST-358, ST-359, ST-360

> ST-345 (Chinese supernova records) is worth pulling forward: the app already
> ships a Crab Nebula rung built on SN 1054, and the Song-dynasty "guest star"
> observation is the primary record for it.

### Section S — Indigenous, Polynesian & Arabic (ST-361 → ST-380)
- **DRAFTED (7):** ST-361, ST-362, ST-364, ST-365, ST-368, ST-370, ST-371
- **PARTIAL (6):** ST-363, ST-366, ST-372, ST-373, ST-374, ST-375
- **OPEN (3):** ST-367 (Indigenous North American), ST-369 (Aztec), ST-376
- **PROCESS (4):** ST-377, ST-378, ST-379, ST-380

### Section T — Celestial navigation (ST-381 → ST-400)
- **DRAFTED (5):** ST-381, ST-382, ST-385, ST-387, ST-389
- **PARTIAL (6):** ST-383, ST-384, ST-386, ST-390, ST-391, ST-394
- **OPEN (4):** ST-388, ST-392, ST-393, ST-395
- **PROCESS (5):** ST-396, ST-397, ST-398, ST-399, ST-400

---

# Phase STE — Astronomy Intelligence Platform (100 received)

**5 PARTIAL · 95 OPEN.** Nothing has been built for this phase.

- **PARTIAL (5):** ST-409 ([factsLadder.js](src/factsLadder.js) *is* an
  educational content schema, and a good one — two rungs, one read point) ·
  ST-410 (the same ladder half-serves narration) · ST-462, ST-463
  ([blackbody.js](src/blackbody.js) from G2-03, the one piece of astronomy
  content in this repo with a real citation) · ST-496
  ([check-astronomy-content.mjs](scripts/check-astronomy-content.mjs))
- **OPEN (95):** everything else.

---

# The gap that matters most

Beyond content coverage, none of these tasks are currently *executable* to the
standard the fleet requires.
[RESUME-HANDOFF.md](claudeteam/m365-salvage/RESUME-HANDOFF.md) sets a triage
gate: before a batch is committed, ≥20 sampled tasks are graded, and each needs
**a source, a deliverable, and an acceptance criterion a machine or the lead
could actually check.** Under ~80% pass, the batch bounces.

"ST-201 Research Andromeda." has none of the three. Neither do the other 484.
Judged against that bar this backlog fails as written — not because the topics
are wrong, but because a task without an acceptance criterion cannot be graded,
delegated, or marked done.

Closing that is mechanical, not creative: every task needs three fields added.
The DRAFTED ones can take their deliverable from the entry that already exists
(`starData.js#sirius`), which makes them the cheapest to upgrade and the easiest
to verify.

## Recommended order

1. **Upgrade the 198 DRAFTED tasks to the triage bar** — add source, deliverable
   and acceptance criterion to tasks whose content already exists. Fastest route
   to a backlog that passes the librarian, and it forces the citation pass that
   the DoD demands anyway.
2. **Verify while citing.** Uncited astronomy written from memory is this
   project's documented failure mode — G2-03 found memory wrong on 5 of 9
   Planckian anchors, and [RESEARCH.md](RESEARCH.md) A1 found Titan filed as a
   moon of Jupiter in shipped data. Assume nothing in the 3,342 lines is correct
   until sourced.
3. **Acquire sky coordinates** (ST-292 and its dependants). One acquisition
   unblocks boundaries, seasons, observer guides, the zodiac ask, and A10.
4. **Fill the structural holes** — luminosity classes (ST-050 → ST-056),
   ~~Hadar and Acrux~~ *(done)*, Hipparchus and Ptolemy, Hertzsprung and
   Russell, the three missing nearby stars (Lalande 21185, Luyten's Star,
   Ross 128).
5. **Wire something in.** 3,342 lines currently reach no user.
6. **STE last** — it is a schema layer over content that is not yet trustworthy.
