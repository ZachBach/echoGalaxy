/**
 * The facts ladder — one entry, two audiences.
 *
 * Existing catalogue entries (galaxyData, planetData, systemData) carry a
 * single flat `facts` array. The astronomy content added for the Stars &
 * Constellations program (BACKLOG phases STA–STD) carries two rungs instead:
 *
 *   factsKids     — concrete, physical, no jargon. Never a simplification
 *                   that has to be un-learned later.
 *   factsAdvanced — the real numbers, the mechanism, the named physics.
 *
 * `factsFor` is the single read point so a HUD never has to know which shape
 * an entry uses. Legacy entries fall back to `facts` on both rungs, so
 * nothing that reads the old catalogues changes behaviour.
 *
 * Pure data + one pure selector: no rendering imports here, per CLAUDE.md.
 */

export const AUDIENCES = ['kids', 'advanced']

export const AUDIENCE_LABELS = {
  kids: 'Explorer',
  advanced: 'Astronomer',
}

/**
 * Read the fact list for an audience, falling back down the ladder:
 * requested rung → the entry's flat `facts` → the other rung → [].
 *
 * @param {object} entry     any catalogue entry
 * @param {'kids'|'advanced'} audience
 * @returns {string[]}
 */
export function factsFor(entry, audience = 'advanced') {
  if (!entry) return []
  const rung = audience === 'kids' ? entry.factsKids : entry.factsAdvanced
  if (rung && rung.length) return rung
  if (entry.facts && entry.facts.length) return entry.facts
  const other = audience === 'kids' ? entry.factsAdvanced : entry.factsKids
  return other && other.length ? other : []
}

/** True when an entry actually carries both rungs (i.e. the toggle is useful). */
export function hasLadder(entry) {
  return Boolean(
    entry &&
      entry.factsKids &&
      entry.factsKids.length &&
      entry.factsAdvanced &&
      entry.factsAdvanced.length,
  )
}

/** Flatten any catalogue to `{ id, name, kids, advanced }` rows — export/QA aid. */
export function ladderRows(entries) {
  return entries.map((e) => ({
    id: e.id,
    name: e.name,
    kids: factsFor(e, 'kids'),
    advanced: factsFor(e, 'advanced'),
  }))
}
