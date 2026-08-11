# echoGalaxy — Research Backlog

## The Stars & Constellations Initiative

Handoff document. Everything below is **open work**, written to be picked up by
an assistant with no prior context on this repo.

Shipped work is not tracked here — phase logs for completed engineering
(G0–G3, GH, PC, SR, MN, MB, PS, CB, SN) live in [TODOS.md](TODOS.md), and the
human-only launch/store sequence lives in [ZACHTODOS.md](ZACHTODOS.md).

---

# Introduction

The night sky is humanity's oldest library.

Long before written language, cities, telescopes, or spacecraft, people looked
upward to navigate oceans, mark seasons, tell stories, predict harvests,
measure time, and understand their place in the universe.

Modern astronomy transformed those points of light into something far greater.
We now understand that stars are nuclear furnaces, that constellations are
projections across immense cosmic distances, and that galaxies, nebulae, black
holes, and planetary systems are all part of a vast interconnected universe
still being explored.

echoGalaxy exists to make that universe understandable.

## Why this research program exists

The purpose of this document is to build the most comprehensive astronomy
knowledge foundation ever integrated into echoGalaxy.

This is not a simple content project. This is the construction of a scientific,
educational, historical, cultural, and navigational understanding of the night
sky.

The completed research program will allow echoGalaxy to:

- Explain what stars are.
- Explain how stars are born and die.
- Explore individual stellar systems.
- Teach stellar evolution.
- Map and explain all 88 official constellations.
- Connect stars to their mythology and history.
- Explore sky traditions from cultures around the world.
- Teach celestial navigation.
- Build educational journeys through the cosmos.
- Power future AI-guided astronomy experiences.
- Support future observation and visualization systems.
- Serve as a foundation for deeper galaxy-scale exploration.

## Guiding philosophy

Every object in the sky tells multiple stories.

A star is simultaneously a physical object, a historical observation, a
navigation marker, a cultural symbol, a scientific discovery, and a source of
future exploration.

echoGalaxy must preserve all of these perspectives.

Scientific accuracy is not enough. Educational usefulness is not enough.
Historical significance is not enough. The goal is to connect all dimensions
into a single coherent understanding of the universe.

## Scope

This initiative is divided into five major phases.

| Phase | Name | Range | Topics | Milestone |
| --- | --- | --- | --- | --- |
| **STA** | Stellar Foundations | ST-001 → ST-100 | Stellar formation · structure · measurements · spectral classification · H-R diagrams · main-sequence evolution | *"echoGalaxy understands what a star is."* |
| **STB** | Major Stars & Stellar Systems | ST-101 → ST-200 | The Sun · nearby stars · brightest stars · navigation stars · giant stars · stellar extremes | *"echoGalaxy knows the stars by name."* |
| **STC** | The 88 IAU Constellations | ST-201 → ST-300 | All official constellations · brightest-star associations · deep-sky objects · observation guidance · historical context | *"echoGalaxy understands the map of the night sky."* |
| **STD** | Cultural Astronomy & Navigation | ST-301 → ST-400 | Ancient · Greek · Babylonian · Egyptian · Chinese · Indian · Indigenous · Polynesian · Arabic astronomy · celestial navigation | *"echoGalaxy understands humanity's relationship with the stars."* |
| **STE** | Astronomy Intelligence Platform | ST-401 → ST-500 | Knowledge graphs · educational systems · narration systems · discovery engines · observation systems · AI-ready datasets | *"echoGalaxy understands the stars, the constellations, and humanity's place beneath them."* |

## Program research standards

Every task completed within this program must:

- Be backed by reputable sources.
- Distinguish facts from interpretation.
- Maintain scientific accuracy.
- Preserve historical context.
- Respect cultural origins.
- Generate educational value.
- Contribute to the echoGalaxy knowledge graph.
- Support future narration systems.
- Support future visualization systems.
- Produce reusable datasets.

**Scientific claims require evidence. Historical claims require sources.
Cultural claims require context. Educational claims require clarity.**

Per-phase standards (below) add to these; they never relax them.

## Completion vision

When all 500 tasks are complete, echoGalaxy will possess a unified astronomy
knowledge ecosystem capable of connecting:

> Star → Constellation → Mythology → Culture → Navigation → History → Science →
> Education → Exploration

The result will not merely be a database of astronomical facts. It will be a
living map of humanity's relationship with the universe.

*Welcome to the Stars & Constellations Initiative. The journey begins with a
single star.*

---

## For the assistant picking this up

- **Task IDs are stable.** `ST-001` etc. never get renumbered, reordered, or
  reused. Cite the ID in every question, note, and deliverable.
- **One task = one unit of work.** A task is done only when it satisfies the
  Research Output Template for its phase (below) — a paragraph of prose is not
  a completed task.
- **Sections are buckets.** Section A/B/C/… map 1:1 onto Planner buckets or
  To Do lists; keep the section name as the bucket name.
- **Fields to carry into a tracker:** ID · title · phase · section (bucket) ·
  status · sources-cited · validation PASS/FAIL.
- **Nothing here is blocked on code.** Phase STA is research; no echoGalaxy
  source file needs to change to complete it.
- **Research once, cite many.** Several subjects carry more than one task ID
  because they are approached from different angles — Sirius is ST-129/130/131
  (system profile) and ST-141 (brightness ranking); Betelgeuse is ST-150,
  ST-181, ST-182, ST-183; Vega is ST-145, ST-164, ST-170; Antares ST-155 and
  ST-186; Rigel ST-147 and ST-184; Alpha Centauri ST-121 and ST-144. Write the
  underlying profile **once**, then have the sibling tasks cite it and add only
  their own angle. Do not research the same star three times.

## Importing this into a tracker

[backlog-planner.csv](backlog-planner.csv) is the machine-readable twin of this
file — one row per task, columns `ID · Task Name · Bucket Name · Phase ·
Progress · Priority · Notes`, ready for Planner's Excel/CSV import or for an
assistant to turn into tasks without re-parsing prose. Buckets are
`<phase> · <section>`, 25 of them.

**This markdown is the source of truth; the CSV is generated.** After editing
tasks here, regenerate rather than hand-editing the CSV:

```
npm run backlog:csv
```

It fails loudly on duplicate or out-of-order IDs and reports any gap in the
ST-001 → ST-500 range.

