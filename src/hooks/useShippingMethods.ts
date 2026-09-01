import { useEffect, useState } from 'react'
import { shippingApi, type ShippingMethod } from '../lib/shippingApi'

export function useShippingMethods() {
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let live = true
    shippingApi
      .list()
      .then((available) => live && setMethods(available))
      .catch(() => undefined)
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [])

  return { loading, methods }
}
