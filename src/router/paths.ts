import { env } from '../config/env'

export const appPaths = {
  // Storefront
  home: '/',
  videos: '/videos',
  login: '/login',
  account: '/account',
  terms: '/terms',
  deliveryTerms: '/delivery-terms',
  accountTerms: '/account/terms',
  accountDeliveryTerms: '/account/delivery-terms',
  deals: '/deals',
  sell: '/sell',
  search: '/search',
  searchFor: (query: string) => `/search?q=${encodeURIComponent(query)}`,
  checkout: '/checkout',
  orders: '/orders',
  orderDetails: (orderNumber: string) => `/orders/${encodeURIComponent(orderNumber)}`,
  track: '/track',
  trackLink: (token: string) => `/track/${encodeURIComponent(token)}`,
  productDetails: (slug: string) => `/products/${encodeURIComponent(slug)}`,
  categoryDetails: (slug: string) => `/categories/${encodeURIComponent(slug)}`,
  shopDetails: (slug: string) => `/shops/${encodeURIComponent(slug)}`,

  /** The seller portal is a separate app. */
  sellerPortal: () => env.sellerPortalUrl,
} as const
