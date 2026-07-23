import { useState } from 'react'
import { BrandStrip } from './components/BrandStrip'
import { CategoryRail } from './components/CategoryRail'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Newsletter } from './components/Newsletter'
import { ProductSection } from './components/ProductSection'
import { PromoGrid } from './components/PromoGrid'
import { StoreHeader } from './components/StoreHeader'
import { homeProducts, products } from './data/catalog'

export default function App() {
  const [cartCount, setCartCount] = useState(0)
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [message, setMessage] = useState('')

  function update(kind: 'cart' | 'favorite') {
    if (kind === 'cart') setCartCount((count) => count + 1)
    else setFavoriteCount((count) => count + 1)
    setMessage(kind === 'cart' ? 'Added to your cart' : 'Saved to your favorites')
    window.setTimeout(() => setMessage(''), 1800)
  }

  return (
    <div className="min-h-screen bg-white text-ink">
      <StoreHeader cartCount={cartCount} favoriteCount={favoriteCount} />
      <main>
        <Hero />
        <CategoryRail />
        <ProductSection eyebrow="Handpicked this week" id="deals" onAdd={() => update('cart')} onFavorite={() => update('favorite')} products={products} title="Today’s best deals" />
        <PromoGrid />
        <BrandStrip />
        <ProductSection eyebrow="Make room for good design" onAdd={() => update('cart')} onFavorite={() => update('favorite')} products={homeProducts} title="Home, thoughtfully chosen" />
        <Newsletter />
      </main>
      <Footer />
      {message && <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-white shadow-xl">{message}</div>}
    </div>
  )
}
