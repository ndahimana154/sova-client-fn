import { marketplaceApi } from './marketplaceApi'

const VISITOR_STORAGE_KEY = 'sova-visitor-id'

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

export function visitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_STORAGE_KEY)
    if (existing) return existing
    const created = randomId()
    localStorage.setItem(VISITOR_STORAGE_KEY, created)
    return created
  } catch {
    return sessionVisitorId()
  }
}

let sessionId = ''
function sessionVisitorId(): string {
  if (!sessionId) sessionId = randomId()
  return sessionId
}

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
    return
  }
}
