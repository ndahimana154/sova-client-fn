import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Product } from '../../data/catalog'
import {
  marketplaceApi,
  type MarketplaceProduct,
  type MarketplaceProductQuery,
} from '../../lib/marketplaceApi'
import { mediaUrl } from '../../lib/mediaUrl'
import { ProductCard } from './ProductCard'

const PAGE_SIZE = 20
const PLACEHOLDER = '/images/storefront-hero.png'

export function toStorefrontProduct(item: MarketplaceProduct): Product {
  const cover = item.media.find((media) => media.isPrimary && media.mediaType === 'IMAGE')
    ?? item.media.find((media) => media.mediaType === 'IMAGE')
  return {
    badge: item.discount > 0 ? `${item.discount}% off` : undefined,
    brand: item.brand ?? undefined,
    category: item.category.name,
    image: cover ? mediaUrl(cover.url) : PLACEHOLDER,
    name: item.name,
    oldPrice: item.discount > 0 ? item.price : undefined,
    price: item.finalPrice,
    rating: 0,
    reviews: 0,
    slug: item.slug,
  }
}

interface InfiniteProductGridProps {
  emptyMessage?: string
  favoriteProductNames: string[]
  onAdd: (product: Product) => void
  onFavorite: (product: Product) => void
  onOpen: (product: Product) => void
  query?: MarketplaceProductQuery
}

/** Product grid that pulls the next page as the visitor nears the bottom. */
export function InfiniteProductGrid({
  emptyMessage = 'No products here yet.',
  favoriteProductNames,
  onAdd,
  onFavorite,
  onOpen,
  query,
}: InfiniteProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const sentinel = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const seen = useRef(new Set<string>())
  const queryKey = JSON.stringify(query ?? {})

  // A different query is a different list: reset rather than append to the old one.
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
      const fresh = result.contents.filter((item) => !seen.current.has(item.slug))
      fresh.forEach((item) => seen.current.add(item.slug))
      setProducts((current) => [...current, ...fresh.map(toStorefrontProduct)])
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

  useEffect(() => {
    const node = sentinel.current
    if (!node || !hasNextPage) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) void loadPage(page + 1) },
      { rootMargin: '400px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, loadPage, page])

  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
        {products.map((product, index) => (
          <ProductCard
            isFavorite={favoriteProductNames.includes(product.name)}
            key={product.slug ?? `${product.name}-${index}`}
            onAdd={onAdd}
            onFavorite={onFavorite}
            onOpen={onOpen}
            product={product}
          />
        ))}
      </div>

      {!products.length && !loading && !error && (
        <p className="rounded-2xl border border-dashed border-line bg-soft/40 px-4 py-12 text-center text-sm text-muted">
          {emptyMessage}
        </p>
      )}

      <div className="pt-8 text-center" ref={sentinel}>
        {loading && (
          <p className="inline-flex items-center gap-2 text-xs text-muted">
            <Loader2 className="animate-spin" size={15} /> Loading more products…
          </p>
        )}
        {error && (
          <button className="secondary-button" onClick={() => { setHasNextPage(true); void loadPage(page + 1) }} type="button">
            {error} Try again
          </button>
        )}
      </div>
    </>
  )
}
