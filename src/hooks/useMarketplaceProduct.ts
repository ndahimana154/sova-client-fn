import { useEffect, useState } from 'react'
import { marketplaceApi, type MarketplaceProduct, type MarketplaceVideo } from '../lib/marketplaceApi'

interface State {
  error: string
  loading: boolean
  product: MarketplaceProduct | null
}

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
      .catch(() => undefined)
    return () => { active = false }
  }, [slug])

  return videos
}
