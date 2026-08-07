import type { CartItem } from '../features/cart/types'

const STORAGE_KEY = 'sova-guest-cart'

/** Cart for signed-out visitors. Moved to the server when they sign in. */
export function loadGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    return Array.isArray(parsed) ? parsed.filter((item) => item?.product?.name) : []
  } catch {
    return []
  }
}

export function saveGuestCart(items: CartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage full or blocked: the cart simply will not survive a reload.
  }
}

export function clearGuestCart(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to do — the cart is already unavailable.
  }
}

/** Only slug-bearing items exist on the server, so only those can be merged. */
export function mergeableItems(items: CartItem[]) {
  return items
    .filter((item) => item.product.slug)
    .map((item) => ({ productSlug: item.product.slug as string, quantity: item.quantity }))
}
