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
  category: { id: string; name: string; parentId: string | null; slug: string }
  createdAt: string
  description: string
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

/** Product summary carried by every video, so a card renders without a second call. */
export interface MarketplaceVideoProduct {
  brand: string | null
  category: { id: string; name: string; slug: string }
  discount: number
  finalPrice: number
  id: string
  imageUrl: string | null
  name: string
  price: number
  quantity: number
  shop: { id: string; name: string; slug: string }
  slug: string
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK'
}

export interface MarketplaceVideo {
  altText: string | null
  likeCount: number
  liked: boolean
  durationSeconds: number | null
  id: string
  isPrimary: boolean
  mediaType: 'IMAGE' | 'VIDEO'
  position: number
  product: MarketplaceVideoProduct
  productSlug: string
  url: string
}

export interface PaginatedVideos {
  contents: MarketplaceVideo[]
  meta: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    limit: number
    page: number
    totalItems: number
    totalPages: number
  }
}

export interface VideoLikeState {
  likeCount: number
  liked: boolean
}

export interface VideoCommentAuthor {
  id: string
  name: string
  profile: string | null
}

export interface VideoComment {
  author: VideoCommentAuthor
  content: string
  createdAt: string
  id: string
  mediaId: string
  parentId: string | null
  replyCount: number
}

export interface PaginatedComments {
  contents: VideoComment[]
  meta: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    limit: number
    page: number
    totalItems: number
    totalPages: number
  }
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
  videos: async (query: { limit?: number; page?: number } = {}) =>
    (await api.get<ApiEnvelope<PaginatedVideos>>('/buyer/product-videos', { params: query })).data,
  setVideoLike: async (mediaId: string, liked: boolean) => {
    const url = `/buyer/product-videos/${mediaId}/like`
    const response = liked
      ? await api.put<ApiEnvelope<VideoLikeState>>(url)
      : await api.delete<ApiEnvelope<VideoLikeState>>(url)
    return response.data
  },
  videoComments: async (mediaId: string, query: { limit?: number; page?: number; parentId?: string } = {}) =>
    (await api.get<ApiEnvelope<PaginatedComments>>(`/buyer/product-videos/${mediaId}/comments`, { params: query })).data,
  postVideoComment: async (mediaId: string, input: { content: string; parentId?: string }) =>
    (await api.post<ApiEnvelope<VideoComment>, typeof input>(`/buyer/product-videos/${mediaId}/comments`, input)).data,
  product: async (slug: string) =>
    (await api.get<ApiEnvelope<MarketplaceProduct>>(`/buyer/products/${slug}`)).data,
  products: async (query: MarketplaceProductQuery = {}) =>
    (await api.get<ApiEnvelope<PaginatedMarketplaceProducts>>('/buyer/products', { params: query })).data,
}

export function flattenCategories(tree: MarketplaceCategory[]): MarketplaceCategory[] {
  return tree.flatMap((category) => [category, ...flattenCategories(category.children)])
}
