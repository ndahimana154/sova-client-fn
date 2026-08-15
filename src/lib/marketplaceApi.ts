import { api } from '../api/request'

export interface MarketplaceCategory {
  children: MarketplaceCategory[]
  id: string
  imageUrl: string | null
  name: string
  slug: string
}

export type StockStatus = 'IN_STOCK' | 'OUT_OF_STOCK'

export interface MarketplaceMedia {
  altText: string | null
  durationSeconds: number | null
  id: string
  isPrimary: boolean
  mediaType: 'IMAGE' | 'VIDEO'
  mimeType: string
  position: number
  sizeBytes: number
  url: string
  /** The SKU this shot belongs to; null when it shows them all. */
  variantId: string | null
}

export interface MarketplaceCategoryRef {
  id: string
  name: string
  parentId: string | null
  slug: string
}

/** One option axis of a product, e.g. Colour with ["Blue", "Red"]. */
export interface MarketplaceAttribute {
  id: string
  name: string
  values: string[]
}

/** What one SKU carries on each of the product's option axes. */
export interface MarketplaceVariantAttribute {
  attributeId: string
  name: string
  value: string
}

/** A sellable SKU. Only the product detail endpoint ships these. */
export interface MarketplaceVariant {
  attributes: MarketplaceVariantAttribute[]
  barcode: string | null
  discountPercent: number | null
  id: string
  isActive: boolean
  isDefault: boolean
  isPlaceholder: boolean
  name: string | null
  price: number
  salePrice: number
  sku: string
  stockQuantity: number
  stockStatus: StockStatus
}

export interface MarketplaceProduct {
  /** Option axes. Empty on list endpoints. */
  attributes: MarketplaceAttribute[]
  brand: string | null
  brandSlug: string | null
  categories: MarketplaceCategoryRef[]
  createdAt: string
  description: string
  /** Percentage off `listPrice`, 0 when the quoted price is not discounted. */
  discountPercent: number
  /** Pre-discount price behind `price`, for a "was" line. */
  listPrice: number
  /** Highest sale price across variants; equals `price` on a one-SKU product. */
  maxPrice: number
  media: MarketplaceMedia[]
  name: string
  /** Lowest sale price across variants — what a listing quotes. */
  price: number
  quantity: number
  shop: { id: string; name: string; slug: string }
  slug: string
  stockStatus: StockStatus
  updatedAt: string
  /** 1 means a simple product with nothing to choose. */
  variantCount: number
  /** Sellable SKUs. Empty on list endpoints. */
  variants: MarketplaceVariant[]
}

/** Product summary carried by every video, so a card renders without a second call. */
export interface MarketplaceVideoProduct {
  brand: string | null
  discountPercent: number
  id: string
  imageUrl: string | null
  listPrice: number
  name: string
  price: number
  quantity: number
  shop: { id: string; name: string; slug: string }
  slug: string
  stockStatus: StockStatus
}

export interface MarketplaceVideo extends MarketplaceMedia {
  likeCount: number
  liked: boolean
  product: MarketplaceVideoProduct
  productSlug: string
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

export interface MarketplaceVillage {
  cell: {
    id: string
    name: string
    sector: {
      district: { id: string; name: string; province: { id: string; name: string } | null } | null
      id: string
      name: string
    } | null
  } | null
  id: string
  name: string
}

export interface MarketplaceShop {
  coverImage: string | null
  description: string | null
  email: string | null
  googleMapsLocationLink: string | null
  id: string
  latitude: string | null
  logo: string | null
  longitude: string | null
  name: string
  phone: string | null
  productCount: number
  slug: string
  street: string | null
  village: MarketplaceVillage | null
  zip: string | null
}

/** Shop endpoint response, which ships the first page of the shop's products. */
export interface MarketplaceShopDetails extends MarketplaceShop {
  products: PaginatedMarketplaceProducts
}

export interface MarketplaceShopQuery {
  limit?: number
  page?: number
  search?: string
  villageId?: string
}

export interface PaginatedMarketplaceShops {
  contents: MarketplaceShop[]
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
  /** Comma-separated brand names. */
  brands?: string
  categoryId?: string
  /** Comma-separated category IDs; each also matches its sub-categories. */
  categoryIds?: string
  categorySlug?: string
  limit?: number
  maxPrice?: number
  minPrice?: number
  onSale?: boolean
  page?: number
  search?: string
  shopSlug?: string
  /** Comma-separated shop slugs. */
  shopSlugs?: string
  sortBy?: 'relevance' | 'name' | 'price' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  stockStatus?: StockStatus
}

export interface MarketplaceFacetValue {
  count: number
  id: string
  name: string
  slug: string
}

/**
 * Counts behind the filter sidebar. Every dimension is counted with the other
 * filters applied but its own ignored, so picking one option never hides the
 * rest of that list.
 */
export interface MarketplaceProductFacets {
  brands: { count: number; name: string }[]
  categories: MarketplaceFacetValue[]
  onSaleCount: number
  price: { max: number; min: number } | null
  shops: MarketplaceFacetValue[]
  totalMatches: number
}

export interface PaginatedMarketplaceProducts {
  contents: MarketplaceProduct[]
  facets: MarketplaceProductFacets
  meta: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    limit: number
    page: number
    totalItems: number
    totalPages: number
  }
  /** Alternative spellings to offer when a search returns little or nothing. */
  suggestions: string[]
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
    (await api.get<ApiEnvelope<MarketplaceProduct>>(`/buyer/products/${encodeURIComponent(slug)}`)).data,
  productVideos: async (slug: string, query: { limit?: number; page?: number } = {}) =>
    (await api.get<ApiEnvelope<PaginatedVideos>>(
      `/buyer/products/${encodeURIComponent(slug)}/videos`,
      { params: query },
    )).data,
  products: async (query: MarketplaceProductQuery = {}) =>
    (await api.get<ApiEnvelope<PaginatedMarketplaceProducts>>('/buyer/products', { params: query })).data,
  shops: async (query: MarketplaceShopQuery = {}) =>
    (await api.get<ApiEnvelope<PaginatedMarketplaceShops>>('/buyer/shops', { params: query })).data,
  shop: async (slug: string, query: MarketplaceProductQuery = {}) =>
    (await api.get<ApiEnvelope<MarketplaceShopDetails>>(`/buyer/shops/${encodeURIComponent(slug)}`, { params: query })).data,
  shopProducts: async (slug: string, query: MarketplaceProductQuery = {}) =>
    (await api.get<ApiEnvelope<PaginatedMarketplaceProducts>>(
      `/buyer/shops/${encodeURIComponent(slug)}/products`,
      { params: query },
    )).data,
}

export function flattenCategories(tree: MarketplaceCategory[]): MarketplaceCategory[] {
  return tree.flatMap((category) => [category, ...flattenCategories(category.children)])
}
