import { useNavigate } from 'react-router-dom'
import { BrandStrip } from '../../features/catalog/BrandStrip'
import { BestDealsSection } from '../../features/catalog/BestDealsSection'
import { NewlyStockedSection } from '../../features/catalog/NewlyStockedSection'
import { useCommerce } from '../../hooks/useCommerce'
import { useProductNavigation } from '../../hooks/useProductNavigation'
import { appPaths } from '../../router/paths'
import { Hero } from './Hero'
import { Newsletter } from './Newsletter'
import { PromoGrid } from './PromoGrid'

export function HomePage() {
  const navigate = useNavigate()
  const { addToCart, favoriteProductNames, toggleFavorite } = useCommerce()
  const openProduct = useProductNavigation()
  return (
    <main>
      <BestDealsSection
        favoriteProductNames={favoriteProductNames}
        onAdd={addToCart}
        onFavorite={toggleFavorite}
        onOpen={openProduct}
      />
      <Hero />
      <PromoGrid />
      <BrandStrip onBrandOpen={(brand) => navigate(appPaths.shopDetails(brand))} />
      <NewlyStockedSection
        favoriteProductNames={favoriteProductNames}
        onAdd={addToCart}
        onFavorite={toggleFavorite}
        onOpen={openProduct}
      />
      <Newsletter />
    </main>
  )
}
