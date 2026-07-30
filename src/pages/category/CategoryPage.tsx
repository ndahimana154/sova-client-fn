import { PackageSearch } from 'lucide-react'
import { categories, type Product } from '../../data/catalog'
import { ProductCard } from '../../features/catalog/ProductCard'

interface CategoryPageProps {
  allProducts: Product[]
  category: string
  favoriteProductNames: string[]
  onAddToCart: (product: Product) => void
  onCategoryOpen: (category: string) => void
  onProductOpen: (product: Product) => void
  onToggleFavorite: (product: Product) => void
}

export function CategoryPage({
  allProducts,
  category,
  favoriteProductNames,
  onAddToCart,
  onCategoryOpen,
  onProductOpen,
  onToggleFavorite,
}: CategoryPageProps) {
  const matchingProducts = filterProducts(allProducts, category)
  const categoryDetails = categories.find((item) => normalizeCategory(item.name) === normalizeCategory(category))

  return (
    <main className="min-h-[65vh]">
      <section className="border-b border-line bg-soft/60">
        <div className="page-container py-8 sm:py-12">
          <div className="flex items-center gap-5">
            {categoryDetails && (
              <div className="size-20 shrink-0 overflow-hidden rounded-3xl bg-white sm:size-24">
                <img alt="" className="size-full object-cover" src={categoryDetails.image} />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black tracking-[-0.045em] text-ink sm:text-4xl">{category}</h1>
              <p className="mt-2 text-sm text-cream">{matchingProducts.length} {matchingProducts.length === 1 ? 'product' : 'products'} available</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-10 sm:py-14">
        {matchingProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
            {matchingProducts.map((product) => (
              <ProductCard
                isFavorite={favoriteProductNames.includes(product.name)}
                key={product.name}
                onAdd={onAddToCart}
                onFavorite={onToggleFavorite}
                onOpen={onProductOpen}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-line bg-soft/70 px-6 py-14 text-center">
            <PackageSearch className="mx-auto text-muted" size={32} />
            <h2 className="mt-4 text-lg font-black text-ink">No products in {category} yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">This category is ready for new arrivals. Browse all products while sellers prepare more listings.</p>
            <button className="primary-button mt-5" onClick={() => onCategoryOpen('All products')} type="button">Browse all products</button>
          </div>
        )}
      </section>
    </main>
  )
}

function filterProducts(products: Product[], category: string) {
  if (category === 'All products' || category === 'New arrivals') return products
  const normalizedCategory = normalizeCategory(category)
  return products.filter((product) => normalizeCategory(product.category) === normalizedCategory)
}

function normalizeCategory(category: string) {
  const normalized = category.toLowerCase().replace('&', 'and').trim()
  if (normalized === 'home' || normalized === 'home and living') return 'home'
  return normalized
}