## What is already built

**Do not start at ST-001.** Commit `7fdc7e9` landed 3,342 lines of astronomy
content against phases STA–STD. [BACKLOG-COVERAGE.md](BACKLOG-COVERAGE.md) maps
every one of the 485 received tasks to what exists: **198 drafted · 92 partial ·
6 in the research dossier · 135 open · 54 process**.

Read it before picking up any task. Two cautions it establishes:

- `DRAFTED` means prose exists, **not** that the task is done. Across those
  3,342 lines there are roughly seven source references, against a definition of
  done demanding three per task.
- Nothing in the repo imports that content yet, and the existing validator
  checks structure, not truth.

## Progress

| Phase | Name | Range | Received | Open |
| --- | --- | --- | --- | --- |
| STA | Stellar Foundations | ST-001 → ST-100 | 85 of 100 | 85 |
| STB | Major Stars & Stellar Systems | ST-101 → ST-200 | 100 of 100 | 100 |
| STC | The 88 IAU Constellations | ST-201 → ST-300 | 100 of 100 | 100 |
| STD | Cultural Astronomy & Navigation | ST-301 → ST-400 | 100 of 100 | 100 |
| STE | Astronomy Intelligence Platform | ST-401 → ST-500 | 100 of 100 | 100 |
| **Total** | **Stars & Constellations Program** | **ST-001 → ST-500** | **485 of 500** | **485** |

*Received* = tasks transcribed into this file so far. Batches are being added
incrementally; gaps are marked inline.

---

# Phase STA — Stellar Foundations

**Status:** ready for research execution.

## Purpose

This phase establishes the scientific foundation for all future star,
constellation, catalog, navigation, education, visualization, narration,
knowledge-graph, and AI systems inside echoGalaxy.

No star catalog, constellation system, or educational experience should be
implemented before this foundation is completed and validated.

## Mission objectives

Build a comprehensive stellar knowledge base covering:

1. Stellar formation
2. Stellar structure
3. Stellar physics
4. Stellar measurements
5. Stellar classification
6. H-R diagram theory
7. Main-sequence star evolution

The resulting datasets become the backbone for all future phases.

## Research standards

Every completed task must include:

- Minimum 3 authoritative sources
- Research notes
- Educational summary
- Technical summary
- Knowledge graph entities
- Knowledge graph relationships
- Source citations
- Confidence score
- Validation status

## Approved source priorities

**Tier 1 (preferred)** — NASA · ESA · JPL · NOIRLab · ESO · SIMBAD · CDS · IAU

**Tier 2** — Britannica · Sky & Telescope · Astronomy Magazine ·
Royal Astronomical Society

**Tier 3** — University astronomy departments · peer-reviewed journals ·
published astronomy textbooks

## Dataset requirements

Each task should contribute to one or more:

- `stellar_foundations_dataset_v1`
- `stellar_education_dataset_v1`
- `stellar_knowledge_graph_v1`
- `stellar_narration_dataset_v1`

## Research output template

For every task generate:

```
## Task ID
ST-XXX

## Topic
(topic name)

## Scientific Summary
(technical research)

## Educational Summary
(child-friendly explanation)

## Key Facts
- fact
- fact
- fact

## Knowledge Graph Nodes
- node
- node
- node

## Relationships
nodeA -> relation -> nodeB

## Sources
- source
- source
- source

## Validation
PASS / FAIL
```

---

## Section A — Astronomy fundamentals

- [ ] ST-001 Research the modern definition of a star.
- [ ] ST-002 Document how stars form from molecular clouds.
- [ ] ST-003 Research interstellar gas composition.
- [ ] ST-004 Research interstellar dust composition.
- [ ] ST-005 Document giant molecular clouds.
- [ ] ST-006 Research gravitational collapse mechanisms.
- [ ] ST-007 Research protostar formation stages.
- [ ] ST-008 Document accretion disks around protostars.
- [ ] ST-009 Research stellar ignition thresholds.
- [ ] ST-010 Document hydrogen fusion fundamentals.
- [ ] ST-011 Research hydrostatic equilibrium.
- [ ] ST-012 Document stellar energy transport mechanisms.
- [ ] ST-013 Research radiation zones.
- [ ] ST-014 Research convection zones.
- [ ] ST-015 Document stellar atmospheres.
- [ ] ST-016 Research photospheres.
- [ ] ST-017 Research chromospheres.
- [ ] ST-018 Research stellar coronae.
- [ ] ST-019 Document stellar magnetic fields.
- [ ] ST-020 Produce Stellar Foundations Summary v1.

## Section B — Stellar measurements

- [ ] ST-021 Research stellar mass measurements.
- [ ] ST-022 Document solar mass standards.
- [ ] ST-023 Research stellar radius measurements.
- [ ] ST-024 Document solar radius standards.
- [ ] ST-025 Research luminosity calculations.
- [ ] ST-026 Document absolute magnitude.
- [ ] ST-027 Document apparent magnitude.
- [ ] ST-028 Research bolometric magnitude.
- [ ] ST-029 Document stellar brightness scales.
- [ ] ST-030 Research distance measurement techniques.
- [ ] ST-031 Document parallax methods.
- [ ] ST-032 Research spectroscopic parallax.
- [ ] ST-033 Document standard candles.
- [ ] ST-034 Research Cepheid distance relationships.
- [ ] ST-035 Document temperature measurements.
- [ ] ST-036 Research blackbody radiation.
- [ ] ST-037 Document color-temperature relationships.
- [ ] ST-038 Research stellar metallicity measurements.
- [ ] ST-039 Document stellar age estimation methods.
- [ ] ST-040 Produce Stellar Measurements Dataset v1.

## Section C — Stellar classification

- [ ] ST-041 Research the Morgan-Keenan classification system.
- [ ] ST-042 Document spectral class O.
- [ ] ST-043 Document spectral class B.
- [ ] ST-044 Document spectral class A.
- [ ] ST-045 Document spectral class F.
- [ ] ST-046 Document spectral class G.
- [ ] ST-047 Document spectral class K.
- [ ] ST-048 Document spectral class M.
- [ ] ST-049 Research spectral subclasses.
- [ ] ST-050 Research luminosity classes.
- [ ] ST-051 Document hypergiants.
- [ ] ST-052 Document supergiants.
- [ ] ST-053 Document giants.
- [ ] ST-054 Document subgiants.
- [ ] ST-055 Document main-sequence stars.
- [ ] ST-056 Document subdwarfs.
- [ ] ST-057 Document white dwarfs.
- [ ] ST-058 Create stellar classification comparison matrix.
- [ ] ST-059 Build classification knowledge graph relationships.
- [ ] ST-060 Produce Spectral Classification Reference v1.

