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

// Seller dashboard screens.
const SellerProductCategoriesPage = lazy(() => import('../pages/seller/products/SellerProductCategoriesPage').then((m) => ({ default: m.SellerProductCategoriesPage })))
const SellerProductCreatePage = lazy(() => import('../pages/seller/products/SellerProductCreatePage').then((m) => ({ default: m.SellerProductCreatePage })))
const SellerProductDetailsPage = lazy(() => import('../pages/seller/products/SellerProductDetailsPage').then((m) => ({ default: m.SellerProductDetailsPage })))
const SellerProductEditPage = lazy(() => import('../pages/seller/products/SellerProductEditPage').then((m) => ({ default: m.SellerProductEditPage })))
const SellerProductListPage = lazy(() => import('../pages/seller/products/SellerProductListPage').then((m) => ({ default: m.SellerProductListPage })))

interface AppRoutesProps {
  /** Login screen — rendered without the storefront chrome. */
  authScreen: ReactNode
  requireSeller: (screen: ReactNode) => ReactNode
  sellerApplication: ReactNode
  sellerLayout: ReactNode
}

export function AppRoutes({ authScreen, requireSeller, sellerApplication, sellerLayout }: AppRoutesProps) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={sellerLayout} path="seller/dashboard">
          <Route element={<SellerDashboardHome />} index />
          <Route element={<SellerProductListPage />} path="products" />
          <Route element={<SellerProductCreatePage />} path="products/new" />
          <Route element={<SellerProductDetailsPage />} path="products/:productId" />
          <Route element={<SellerProductEditPage />} path="products/:productId/edit" />
          <Route element={<SellerProductCategoriesPage />} path="product-categories" />
          <Route element={<Navigate replace to={appPaths.sellerDashboard} />} path="*" />
        </Route>

        <Route element={authScreen} path="login" />
        <Route element={<VideoDiscoveryPage />} path="videos" />

        <Route element={<StorefrontLayout />}>
          <Route element={<HomePage />} index />
          <Route element={requireSeller(<AccountPage />)} path="account" />
          <Route element={sellerApplication} path="sell" />
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

function SellerDashboardHome() {
  return <div className="grid min-h-[calc(100vh-101px)] place-items-center bg-[#fffaf3] p-6"><h1 className="text-center text-3xl font-bold tracking-[-0.04em] text-ink">Seller Dashboard</h1></div>
}
