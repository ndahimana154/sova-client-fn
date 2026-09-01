import { Suspense, lazy, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AccountLayout } from '../components/layout/AccountLayout'
import { StorefrontLayout } from '../components/layout/StorefrontLayout'
import { appPaths } from './paths'

// Storefront screens. Each one owns a real URL, which keeps them crawlable and
// makes reloads and shared links land in the right place.
const HomePage = lazy(() => import('../pages/home/HomePage').then((m) => ({ default: m.HomePage })))
const LoginRedirect = lazy(() => import('../features/auth/LoginRedirect').then((m) => ({ default: m.LoginRedirect })))
const AccountTermsPage = lazy(() => import('../pages/account/AccountTermsPage').then((m) => ({ default: m.AccountTermsPage })))
const AccountDeliveryTermsPage = lazy(() => import('../pages/account/AccountDeliveryTermsPage').then((m) => ({ default: m.AccountDeliveryTermsPage })))
const AccountPage = lazy(() => import('../pages/account/AccountPage').then((m) => ({ default: m.AccountPage })))
const MarketplaceCategoryPage = lazy(() => import('../pages/category/MarketplaceCategoryPage').then((m) => ({ default: m.MarketplaceCategoryPage })))
const ProductDetailPage = lazy(() => import('../pages/product/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })))
const SearchPage = lazy(() => import('../pages/search/SearchPage').then((m) => ({ default: m.SearchPage })))
const BrandStorePage = lazy(() => import('../pages/shop/BrandStorePage').then((m) => ({ default: m.BrandStorePage })))
const VideoDiscoveryPage = lazy(() => import('../pages/videos/VideoDiscoveryPage').then((m) => ({ default: m.VideoDiscoveryPage })))
const CheckoutPage = lazy(() => import('../pages/checkout/CheckoutPage').then((m) => ({ default: m.CheckoutPage })))
const TermsPage = lazy(() => import('../pages/legal/TermsPage').then((m) => ({ default: m.TermsPage })))
const DeliveryTermsPage = lazy(() => import('../pages/legal/DeliveryTermsPage').then((m) => ({ default: m.DeliveryTermsPage })))
const OrdersPage = lazy(() => import('../pages/orders/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const OrderDetailPage = lazy(() => import('../pages/orders/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })))
const TrackOrderPage = lazy(() => import('../pages/orders/TrackOrderPage').then((m) => ({ default: m.TrackOrderPage })))


interface AppRoutesProps {
  requireSession: (screen: ReactNode) => ReactNode
}

export function AppRoutes({ requireSession }: AppRoutesProps) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<VideoDiscoveryPage />} path="videos" />

        <Route element={<StorefrontLayout />}>
          <Route element={<HomePage />} index />
          <Route element={<LoginRedirect />} path="login" />
          <Route element={<TermsPage />} path="terms" />
          <Route element={<DeliveryTermsPage />} path="delivery-terms" />
          <Route element={requireSession(<AccountLayout />)}>
            <Route element={<AccountPage />} path="account" />
            <Route element={<AccountTermsPage />} path="account/terms" />
            <Route element={<AccountDeliveryTermsPage />} path="account/delivery-terms" />
          </Route>
          <Route element={<CheckoutPage />} path="checkout" />
          <Route element={requireSession(<OrdersPage />)} path="orders" />
          <Route element={requireSession(<OrderDetailPage />)} path="orders/:orderNumber" />
          <Route element={<TrackOrderPage />} path="track" />
          <Route element={<TrackOrderPage />} path="track/:token" />
          <Route element={<SearchPage />} path="search" />
          <Route element={<ProductDetailPage />} path="products/:slug" />
          <Route element={<MarketplaceCategoryPage />} path="categories/:slug" />
          <Route element={<BrandStorePage />} path="shops/:slug" />
          <Route element={<Navigate replace to={appPaths.home} />} path="*" />
        </Route>
      </Routes>
    </Suspense>
  )
}

function RouteFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <span className="size-8 animate-spin rounded-full border-2 border-line border-t-primary" />
    </div>
  )
}