## Section D — H-R diagram research

- [ ] ST-061 Research the history of the Hertzsprung-Russell Diagram.
- [ ] ST-062 Research Ejnar Hertzsprung.
- [ ] ST-063 Research Henry Norris Russell.
- [ ] ST-064 Document diagram axes and scales.
- [ ] ST-065 Research luminosity trends.
- [ ] ST-066 Research temperature trends.
- [ ] ST-067 Document main sequence structure.
- [ ] ST-068 Research giant branch populations.
- [ ] ST-069 Document supergiant regions.
- [ ] ST-070 Document white dwarf regions.
- [ ] ST-071 Research stellar evolution paths on the H-R Diagram.
- [ ] ST-072 Research birth-line relationships.
- [ ] ST-073 Research pre-main-sequence tracks.
- [ ] ST-074 Research red giant branch movement.
- [ ] ST-075 Research asymptotic giant branch movement.
- [ ] ST-076 Research post-main-sequence pathways.
- [ ] ST-077 Build educational H-R explanations.
- [ ] ST-078 Build H-R knowledge graph relationships.
- [ ] ST-079 Create classroom-level H-R summary.
- [ ] ST-080 Produce H-R Dataset v1.

## Section E — Main sequence stars

- [ ] ST-081 Research the definition of a main-sequence star.
- [ ] ST-082 Document hydrogen-burning equilibrium.
- [ ] ST-083 Research stellar lifetimes across masses.
- [ ] ST-084 Research low-mass stellar evolution.
- [ ] ST-085 Research medium-mass stellar evolution.

> **⚠ GAP — ST-086 → ST-100 not yet received.** The source paste ended
> mid-line at "ST-086 Research high-mass". Section E is incomplete and the
> phase total (100) is not yet reconciled.
>
> The truncation also took everything that follows the task list: STA is the
> only phase here **without** a completion gate, a deliverables list, or a
> success-criteria block. Its milestone below is recovered from the
> Introduction's scope table, not from the phase document itself.

## Phase STA milestone

**"echoGalaxy understands what a star is."**

---

# Phase STB — Major Stars & Stellar Systems

**Status:** ready for research execution.

## Purpose

This phase expands the stellar foundation into real astronomical objects. The
objective is to build citation-backed profiles, educational content, knowledge
graph entities, and visualization metadata for the most important stars and
stellar systems visible from Earth.

The resulting dataset will power:

- Star exploration
- Guided tours
- Educational narration
- Constellation linking
- Sky map visualizations
- Stellar comparisons
- Knowledge graph relationships

The Phase STA research standards, source priorities, and output template apply
unchanged to every task below.

## Section F — The Sun (ST-101 → ST-120)

- [ ] ST-101 Research the Sun as a G-type main-sequence star.
- [ ] ST-102 Document solar formation history.
- [ ] ST-103 Research solar age estimates.
- [ ] ST-104 Document solar structure layers.
- [ ] ST-105 Research the solar core.
- [ ] ST-106 Document radiative zone properties.
- [ ] ST-107 Document convective zone properties.
- [ ] ST-108 Research photosphere characteristics.
- [ ] ST-109 Research chromosphere characteristics.
- [ ] ST-110 Research corona characteristics.
- [ ] ST-111 Document solar magnetic activity.
- [ ] ST-112 Research sunspot cycles.
- [ ] ST-113 Research solar prominences.
- [ ] ST-114 Research solar flares.
- [ ] ST-115 Research coronal mass ejections.
- [ ] ST-116 Document solar wind physics.
- [ ] ST-117 Research heliosphere structure.
- [ ] ST-118 Create educational Sun profile.
- [ ] ST-119 Build Sun knowledge graph entity.
- [ ] ST-120 Produce Solar Reference Package v1.

## Section G — Closest stellar systems (ST-121 → ST-140)

- [ ] ST-121 Research the Alpha Centauri system.
- [ ] ST-122 Document Alpha Centauri A.
- [ ] ST-123 Document Alpha Centauri B.
- [ ] ST-124 Research Proxima Centauri.
- [ ] ST-125 Document Proxima Centauri b.
- [ ] ST-126 Research Barnard's Star.
- [ ] ST-127 Document Wolf 359.
- [ ] ST-128 Research Lalande 21185.
- [ ] ST-129 Document Sirius system overview.
- [ ] ST-130 Research Sirius A.
- [ ] ST-131 Research Sirius B.
- [ ] ST-132 Document Epsilon Eridani.
- [ ] ST-133 Research Tau Ceti.
- [ ] ST-134 Document Luyten's Star.
- [ ] ST-135 Research Ross 128.
- [ ] ST-136 Document Teegarden's Star.
- [ ] ST-137 Create Near Stars comparison matrix.
- [ ] ST-138 Build stellar neighborhood relationships.
- [ ] ST-139 Create educational nearby-stars narrative.
- [ ] ST-140 Produce Nearby Stellar Systems Dataset v1.

## Section H — Brightest stars in Earth's sky (ST-141 → ST-160)

- [ ] ST-141 Research Sirius.
- [ ] ST-142 Research Canopus.
- [ ] ST-143 Research Arcturus.
- [ ] ST-144 Research Alpha Centauri.
- [ ] ST-145 Research Vega.
- [ ] ST-146 Research Capella.
- [ ] ST-147 Research Rigel.
- [ ] ST-148 Research Procyon.
- [ ] ST-149 Research Achernar.
- [ ] ST-150 Research Betelgeuse.
- [ ] ST-151 Research Hadar.
- [ ] ST-152 Research Altair.
- [ ] ST-153 Research Acrux.
- [ ] ST-154 Research Aldebaran.
- [ ] ST-155 Research Antares.
- [ ] ST-156 Create brightest stars ranking dataset.
- [ ] ST-157 Build naked-eye observation guide.
- [ ] ST-158 Map visible-sky brightness categories.
- [ ] ST-159 Create educational brightest-stars timeline.
- [ ] ST-160 Produce Bright Stars Reference Package v1.

