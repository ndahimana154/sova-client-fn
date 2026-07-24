import type { Product } from '../data/catalog'
import { ProductCard } from './ProductCard'
import { SectionHeader } from './SectionHeader'

interface ProductSectionProps {
  eyebrow?: string
  id?: string
  onAdd: (product: Product) => void
  onFavorite: () => void
  products: Product[]
  title: string
}

export function ProductSection({ eyebrow, id, onAdd, onFavorite, products, title }: ProductSectionProps) {
  return (
    <section className="page-container section-space" id={id}>
      <SectionHeader eyebrow={eyebrow} title={title} />
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
        {products.map((product) => <ProductCard key={product.name} onAdd={onAdd} onFavorite={onFavorite} product={product} />)}
      </div>
    </section>
  )
}
