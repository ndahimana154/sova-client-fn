import type { PurchaseItem } from '../features/purchase/types'

const KEY = 'sova-pending-purchase'

/**
 * Survives the reload that email verification can cause, but is deliberately
 * session-scoped: an abandoned purchase should not resurface days later.
 */
export function loadPendingPurchase(): PurchaseItem | null {
  try {
    const stored = sessionStorage.getItem(KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as PurchaseItem
    return parsed?.product?.variantId ? parsed : null
  } catch {
    return null
  }
}

export function savePendingPurchase(item: PurchaseItem): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(item))
  } catch {
    // A full or blocked store must not stop the buyer reaching checkout.
  }
}

export function clearPendingPurchase(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // Nothing to recover from.
  }
}
