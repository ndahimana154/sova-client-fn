import type { Product } from '../data/catalog'

const STORAGE_KEY = 'sova-guest-favorites'

/** Favorites for signed-out visitors. Moved to the server when they sign in. */
export function loadGuestFavorites(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Product[]
    return Array.isArray(parsed) ? parsed.filter((product) => product?.name) : []
  } catch {
    return []
  }
}

export function saveGuestFavorites(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  } catch {
    // Storage full or blocked: the favorites simply will not survive a reload.
  }
}

export function clearGuestFavorites(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to do — the list is already unavailable.
  }
}

/** Only slug-bearing products exist on the server, so only those can be merged. */
export function mergeableFavorites(products: Product[]) {
  return products
    .filter((product) => product.slug)
    .map((product) => ({ productSlug: product.slug as string }))
}
