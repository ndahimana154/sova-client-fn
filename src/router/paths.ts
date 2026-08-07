export const appPaths = {
  // Storefront
  home: '/',
  videos: '/videos',
  login: '/login',
  account: '/account',
  sell: '/sell',
  search: '/search',
  searchFor: (query: string) => `/search?q=${encodeURIComponent(query)}`,
  productDetails: (slug: string) => `/products/${encodeURIComponent(slug)}`,
  categoryDetails: (slug: string) => `/categories/${encodeURIComponent(slug)}`,
  shopDetails: (slug: string) => `/shops/${encodeURIComponent(slug)}`,

  // Seller dashboard
  sellerDashboard: '/seller/dashboard',
  sellerCategories: '/seller/dashboard/product-categories',
  sellerProductCreate: '/seller/dashboard/products/new',
  sellerProductDetails: (id: string) => `/seller/dashboard/products/${id}`,
  sellerProductEdit: (id: string) => `/seller/dashboard/products/${id}/edit`,
  sellerProducts: '/seller/dashboard/products',
} as const
