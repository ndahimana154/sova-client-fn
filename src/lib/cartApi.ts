import { api } from '../api/request'

export interface ServerCartItem {
  lineDiscount: number
  lineSubtotal: number
  lineTotal: number
  product: {
    availableQuantity: number
    brand: string | null
    discount: number
    finalPrice: number
    image: { url: string } | null
    name: string
    price: number
    slug: string
  }
  quantity: number
}

export interface ServerCart {
  discountTotal: number
  items: ServerCartItem[]
  subtotal: number
  total: number
  totalDistinctItems: number
  totalQuantity: number
}

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

export const cartApi = {
  get: async () => (await api.get<ApiEnvelope<ServerCart>>('/buyer/cart')).data,
  add: async (productSlug: string, quantity = 1) =>
    (await api.post<ApiEnvelope<ServerCart>, { productSlug: string; quantity: number }>(
      '/buyer/cart/items',
      { productSlug, quantity },
    )).data,
  merge: async (items: Array<{ productSlug: string; quantity: number }>) =>
    (await api.post<ApiEnvelope<ServerCart>, { items: typeof items }>('/buyer/cart/merge', { items })).data,
  remove: async (productSlug: string) =>
    (await api.delete<ApiEnvelope<ServerCart>>(`/buyer/cart/items/${productSlug}`)).data,
  clear: async () => (await api.delete<ApiEnvelope<null>>('/buyer/cart')).data,
}
