import { useCallback, useEffect, useRef, useState } from 'react'
import {
  marketplaceApi,
  type MarketplaceProduct,
  type MarketplaceProductFacets,
  type MarketplaceProductQuery,
  type PaginatedMarketplaceProducts,
} from '../lib/marketplaceApi'

const EMPTY_FACETS: MarketplaceProductFacets = {
  brands: [],
  categories: [],
  onSaleCount: 0,
  price: null,
  shops: [],
  totalMatches: 0,
}

export const PRODUCT_PAGE_SIZE = 20

interface InfiniteProductOptions {
  /**
   * First page the caller already has — the shop endpoint ships one with the
   * shop details, so the list starts filled instead of fetching it again.
   */
  initial?: PaginatedMarketplaceProducts
  /** Pages come from this shop's endpoint instead of the global product list. */
  shopSlug?: string
}

/**
 * Paginated storefront products that append as the caller asks for more.
 * A changed query starts a fresh list rather than appending to the previous one.
 */
export function useInfiniteProducts(
  query: MarketplaceProductQuery = {},
  { initial, shopSlug }: InfiniteProductOptions = {},
) {
  const [products, setProducts] = useState<MarketplaceProduct[]>(initial?.contents ?? [])
  const [page, setPage] = useState(initial?.meta.page ?? 0)
  const [hasNextPage, setHasNextPage] = useState(initial?.meta.hasNextPage ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [facets, setFacets] = useState(initial?.facets ?? EMPTY_FACETS)
  const [suggestions, setSuggestions] = useState<string[]>(initial?.suggestions ?? [])
  const [totalItems, setTotalItems] = useState(initial?.meta.totalItems ?? 0)
  // True once a page has come back, so callers can tell "nothing yet" from "nothing".
  const [loaded, setLoaded] = useState(Boolean(initial))
  const loadingRef = useRef(false)
  const seen = useRef(new Set(initial?.contents.map((item) => item.slug) ?? []))
  const queryKey = JSON.stringify(query)

  useEffect(() => {
    seen.current = new Set(initial?.contents.map((item) => item.slug) ?? [])
    setProducts(initial?.contents ?? [])
    setPage(initial?.meta.page ?? 0)
    setHasNextPage(initial?.meta.hasNextPage ?? true)
    setFacets(initial?.facets ?? EMPTY_FACETS)
    setSuggestions(initial?.suggestions ?? [])
    setTotalItems(initial?.meta.totalItems ?? 0)
    setLoaded(Boolean(initial))
    setError('')
  }, [initial, queryKey, shopSlug])

  const loadPage = useCallback(async (target: number) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError('')
    try {
      const params: MarketplaceProductQuery = {
        limit: PRODUCT_PAGE_SIZE,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...(JSON.parse(queryKey) as MarketplaceProductQuery),
        page: target,
      }
      const result = shopSlug
        ? await marketplaceApi.shopProducts(shopSlug, params)
        : await marketplaceApi.products(params)
      // Paginated lists shift as products are added, so skip anything already shown.
      const fresh = result.contents.filter((item) => !seen.current.has(item.slug))
      fresh.forEach((item) => seen.current.add(item.slug))
      setProducts((current) => [...current, ...fresh])
      setHasNextPage(result.meta.hasNextPage)
      setPage(result.meta.page)
      setTotalItems(result.meta.totalItems)
      // Facets describe the whole match set, so every page carries the same ones.
      if (result.facets) setFacets(result.facets)
      setSuggestions(result.suggestions ?? [])
    } catch {
      setError('Could not load more products.')
      setHasNextPage(false)
    } finally {
      loadingRef.current = false
      setLoaded(true)
      setLoading(false)
    }
  }, [queryKey, shopSlug])

  const loadNext = useCallback(() => { void loadPage(page + 1) }, [loadPage, page])

  return { error, facets, hasNextPage, loadNext, loaded, loading, products, suggestions, totalItems }
}
