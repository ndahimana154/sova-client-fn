import { BrandStrip } from '../../features/catalog/BrandStrip'
import { BestDealsSection } from '../../features/catalog/BestDealsSection'
import { NewlyStockedSection } from '../../features/catalog/NewlyStockedSection'
import { useCommerce } from '../../hooks/useCommerce'
import { useProductNavigation } from '../../hooks/useProductNavigation'
import { Hero } from './Hero'

export function HomePage() {
  const { addToCart, isFavorite, toggleFavorite } = useCommerce()
  const openProduct = useProductNavigation()
  return (
    <main>
      <BestDealsSection
        isFavorite={isFavorite}
        onAdd={addToCart}
        onFavorite={toggleFavorite}
        onOpen={openProduct}
      />
      <Hero />
      <BrandStrip />
      <NewlyStockedSection
        isFavorite={isFavorite}
        onAdd={addToCart}
        onFavorite={toggleFavorite}
        onOpen={openProduct}
      />
    </main>
  )
}
