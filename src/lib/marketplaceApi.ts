import { api } from '../api/request'

export interface MarketplaceCategory {
  children: MarketplaceCategory[]
  id: string
  imageUrl: string | null
  name: string
  slug: string
}

export interface MarketplaceMedia {
  altText: string | null
  id: string
  isPrimary: boolean
  mediaType: 'IMAGE' | 'VIDEO'
  position: number
  url: string
}

export interface MarketplaceProduct {
  brand: string | null
  category: { id: string; name: string; parentId: string | null }
  createdAt: string
  discount: number
  finalPrice: number
  media: MarketplaceMedia[]
  name: string
  price: number
  quantity: number
  shop: { id: string; name: string; slug: string }
  slug: string
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK'
  variants: Record<string, string>
}

export interface MarketplaceProductQuery {
  categoryId?: string
  categorySlug?: string
  limit?: number
  page?: number
  search?: string
  shopSlug?: string
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedMarketplaceProducts {
  contents: MarketplaceProduct[]
  meta: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    limit: number
    page: number
    totalItems: number
    totalPages: number
  }
}

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

export interface HomepageProduct extends MarketplaceProduct {
  position: number | null
  source: 'CURATED' | 'LATEST'
}

export const marketplaceApi = {
  homepageProducts: async () =>
    (await api.get<ApiEnvelope<{ contents: HomepageProduct[] }>>('/buyer/homepage-products')).data,
  recordProductView: async (slug: string, input: { referrer?: string; visitorId: string }, idempotencyKey: string) =>
    (await api.post<ApiEnvelope<{ recorded: boolean }>, typeof input>(
      `/buyer/products/${slug}/views`,
      input,
      { headers: { 'Idempotency-Key': idempotencyKey } },
    )).data,
  categories: async () =>
    (await api.get<ApiEnvelope<MarketplaceCategory[]>>('/buyer/product-categories')).data,
  category: async (slug: string) =>
    (await api.get<ApiEnvelope<MarketplaceCategory>>(`/buyer/product-categories/${slug}`)).data,
  products: async (query: MarketplaceProductQuery = {}) =>
    (await api.get<ApiEnvelope<PaginatedMarketplaceProducts>>('/buyer/products', { params: query })).data,
}

export function flattenCategories(tree: MarketplaceCategory[]): MarketplaceCategory[] {
  return tree.flatMap((category) => [category, ...flattenCategories(category.children)])
}
