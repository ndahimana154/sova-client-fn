import type { Product } from '../../data/catalog'
import { BrandStrip } from '../../features/catalog/BrandStrip'
import { CategoryRail } from '../../features/catalog/CategoryRail'
import { BestDealsSection } from '../../features/catalog/BestDealsSection'
import { NewlyStockedSection } from '../../features/catalog/NewlyStockedSection'
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
      <BestDealsSection
        favoriteProductNames={favoriteProductNames}
        onAdd={onAddToCart}
        onFavorite={onToggleFavorite}
        onOpen={onProductOpen}
      />
      <CategoryRail onCategoryOpen={onCategoryOpen} />
      <Hero />
      <PromoGrid />
      <BrandStrip onBrandOpen={onBrandOpen} />
      <NewlyStockedSection
        favoriteProductNames={favoriteProductNames}
        onAdd={onAddToCart}
        onFavorite={onToggleFavorite}
        onOpen={onProductOpen}
      />
      <Newsletter />
    </main>
  )
}
