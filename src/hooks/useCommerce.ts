import { useCallback } from 'react'
import { useAppDispatch } from '../store/hooks'
import { setToast } from '../store/uiSlice'
import { useBuyNow } from './useBuyNow'
import { useFavorites } from './useFavorites'

/**
 * Buying and favourites for storefront pages. Pages call this instead of taking
 * handlers as props, so routes can render them without prop drilling.
 */
export function useCommerce() {
  const dispatch = useAppDispatch()
  const buyNow = useBuyNow()
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
    buyNow,
    clearFavorites,
    favoriteCount,
    favoriteItems,
    isFavorite,
    notify,
    toggleFavorite,
  }
}
