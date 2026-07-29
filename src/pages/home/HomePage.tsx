import type { Product } from '../../data/catalog'
import { homeProducts, products } from '../../data/catalog'
import { BrandStrip } from '../../features/catalog/BrandStrip'
import { CategoryRail } from '../../features/catalog/CategoryRail'
import { ProductSection } from '../../features/catalog/ProductSection'
import { Hero } from './Hero'
import { Newsletter } from './Newsletter'
import { PromoGrid } from './PromoGrid'

interface HomePageProps {
  favoriteProductNames: string[]
  onAddToCart: (product: Product) => void
  onBrandOpen: (brand: string) => void
  onCategoryOpen: (category: string) => void
  onProductOpen: (product: Product) => void
  onToggleFavorite: (product: Product) => void
}

export function HomePage({ favoriteProductNames, onAddToCart, onBrandOpen, onCategoryOpen, onProductOpen, onToggleFavorite }: HomePageProps) {
  return (
    <main>
      <ProductSection
        eyebrow="Handpicked this week"
        favoriteProductNames={favoriteProductNames}
        id="deals"
        onAdd={onAddToCart}
        onFavorite={onToggleFavorite}
        onOpen={onProductOpen}
        products={products}
        title="Today’s best deals"
      />
      <CategoryRail onCategoryOpen={onCategoryOpen} />
      <Hero />
      <PromoGrid />
      <BrandStrip onBrandOpen={onBrandOpen} />
      <ProductSection
        eyebrow="Make room for good design"
        favoriteProductNames={favoriteProductNames}
        onAdd={onAddToCart}
        onFavorite={onToggleFavorite}
        onOpen={onProductOpen}
        products={homeProducts}
        title="Home, thoughtfully chosen"
      />
      <Newsletter />
    </main>
  )
}
