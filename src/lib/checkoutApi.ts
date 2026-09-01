import { api } from '../api/request'

export interface PlacedOrder {
  amountPaid: number
  deliveryFee: number
  discountAmount: number
  expiresAt: string | null
  id: string
  orderNumber: string
  productName: string
  quantity: number
  shopName: string
  status: string
  totalAmount: number
  trackingToken: string
  unitPrice: number
  variantName: string | null
}

export interface PayableOrder {
  amountDue: number
  amountPaid: number
  deliveryFee: number
  discountAmount: number
  expiresAt: string | null
  imageUrl: string | null
  orderNumber: string
  productName: string
  quantity: number
  requiredNow: number
  shopName: string
  status: string
  totalAmount: number
  unitPrice: number
  variantName: string | null
}

export interface CheckoutPaymentMethod {
  code: string
  description: string | null
  id: string
  logo: string | null
  name: string
}

export interface PlaceOrderInput {
  acceptDeliveryTerms?: boolean
  acceptTerms?: boolean
  deliveryAddress: string
  deliveryLatitude?: string | null
  deliveryLongitude?: string | null
  deliveryNote?: string | null
  deliveryPlaceId?: string | null
  idempotencyKey?: string
  paymentMethodId: string
  quantity: number
  recipientEmail: string
  recipientName: string
  recipientPhone: string
  shippingMethodId: string
  variantId: string
  verificationToken?: string
}

export interface SubmitPaymentInput {
  amount: number
  idempotencyKey?: string
  note?: string | null
  payerAccount?: string | null
  payerEmail?: string | null
  paymentMethodId: string
  proof?: File | null
  transactionReference?: string | null
}

export interface OrderPaymentReceipt {
  amount: number
  id: string
  orderNumber: string
  paymentProof: string | null
  status: string
  submittedAt: string | null
  transactionReference: string | null
}

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

function paymentForm(input: SubmitPaymentInput): FormData {
  const form = new FormData()
  form.append('paymentMethodId', input.paymentMethodId)
  form.append('amount', String(input.amount))
  if (input.idempotencyKey) form.append('idempotencyKey', input.idempotencyKey)
  if (input.transactionReference) form.append('transactionReference', input.transactionReference)
  if (input.payerAccount) form.append('payerAccount', input.payerAccount)
  if (input.payerEmail) form.append('payerEmail', input.payerEmail)
  if (input.note) form.append('note', input.note)
  if (input.proof) form.append('proof', input.proof)
  return form
}

export const checkoutApi = {
  paymentMethods: async (authenticated: boolean) =>
    (await api.get<ApiEnvelope<CheckoutPaymentMethod[]>>(
      authenticated ? '/buyer/payment-methods' : '/checkout/payment-methods',
    )).data,

  requestGuestOtp: async (email: string) =>
    (await api.post<ApiEnvelope<{ expiresAt: string }>, { email: string }>(
      '/checkout/verify/request',
      { email },
    )).data,

  verifyGuestOtp: async (email: string, otp: string) =>
    (await api.post<ApiEnvelope<{ verificationToken: string }>, { email: string; otp: string }>(
      '/checkout/verify',
      { email, otp },
    )).data.verificationToken,

  place: async (input: PlaceOrderInput, authenticated: boolean) =>
    (await api.post<ApiEnvelope<PlacedOrder>, PlaceOrderInput>(
      authenticated ? '/buyer/orders' : '/checkout',
      input,
    )).data,

  payable: async (orderNumber: string, contact?: string) =>
    (await api.get<ApiEnvelope<PayableOrder>>(
      contact
        ? `/checkout/${encodeURIComponent(orderNumber)}?contact=${encodeURIComponent(contact)}`
        : `/buyer/orders/${encodeURIComponent(orderNumber)}/payable`,
    )).data,

  submitPayment: async (
    orderNumber: string,
    input: SubmitPaymentInput,
    authenticated: boolean,
  ) => {
    const base = authenticated ? '/buyer/orders' : '/checkout'
    const response = await api.post<ApiEnvelope<OrderPaymentReceipt>, FormData>(
      `${base}/${encodeURIComponent(orderNumber)}/payment`,
      paymentForm(input),
    )
    return response.data
  },
}