## Section I — Navigation stars (ST-161 → ST-180)

- [ ] ST-161 Research Polaris.
- [ ] ST-162 Document Polaris history.
- [ ] ST-163 Research Polaris system structure.
- [ ] ST-164 Research Vega as a former pole star.
- [ ] ST-165 Research Thuban as a former pole star.
- [ ] ST-166 Document celestial pole mechanics.
- [ ] ST-167 Research Earth's axial precession.
- [ ] ST-168 Research Altair navigation history.
- [ ] ST-169 Research Deneb navigation history.
- [ ] ST-170 Research Vega navigation history.
- [ ] ST-171 Research Fomalhaut.
- [ ] ST-172 Research Regulus.
- [ ] ST-173 Research Spica.
- [ ] ST-174 Research navigation stars used in maritime astronomy.
- [ ] ST-175 Document celestial navigation basics.
- [ ] ST-176 Build navigation-star education content.
- [ ] ST-177 Build navigation-star knowledge graph.
- [ ] ST-178 Create pole-star chronology dataset.
- [ ] ST-179 Create navigation narrative package.
- [ ] ST-180 Produce Celestial Navigation Dataset v1.

## Section J — Famous stellar giants & supergiants (ST-181 → ST-200)

- [ ] ST-181 Research Betelgeuse.
- [ ] ST-182 Document Betelgeuse variability.
- [ ] ST-183 Research Betelgeuse future supernova potential.
- [ ] ST-184 Research Rigel.
- [ ] ST-185 Research Deneb.
- [ ] ST-186 Research Antares.
- [ ] ST-187 Research Mu Cephei.
- [ ] ST-188 Research VY Canis Majoris.
- [ ] ST-189 Research UY Scuti.
- [ ] ST-190 Research Eta Carinae.
- [ ] ST-191 Document Eta Carinae eruptions.
- [ ] ST-192 Research P Cygni.
- [ ] ST-193 Research R136a1.
- [ ] ST-194 Document known stellar size extremes.
- [ ] ST-195 Research known stellar mass extremes.
- [ ] ST-196 Research known stellar luminosity extremes.
- [ ] ST-197 Create giant-star comparison matrix.
- [ ] ST-198 Build stellar-extremes knowledge graph.
- [ ] ST-199 Create giant-star educational narrative.
- [ ] ST-200 Produce Stellar Extremes Reference Package v1.

## Phase STB completion gate

Before ST-101 through ST-200 may be marked complete:

- [ ] All 100 tasks completed.
- [ ] All star profiles citation-backed.
- [ ] Educational content generated.
- [ ] Narration content generated.
- [ ] Knowledge graph nodes created.
- [ ] Stellar system relationships mapped.
- [ ] Navigation datasets generated.
- [ ] Bright-star datasets validated.
- [ ] Stellar extremes datasets validated.
- [ ] All exports completed.

## Phase STB deliverables

- `solar_reference_dataset_v1`
- `nearby_stars_dataset_v1`
- `bright_stars_dataset_v1`
- `navigation_stars_dataset_v1`
- `stellar_extremes_dataset_v1`
- `stellar_profiles_dataset_v1`
- `stellar_narration_dataset_v1`
- `stellar_knowledge_graph_v2`

## Phase STB success criteria

Upon completion of ST-101 through ST-200, echoGalaxy possesses a complete
library of major stars, nearby stellar systems, navigation stars, bright stars,
and stellar extremes suitable for educational exploration, constellation
linking, AI narration, and future sky-map expansion.

**Milestone: "echoGalaxy knows the stars by name."**

---

# Phase STC — The 88 IAU Constellations

**Status:** ready for research execution.

## Purpose

This phase creates the constellation knowledge layer of echoGalaxy.

Every official IAU constellation will receive:

- Scientific profile
- Historical profile
- Mythological profile
- Brightest-star mapping
- Major deep-sky objects
- Observation guidance
- Knowledge graph relationships
- Educational narration

This phase serves as the bridge between individual stars and the larger
structure of the night sky.

## Constellation research template

For every constellation create:

```
## Identity
- Official IAU name
- Genitive form
- Abbreviation
- Hemisphere
- Seasonal visibility

## Astronomy
- Brightest star
- Major stars
- Deep-sky objects
- Nearby stellar associations

## History
- Original source culture
- Naming history
- Historical references

## Education
- Child-friendly explanation
- Observer guide
- Narrative script

## Knowledge Graph
- Linked stars
- Linked objects
- Linked myths
```

> **Section titles corrected.** Sections K–N originally read "Northern
> Constellations I–IV", but the 88 are listed in a single alphabetical run and
> the sections are alphabetical batches, not hemisphere groupings — Apus, Crux,
> Musca, Octans, Tucana and Volans are all deep-southern and all sat under a
> "Northern" heading. Retitled to "Alphabetical Batch I–IV". Hemisphere is
> captured per-constellation in the research template's Identity block, which
> is where it belongs.

## Section K — Alphabetical Batch I (ST-201 → ST-225)

- [ ] ST-201 Research Andromeda.
- [ ] ST-202 Research Antlia.
- [ ] ST-203 Research Apus.
- [ ] ST-204 Research Aquarius.
- [ ] ST-205 Research Aquila.
- [ ] ST-206 Research Ara.
- [ ] ST-207 Research Aries.
- [ ] ST-208 Research Auriga.
- [ ] ST-209 Research Boötes.
- [ ] ST-210 Research Caelum.
- [ ] ST-211 Research Camelopardalis.
- [ ] ST-212 Research Cancer.
- [ ] ST-213 Research Canes Venatici.
- [ ] ST-214 Research Canis Major.
- [ ] ST-215 Research Canis Minor.
- [ ] ST-216 Research Capricornus.
- [ ] ST-217 Research Carina.
- [ ] ST-218 Research Cassiopeia.
- [ ] ST-219 Research Centaurus.
- [ ] ST-220 Research Cepheus.
- [ ] ST-221 Research Cetus.
- [ ] ST-222 Research Chamaeleon.
- [ ] ST-223 Research Circinus.
- [ ] ST-224 Research Columba.
- [ ] ST-225 Produce Constellation Dataset Batch 1.

## Section L — Alphabetical Batch II (ST-226 → ST-250)

