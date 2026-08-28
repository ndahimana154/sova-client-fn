import { useEffect, useState } from 'react'
import { policiesApi, readNumber } from '../lib/policiesApi'

interface DeliveryPricing {
  fee: number
  freeThreshold: number
  loaded: boolean
}

/** Delivery pricing straight from the public system parameters. */
export function useDeliveryPricing(): DeliveryPricing {
  const [pricing, setPricing] = useState<DeliveryPricing>({
    fee: 0,
    freeThreshold: 0,
    loaded: false,
  })

  useEffect(() => {
    let live = true
    policiesApi
      .byGroup('orders')
      .then((parameters) => {
        if (!live) return
        setPricing({
          fee: readNumber(parameters, 'orders.delivery_fee') ?? 0,
          freeThreshold: readNumber(parameters, 'orders.free_delivery_threshold') ?? 0,
          loaded: true,
        })
      })
      .catch(() => live && setPricing((current) => ({ ...current, loaded: true })))
    return () => {
      live = false
    }
  }, [])

  return pricing
}
