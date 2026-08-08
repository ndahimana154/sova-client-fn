import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PRODUCT_PAGE_SIZE } from '../../hooks/useInfiniteProducts'
import type { MarketplaceProductQuery } from '../../lib/marketplaceApi'

export type SortKey = 'relevance' | 'newest' | 'price-asc' | 'price-desc' | 'name'

export const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'relevance', label: 'Best match' },
  { key: 'newest', label: 'Newest arrivals' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'name', label: 'Name: A to Z' },
]

/** Multi-select filters, and the short URL key each one is stored under. */
const multiKeys = { brands: 'brand', categoryIds: 'cat', shopSlugs: 'shop' } as const

export type MultiFilter = keyof typeof multiKeys

export interface SearchFilterState {
  brands: string[]
  categoryIds: string[]
  /** Kept as typed, so a half-entered bound does not fire a request. */
  maxPrice: string
  minPrice: string
  onSale: boolean
  query: string
  shopSlugs: string[]
  sort: SortKey
}

const sortParams: Record<SortKey, Pick<MarketplaceProductQuery, 'sortBy' | 'sortOrder'>> = {
  name: { sortBy: 'name', sortOrder: 'asc' },
  newest: { sortBy: 'createdAt', sortOrder: 'desc' },
  'price-asc': { sortBy: 'price', sortOrder: 'asc' },
  'price-desc': { sortBy: 'price', sortOrder: 'desc' },
  relevance: { sortBy: 'relevance', sortOrder: 'desc' },
}

const list = (params: URLSearchParams, key: string) =>
  (params.get(key) ?? '').split(',').map((value) => value.trim()).filter(Boolean)

/**
 * Every filter lives in the URL, so a filtered result page can be shared,
 * bookmarked and stepped back out of like any other page.
 */
export function useSearchFilters() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const requestedSort = params.get('sort') as SortKey | null
  // Without a search term there is nothing to be relevant to, so newest stands in.
  const fallback: SortKey = query.trim() ? 'relevance' : 'newest'
  const usable = sortOptions.some((option) => option.key === requestedSort)
    && !(requestedSort === 'relevance' && !query.trim())
  const sort: SortKey = usable ? (requestedSort as SortKey) : fallback

  const filters: SearchFilterState = useMemo(() => ({
    brands: list(params, multiKeys.brands),
    categoryIds: list(params, multiKeys.categoryIds),
    maxPrice: params.get('max') ?? '',
    minPrice: params.get('min') ?? '',
    onSale: params.get('sale') === '1',
    query,
    shopSlugs: list(params, multiKeys.shopSlugs),
    sort,
  }), [params, query, sort])

  const update = useCallback((mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params)
    mutate(next)
    setParams(next, { replace: true })
  }, [params, setParams])

  /** Writes params together: two separate writes would each start from the old URL. */
  const setValues = useCallback((values: Record<string, string>) => {
    update((next) => {
      for (const [key, value] of Object.entries(values)) {
        if (value) next.set(key, value)
        else next.delete(key)
      }
    })
  }, [update])

  const setValue = useCallback((key: string, value: string) => {
    setValues({ [key]: value })
  }, [setValues])

  const toggle = useCallback((filter: MultiFilter, value: string) => {
    const key = multiKeys[filter]
    update((next) => {
      const current = list(next, key)
      const kept = current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value]
      if (kept.length) next.set(key, kept.join(','))
      else next.delete(key)
    })
  }, [update])

  const clearAll = useCallback(() => {
    update((next) => {
      for (const key of [...Object.values(multiKeys), 'min', 'max', 'sale']) next.delete(key)
    })
  }, [update])

  const activeCount =
    filters.brands.length + filters.categoryIds.length + filters.shopSlugs.length +
    (filters.onSale ? 1 : 0) + (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0)

  const productQuery: MarketplaceProductQuery = useMemo(() => ({
    ...sortParams[filters.sort],
    ...(filters.brands.length ? { brands: filters.brands.join(',') } : {}),
    ...(filters.categoryIds.length ? { categoryIds: filters.categoryIds.join(',') } : {}),
    ...(filters.shopSlugs.length ? { shopSlugs: filters.shopSlugs.join(',') } : {}),
    ...(filters.minPrice ? { minPrice: Number(filters.minPrice) } : {}),
    ...(filters.maxPrice ? { maxPrice: Number(filters.maxPrice) } : {}),
    ...(filters.onSale ? { onSale: true } : {}),
    limit: PRODUCT_PAGE_SIZE,
    search: filters.query.trim() || undefined,
  }), [filters])

  return { activeCount, clearAll, filters, productQuery, setValue, setValues, toggle }
}