- [ ] ST-226 Research Coma Berenices.
- [ ] ST-227 Research Corona Australis.
- [ ] ST-228 Research Corona Borealis.
- [ ] ST-229 Research Corvus.
- [ ] ST-230 Research Crater.
- [ ] ST-231 Research Crux.
- [ ] ST-232 Research Cygnus.
- [ ] ST-233 Research Delphinus.
- [ ] ST-234 Research Dorado.
- [ ] ST-235 Research Draco.
- [ ] ST-236 Research Equuleus.
- [ ] ST-237 Research Eridanus.
- [ ] ST-238 Research Fornax.
- [ ] ST-239 Research Gemini.
- [ ] ST-240 Research Grus.
- [ ] ST-241 Research Hercules.
- [ ] ST-242 Research Horologium.
- [ ] ST-243 Research Hydra.
- [ ] ST-244 Research Hydrus.
- [ ] ST-245 Research Indus.
- [ ] ST-246 Research Lacerta.
- [ ] ST-247 Research Leo.
- [ ] ST-248 Research Leo Minor.
- [ ] ST-249 Research Lepus.
- [ ] ST-250 Produce Constellation Dataset Batch 2.

## Section M — Alphabetical Batch III (ST-251 → ST-275)

- [ ] ST-251 Research Libra.
- [ ] ST-252 Research Lupus.
- [ ] ST-253 Research Lynx.
- [ ] ST-254 Research Lyra.
- [ ] ST-255 Research Mensa.
- [ ] ST-256 Research Microscopium.
- [ ] ST-257 Research Monoceros.
- [ ] ST-258 Research Musca.
- [ ] ST-259 Research Norma.
- [ ] ST-260 Research Octans.
- [ ] ST-261 Research Ophiuchus.
- [ ] ST-262 Research Orion.
- [ ] ST-263 Research Pavo.
- [ ] ST-264 Research Pegasus.
- [ ] ST-265 Research Perseus.
- [ ] ST-266 Research Phoenix.
- [ ] ST-267 Research Pictor.
- [ ] ST-268 Research Pisces.
- [ ] ST-269 Research Piscis Austrinus.
- [ ] ST-270 Research Puppis.
- [ ] ST-271 Research Pyxis.
- [ ] ST-272 Research Reticulum.
- [ ] ST-273 Research Sagitta.
- [ ] ST-274 Research Sagittarius.
- [ ] ST-275 Produce Constellation Dataset Batch 3.

## Section N — Alphabetical Batch IV (ST-276 → ST-288)

- [ ] ST-276 Research Scorpius.
- [ ] ST-277 Research Sculptor.
- [ ] ST-278 Research Scutum.
- [ ] ST-279 Research Serpens.
- [ ] ST-280 Research Sextans.
- [ ] ST-281 Research Taurus.
- [ ] ST-282 Research Telescopium.
- [ ] ST-283 Research Triangulum.
- [ ] ST-284 Research Triangulum Australe.
- [ ] ST-285 Research Tucana.
- [ ] ST-286 Research Ursa Major.
- [ ] ST-287 Research Ursa Minor.
- [ ] ST-288 Research Vela.

## Section O — Remaining IAU constellations + integration (ST-289 → ST-300)

- [ ] ST-289 Research Virgo.
- [ ] ST-290 Research Volans.
- [ ] ST-291 Research Vulpecula.
- [ ] ST-292 Create constellation boundary dataset. **Source of truth** — the
      IAU's official 1930 Delporte boundaries as B1875.0 arcs, cited, with
      precession to J2000 documented. ST-468 consumes this; do not produce
      boundary geometry twice. ⚠ **Serpens is the only constellation split
      into two disjoint regions** (Caput and Cauda, separated by Ophiuchus) —
      a schema assuming one polygon per constellation breaks on exactly this
      row. Design for multi-polygon from the start.
- [ ] ST-293 Create constellation-season mapping dataset.
- [ ] ST-294 Create brightest-star-to-constellation index.
- [ ] ST-295 Create constellation deep-sky-object index.
- [ ] ST-296 Build constellation knowledge graph.
- [ ] ST-297 Build educational constellation narration package.
- [ ] ST-298 Build observer guide dataset.
- [ ] ST-299 Validate all 88 constellation entries.
- [ ] ST-300 Produce Complete IAU Constellation Reference v1.

## Phase STC completion gate

Before ST-201 through ST-300 may be marked complete:

- [ ] All 88 IAU constellations researched.
- [ ] Constellation boundaries documented.
- [ ] Brightest-star mappings verified.
- [ ] Seasonal visibility dataset completed.
- [ ] Major DSO mappings verified.
- [ ] Educational content generated.
- [ ] Narration content generated.
- [ ] Knowledge graph relationships created.
- [ ] Observer guides created.
- [ ] Final validation completed.

## Phase STC deliverables

- `iau_constellations_dataset_v1`
- `constellation_boundaries_dataset_v1`
- `constellation_brightest_stars_dataset_v1`
- `constellation_dso_dataset_v1`
- `constellation_education_dataset_v1`
- `constellation_narration_dataset_v1`
- `constellation_observer_guide_v1`
- `constellation_knowledge_graph_v1`

## Phase STC success criteria

Upon completion of ST-201 through ST-300, echoGalaxy possesses a complete
research-backed representation of all 88 official IAU constellations and their
relationships to stars, deep-sky objects, observation seasons, mythology, and
educational content.

**Milestone: "echoGalaxy understands the map of the night sky."**

---

# Phase STD — Cultural Astronomy, Navigation & Human Sky Knowledge

**Status:** ready for research execution.

## Purpose

Astronomy is not only physics.

For thousands of years, humans have used the stars for:

- Survival
- Navigation
- Agriculture
- Timekeeping
- Storytelling
- Religion
- Exploration

This phase builds the human relationship layer of echoGalaxy.

The goal is to allow future users to ask not only *"What is that
constellation?"* but also *"Why did humans care about it?"*

## Research standards

Every completed task must include:

- Historical sources
- Astronomical sources
- Educational summary
- Cultural context summary
- Knowledge graph entities
- Cross-links to stars
- Cross-links to constellations
- Narration-ready content
- Validation notes

## Cultural review requirement

All cultural traditions must be documented accurately.

Research should distinguish between:

