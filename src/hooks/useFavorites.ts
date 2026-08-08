import { useCallback, useEffect, useRef } from 'react'
import type { Product } from '../data/catalog'
import { favoritesApi, type ServerFavorites } from '../lib/favoritesApi'
import {
  clearGuestFavorites,
  loadGuestFavorites,
  mergeableFavorites,
  saveGuestFavorites,
} from '../lib/guestFavorites'
import { mediaUrl } from '../lib/mediaUrl'
import { setFavoriteItems } from '../store/commerceSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setToast } from '../store/uiSlice'

const PLACEHOLDER = '/images/storefront-hero.png'

/**
 * What makes two products the same saved product. Names repeat across the
 * catalog — two shops list the same watch — so the slug decides wherever there
 * is one, and only the demo products without a slug fall back to the name.
 */
const favoriteKey = (product: Product) => product.slug ?? product.name

/**
 * Shared across every copy of this hook. Each page holds its own, so without
 * this they would all sync on sign-in at once and race each other's writes.
 */
const loadInFlight = new Map<string, Promise<ServerFavorites>>()

function toProducts(favorites: ServerFavorites): Product[] {
  return favorites.items.map((item) => ({
    badge: item.product.stockStatus === 'OUT_OF_STOCK'
      ? 'Out of stock'
      : item.product.discount > 0 ? `${item.product.discount}% off` : undefined,
    brand: item.product.brand ?? undefined,
    category: item.product.category.name,
    image: item.product.image ? mediaUrl(item.product.image.url) : PLACEHOLDER,
    name: item.product.name,
    oldPrice: item.product.discount > 0 ? item.product.price : undefined,
    price: item.product.finalPrice,
    rating: 0,
    reviews: 0,
    slug: item.product.slug,
  }))
}

/**
 * One favorites list, two backing stores: the API when signed in, localStorage
 * when not. Signing in moves the guest list to the server and empties local
 * storage — the same arrangement the cart uses.
 */
export function useFavorites() {
  const dispatch = useAppDispatch()
  const session = useAppSelector((state) => state.auth.session)
  const favoriteItems = useAppSelector((state) => state.commerce.favoriteItems)
  const authenticated = Boolean(session)
  const mergedFor = useRef<string | null>(null)

  const notify = useCallback((text: string) => {
    dispatch(setToast(text))
    window.setTimeout(() => dispatch(setToast('')), 1800)
  }, [dispatch])

  const applyServerFavorites = useCallback((favorites: ServerFavorites) => {
    dispatch(setFavoriteItems(toProducts(favorites)))
  }, [dispatch])

  // Load from the right place, merging anything saved while signed out.
  useEffect(() => {
    if (!authenticated) {
      mergedFor.current = null
      dispatch(setFavoriteItems(loadGuestFavorites()))
      return
    }
    const userId = session?.user?.id ?? 'me'
    if (mergedFor.current === userId) return
    mergedFor.current = userId

    const pending = mergeableFavorites(loadGuestFavorites())
    // One request per sign-in, however many pages are asking: the first copy of
    // the hook starts it and the rest await the same promise.
    let load = loadInFlight.get(userId)
    if (!load) {
      load = pending.length ? favoritesApi.merge(pending) : favoritesApi.get()
      loadInFlight.set(userId, load)
      void load.finally(() => loadInFlight.delete(userId))
    }
    load
      .then((favorites) => {
        applyServerFavorites(favorites)
        if (pending.length) {
          clearGuestFavorites()
          notify('Your saved products moved to your account')
        }
      })
      .catch(() => undefined)
  }, [applyServerFavorites, authenticated, dispatch, notify, session?.user?.id])

  /**
   * A guest's list is written where it changes rather than mirrored from state
   * by an effect: every page holds its own copy of this hook, and an effect
   * would let one copy's pre-hydration empty state overwrite storage before
   * another copy had read it back.
   */
  const setGuestFavorites = useCallback((products: Product[]) => {
    saveGuestFavorites(products)
    dispatch(setFavoriteItems(products))
  }, [dispatch])

  const isFavorite = useCallback(
    (product: Product) =>
      favoriteItems.some((item) => favoriteKey(item) === favoriteKey(product)),
    [favoriteItems],
  )

  const toggleFavorite = useCallback(async (product: Product) => {
    const key = favoriteKey(product)
    const saved = favoriteItems.some((item) => favoriteKey(item) === key)
    if (authenticated && product.slug) {
      try {
        applyServerFavorites(saved
          ? await favoritesApi.remove(product.slug)
          : await favoritesApi.add(product.slug))
        notify(saved ? 'Removed from your favorites' : `${product.name} saved to your favorites`)
      } catch {
        notify(saved ? 'Could not remove that favorite' : 'That product could not be saved')
      }
      return
    }
    setGuestFavorites(saved
      ? favoriteItems.filter((item) => favoriteKey(item) !== key)
      : [product, ...favoriteItems])
    notify(saved ? 'Removed from your favorites' : `${product.name} saved to your favorites`)
  }, [applyServerFavorites, authenticated, favoriteItems, notify, setGuestFavorites])

  const clearFavorites = useCallback(async () => {
    if (authenticated) {
      try {
        await favoritesApi.clear()
      } catch {
        notify('Could not clear your favorites')
        return
      }
      dispatch(setFavoriteItems([]))
    } else {
      setGuestFavorites([])
    }
    notify('Your favorites are empty')
  }, [authenticated, dispatch, notify, setGuestFavorites])

  return {
    clearFavorites,
    favoriteCount: favoriteItems.length,
    favoriteItems,
    isFavorite,
    toggleFavorite,
  }
}
