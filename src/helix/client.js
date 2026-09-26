import { askHelix as askHelixCore } from '@aureliusdynamic/helix-capacitor/client'
import { validateHelixAction } from './actions.js'

/**
 * EchoGalaxy's Q&A call. The transport, HTTPS rules and response checks live
 * in the shared Helix package (helix/capacitor); this app supplies only its
 * server URL and its own astronomy action allowlist.
 */
export function askHelix(message, context, { apiBase, fetchImpl } = {}) {
  return askHelixCore(message, context, {
    apiBase: apiBase ?? import.meta.env?.VITE_HELIX_API_URL,
    fetchImpl,
    validateAction: validateHelixAction,
  })
}