- Historical evidence
- Oral traditions
- Mythology
- Archaeological evidence
- Modern interpretation

**Avoid merging traditions into a single narrative.**

### Source priorities for STD — proposed, pending sign-off

Phase STA's tier list (NASA · ESA · JPL · SIMBAD · IAU) is astronomy-
institutional and does not fit this phase's material: cuneiform tablets,
Polynesian wayfinding, and Nakshatra systems are not NASA subjects. STD arrived
without its own list, so this one is **proposed, not authoritative** — Zach to
confirm or replace:

- **Tier 1** — peer-reviewed archaeoastronomy and history-of-science
  literature (*Journal for the History of Astronomy*, *Journal of
  Astronomical History and Heritage*, *Archaeoastronomy*); museum and library
  holdings of primary sources (British Museum for MUL.APIN and the Babylonian
  tablets, Bibliothèque nationale, Dunhuang star chart at the British Library).
- **Tier 2** — university departments of history of science and Indigenous
  studies; national observatory and planetarium cultural-astronomy programmes;
  UNESCO astronomy-and-heritage documentation.
- **Tier 3** — general reference (Britannica, Sky & Telescope) for orientation
  only, never as the sole citation for a cultural claim.

### Indigenous knowledge protocols — read before ST-361 → ST-380

Parts of Aboriginal Australian, Māori, and other Indigenous astronomical
knowledge are held under community protocols governing what may be published,
retold, or attributed — some material is restricted by gender, initiation, or
clan. Researchers in this field publish under agreements with knowledge
holders.

For Section S, **the community-sanctioned publication is the Tier 1 source**,
not the general astronomy institution: work by Hamacher and Norris and the
Australian Indigenous Astronomy group, Māori scholarship on Matariki, and
tribal-nation published material. Where a source states that knowledge is
restricted or shared conditionally, honour that in the dataset — record that
the restriction exists rather than reproducing the content. This is a sourcing
rule, not a scope cut: the tasks stay, the citations get stricter.

## Section P — Ancient astronomy foundations (ST-301 → ST-320)

- [ ] ST-301 Research the origins of ancient astronomy.
- [ ] ST-302 Research prehistoric sky observation.
- [ ] ST-303 Document early lunar calendars.
- [ ] ST-304 Research ancient solar calendars.
- [ ] ST-305 Research megalithic astronomy.
- [ ] ST-306 Document Stonehenge astronomical theories.
- [ ] ST-307 Research Nabta Playa sky alignments.
- [ ] ST-308 Research early constellation development.
- [ ] ST-309 Document ancient seasonal sky tracking.
- [ ] ST-310 Research agriculture-driven astronomy.
- [ ] ST-311 Research star-based migration traditions.
- [ ] ST-312 Research astronomy and navigation origins.
- [ ] ST-313 Document naked-eye observing techniques.
- [ ] ST-314 Research emergence of zodiac systems.
- [ ] ST-315 Document development of celestial mapping.
- [ ] ST-316 Research astronomy in early civilizations.
- [ ] ST-317 Create timeline of ancient astronomy.
- [ ] ST-318 Build ancient-sky knowledge graph.
- [ ] ST-319 Create educational history narrative.
- [ ] ST-320 Produce Ancient Astronomy Dataset v1.

## Section Q — Mesopotamian, Egyptian & Greek traditions (ST-321 → ST-340)

- [ ] ST-321 Research Babylonian astronomy.
- [ ] ST-322 Research Sumerian sky traditions.
- [ ] ST-323 Research Assyrian astronomical records.
- [ ] ST-324 Document MUL.APIN star catalog.
- [ ] ST-325 Research Babylonian constellation origins.
- [ ] ST-326 Research ancient Egyptian astronomy.
- [ ] ST-327 Research Sirius and Nile flooding traditions.
- [ ] ST-328 Document Egyptian decan systems.
- [ ] ST-329 Research pyramid astronomical alignments.
- [ ] ST-330 Research Greek astronomy origins.
- [ ] ST-331 Document Hipparchus contributions.
- [ ] ST-332 Research Ptolemy and the Almagest.
- [ ] ST-333 Research Greek constellation mythology.
- [ ] ST-334 Document Greek celestial sphere concepts.
- [ ] ST-335 Research Hellenistic sky mapping.
- [ ] ST-336 Create Mesopotamian-to-Greek lineage map.
- [ ] ST-337 Build mythological relationship graph.
- [ ] ST-338 Create educational mythology summaries.
- [ ] ST-339 Validate historical source consistency.
- [ ] ST-340 Produce Mediterranean Astronomy Dataset v1.

## Section R — Chinese, Indian, Japanese & Korean astronomy (ST-341 → ST-360)

- [ ] ST-341 Research ancient Chinese astronomy.
- [ ] ST-342 Document Chinese sky divisions.
- [ ] ST-343 Research Twenty-Eight Mansions.
- [ ] ST-344 Research Chinese star catalogs.
- [ ] ST-345 Document Chinese supernova observations.
- [ ] ST-346 Research Chinese comet records.
- [ ] ST-347 Research Indian astronomy origins.
- [ ] ST-348 Document Nakshatra systems.
- [ ] ST-349 Research Vedic astronomy.
- [ ] ST-350 Research ancient Indian observatories.
- [ ] ST-351 Research traditional Japanese astronomy.
- [ ] ST-352 Document Japanese star lore.
- [ ] ST-353 Research Korean astronomy history.
- [ ] ST-354 Document Korean sky records.
- [ ] ST-355 Research East Asian constellation systems.
- [ ] ST-356 Compare East Asian and Western skies.
- [ ] ST-357 Build East Asian sky knowledge graph.
- [ ] ST-358 Create cultural astronomy educational content.
- [ ] ST-359 Validate cross-cultural constellation mappings.
- [ ] ST-360 Produce Asian Astronomy Dataset v1.

## Section S — Indigenous, Polynesian & Arabic sky traditions (ST-361 → ST-380)

