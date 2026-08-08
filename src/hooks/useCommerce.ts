import { useCallback } from 'react'
import { useAppDispatch } from '../store/hooks'
import { setToast } from '../store/uiSlice'
import { useCart } from './useCart'
import { useFavorites } from './useFavorites'

/**
 * Cart and favourites for storefront pages. Pages call this instead of taking
 * handlers as props, so routes can render them without prop drilling.
 */
export function useCommerce() {
  const dispatch = useAppDispatch()
  const { addToCart, cartCount, cartItems, changeQuantity, removeFromCart } = useCart()
  const {
    clearFavorites,
    favoriteCount,
    favoriteItems,
    isFavorite,
    toggleFavorite,
  } = useFavorites()

  const notify = useCallback((text: string) => {
    dispatch(setToast(text))
    window.setTimeout(() => dispatch(setToast('')), 1800)
  }, [dispatch])

  return {
    addToCart,
    cartCount,
    cartItems,
    changeQuantity,
    clearFavorites,
    favoriteCount,
    favoriteItems,
    isFavorite,
    notify,
    removeFromCart,
    toggleFavorite,
  }
}
