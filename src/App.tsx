import { useEffect, useState } from 'react'
import { Footer } from './components/layout/Footer'
import { StoreHeader } from './components/layout/StoreHeader'
import { CartDrawer } from './features/cart/CartDrawer'
import type { CartItem } from './features/cart/types'
import { FavoritesDrawer } from './features/favorites/FavoritesDrawer'
import { homeProducts, products, type Product } from './data/catalog'
import {
  clearClientSession,
  isSeller,
  loadClientSession,
  loginClient,
  registerBuyer,
  type ClientSession,
} from './lib/clientAuth'
import { AccountPage } from './pages/account/AccountPage'
import { AuthPage, type AuthMode } from './pages/auth/AuthPage'
import { CategoryPage } from './pages/category/CategoryPage'
import { HomePage } from './pages/home/HomePage'
import { ProductDetailPage } from './pages/product/ProductDetailPage'
import { SellerApplicationPage } from './pages/seller/SellerApplicationPage'
import { SellerDashboardPage } from './pages/seller/SellerDashboardPage'
import { SearchPage } from './pages/search/SearchPage'
import { BrandStorePage } from './pages/shop/BrandStorePage'

type Page =
  | 'home'
  | 'account'
  | 'category'
  | 'product'
  | 'search'
  | 'seller'
  | 'seller-dashboard'
  | 'shop'
  | AuthMode
const allProducts = [...products, ...homeProducts]

function productFromHash() {
  if (!window.location.hash.startsWith('#product/')) return undefined
  const productName = decodeURIComponent(window.location.hash.slice('#product/'.length))
  return allProducts.find((product) => product.name === productName)
}

function brandFromHash() {
  if (!window.location.hash.startsWith('#shop/')) return undefined
  return decodeURIComponent(window.location.hash.slice('#shop/'.length))
}

function categoryFromHash() {
  if (!window.location.hash.startsWith('#category/')) return undefined
  return decodeURIComponent(window.location.hash.slice('#category/'.length))
}

function searchFromHash() {
  if (!window.location.hash.startsWith('#search/')) return undefined
  return decodeURIComponent(window.location.hash.slice('#search/'.length))
}

function pageFromLocation(session: ClientSession | null): Page {
  if (window.location.pathname.startsWith('/seller/dashboard')) {
    return isSeller(session) ? 'seller-dashboard' : session ? 'home' : 'login'
  }
  if (window.location.hash === '#login') return 'login'
  if (window.location.hash === '#signup') return 'signup'
  if (window.location.hash === '#account') {
    return session ? 'account' : 'login'
  }
  if (window.location.hash === '#sell') {
    return session ? 'seller' : 'login'
  }
  if (productFromHash()) return 'product'
  if (brandFromHash()) return 'shop'
  if (categoryFromHash()) return 'category'
  if (searchFromHash()) return 'search'
  return 'home'
}

