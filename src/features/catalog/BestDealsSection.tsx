import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Product } from '../../data/catalog'
import { marketplaceApi } from '../../lib/marketplaceApi'
import { toStorefrontProduct } from '../../lib/storefrontProduct'
import { ProductCard } from './ProductCard'

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
    let active = true
    marketplaceApi.homepageProducts()
      .then((result) => { if (active) setProducts(result.contents.map(toStorefrontProduct)) })
      .catch(() => { if (active) setProducts([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
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
