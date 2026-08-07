import { ChevronRight, ImageIcon, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { InfiniteProductGrid } from '../../features/catalog/InfiniteProductGrid'
import { useCommerce } from '../../hooks/useCommerce'
import { useProductNavigation } from '../../hooks/useProductNavigation'
import { marketplaceApi, type MarketplaceCategory } from '../../lib/marketplaceApi'
import { mediaUrl } from '../../lib/mediaUrl'
import { appPaths } from '../../router/paths'

export function MarketplaceCategoryPage() {
  const { slug = '' } = useParams()
  const { addToCart, favoriteProductNames, toggleFavorite } = useCommerce()
  const openProduct = useProductNavigation()
  const [category, setCategory] = useState<MarketplaceCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    marketplaceApi.category(slug)
      .then(setCategory)
      .catch(() => setError('This category could not be found.'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <main className="page-container section-space">
        <p className="flex items-center justify-center gap-2 py-20 text-sm text-muted">
          <Loader2 className="animate-spin" size={16} /> Loading category…
        </p>
      </main>
    )
  }

  if (error || !category) {
    return (
      <main className="page-container section-space">
        <p className="rounded-2xl border border-dashed border-line bg-soft/40 px-4 py-16 text-center text-sm text-muted">
          {error || 'This category could not be found.'}
        </p>
      </main>
    )
  }

  return (
    <main className="page-container section-space">
      <div className="overflow-hidden rounded-[28px] border border-line bg-soft">
        <div className="relative grid h-44 place-items-center sm:h-60">
          {category.imageUrl
            ? <img alt="" className="size-full object-cover" src={mediaUrl(category.imageUrl)} />
            : <ImageIcon className="text-muted" size={40} />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2d1709]/75 via-[#2d1709]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <h1 className="text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">{category.name}</h1>
          </div>
        </div>
      </div>

      {category.children.length > 0 && (
        <nav className="mt-5 flex flex-wrap gap-2">
          {category.children.map((child) => (
            <Link
              className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-bold text-ink transition hover:border-primary hover:text-primary-dark"
              key={child.id}
              to={appPaths.categoryDetails(child.slug)}
            >
              {child.name} <ChevronRight size={13} />
            </Link>
          ))}
        </nav>
      )}

      <div className="mt-8">
        <InfiniteProductGrid
          emptyMessage={`No products in ${category.name} yet.`}
          favoriteProductNames={favoriteProductNames}
          onAdd={addToCart}
          onFavorite={toggleFavorite}
          onOpen={openProduct}
          query={{ categorySlug: category.slug }}
        />
      </div>
    </main>
  )
}