- [ ] ST-361 Research Polynesian wayfinding astronomy.
- [ ] ST-362 Document Polynesian navigation stars.
- [ ] ST-363 Research Polynesian star compasses.
- [ ] ST-364 Research Māori astronomy traditions.
- [ ] ST-365 Research Aboriginal Australian astronomy.
- [ ] ST-366 Document Aboriginal sky stories.
- [ ] ST-367 Research Indigenous North American astronomy.
- [ ] ST-368 Research Maya astronomy.
- [ ] ST-369 Research Aztec astronomy.
- [ ] ST-370 Research Inca astronomy.
- [ ] ST-371 Research Arabic astronomy.
- [ ] ST-372 Document Arabic star naming traditions.
- [ ] ST-373 Research Islamic Golden Age astronomy.
- [ ] ST-374 Document Arabic celestial navigation.
- [ ] ST-375 Research historical transmission of star names.
- [ ] ST-376 Compare Indigenous sky systems.
- [ ] ST-377 Build world sky traditions knowledge graph.
- [ ] ST-378 Create navigation-culture educational content.
- [ ] ST-379 Validate cultural astronomy dataset.
- [ ] ST-380 Produce Global Sky Cultures Dataset v1.

## Section T — Celestial navigation & human exploration (ST-381 → ST-400)

- [ ] ST-381 Research celestial navigation fundamentals.
- [ ] ST-382 Document latitude determination by stars.
- [ ] ST-383 Research historical ocean navigation.
- [ ] ST-384 Research Age of Exploration star navigation.
- [ ] ST-385 Document sextant usage principles.
- [ ] ST-386 Research chronometer history.
- [ ] ST-387 Document longitude determination.
- [ ] ST-388 Research navigation star catalogs.
- [ ] ST-389 Research Polaris navigation methods.
- [ ] ST-390 Research Southern Cross navigation methods.
- [ ] ST-391 Research Pacific navigation techniques.
- [ ] ST-392 Research Arctic navigation traditions.
- [ ] ST-393 Research desert navigation traditions.
- [ ] ST-394 Document astronomical timekeeping history.
- [ ] ST-395 Research observatory development history.
- [ ] ST-396 Create celestial-navigation timeline.
- [ ] ST-397 Build navigation knowledge graph.
- [ ] ST-398 Create educational navigation simulations.
- [ ] ST-399 Validate historical navigation references.
- [ ] ST-400 Produce Human Navigation Dataset v1.

## Phase STD completion gate

Before ST-301 through ST-400 may be marked complete:

- [ ] Ancient astronomy research completed.
- [ ] Mediterranean traditions documented.
- [ ] Asian sky traditions documented.
- [ ] Indigenous sky traditions documented.
- [ ] Navigation traditions documented.
- [ ] Historical sources validated.
- [ ] Cultural relationships mapped.
- [ ] Educational content generated.
- [ ] Narration content generated.
- [ ] Knowledge graph integrated.

## Phase STD deliverables

- `ancient_astronomy_dataset_v1`
- `mediterranean_astronomy_dataset_v1`
- `asian_astronomy_dataset_v1`
- `indigenous_astronomy_dataset_v1`
- `navigation_astronomy_dataset_v1`
- `global_sky_cultures_dataset_v1`
- `cultural_astronomy_narration_dataset_v1`
- `human_sky_knowledge_graph_v1`

## Phase STD success criteria

Upon completion of ST-301 through ST-400, echoGalaxy understands how human
civilizations observed, interpreted, named, navigated by, and built stories
around the night sky.

**Milestone: "echoGalaxy understands humanity's relationship with the stars."**

---

# Phase STE — Astronomy Intelligence Platform

*Full title in the source document: "Knowledge Graph, Educational Systems &
Astronomy Intelligence". The short form is canonical here — it matches the
Introduction's scope table, the `astronomy_intelligence_platform_v1`
deliverable, and ST-500.*

**Status:** ready for research execution.

## Purpose

This phase transforms all previous astronomy research into a unified,
searchable, interconnected knowledge system for echoGalaxy.

Previous phases established stellar physics, stellar systems, major stars,
constellations, cultural astronomy, human sky traditions, and navigation
systems. Phase STE converts those datasets into:

- Knowledge graphs
- Educational engines
- Narration systems
- Discovery systems
- Learning pathways
- Visualization datasets
- AI-ready astronomy infrastructure

This is the phase where astronomy becomes an explorable universe.

## Research standards

Every completed task must include:

- Source validation
- Schema definition
- Knowledge graph integration
- Educational integration
- Narration integration
- Search integration
- Dataset export
- QA review

## Section U — Astronomy knowledge graph core (ST-401 → ST-420)

- [ ] ST-401 Design astronomy knowledge graph architecture.
- [ ] ST-402 Define celestial entity schema.
- [ ] ST-403 Define stellar object schema.
- [ ] ST-404 Define constellation schema.
- [ ] ST-405 Define deep-sky object schema.
- [ ] ST-406 Define mythology schema.
- [ ] ST-407 Define culture schema.
- [ ] ST-408 Define navigation schema.
- [ ] ST-409 Define educational content schema.
- [ ] ST-410 Define narration content schema.
- [ ] ST-411 Create star-to-constellation relationships.
- [ ] ST-412 Create star-to-star relationships.
- [ ] ST-413 Create constellation-to-constellation relationships.
- [ ] ST-414 Create mythology-to-constellation relationships.
- [ ] ST-415 Create culture-to-sky relationships.
- [ ] ST-416 Create navigation-to-star relationships.
- [ ] ST-417 Build graph validation framework.
- [ ] ST-418 Build graph export pipeline.
- [ ] ST-419 Create graph visualization specification.
- [ ] ST-420 Produce Astronomy Knowledge Graph v1.

## Section V — Educational systems (ST-421 → ST-440)

- [ ] ST-421 Design astronomy learning framework.
- [ ] ST-422 Create beginner astronomy pathway.
- [ ] ST-423 Create intermediate astronomy pathway.
- [ ] ST-424 Create advanced astronomy pathway.
- [ ] ST-425 Create stellar evolution lesson sequence.
- [ ] ST-426 Create constellation discovery sequence.
- [ ] ST-427 Create sky-navigation lesson sequence.
- [ ] ST-428 Create mythology learning sequence.
- [ ] ST-429 Create culture comparison lesson sequence.
- [ ] ST-430 Create observational astronomy curriculum.
- [ ] ST-431 Create child-friendly astronomy module.
- [ ] ST-432 Create teen astronomy module.
- [ ] ST-433 Create adult astronomy module.
- [ ] ST-434 Create educator resource package.
- [ ] ST-435 Create astronomy glossary dataset.
- [ ] ST-436 Create astronomy question bank.
- [ ] ST-437 Create astronomy quiz generation system.
- [ ] ST-438 Create adaptive learning recommendations.
- [ ] ST-439 Validate educational progression pathways.
- [ ] ST-440 Produce Educational Astronomy System v1.

