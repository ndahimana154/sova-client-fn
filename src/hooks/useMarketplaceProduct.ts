import { useEffect, useState } from 'react'
import { marketplaceApi, type MarketplaceProduct } from '../lib/marketplaceApi'

interface State {
  error: string
  loading: boolean
  product: MarketplaceProduct | null
}

/** Loads one storefront product by slug. */
export function useMarketplaceProduct(slug: string | undefined): State {
  const [state, setState] = useState<State>({ error: '', loading: Boolean(slug), product: null })

  useEffect(() => {
    if (!slug) {
      setState({ error: '', loading: false, product: null })
      return
    }
    let active = true
    setState({ error: '', loading: true, product: null })
    marketplaceApi.product(slug)
      .then((product) => { if (active) setState({ error: '', loading: false, product }) })
      .catch(() => {
        if (active) setState({ error: 'This product could not be found.', loading: false, product: null })
      })
    return () => { active = false }
  }, [slug])

  return state
}
