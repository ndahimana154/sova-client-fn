export const appPaths = {
  home: '/',
  videos: '/videos',
  sellerDashboard: '/seller/dashboard',
  sellerCategories: '/seller/dashboard/product-categories',
  sellerProductCreate: '/seller/dashboard/products/new',
  sellerProductDetails: (id: string) => `/seller/dashboard/products/${id}`,
  sellerProductEdit: (id: string) => `/seller/dashboard/products/${id}/edit`,
  sellerProductMedia: (id: string) => `/seller/dashboard/products/${id}/media`,
  sellerProducts: '/seller/dashboard/products',
} as const
