import { useCallback } from 'react'
import type { Product } from '../data/catalog'
import { toggleFavorite as toggleFavoriteItem } from '../store/commerceSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setToast } from '../store/uiSlice'
import { useCart } from './useCart'

/**
 * Cart and favourites for storefront pages. Pages call this instead of taking
 * handlers as props, so routes can render them without prop drilling.
 */
export function useCommerce() {
  const dispatch = useAppDispatch()
  const favoriteItems = useAppSelector((state) => state.commerce.favoriteItems)
  const { addToCart, cartCount, cartItems, changeQuantity, removeFromCart } = useCart()

  const notify = useCallback((text: string) => {
    dispatch(setToast(text))
    window.setTimeout(() => dispatch(setToast('')), 1800)
  }, [dispatch])

  const toggleFavorite = useCallback((product: Product) => {
    const wasFavorite = favoriteItems.some((item) => item.name === product.name)
    dispatch(toggleFavoriteItem(product))
    notify(wasFavorite ? 'Removed from your favorites' : `${product.name} saved to your favorites`)
  }, [dispatch, favoriteItems, notify])

  return {
    addToCart,
    cartCount,
    cartItems,
    changeQuantity,
    favoriteItems,
    favoriteProductNames: favoriteItems.map((item) => item.name),
    notify,
    removeFromCart,
    toggleFavorite,
  }
}
