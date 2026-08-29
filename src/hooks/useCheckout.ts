import { useCallback, useMemo, useState } from 'react'
import { normalizeApiError } from '../api/errors'
import {
  checkoutApi,
  type PayableOrder,
  
  type OrderPaymentReceipt,
  type CheckoutPaymentMethod,
  type SubmitPaymentInput,
} from '../lib/checkoutApi'
import {
  clearActiveCheckout,
  loadCheckoutContact,
  newIdempotencyKey,
  saveActiveCheckout,
} from '../lib/checkoutSession'
import { clearPendingPurchase, loadPendingPurchase } from '../lib/pendingPurchase'
import { normalizePhone } from '../lib/phone'
import { useAppSelector } from '../store/hooks'

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


export function useCheckout() {
  const session = useAppSelector((state) => state.auth.session)
  const authenticated = Boolean(session)

  const [checkout, setCheckout] = useState<PayableOrder | null>(null)
  const [payment, setPayment] = useState<OrderPaymentReceipt | null>(null)
  const [methods, setMethods] = useState<CheckoutPaymentMethod[]>([])
  const [verificationToken, setVerificationToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const purchase = useMemo(() => loadPendingPurchase(), [])
  const lines = useMemo(() => (purchase ? [purchase] : []), [purchase])
  const unavailable = lines.filter((line) => !line.product.variantId).length

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
      if (!lines.length) throw new Error('Nothing selected to buy')
      const payload = { ...contact }
      delete payload.deliveryGateConfirmed
      const line = lines[0]
      const created = await checkoutApi.place(
        {
          ...payload,
          deliveryNote: contact.deliveryNote?.trim() || null,
          recipientPhone: normalizePhone(contact.recipientPhone),
          idempotencyKey: newIdempotencyKey(),
          quantity: line.quantity,
          variantId: line.product.variantId as string,
          verificationToken: authenticated ? undefined : verificationToken,
        },
        authenticated,
      )
      saveActiveCheckout({
        checkoutNumber: created.orderNumber,
        contact: contact.recipientEmail,
      })
      clearPendingPurchase()
      return created
    }),
    [authenticated, lines, run, verificationToken],
  )

  const reopen = useCallback(
    (checkoutNumber: string, contact?: string) => run(async () => {
      const email = contact?.trim() || loadCheckoutContact()
      if (!authenticated && !email) {
        throw new Error('Enter the email address you ordered with')
      }
      const found = await checkoutApi.payable(
        checkoutNumber,
        authenticated ? undefined : email,
      )
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
        checkout.orderNumber,
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
    lines,
    error,
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
