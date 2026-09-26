import { validateHelixAction } from './actions.js'

export async function askHelix(
  message,
  context,
  { apiBase, fetchImpl = fetch } = {},
) {
  const configuredBase = apiBase ?? import.meta.env?.VITE_HELIX_API_URL
  if (!configuredBase?.trim()) {
    throw new Error('Helix Q&A is not configured. Set VITE_HELIX_API_URL.')
  }

  const base = configuredBase.trim().replace(/\/+$/, '')
  let endpoint
  try {
    endpoint = new URL(base)
  } catch {
    throw new Error('VITE_HELIX_API_URL must be an absolute HTTPS URL.')
  }

  const localHost = ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname)
  if (endpoint.protocol !== 'https:' && !(localHost && endpoint.protocol === 'http:')) {
    throw new Error('Helix requires HTTPS except when using a local development server.')
  }

  const response = await fetchImpl(`${base}/v1/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context }),
  })

  if (!response.ok) {
    throw new Error(`Helix server returned HTTP ${response.status}.`)
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error('Helix server returned invalid JSON.')
  }

  if (!payload || typeof payload.answer !== 'string' || !payload.answer.trim()) {
    throw new Error('Helix server response must include a non-empty answer.')
  }

  const action =
    payload.action == null ? null : validateHelixAction(payload.action)
  if (payload.action != null && !action) {
    throw new Error('Helix server returned an unsupported app action.')
  }

  return { answer: payload.answer.trim(), action }
}
