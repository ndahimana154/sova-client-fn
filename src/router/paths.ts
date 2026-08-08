import { env } from '../config/env'

export const appPaths = {
  // Storefront
  home: '/',
  videos: '/videos',
  login: '/login',
  account: '/account',
  deals: '/deals',
  sell: '/sell',
  search: '/search',
  searchFor: (query: string) => `/search?q=${encodeURIComponent(query)}`,
  productDetails: (slug: string) => `/products/${encodeURIComponent(slug)}`,
  categoryDetails: (slug: string) => `/categories/${encodeURIComponent(slug)}`,
  shopDetails: (slug: string) => `/shops/${encodeURIComponent(slug)}`,

  /** The seller portal is a separate app. */
  sellerPortal: () => env.sellerPortalUrl,
} as const
