import { api } from '../api/request'

export interface CheckoutOrder {
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

export interface Checkout {
  checkoutNumber: string
  deliveryFee: number
  discountAmount: number
  expiresAt: string | null
  id: string
  orders: CheckoutOrder[]
  status: string
  subtotal: number
  totalAmount: number
}

export interface CheckoutPaymentMethod {
  code: string
  description: string | null
  id: string
  name: string
}

export interface CheckoutItemInput {
  quantity: number
  variantId: string
}

export interface CreateCheckoutInput {
  acceptDeliveryTerms?: boolean
  acceptTerms?: boolean
  deliveryAddress: string
  deliveryLatitude?: string | null
  deliveryLongitude?: string | null
  deliveryNote?: string | null
  deliveryPlaceId?: string | null
  idempotencyKey?: string
  items: CheckoutItemInput[]
  recipientEmail: string
  recipientName: string
  recipientPhone: string
  verificationToken?: string
}

export interface SubmitPaymentInput {
  idempotencyKey?: string
  note?: string | null
  payerEmail?: string | null
  payerPhone?: string | null
  paymentMethodId: string
  proof?: File | null
  transactionReference?: string | null
}

export interface CheckoutPayment {
  amount: number
  checkoutNumber: string
  id: string
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
  if (input.idempotencyKey) form.append('idempotencyKey', input.idempotencyKey)
  if (input.transactionReference) form.append('transactionReference', input.transactionReference)
  if (input.payerPhone) form.append('payerPhone', input.payerPhone)
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

  create: async (input: CreateCheckoutInput, authenticated: boolean) =>
    (await api.post<ApiEnvelope<Checkout>, CreateCheckoutInput>(
      authenticated ? '/buyer/checkout' : '/checkout',
      input,
    )).data,

  find: async (checkoutNumber: string, contact?: string) =>
    (await api.get<ApiEnvelope<Checkout>>(
      contact
        ? `/checkout/${encodeURIComponent(checkoutNumber)}?contact=${encodeURIComponent(contact)}`
        : `/buyer/checkout/${encodeURIComponent(checkoutNumber)}`,
    )).data,

  submitPayment: async (
    checkoutNumber: string,
    input: SubmitPaymentInput,
    authenticated: boolean,
  ) => {
    const base = authenticated ? '/buyer/checkout' : '/checkout'
    const response = await api.post<ApiEnvelope<CheckoutPayment>, FormData>(
      `${base}/${encodeURIComponent(checkoutNumber)}/payment`,
      paymentForm(input),
    )
    return response.data
  },
}
