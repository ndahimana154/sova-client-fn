import { useCallback, useMemo, useState } from 'react'
import { normalizeApiError } from '../api/errors'
import {
  checkoutApi,
  type Checkout,
  type CheckoutItemInput,
  type CheckoutPayment,
  type CheckoutPaymentMethod,
  type SubmitPaymentInput,
} from '../lib/checkoutApi'
import {
  clearActiveCheckout,
  loadCheckoutContact,
  newIdempotencyKey,
  saveActiveCheckout,
} from '../lib/checkoutSession'
import { clearGuestCart } from '../lib/guestCart'
import { normalizePhone } from '../lib/phone'
import { useAppSelector } from '../store/hooks'
import type { CartItem } from '../features/cart/types'

export interface CheckoutContact {
  acceptDeliveryTerms?: boolean
  acceptTerms?: boolean
  deliveryAddress: string
  deliveryGateConfirmed?: boolean
  deliveryLatitude?: string | null
  deliveryLongitude?: string | null
  deliveryNote?: string
  deliveryPlaceId?: string | null
  recipientEmail: string
  recipientName: string
  recipientPhone: string
}

function toItems(cartItems: CartItem[]): CheckoutItemInput[] {
  return cartItems
    .filter((item) => Boolean(item.product.variantId))
    .map((item) => ({ quantity: item.quantity, variantId: item.product.variantId as string }))
}

export function useCheckout() {
  const session = useAppSelector((state) => state.auth.session)
  const cartItems = useAppSelector((state) => state.commerce.cartItems)
  const authenticated = Boolean(session)

  const [checkout, setCheckout] = useState<Checkout | null>(null)
  const [payment, setPayment] = useState<CheckoutPayment | null>(null)
  const [methods, setMethods] = useState<CheckoutPaymentMethod[]>([])
  const [verificationToken, setVerificationToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const items = useMemo(() => toItems(cartItems), [cartItems])
  const unavailable = cartItems.length - items.length

  const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T | null> => {
    setBusy(true)
    setError('')
    try {
      return await action()
    } catch (cause) {
      setError(normalizeApiError(cause).message)
      return null
    } finally {
      setBusy(false)
    }
  }, [])

  const loadMethods = useCallback(
    () => run(async () => {
      const available = await checkoutApi.paymentMethods(authenticated)
      setMethods(available)
      return available
    }),
    [authenticated, run],
  )

  const requestGuestOtp = useCallback(
    (email: string) => run(() => checkoutApi.requestGuestOtp(email)),
    [run],
  )

  const verifyGuestOtp = useCallback(
    (email: string, otp: string) => run(async () => {
      const token = await checkoutApi.verifyGuestOtp(email, otp)
      setVerificationToken(token)
      return token
    }),
    [run],
  )

  const placeOrder = useCallback(
    (contact: CheckoutContact) => run(async () => {
      if (!items.length) throw new Error('Your cart is empty')
      const payload = { ...contact }
      delete payload.deliveryGateConfirmed
      const created = await checkoutApi.create(
        {
          ...payload,
          deliveryNote: contact.deliveryNote?.trim() || null,
          recipientPhone: normalizePhone(contact.recipientPhone),
          idempotencyKey: newIdempotencyKey(),
          items,
          verificationToken: authenticated ? undefined : verificationToken,
        },
        authenticated,
      )
      setCheckout(created)
      saveActiveCheckout({
        checkoutNumber: created.checkoutNumber,
        contact: contact.recipientEmail,
      })
      if (!authenticated) clearGuestCart()
      return created
    }),
    [authenticated, items, run, verificationToken],
  )

  const reopen = useCallback(
    (checkoutNumber: string, contact?: string) => run(async () => {
      const email = contact?.trim() || loadCheckoutContact()
      if (!authenticated && !email) {
        throw new Error('Enter the email address you ordered with')
      }
      const found = await checkoutApi.find(checkoutNumber, authenticated ? undefined : email)
      setCheckout(found)
      if (!authenticated) saveActiveCheckout({ checkoutNumber, contact: email })
      return found
    }),
    [authenticated, run],
  )

  const submitPayment = useCallback(
    (input: SubmitPaymentInput) => run(async () => {
      if (!checkout) throw new Error('Place your order before paying')
      const submitted = await checkoutApi.submitPayment(
        checkout.checkoutNumber,
        {
          ...input,
          idempotencyKey: input.idempotencyKey ?? newIdempotencyKey(),
          payerEmail: authenticated ? null : input.payerEmail || loadCheckoutContact(),
        },
        authenticated,
      )
      setPayment(submitted)
      clearActiveCheckout()
      return submitted
    }),
    [authenticated, checkout, run],
  )

  return {
    authenticated,
    busy,
    checkout,
    error,
    items,
    loadMethods,
    methods,
    payment,
    placeOrder,
    reopen,
    requestGuestOtp,
    submitPayment,
    unavailable,
    verificationToken,
    verifyGuestOtp,
  }
}
