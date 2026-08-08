import { api } from '../api/request'

export interface ServerFavoriteItem {
  product: {
    availableQuantity: number
    brand: string | null
    category: { id: string; name: string; slug: string }
    discount: number
    finalPrice: number
    image: { url: string } | null
    name: string
    price: number
    shop: { id: string; name: string; slug: string }
    slug: string
    stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK'
  }
  savedAt: string
}

export interface ServerFavorites {
  items: ServerFavoriteItem[]
  outOfStockItems: number
  totalItems: number
}

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

export const favoritesApi = {
  get: async () => (await api.get<ApiEnvelope<ServerFavorites>>('/buyer/favorites')).data,
  add: async (productSlug: string) =>
    (await api.post<ApiEnvelope<ServerFavorites>, { productSlug: string }>(
      '/buyer/favorites/items',
      { productSlug },
    )).data,
  merge: async (items: Array<{ productSlug: string }>) =>
    (await api.post<ApiEnvelope<ServerFavorites>, { items: typeof items }>(
      '/buyer/favorites/merge',
      { items },
    )).data,
  remove: async (productSlug: string) =>
    (await api.delete<ApiEnvelope<ServerFavorites>>(`/buyer/favorites/items/${productSlug}`)).data,
  clear: async () => (await api.delete<ApiEnvelope<null>>('/buyer/favorites')).data,
}
