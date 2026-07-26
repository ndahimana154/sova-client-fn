import { SectionHeader } from '../../components/ui/SectionHeader'
import type { Product } from '../../data/catalog'
import { ProductCard } from './ProductCard'

interface ProductSectionProps {
  eyebrow?: string
  favoriteProductNames: string[]
  id?: string
  onAdd: (product: Product) => void
  onFavorite: (product: Product) => void
  onOpen: (product: Product) => void
  products: Product[]
  title: string
}

export function ProductSection({ eyebrow, favoriteProductNames, id, onAdd, onFavorite, onOpen, products, title }: ProductSectionProps) {
  return (
    <section className="page-container section-space" id={id}>
      <SectionHeader eyebrow={eyebrow} title={title} />
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
        {products.map((product) => (
          <ProductCard
            isFavorite={favoriteProductNames.includes(product.name)}
            key={product.name}
            onAdd={onAdd}
            onFavorite={onFavorite}
            onOpen={onOpen}
            product={product}
          />
        ))}
      </div>
    </section>
  )
}
