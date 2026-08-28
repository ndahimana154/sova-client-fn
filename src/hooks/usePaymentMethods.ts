import { useEffect, useState } from 'react'
import { checkoutApi, type CheckoutPaymentMethod } from '../lib/checkoutApi'

/**
 * Standalone fetch so the checkout page can show payment channels without
 * touching the shared busy/error state — a failed lookup here must never
 * block placing an order.
 */
export function usePaymentMethods(authenticated: boolean) {
  const [methods, setMethods] = useState<CheckoutPaymentMethod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let live = true
    checkoutApi
      .paymentMethods(authenticated)
      .then((available) => live && setMethods(available))
      .catch(() => undefined)
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [authenticated])

  return { loading, methods }
}
