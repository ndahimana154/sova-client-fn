import { useCallback, useEffect, useRef, useState } from 'react'
import { marketplaceApi, type MarketplaceProduct, type MarketplaceProductQuery } from '../lib/marketplaceApi'

const PAGE_SIZE = 20

/**
 * Paginated storefront products that append as the caller asks for more.
 * A changed query starts a fresh list rather than appending to the previous one.
 */
export function useInfiniteProducts(query: MarketplaceProductQuery = {}) {
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [page, setPage] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const loadingRef = useRef(false)
  const seen = useRef(new Set<string>())
  const queryKey = JSON.stringify(query)

  useEffect(() => {
    seen.current = new Set()
    setProducts([])
    setPage(0)
    setHasNextPage(true)
    setError('')
  }, [queryKey])

  const loadPage = useCallback(async (target: number) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError('')
    try {
      const result = await marketplaceApi.products({
        limit: PAGE_SIZE,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...(JSON.parse(queryKey) as MarketplaceProductQuery),
        page: target,
      })
      // Paginated lists shift as products are added, so skip anything already shown.
      const fresh = result.contents.filter((item) => !seen.current.has(item.slug))
      fresh.forEach((item) => seen.current.add(item.slug))
      setProducts((current) => [...current, ...fresh])
      setHasNextPage(result.meta.hasNextPage)
      setPage(result.meta.page)
    } catch {
      setError('Could not load more products.')
      setHasNextPage(false)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [queryKey])

  const loadNext = useCallback(() => { void loadPage(page + 1) }, [loadPage, page])

  return { error, hasNextPage, loadNext, loading, products }
}
