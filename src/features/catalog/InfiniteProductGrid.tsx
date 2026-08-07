import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { Product } from '../../data/catalog'
import { useInfiniteProducts } from '../../hooks/useInfiniteProducts'
import type { MarketplaceProduct, MarketplaceProductQuery } from '../../lib/marketplaceApi'
import { mediaUrl } from '../../lib/mediaUrl'
import { ProductCard } from './ProductCard'

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
  const { error, hasNextPage, loadNext, loading, products } = useInfiniteProducts(query ?? {})
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
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
        {products.map((item) => {
          const product = toStorefrontProduct(item)
          return (
            <ProductCard
              isFavorite={favoriteProductNames.includes(product.name)}
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
