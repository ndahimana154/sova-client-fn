import { useEffect, useState } from 'react'
import { Footer } from './components/layout/Footer'
import { StoreHeader } from './components/layout/StoreHeader'
import { CartDrawer } from './features/cart/CartDrawer'
import type { CartItem } from './features/cart/types'
import { FavoritesDrawer } from './features/favorites/FavoritesDrawer'
import type { Product } from './data/catalog'
import { AccountPage } from './pages/account/AccountPage'
import { AuthPage, type AuthMode } from './pages/auth/AuthPage'
import { HomePage } from './pages/home/HomePage'

type Page = 'home' | 'account' | AuthMode

function pageFromHash(): Page {
  if (window.location.hash === '#login') return 'login'
  if (window.location.hash === '#signup') return 'signup'
  if (window.location.hash === '#account') {
    return localStorage.getItem('sova-authenticated') === 'true' ? 'account' : 'login'
  }
  return 'home'
}

export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [favoriteItems, setFavoriteItems] = useState<Product[]>([])
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [message, setMessage] = useState('')

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  useEffect(() => {
    function handleHashChange() {
      setPage(pageFromHash())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

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

  function authenticate(name?: string, email?: string) {
    localStorage.setItem('sova-authenticated', 'true')
    if (name || email) {
      try {
        const current = JSON.parse(localStorage.getItem('sova-account-settings') || '{}')
        localStorage.setItem('sova-account-settings', JSON.stringify({ ...current, name: name || current.name || '', email: email || current.email || '' }))
      } catch {
        localStorage.setItem('sova-account-settings', JSON.stringify({ name: name || '', email: email || '' }))
      }
    }
    setPage('account')
    window.location.hash = 'account'
    showMessage('Welcome to SOVA')
  }

  if (page === 'login' || page === 'signup') {
    return (
      <AuthPage
        mode={page}
        onAuthenticate={authenticate}
        onModeChange={(mode) => {
          setPage(mode)
          window.location.hash = mode
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-white text-ink">
      <StoreHeader
        accountActive={page === 'account'}
        cartCount={cartCount}
        favoriteCount={favoriteItems.length}
        onAccountOpen={() => {
          window.location.hash = localStorage.getItem('sova-authenticated') === 'true' ? 'account' : 'login'
        }}
        onCartOpen={() => setCartOpen(true)}
        onFavoritesOpen={() => setFavoritesOpen(true)}
      />
      {page === 'account' ? (
        <AccountPage onSaved={() => showMessage('Your settings have been saved')} />
      ) : (
        <HomePage
          favoriteProductNames={favoriteItems.map((item) => item.name)}
          onAddToCart={addToCart}
          onToggleFavorite={toggleFavorite}
        />
      )}
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
