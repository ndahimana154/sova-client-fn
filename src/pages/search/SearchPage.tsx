import { ChevronLeft, SearchX } from 'lucide-react'
import type { Product } from '../../data/catalog'
import { ProductCard } from '../../features/catalog/ProductCard'
import { useSearchParams } from 'react-router-dom'
import { homeProducts, products as catalogProducts } from '../../data/catalog'
import { useCommerce } from '../../hooks/useCommerce'
import { useProductNavigation } from '../../hooks/useProductNavigation'

const allCatalogProducts = [...catalogProducts, ...homeProducts]

export function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get('q') ?? ''
  const products = allCatalogProducts
  const { addToCart, favoriteProductNames, toggleFavorite } = useCommerce()
  const openProduct = useProductNavigation()
  const results = searchProducts(products, query)

  return (
    <main className="min-h-[65vh]">
      <section className="border-b border-line bg-soft/60">
        <div className="page-container py-8 sm:py-12">
          <a className="inline-flex items-center gap-2 text-xs font-bold text-muted transition hover:text-primary-dark" href="#"><ChevronLeft size={16} /> Back to shopping</a>
          <p className="mt-7 auth-eyebrow">Search SOVA</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] text-ink sm:text-4xl">Results for “{query}”</h1>
          <p className="mt-2 text-sm text-muted">{results.length} {results.length === 1 ? 'product found' : 'products found'}</p>
        </div>
      </section>
      <section className="page-container py-10 sm:py-14">
        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
            {results.map((product) => (
              <ProductCard isFavorite={favoriteProductNames.includes(product.name)} key={product.name} onAdd={addToCart} onFavorite={toggleFavorite} onOpen={openProduct} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-line bg-soft/70 px-6 py-14 text-center">
            <SearchX className="mx-auto text-muted" size={34} />
            <h2 className="mt-4 text-lg font-black text-ink">No products matched “{query}”</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">Try a product name, category such as Electronics, or a brand such as Nuru Home.</p>
            <a className="primary-button mt-5" href="#">Browse all products</a>
          </div>
        )}
      </section>
    </main>
  )
}

function searchProducts(products: Product[], query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  return products.filter((product) => {
    const searchable = `${product.name} ${product.category} ${product.brand ?? ''}`.toLowerCase()
    return terms.every((term) => searchable.includes(term))
  })
}
