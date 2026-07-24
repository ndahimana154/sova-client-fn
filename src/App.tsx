import { useState } from 'react'
import { Footer } from './components/layout/Footer'
import { StoreHeader } from './components/layout/StoreHeader'
import { CartDrawer } from './features/cart/CartDrawer'
import type { CartItem } from './features/cart/types'
import { FavoritesDrawer } from './features/favorites/FavoritesDrawer'
import type { Product } from './data/catalog'
import { HomePage } from './pages/home/HomePage'

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [favoriteItems, setFavoriteItems] = useState<Product[]>([])
  const [favoritesOpen, setFavoritesOpen] = useState(false)
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

  function toggleFavorite(product: Product) {
    const isFavorite = favoriteItems.some((item) => item.name === product.name)
    setFavoriteItems((items) => isFavorite
      ? items.filter((item) => item.name !== product.name)
      : [...items, product])
    showMessage(isFavorite ? 'Removed from your favorites' : `${product.name} saved to your favorites`)
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
        favoriteCount={favoriteItems.length}
        onCartOpen={() => setCartOpen(true)}
        onFavoritesOpen={() => setFavoritesOpen(true)}
      />
      <HomePage
        favoriteProductNames={favoriteItems.map((item) => item.name)}
        onAddToCart={addToCart}
        onToggleFavorite={toggleFavorite}
      />
      <Footer />
      {cartOpen && (
        <CartDrawer
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onQuantityChange={changeQuantity}
          onRemove={removeFromCart}
        />
      )}
      {favoritesOpen && (
        <FavoritesDrawer
          items={favoriteItems}
          onAddToCart={addToCart}
          onClose={() => setFavoritesOpen(false)}
          onRemove={toggleFavorite}
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
