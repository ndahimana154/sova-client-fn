import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { CartDrawer } from '../../features/cart/CartDrawer'
import { FavoritesDrawer } from '../../features/favorites/FavoritesDrawer'
import { useCommerce } from '../../hooks/useCommerce'
import { isSeller } from '../../lib/clientAuth'
import { appPaths } from '../../router/paths'
import { setCartOpen, setFavoritesOpen } from '../../store/commerceSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { Footer } from './Footer'
import { StoreHeader } from './StoreHeader'

/** Shared storefront chrome. Every buyer route renders inside this. */
export function StorefrontLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const session = useAppSelector((state) => state.auth.session)
  const { cartOpen, favoritesOpen } = useAppSelector((state) => state.commerce)
  const toast = useAppSelector((state) => state.ui.toast)
  const {
    addToCart,
    cartCount,
    cartItems,
    changeQuantity,
    clearFavorites,
    favoriteCount,
    favoriteItems,
    removeFromCart,
    toggleFavorite,
  } = useCommerce()

  return (
    <div className="min-h-screen bg-white text-ink">
      <StoreHeader
        accountActive={location.pathname === appPaths.account}
        authenticated={Boolean(session)}
        cartCount={cartCount}
        favoriteCount={favoriteCount}
        onCartOpen={() => dispatch(setCartOpen(true))}
        onFavoritesOpen={() => dispatch(setFavoritesOpen(true))}
        onSearch={(query) => navigate(appPaths.searchFor(query))}
        seller={isSeller(session)}
      />

      <Outlet />

      <Footer />

      {cartOpen && (
        <CartDrawer
          items={cartItems}
          onClose={() => dispatch(setCartOpen(false))}
          onQuantityChange={changeQuantity}
          onRemove={removeFromCart}
        />
      )}
      {favoritesOpen && (
        <FavoritesDrawer
          items={favoriteItems}
          onAddToCart={addToCart}
          onClear={clearFavorites}
          onClose={() => dispatch(setFavoritesOpen(false))}
          onRemove={toggleFavorite}
        />
      )}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}
