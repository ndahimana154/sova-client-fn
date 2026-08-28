import { api } from '../api/request'

export interface BuyerProfile {
  addressHouseNumber: string | null
  addressLabel: string | null
  fullAddress: string | null
  addressLatitude: string | null
  addressLongitude: string | null
  addressPlaceId: string | null
  dateOfBirth: string | null
  email: string
  id: string
  mapsUrl: string | null
  name: string
  phone: string | null
}

export interface UpdateBuyerProfileInput {
  addressHouseNumber?: string
  addressLabel?: string
  addressLatitude?: string
  addressLongitude?: string
  addressPlaceId?: string
  dateOfBirth?: string
  name?: string
  phone?: string
}

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

export const profileApi = {
  get: async () => (await api.get<ApiEnvelope<BuyerProfile>>('/clients/profile/buyer')).data,

  update: async (input: UpdateBuyerProfileInput) =>
    (await api.put<ApiEnvelope<BuyerProfile>, UpdateBuyerProfileInput>(
      '/clients/profile/buyer',
      input,
    )).data,
}