## Section W — Narration & discovery systems (ST-441 → ST-460)

- [ ] ST-441 Design astronomy narration architecture.
- [ ] ST-442 Create star narration template.
- [ ] ST-443 Create constellation narration template.
- [ ] ST-444 Create mythology narration template.
- [ ] ST-445 Create culture narration template.
- [ ] ST-446 Create deep-sky-object narration template.
- [ ] ST-447 Create navigation narration template.
- [ ] ST-448 Create discovery-story framework.
- [ ] ST-449 Create astronomy timeline narration system.
- [ ] ST-450 Create scientific discovery narratives.
- [ ] ST-451 Create observational experience narratives.
- [ ] ST-452 Create child-focused narration style guide.
- [ ] ST-453 Create educational narration style guide.
- [ ] ST-454 Create exploratory narration style guide.
- [ ] ST-455 Build narration metadata schema.
- [ ] ST-456 Build narration relationship mapping.
- [ ] ST-457 Build narrated learning journeys.
- [ ] ST-458 Validate narration consistency.
- [ ] ST-459 Create discovery recommendation engine.
- [ ] ST-460 Produce Astronomy Narration System v1.

## Section X — Observation & visualization systems (ST-461 → ST-480)

- [ ] ST-461 Design celestial visualization architecture.
- [ ] ST-462 Build star color reference dataset.
- [ ] ST-463 Build stellar temperature visualization dataset.
- [ ] ST-464 Build stellar size comparison dataset.
- [ ] ST-465 Build stellar luminosity comparison dataset.
- [ ] ST-466 Build spectral classification visualization dataset.
- [ ] ST-467 Build constellation line dataset. (Stick figures — the drawn
      asterism lines, which are conventional and have no single official
      source. Distinct from ST-468's boundaries; state which convention is
      followed.)
- [ ] ST-468 Build constellation boundary dataset. **Render-ready derivative
      of ST-292** — tessellated, precessed to the app's epoch, sized to the
      frame budget. Blocked on ST-292; do not re-research the geometry. Must
      carry Serpens as two polygons (see ST-292).
- [ ] ST-469 Build seasonal sky visualization dataset.
- [ ] ST-470 Build northern hemisphere sky dataset.
- [ ] ST-471 Build southern hemisphere sky dataset.
- [ ] ST-472 Build naked-eye visibility dataset.
- [ ] ST-473 Build binocular observation dataset.
- [ ] ST-474 Build telescope observation dataset.
- [ ] ST-475 Build sky simulation metadata schema.
- [ ] ST-476 Create visualization quality guidelines.
- [ ] ST-477 Create astronomy artwork standards.
- [ ] ST-478 Validate visualization consistency.
- [ ] ST-479 Produce visualization asset registry.
- [ ] ST-480 Produce Observation & Visualization Dataset v1.

## Section Y — AI astronomy layer & final integration (ST-481 → ST-500)

- [ ] ST-481 Design astronomy AI integration architecture.
- [ ] ST-482 Define astronomy retrieval schema.
- [ ] ST-483 Define astronomy search index schema.
- [ ] ST-484 Create star-search dataset.
- [ ] ST-485 Create constellation-search dataset.
- [ ] ST-486 Create mythology-search dataset.
- [ ] ST-487 Create educational-query dataset.
- [ ] ST-488 Create astronomy fact-verification pipeline.
- [ ] ST-489 Create source-citation generation pipeline.
- [ ] ST-490 Create astronomy recommendation engine.
- [ ] ST-491 Build explorer-mode query system.
- [ ] ST-492 Build guided-tour query system.
- [ ] ST-493 Build child-safe astronomy explanation system.
- [ ] ST-494 Build astronomy relationship explorer.
- [ ] ST-495 Create astronomy concept map.
- [ ] ST-496 Validate all previous astronomy datasets.
- [ ] ST-497 Validate graph integrity.
- [ ] ST-498 Export final integrated astronomy universe dataset.
- [ ] ST-499 Perform end-to-end echoGalaxy astronomy review.
- [ ] ST-500 Produce Astronomy Intelligence Platform v1.

## Phase STE completion gate

Before ST-401 through ST-500 may be marked complete:

- [ ] Knowledge graph completed.
- [ ] Educational framework completed.
- [ ] Narration system completed.
- [ ] Search system completed.
- [ ] Retrieval system completed.
- [ ] Dataset validation completed.
- [ ] Relationship mappings validated.
- [ ] Astronomy intelligence layer validated.
- [ ] Final exports generated.
- [ ] Integration with echoGalaxy completed.

## Phase STE deliverables

- `astronomy_knowledge_graph_v1`
- `astronomy_education_system_v1`
- `astronomy_narration_system_v1`
- `astronomy_visualization_system_v1`
- `astronomy_search_system_v1`
- `astronomy_retrieval_system_v1`
- `astronomy_recommendation_system_v1`
- `astronomy_intelligence_platform_v1`
- `echoGalaxy_astronomy_universe_dataset_v1`

---

# Final program completion gate — ST-001 → ST-500

The entire Stars & Constellations Program is complete when:

- [ ] 500 tasks completed.
- [ ] All datasets validated.
- [ ] All astronomical entities citation-backed.
- [ ] All constellation research complete.
- [ ] Cultural astronomy complete.
- [ ] Navigation astronomy complete.
- [ ] Knowledge graph operational.
- [ ] Educational system operational.
- [ ] Narration system operational.
- [ ] Astronomy intelligence platform operational.

## Final success criteria

Upon completion of ST-001 through ST-500, echoGalaxy possesses a comprehensive
astronomy knowledge ecosystem capable of supporting:

- Interactive star exploration
- Constellation discovery
- Cultural astronomy journeys
- Educational learning paths
- AI astronomy guidance
- Knowledge graph exploration
- Scientific storytelling
- Future planetary datasets
- Future deep-sky object datasets
- Future galaxy-scale educational experiences

**Final milestone: "echoGalaxy understands the stars, the constellations, and
humanity's place beneath them."**