import type { CartItem } from '../features/cart/types'
import type { CartLineInput } from './cartApi'

const STORAGE_KEY = 'sova-guest-cart'

/** Cart for signed-out visitors. Moved to the server when they sign in. */
export function loadGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    return Array.isArray(parsed)
      // Lines stored before options existed still load; they just have none.
      ? parsed
        .filter((item) => item?.product?.name)
        .map((item) => ({ ...item, options: item.options ?? [] }))
      : []
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
export function mergeableItems(items: CartItem[]): CartLineInput[] {
  return items
    .filter((item) => item.product.slug)
    .map((item) => ({
      productSlug: item.product.slug as string,
      quantity: item.quantity,
      variantId: item.product.variantId,
    }))
}
