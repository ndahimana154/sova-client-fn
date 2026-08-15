import { useEffect, useState } from 'react'
import { marketplaceApi, type MarketplaceProduct, type MarketplaceVideo } from '../lib/marketplaceApi'

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

/**
 * A product's videos, which the product endpoint no longer carries — its media
 * is images only — so the gallery asks for them separately.
 */
export function useProductVideos(slug: string | undefined): MarketplaceVideo[] {
  const [videos, setVideos] = useState<MarketplaceVideo[]>([])

  useEffect(() => {
    if (!slug) {
      setVideos([])
      return
    }
    let active = true
    setVideos([])
    marketplaceApi.productVideos(slug, { limit: 20 })
      .then((result) => { if (active) setVideos(result.contents) })
      // A missing reel must never take the product page down with it.
      .catch(() => undefined)
    return () => { active = false }
  }, [slug])

  return videos
}
