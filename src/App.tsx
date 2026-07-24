import { useState } from 'react'
import { BrandStrip } from './components/BrandStrip'
import { CartDrawer, type CartItem } from './components/CartDrawer'
import { CategoryRail } from './components/CategoryRail'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Newsletter } from './components/Newsletter'
import { ProductSection } from './components/ProductSection'
import { PromoGrid } from './components/PromoGrid'
import { StoreHeader } from './components/StoreHeader'
import { homeProducts, products, type Product } from './data/catalog'

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [message, setMessage] = useState('')

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  function showMessage(text: string) {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 1800)
  }

  function addToCart(product: Product) {
    setCartItems((items) => {
      const existingItem = items.find((item) => item.product.name === product.name)
      if (existingItem) {
        return items.map((item) => item.product.name === product.name ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...items, { product, quantity: 1 }]
    })
    showMessage(`${product.name} added to your cart`)
  }

  function addFavorite() {
    setFavoriteCount((count) => count + 1)
    showMessage('Saved to your favorites')
  }

  function changeQuantity(productName: string, quantity: number) {
    if (quantity < 1) {
      setCartItems((items) => items.filter((item) => item.product.name !== productName))
      return
    }
    setCartItems((items) => items.map((item) => item.product.name === productName ? { ...item, quantity } : item))
  }

  function removeFromCart(productName: string) {
    setCartItems((items) => items.filter((item) => item.product.name !== productName))
  }

  return (
    <div className="min-h-screen bg-white text-ink">
      <StoreHeader
        cartCount={cartCount}
        favoriteCount={favoriteCount}
        onCartOpen={() => setCartOpen(true)}
      />
      <main>
        <Hero />
        <CategoryRail />
        <ProductSection
          eyebrow="Handpicked this week"
          id="deals"
          onAdd={addToCart}
          onFavorite={addFavorite}
          products={products}
          title="Today’s best deals"
        />
        <PromoGrid />
        <BrandStrip />
        <ProductSection
          eyebrow="Make room for good design"
          onAdd={addToCart}
          onFavorite={addFavorite}
          products={homeProducts}
          title="Home, thoughtfully chosen"
        />
        <Newsletter />
      </main>
      <Footer />
      {cartOpen && (
        <CartDrawer
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onQuantityChange={changeQuantity}
          onRemove={removeFromCart}
        />
      )}
      {message && (
        <div className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-white shadow-xl">
          {message}
        </div>
      )}
    </div>
  )
}
