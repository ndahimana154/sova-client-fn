import { api } from '../api/request'

export interface ShippingMethod {
  description: string | null
  estimatedDaysMin: number | null
  estimatedDaysMax: number | null
  id: string
  shippingFee: number
  title: string
}

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

export const shippingApi = {
  list: async () =>
    (await api.get<ApiEnvelope<ShippingMethod[]>>('/shipping-methods')).data,
}
