import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { SellerProductCategoriesPage } from '../pages/seller/products/SellerProductCategoriesPage'
import { SellerProductCreatePage } from '../pages/seller/products/SellerProductCreatePage'
import { SellerProductDetailsPage } from '../pages/seller/products/SellerProductDetailsPage'
import { SellerProductEditPage } from '../pages/seller/products/SellerProductEditPage'
import { SellerProductListPage } from '../pages/seller/products/SellerProductListPage'
import { VideoDiscoveryPage } from '../pages/videos/VideoDiscoveryPage'
import { appPaths } from './paths'

export function AppRoutes({ sellerLayout, storefront }: { sellerLayout: ReactNode; storefront: ReactNode }) {
  return (
    <Routes>
      <Route path="seller/dashboard" element={sellerLayout}>
        <Route index element={<SellerDashboardHome />} />
        <Route path="products" element={<SellerProductListPage />} />
        <Route path="products/new" element={<SellerProductCreatePage />} />
        <Route path="products/:productId" element={<SellerProductDetailsPage />} />
        <Route path="products/:productId/edit" element={<SellerProductEditPage />} />
        <Route path="product-categories" element={<SellerProductCategoriesPage />} />
        <Route path="*" element={<Navigate replace to={appPaths.sellerDashboard} />} />
      </Route>
      <Route path="videos" element={<VideoDiscoveryPage />} />
      <Route path="*" element={storefront} />
    </Routes>
  )
}

function SellerDashboardHome() {
  return <div className="grid min-h-[calc(100vh-101px)] place-items-center bg-[#fffaf3] p-6"><h1 className="text-center text-3xl font-bold tracking-[-0.04em] text-ink">Seller Dashboard</h1></div>
}
