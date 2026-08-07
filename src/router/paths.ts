export const appPaths = {
  home: '/',
  videos: '/videos',
  sellerDashboard: '/seller/dashboard',
  sellerCategories: '/seller/dashboard/product-categories',
  sellerProductCreate: '/seller/dashboard/products/new',
  sellerProductDetails: (id: string) => `/seller/dashboard/products/${id}`,
  sellerProductEdit: (id: string) => `/seller/dashboard/products/${id}/edit`,
  sellerProducts: '/seller/dashboard/products',
} as const
