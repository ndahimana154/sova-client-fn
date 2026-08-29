import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../data/catalog'
import { savePendingPurchase } from '../lib/pendingPurchase'
import { appPaths } from '../router/paths'

/** Sends one product straight to checkout. No basket, no intermediate step. */
export function useBuyNow() {
  const navigate = useNavigate()

  return useCallback(
    (product: Product, quantity = 1, options: string[] = []) => {
      savePendingPurchase({ options, product, quantity: Math.max(1, quantity) })
      navigate(appPaths.checkout)
    },
    [navigate],
  )
}
