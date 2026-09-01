import { api } from '../api/request'

export interface OrderTimelineEntry {
  at: string
  description: string | null
  eventType: string
  note: string | null
  proofImage: string | null
  recordedBy: string | null
  status: string | null
}

export interface OrderDelivery {
  attemptNumber: number
  courierName: string | null
  deliveredAt: string | null
  status: string
}

export interface OrderSummary {
  createdAt: string
  amountDue: number
  amountPaid: number
  awaitingPayment: boolean
  id: string
  imageUrl: string | null
  paymentStatus: string | null
  orderNumber: string
  productName: string
  quantity: number
  shopName: string
  status: string
  totalAmount: number
  variantName: string | null
}

export interface OrderDetail extends OrderSummary {
  courierName: string | null
  deliveryAddress: string
  mapsUrl: string | null
  deliveryNote: string | null
  discountAmount: number
  recipientEmail: string | null
  recipientName: string
  recipientPhone: string
  reservedQuantity: number
  timeline: OrderTimelineEntry[]
  unitPrice: number
}

export interface OrderTracking {
  courierName: string | null
  imageUrl: string | null
  orderNumber: string
  placedAt: string
  productName: string
  quantity: number
  recipientName: string
  shopName: string
  status: string
  timeline: OrderTimelineEntry[]
  variantName: string | null
}

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

export const ordersApi = {
  list: async () => (await api.get<ApiEnvelope<OrderSummary[]>>('/buyer/orders')).data,

  get: async (orderNumber: string) =>
    (await api.get<ApiEnvelope<OrderDetail>>(`/buyer/orders/${encodeURIComponent(orderNumber)}`)).data,

  trackByNumber: async (orderNumber: string, contact: string) =>
    (await api.get<ApiEnvelope<OrderTracking>>(
      `/checkout/track/${encodeURIComponent(orderNumber)}?contact=${encodeURIComponent(contact)}`,
    )).data,

  trackByToken: async (token: string) =>
    (await api.get<ApiEnvelope<OrderTracking>>(
      `/checkout/track/link/${encodeURIComponent(token)}`,
    )).data,
}
