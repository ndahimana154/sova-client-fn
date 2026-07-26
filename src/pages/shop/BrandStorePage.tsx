import { BadgeCheck, ChevronLeft, PackageCheck, ShieldCheck, Star, Truck } from 'lucide-react'
import type { Product } from '../../data/catalog'
import { ProductCard } from '../../features/catalog/ProductCard'

interface BrandStorePageProps {
  allProducts: Product[]
  brand: string
  favoriteProductNames: string[]
  onAddToCart: (product: Product) => void
  onProductOpen: (product: Product) => void
  onToggleFavorite: (product: Product) => void
}

export function BrandStorePage({
  allProducts,
  brand,
  favoriteProductNames,
  onAddToCart,
  onProductOpen,
  onToggleFavorite,
}: BrandStorePageProps) {
  const brandProducts = allProducts.filter((product) => (product.brand ?? 'SOVA Select') === brand)
  const averageRating = brandProducts.length
    ? brandProducts.reduce((total, product) => total + product.rating, 0) / brandProducts.length
    : 0

  return (
    <main>
      <section className="border-b border-line bg-[#fbf3e8]">
        <div className="page-container py-8 sm:py-12">
          <a className="inline-flex items-center gap-2 text-xs font-bold text-muted transition hover:text-primary-dark" href="#">
            <ChevronLeft size={16} /> Back to shopping
          </a>
          <div className="mt-8 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="grid size-20 shrink-0 place-items-center rounded-3xl bg-ink text-2xl font-black text-white shadow-xl">
                {brand.split(' ').map((word) => word[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold text-primary-dark"><BadgeCheck size={16} /> Official SOVA store</p>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] text-ink sm:text-4xl">{brand}</h1>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                  <Star className="fill-primary text-primary" size={14} />
                  <strong className="text-ink">{averageRating.toFixed(1)}</strong>
                  <span>seller rating</span>
                </div>
              </div>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted">
              Shop authentic products supplied directly by {brand}, with protected payments and delivery support from SOVA.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="page-container grid gap-4 py-6 sm:grid-cols-3">
          <StorePromise icon={<BadgeCheck size={18} />} label="Verified seller" />
          <StorePromise icon={<PackageCheck size={18} />} label="Authenticity checked" />
          <StorePromise icon={<Truck size={18} />} label="Supported delivery" />
        </div>
      </section>

      <section className="page-container py-12 sm:py-16">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="auth-eyebrow">From the official store</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-ink">{brand} products</h2>
          </div>
          <span className="text-xs text-muted">{brandProducts.length} {brandProducts.length === 1 ? 'product' : 'products'}</span>
        </div>

        {brandProducts.length > 0 ? (
          <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {brandProducts.map((product) => (
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
          <div className="mt-8 rounded-2xl border border-line bg-soft p-8 text-center">
            <ShieldCheck className="mx-auto text-muted" size={26} />
            <p className="mt-3 text-sm font-bold text-ink">This store has no available products right now.</p>
          </div>
        )}
      </section>
    </main>
  )
}

function StorePromise({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-3 rounded-xl bg-soft px-4 py-3 text-xs font-bold text-ink">
      <span className="text-primary-dark">{icon}</span>{label}
    </span>
  )
}
