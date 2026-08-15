import { marketplaceApi } from './marketplaceApi'

const VISITOR_STORAGE_KEY = 'sova-visitor-id'

/**
 * `crypto.randomUUID` only exists in a secure context, so it is missing whenever
 * the app is served over plain http from anything but localhost — a LAN IP on a
 * phone, say. Anything unique will do here, so fall back rather than throw.
 */
function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

/** Stable per-browser id so repeat visits by the same person are recognisable. */
export function visitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_STORAGE_KEY)
    if (existing) return existing
    const created = randomId()
    localStorage.setItem(VISITOR_STORAGE_KEY, created)
    return created
  } catch {
    // Private mode or blocked storage: fall back to a per-session id.
    return sessionVisitorId()
  }
}

let sessionId = ''
function sessionVisitorId(): string {
  if (!sessionId) sessionId = randomId()
  return sessionId
}

/**
 * Records a product view. The idempotency key is derived from visitor, product
 * and day, so a refresh or a retried request is counted once.
 */
export async function recordProductView(slug: string | undefined): Promise<void> {
  if (!slug) return
  try {
    const visitor = visitorId()
    const day = new Date().toISOString().slice(0, 10)
    await marketplaceApi.recordProductView(
      slug,
      { referrer: document.referrer || undefined, visitorId: visitor },
      `${visitor}:${slug}:${day}`,
    )
  } catch {
    // Analytics must never interrupt browsing — minting the id included.
  }
}