export default function App() {
  const [session, setSession] = useState<ClientSession | null>(loadClientSession)
  const [page, setPage] = useState<Page>(() => pageFromLocation(loadClientSession()))
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(productFromHash)
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(brandFromHash)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(categoryFromHash)
  const [searchQuery, setSearchQuery] = useState<string | undefined>(searchFromHash)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [favoriteItems, setFavoriteItems] = useState<Product[]>([])
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [message, setMessage] = useState('')

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  useEffect(() => {
    function handleLocationChange() {
      const currentSession = loadClientSession()
      setSession(currentSession)
      setSelectedProduct(productFromHash())
      setSelectedBrand(brandFromHash())
      setSelectedCategory(categoryFromHash())
      setSearchQuery(searchFromHash())
      setPage(pageFromLocation(currentSession))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('hashchange', handleLocationChange)
    window.addEventListener('popstate', handleLocationChange)
    return () => {
      window.removeEventListener('hashchange', handleLocationChange)
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [])

  useEffect(() => {
    if (window.location.pathname.startsWith('/seller/dashboard') && !isSeller(session)) {
      window.history.replaceState(null, '', session ? '/' : '/#login')
      setPage(session ? 'home' : 'login')
      if (session) showMessage('Seller access is required for that page')
    }
  }, [session])

  function showMessage(text: string) {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 1800)
  }

  function addToCart(product: Product, quantity = 1) {
    setCartItems((items) => {
      const existingItem = items.find((item) => item.product.name === product.name)
      if (existingItem) {
        return items.map((item) => item.product.name === product.name ? { ...item, quantity: item.quantity + quantity } : item)
      }
      return [...items, { product, quantity }]
    })
    showMessage(`${quantity > 1 ? `${quantity} × ` : ''}${product.name} added to your cart`)
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

  async function authenticate(mode: AuthMode, email: string, password: string) {
    if (mode === 'signup') {
      await registerBuyer(email, password)
    }
    const nextSession = await loginClient(email, password)
    setSession(nextSession)
    localStorage.setItem('sova-account-settings', JSON.stringify({
      email: nextSession.user.email,
      name: nextSession.user.name || '',
    }))

    if (isSeller(nextSession)) {
      setPage('seller-dashboard')
      window.history.pushState(null, '', '/seller/dashboard')
      showMessage('Welcome to your seller workspace')
      return
    }

    setPage('home')
    window.history.pushState(null, '', '/')
    showMessage('Welcome to SOVA')
  }

  function logout() {
    clearClientSession()
    setSession(null)
    setPage('home')
    window.history.pushState(null, '', '/')
    showMessage('You have been logged out')
  }

  function openProduct(product: Product) {
    setSelectedProduct(product)
    setPage('product')
    window.location.hash = `product/${encodeURIComponent(product.name)}`
  }

  function openBrand(brand: string) {
    setSelectedBrand(brand)
    setPage('shop')
    window.location.hash = `shop/${encodeURIComponent(brand)}`
  }

  function openCategory(category: string) {
    setSelectedCategory(category)
    setPage('category')
    window.location.hash = `category/${encodeURIComponent(category)}`
  }

  function searchProducts(query: string) {
    setSearchQuery(query)
    setPage('search')
    window.location.hash = `search/${encodeURIComponent(query)}`
  }

  function openSellerApplication() {
    if (session) {
      window.location.hash = 'sell'
      return
    }
    window.location.hash = 'login'
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

  if (page === 'seller-dashboard' && session && isSeller(session)) {
    return (
      <SellerDashboardPage
        onLogout={logout}
        onStorefrontOpen={() => {
          window.history.pushState(null, '', '/')
          setPage('home')
        }}
        user={session.user}
      />
    )
  }

  return (
    <div className="min-h-screen bg-white text-ink">
      <StoreHeader
        accountActive={page === 'account'}
        authenticated={Boolean(session)}
        cartCount={cartCount}
        favoriteCount={favoriteItems.length}
        onAccountOpen={() => {
          window.location.hash = 'account'
        }}
        onCartOpen={() => setCartOpen(true)}
        onCategoryOpen={openCategory}
        onFavoritesOpen={() => setFavoritesOpen(true)}
        onLoginOpen={() => {
          window.location.hash = 'login'
        }}
        onSearch={searchProducts}
        onSignupOpen={() => {
          window.location.hash = 'signup'
        }}
        onSellerDashboardOpen={() => {
          window.history.pushState(null, '', '/seller/dashboard')
          setPage('seller-dashboard')
        }}
        seller={isSeller(session)}
      />
      {page === 'account' ? (
        <AccountPage onLogout={logout} onSaved={() => showMessage('Your settings have been saved')} />
      ) : page === 'product' && selectedProduct ? (
        <ProductDetailPage
          allProducts={allProducts}
          favoriteProductNames={favoriteItems.map((item) => item.name)}
          key={selectedProduct.name}
          onAddToCart={addToCart}
          onBrandOpen={openBrand}
          onProductOpen={openProduct}
          onToggleFavorite={toggleFavorite}
          product={selectedProduct}
        />
      ) : page === 'shop' && selectedBrand ? (
        <BrandStorePage
          allProducts={allProducts}
          brand={selectedBrand}
          favoriteProductNames={favoriteItems.map((item) => item.name)}
          key={selectedBrand}
          onAddToCart={addToCart}
          onProductOpen={openProduct}
          onToggleFavorite={toggleFavorite}
        />
      ) : page === 'seller' ? (
        <SellerApplicationPage onBack={() => { window.location.hash = '' }} />
      ) : page === 'category' && selectedCategory ? (
        <CategoryPage
          allProducts={allProducts}
          category={selectedCategory}
          favoriteProductNames={favoriteItems.map((item) => item.name)}
          key={selectedCategory}
          onAddToCart={addToCart}
          onCategoryOpen={openCategory}
          onProductOpen={openProduct}
          onToggleFavorite={toggleFavorite}
        />
      ) : page === 'search' && searchQuery ? (
        <SearchPage
          favoriteProductNames={favoriteItems.map((item) => item.name)}
          key={searchQuery}
          onAddToCart={addToCart}
          onProductOpen={openProduct}
          onToggleFavorite={toggleFavorite}
          products={allProducts}
          query={searchQuery}
        />
      ) : (
        <HomePage
          favoriteProductNames={favoriteItems.map((item) => item.name)}
          onAddToCart={addToCart}
          onBrandOpen={openBrand}
          onCategoryOpen={openCategory}
          onProductOpen={openProduct}
          onToggleFavorite={toggleFavorite}
        />
      )}
      <Footer onSellOnSova={openSellerApplication} />
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
