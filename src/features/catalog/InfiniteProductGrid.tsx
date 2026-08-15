import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { Product } from '../../data/catalog'
import { useInfiniteProducts } from '../../hooks/useInfiniteProducts'
import type {
  MarketplaceProductQuery,
  PaginatedMarketplaceProducts,
} from '../../lib/marketplaceApi'
import { toStorefrontProduct } from '../../lib/storefrontProduct'
import { ProductCard } from './ProductCard'

interface InfiniteProductGridProps {
  className?: string
  emptyMessage?: string
  isFavorite: (product: Product) => boolean
  initial?: PaginatedMarketplaceProducts
  onAdd: (product: Product) => void
  onFavorite: (product: Product) => void
  onOpen: (product: Product) => void
  query?: MarketplaceProductQuery
  shopSlug?: string
}

export function InfiniteProductGrid({
  initial,
  query,
  shopSlug,
  ...rest
}: InfiniteProductGridProps) {
  const feed = useInfiniteProducts(query ?? {}, { initial, shopSlug })
  return <ProductFeed feed={feed} {...rest} />
}

type ProductFeedState = ReturnType<typeof useInfiniteProducts>

interface ProductFeedProps extends Omit<InfiniteProductGridProps, 'initial' | 'query' | 'shopSlug'> {
  feed: ProductFeedState
}

export function ProductFeed({
  className = 'grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5',
  emptyMessage = 'No products here yet.',
  isFavorite,
  feed: { error, hasNextPage, loadNext, loading, products },
  onAdd,
  onFavorite,
  onOpen,
}: ProductFeedProps) {
  const sentinel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = sentinel.current
    if (!node || !hasNextPage) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) loadNext() },
      { rootMargin: '400px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, loadNext])

  return (
    <>
      <div className={className}>
        {products.map((item) => {
          const product = toStorefrontProduct(item)
          return (
            <ProductCard
              isFavorite={isFavorite(product)}
              key={item.slug}
              onAdd={onAdd}
              onFavorite={onFavorite}
              onOpen={onOpen}
              product={product}
            />
          )
        })}
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
          <button className="secondary-button" onClick={loadNext} type="button">
            {error} Try again
          </button>
        )}
      </div>
    </>
  )
}
