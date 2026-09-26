export const HELIX_SCALES = [
  { id: 'planet', aliases: ['planet', 'planets'] },
  { id: 'system', aliases: ['system', 'star system', 'solar system'] },
  { id: 'nebula', aliases: ['nebula', 'nebulae'] },
  { id: 'galaxy', aliases: ['galaxy', 'galaxies'] },
  { id: 'group', aliases: ['local group', 'galaxy group'] },
  { id: 'cluster', aliases: ['cluster', 'coma cluster'] },
]

const SCALE_BY_ALIAS = new Map(
  HELIX_SCALES.flatMap(({ id, aliases }) => aliases.map((alias) => [alias, id])),
)

export function validateHelixAction(action) {
  if (!action || typeof action !== 'object' || Array.isArray(action)) return null

  if (
    action.type === 'navigate-scale' &&
    HELIX_SCALES.some((scale) => scale.id === action.scaleId)
  ) {
    return { type: action.type, scaleId: action.scaleId }
  }

  if (
    (action.type === 'navigate-object' || action.type === 'navigate-system') &&
    (action.direction === -1 || action.direction === 1)
  ) {
    return { type: action.type, direction: action.direction }
  }

  if (action.type === 'set-redshift' && typeof action.enabled === 'boolean') {
    return { type: action.type, enabled: action.enabled }
  }

  return null
}

export function parseHelixCommand(transcript, context = {}) {
  const text = transcript
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, ' ')

  if (!text) return null

  const scaleRequest = text.match(
    /^(?:(?:please )?(?:go to|switch to|open|show|take me to) )(.+)$/,
  )
  if (scaleRequest) {
    const requestedScale = scaleRequest[1].replace(/^(?:the|a|an) /, '')
    const scaleId = SCALE_BY_ALIAS.get(requestedScale)
    if (scaleId) return { type: 'navigate-scale', scaleId }
  }

  if (
    context.scaleId === 'cluster' &&
    /\b(real space|return to real space|leave redshift)\b/.test(text)
  ) {
    return { type: 'set-redshift', enabled: false }
  }

  if (context.scaleId === 'cluster' && /\bredshift\b/.test(text)) {
    return { type: 'set-redshift', enabled: true }
  }

  const direction = /\b(next|forward)\b/.test(text)
    ? 1
    : /\b(previous|prev|back)\b/.test(text)
      ? -1
      : null

  if (direction === null) return null

  if (context.scaleId === 'system' && /\bsystem\b/.test(text)) {
    return { type: 'navigate-system', direction }
  }

  if (
    context.canCycle &&
    /^(?:(?:please )?(?:go to|show) )?(?:next|previous|prev|forward|back)(?: (?:planet|object|entry|item))?$/.test(
      text,
    )
  ) {
    return { type: 'navigate-object', direction }
  }

  return null
}
