import { marketplaceApi } from './marketplaceApi'

const VISITOR_STORAGE_KEY = 'sova-visitor-id'

/** Stable per-browser id so repeat visits by the same person are recognisable. */
export function visitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_STORAGE_KEY)
    if (existing) return existing
    const created = crypto.randomUUID()
    localStorage.setItem(VISITOR_STORAGE_KEY, created)
    return created
  } catch {
    // Private mode or blocked storage: fall back to a per-session id.
    return sessionVisitorId()
  }
}

let sessionId = ''
function sessionVisitorId(): string {
  if (!sessionId) sessionId = crypto.randomUUID()
  return sessionId
}

/**
 * Records a product view. The idempotency key is derived from visitor, product
 * and day, so a refresh or a retried request is counted once.
 */
export async function recordProductView(slug: string | undefined): Promise<void> {
  if (!slug) return
  const visitor = visitorId()
  const day = new Date().toISOString().slice(0, 10)
  try {
    await marketplaceApi.recordProductView(
      slug,
      { referrer: document.referrer || undefined, visitorId: visitor },
      `${visitor}:${slug}:${day}`,
    )
  } catch {
    // Analytics must never interrupt browsing.
  }
}
