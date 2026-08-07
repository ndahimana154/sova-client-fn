import { useCallback, useEffect, useRef, useState } from 'react'
import { marketplaceApi, type MarketplaceVideo } from '../lib/marketplaceApi'

/** Latest marketplace videos, appended a page at a time. */
export function useInfiniteVideos(pageSize = 12) {
  const [videos, setVideos] = useState<MarketplaceVideo[]>([])
  const [page, setPage] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const loadingRef = useRef(false)
  const seen = useRef(new Set<string>())

  const loadPage = useCallback(async (target: number) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError('')
    try {
      const result = await marketplaceApi.videos({ limit: pageSize, page: target })
      const fresh = result.contents.filter((item) => !seen.current.has(item.id))
      fresh.forEach((item) => seen.current.add(item.id))
      setVideos((current) => [...current, ...fresh])
      setHasNextPage(result.meta.hasNextPage)
      setPage(result.meta.page)
    } catch {
      setError('Could not load videos.')
      setHasNextPage(false)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [pageSize])

  useEffect(() => { void loadPage(1) }, [loadPage])

  const loadNext = useCallback(() => {
    if (hasNextPage) void loadPage(page + 1)
  }, [hasNextPage, loadPage, page])

  return { error, hasNextPage, loadNext, loading, videos }
}
