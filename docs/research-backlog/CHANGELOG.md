# CHANGELOG — batch acceptances and rejections

Newest first. Every batch that enters or bounces gets a line here, with its
grade. See [README.md](README.md) for the intake bar.

---

## 2026-08-14 — ACCEPTED: `STB-H-001`, Section H (brightest stars), ST-141 → ST-156

**Directory created.** First entry.

### Grade

61 claim records were written: **47 catalogue-field** claims (`mag`,
`distance`, `spectral`) and **14 prose** claims.

| Population graded | Sampled | ≥1 real source | ≥3 **independent** sources | Machine-checkable criterion | Clears the bar |
| --- | ---: | ---: | ---: | ---: | ---: |
| Outgoing: catalogue-field claims | 47 | 47 | 47 | 47 | **100%** |
| Outgoing: prose claims | 14 | 11 | **0** | 12 | **0%** |
| Incoming: `BACKLOG.md` ST-141 → ST-156 **as written** | 16 | 0 | 0 | 0 | **0%** |

Prose verification outcome: **6 PASS · 3 FAIL · 1 FLAG · 2 PROVISIONAL ·
2 NOT_CHECKED**, plus 16 further prose claims listed as `notChecked` without
individual records.

All three rows matter, and the middle one most.

The **incoming** row is why `BACKLOG-COVERAGE.md` says the backlog fails as
written. "ST-141 Research Sirius." names a subject and stops. It cannot be
graded, delegated, or marked done, and no amount of prose satisfies it because
there is nothing to satisfy.

The **prose** row is the honest bad news, and it is why the schema in README
attaches sources to claims rather than to entries. The same 14 profiles that
score 100% on their catalogue fields score **zero** on the 3-source bar for
their prose — and three of those prose claims are outright wrong, including one
with the physics inverted. An entry-level `sources: []` array would have
averaged those two populations into one green badge on every star.

A catalogue field is cheap to verify because three institutions independently
publish it. A sentence like "the Great Dimming was a dust cloud" has no
catalogue column, so each one costs a real read. That asymmetry is structural,
not a shortfall of this batch, and the schema has to survive it.

Accepted because the catalogue-field claims clear the bar comfortably and every
prose claim is individually labelled rather than averaged. **Nothing in this
batch is marked verified that was not fetched and read**; `readDepth` records
how deeply, and the two `search-snippet` sources are explicitly held below
`PASS`.

### Why Section H

Not convenience — leverage. Section H is the only content in the repo already
policed by a machine cross-check: `check-astronomy-content.mjs` section [8]
compares profile `mag` against `BRIGHTNESS_RANKING` within 0.02, profile
`distance` against `NEAREST_RANKING` within 0.05, `mag` against `magRange`, and
hard-fails if a top-16 ranked star has no profile.

That gate compares the repo **to itself**. Supply the external anchor it lacks
and every one of its comparisons becomes a truth check instead of a consistency
check. Two of the defects below prove the need: Alpha Centauri's distance and
Procyon's magnitude are each wrong in *both* places the gate compares, so it
passes green at a difference of exactly 0.0.

One citation pass also discharges 16 task IDs, because the ranking table and
the profiles state the same numbers twice by design.

### Sources used

Three genuinely independent photometric lineages, two astrometric reductions,
one identity catalogue, six peer-reviewed papers. All Tier 1 or Tier 3 under
`BACKLOG.md` § "Approved source priorities"; every one carries a re-runnable
locator (the exact ADQL, the exact table, the exact arXiv id).

**Independence warning recorded in `sources.json`:** the IAU-CSN `mag` column
reproduces the Hipparcos `Vmag` row for row across all 21 stars checked.
Counting both would double-count one lineage. It is authoritative for names and
HR/HIP/HD cross-identification, not for photometry.

### Result

- **22 entries** covered (16 profiles + 6 ranking-only rows), **61 claims**.
- **22 of 22 clear the 3-source bar** on catalogue fields — magnitude,
  distance, spectral type, rank, cross-identification.
- **0 of 14** itemised prose claims clear it. Stated plainly rather than
  averaged away.
- **11 contradictions** found: 4 HIGH, 4 MEDIUM, 2 LOW, 1 cosmetic.
- **14 repo claims verified correct**, including the two existing inline
  citations (ST-151 Hadar, ST-153 Acrux), which re-verify exactly.
- **16 prose claims explicitly not checked** and listed as such.

`src/` was not edited. The patch is specified in
`sources.json` → `batches[0].proposedPatch` for the lead to apply.

### Follow-on work this created

1. `C-006` is a Section G defect (`NEAREST_RANKING` is titled "systems" but
   ranks stars, and omits the two nearest brown-dwarf systems). Found while
   verifying a Section H claim. Needs its own task — it is out of this batch's
   scope and should not be smuggled in.
2. `C-003` (Vega's rotation) has one source. It needs two more before the fix
   ships, or the fix violates the same bar it is correcting.
3. `C-010` asks for a `magRange` on Spica. The bounds are **not** sourced yet.
   Do not invent them.
4. The 16 `notChecked` prose claims are the natural STB-H-002.
