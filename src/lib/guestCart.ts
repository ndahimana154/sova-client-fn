import type { CartItem } from '../features/cart/types'
import type { CartLineInput } from './cartApi'

const STORAGE_KEY = 'sova-guest-cart'

export function loadGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    return Array.isArray(parsed)
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
    return
  }
}

export function clearGuestCart(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    return
  }
}

export function mergeableItems(items: CartItem[]): CartLineInput[] {
  return items
    .filter((item) => item.product.slug)
    .map((item) => ({
      productSlug: item.product.slug as string,
      quantity: item.quantity,
      variantId: item.product.variantId,
    }))
}
