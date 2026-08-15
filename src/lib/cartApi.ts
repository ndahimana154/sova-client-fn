import { api } from '../api/request'

export interface ServerCartVariantAttribute {
  name: string
  value: string
}

export interface ServerCartItem {
  lineTotal: number
  product: {
    availableQuantity: number
    brand: string | null
    discountPercent: number
    image: { url: string } | null
    listPrice: number
    name: string
    price: number
    slug: string
    variant: {
      attributes: ServerCartVariantAttribute[]
      id: string
      sku: string
    }
  }
  quantity: number
}

export interface ServerCart {
  items: ServerCartItem[]
  total: number
  totalDistinctItems: number
  totalQuantity: number
  updatedAt: string
}

/** What the API needs to put one SKU in a cart. */
export interface CartLineInput {
  productSlug: string
  quantity: number
  /** Optional only for a product that sells as exactly one version. */
  variantId?: string
}

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

export const cartApi = {
  get: async () => (await api.get<ApiEnvelope<ServerCart>>('/buyer/cart')).data,
  add: async (input: CartLineInput) =>
    (await api.post<ApiEnvelope<ServerCart>, CartLineInput>('/buyer/cart/items', input)).data,
  merge: async (items: CartLineInput[]) =>
    (await api.post<ApiEnvelope<ServerCart>, { items: CartLineInput[] }>('/buyer/cart/merge', { items })).data,
  remove: async (variantId: string) =>
    (await api.delete<ApiEnvelope<ServerCart>>(`/buyer/cart/items/${variantId}`)).data,
  clear: async () => (await api.delete<ApiEnvelope<null>>('/buyer/cart')).data,
}
