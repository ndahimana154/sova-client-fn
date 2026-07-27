import { api } from '../api/request'

export type ProductStatus = 'DRAFT' | 'SUBMITTED' | 'ACTIVE' | 'REJECTED'
export type StockStatus = 'IN_STOCK' | 'OUT_OF_STOCK'

export interface SellerCategory {
  id: string
  name: string
  parentId: string | null
}

export interface ProductVariant {
  attributes: Record<string, string>
  availableQuantity: number
  compareAtPrice: number | null
  id: string
  isDefault: boolean
  name: string
  price: number
  productId: string
  quantity: number
  reservedQuantity: number
  sku: string
  stockStatus: StockStatus
}

export interface ProductMedia {
  altText: string | null
  durationSeconds: number | null
  id: string
  isPrimary: boolean
  mediaType: 'IMAGE' | 'VIDEO'
  mimeType: string
  position: number
  productId: string
  sizeBytes: number
  url: string
  variantId: string | null
}

export interface SellerProduct {
  availableQuantity: number
  brand: string | null
  category: SellerCategory
  createdAt: string
  defaultVariant: ProductVariant
  description: string
  id: string
  maximumPrice: number
  media: ProductMedia[]
  minimumPrice: number
  name: string
  status: ProductStatus
  stockStatus: StockStatus
  totalQuantity: number
  updatedAt: string
  variants: ProductVariant[]
}

export interface VariantInput {
  attributes: Record<string, string>
  compareAtPrice?: number
  isDefault?: boolean
  name: string
  price: number
  quantity: number
  sku: string
}

export interface ProductListQuery {
  categoryId?: string
  limit?: number
  page?: number
  search?: string
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  status?: string
  stockStatus?: string
}

export interface PaginatedProducts {
  contents: SellerProduct[]
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

export const sellerProductsApi = {
  categories: async () => (await api.get<ApiEnvelope<SellerCategory[]>>('/seller/product-categories')).data,
  list: async (query: ProductListQuery = {}) =>
    (await api.get<ApiEnvelope<PaginatedProducts>>('/seller/products', { params: query })).data,
  get: async (productId: string) =>
    (await api.get<ApiEnvelope<SellerProduct>>(`/seller/products/${productId}`)).data,
  create: async (input: { brand?: string; categoryId: string; description: string; name: string; variants: VariantInput[] }) =>
    (await api.post<ApiEnvelope<SellerProduct>, typeof input>('/seller/products', input)).data,
  update: async (productId: string, input: { brand?: string | null; categoryId?: string; description?: string; name?: string }) =>
    (await api.patch<ApiEnvelope<SellerProduct>, typeof input>(`/seller/products/${productId}`, input)).data,
  delete: (productId: string) => api.delete<ApiEnvelope<null>>(`/seller/products/${productId}`),
  createVariant: async (productId: string, input: VariantInput) =>
    (await api.post<ApiEnvelope<ProductVariant>, VariantInput>(`/seller/products/${productId}/variants`, input)).data,
  updateVariant: async (productId: string, variantId: string, input: Partial<VariantInput>) =>
    (await api.patch<ApiEnvelope<ProductVariant>, Partial<VariantInput>>(`/seller/products/${productId}/variants/${variantId}`, input)).data,
  deleteVariant: (productId: string, variantId: string, newDefaultVariantId?: string) =>
    api.delete<ApiEnvelope<null>>(`/seller/products/${productId}/variants/${variantId}`, { params: { newDefaultVariantId } }),
  setDefault: async (productId: string, variantId: string) =>
    (await api.patch<ApiEnvelope<ProductVariant>>(`/seller/products/${productId}/variants/${variantId}/default`)).data,
  updateStock: async (productId: string, variantId: string, quantity: number, reason: string) =>
    (await api.patch<ApiEnvelope<ProductVariant>, { quantity: number; reason: string }>(
      `/seller/products/${productId}/variants/${variantId}/stock`,
      { quantity, reason },
    )).data,
  submit: async (productId: string) =>
    (await api.post<ApiEnvelope<SellerProduct>>(`/seller/products/${productId}/submit`)).data,
  listMedia: async (productId: string) =>
    (await api.get<ApiEnvelope<ProductMedia[]>>(`/seller/products/${productId}/media`)).data,
  uploadMedia: (productId: string, input: { altText?: string; file: File; isPrimary?: boolean; position?: number; variantId?: string }) => {
    const body = new FormData()
    body.set('file', input.file)
    if (input.altText) body.set('altText', input.altText)
    if (input.variantId) body.set('variantId', input.variantId)
    if (input.position !== undefined) body.set('position', String(input.position))
    if (input.isPrimary !== undefined) body.set('isPrimary', String(input.isPrimary))
    return api.post<ApiEnvelope<ProductMedia>, FormData>(`/seller/products/${productId}/media`, body)
      .then((response) => response.data)
  },
  updateMedia: async (productId: string, mediaId: string, input: { altText?: string | null; isPrimary?: boolean; position?: number }) =>
    (await api.patch<ApiEnvelope<ProductMedia>, typeof input>(`/seller/products/${productId}/media/${mediaId}`, input)).data,
  deleteMedia: (productId: string, mediaId: string, replacementMediaId?: string) =>
    api.delete<ApiEnvelope<null>>(`/seller/products/${productId}/media/${mediaId}`, { params: { replacementMediaId } }),
}
