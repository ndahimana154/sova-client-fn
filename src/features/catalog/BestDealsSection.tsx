import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Product } from '../../data/catalog'
import { marketplaceApi, type HomepageProduct } from '../../lib/marketplaceApi'
import { mediaUrl } from '../../lib/mediaUrl'
import { ProductCard } from './ProductCard'

const PLACEHOLDER = '/images/storefront-hero.png'

interface BestDealsSectionProps {
  isFavorite: (product: Product) => boolean
  onAdd: (product: Product) => void
  onFavorite: (product: Product) => void
  onOpen: (product: Product) => void
}

export function BestDealsSection({ isFavorite, onAdd, onFavorite, onOpen }: BestDealsSectionProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    marketplaceApi.homepageProducts()
      .then((result) => setProducts(result.contents.map(toProduct)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && !products.length) return null

  return (
    <section className="page-container section-space" id="deals">
      <div className="mb-5">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-dark">Handpicked this week</p>
        <h2 className="text-2xl font-black tracking-[-0.04em] text-ink sm:text-3xl">Today’s best deals</h2>
      </div>
      {loading
        ? (
          <p className="flex items-center justify-center gap-2 py-12 text-xs text-muted">
            <Loader2 className="animate-spin" size={15} /> Loading picks…
          </p>
        )
        : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
            {products.map((product, index) => (
              <ProductCard
                isFavorite={isFavorite(product)}
                key={product.slug ?? `${product.name}-${index}`}
                onAdd={onAdd}
                onFavorite={onFavorite}
                onOpen={onOpen}
                product={product}
              />
            ))}
          </div>
        )}
    </section>
  )
}

function toProduct(item: HomepageProduct): Product {
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
