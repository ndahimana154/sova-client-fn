import { Suspense, lazy, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { StorefrontLayout } from '../components/layout/StorefrontLayout'
import { appPaths } from './paths'

// Storefront screens. Each one owns a real URL, which keeps them crawlable and
// makes reloads and shared links land in the right place.
const HomePage = lazy(() => import('../pages/home/HomePage').then((m) => ({ default: m.HomePage })))
const AccountPage = lazy(() => import('../pages/account/AccountPage').then((m) => ({ default: m.AccountPage })))
const MarketplaceCategoryPage = lazy(() => import('../pages/category/MarketplaceCategoryPage').then((m) => ({ default: m.MarketplaceCategoryPage })))
const ProductDetailPage = lazy(() => import('../pages/product/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })))
const SearchPage = lazy(() => import('../pages/search/SearchPage').then((m) => ({ default: m.SearchPage })))
const BrandStorePage = lazy(() => import('../pages/shop/BrandStorePage').then((m) => ({ default: m.BrandStorePage })))
const VideoDiscoveryPage = lazy(() => import('../pages/videos/VideoDiscoveryPage').then((m) => ({ default: m.VideoDiscoveryPage })))


interface AppRoutesProps {
  /** Login screen — rendered without the storefront chrome. */
  authScreen: ReactNode
  requireSession: (screen: ReactNode) => ReactNode
}

export function AppRoutes({ authScreen, requireSession }: AppRoutesProps) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={authScreen} path="login" />
        <Route element={<VideoDiscoveryPage />} path="videos" />

        <Route element={<StorefrontLayout />}>
          <Route element={<HomePage />} index />
          <Route element={requireSession(<AccountPage />)} path="account" />
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
