import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../data/catalog'
import { appPaths } from '../router/paths'

/** Opens a product page. Catalogue entries without a slug have no page yet. */
export function useProductNavigation() {
  const navigate = useNavigate()
  return useCallback((product: Product) => {
    if (!product.slug) return
    navigate(appPaths.productDetails(product.slug))
  }, [navigate])
}
