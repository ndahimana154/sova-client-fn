import { useEffect, useState } from 'react'
import { normalizeApiError } from '../api/errors'
import { policiesApi, type SystemParameter } from '../lib/policiesApi'

export function usePolicies() {
  const [legal, setLegal] = useState<SystemParameter[]>([])
  const [orders, setOrders] = useState<SystemParameter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    Promise.all([policiesApi.byGroup('legal'), policiesApi.byGroup('orders')])
      .then(([legalParameters, orderParameters]) => {
        if (!live) return
        setLegal(legalParameters)
        setOrders(orderParameters)
      })
      .catch((cause) => live && setError(normalizeApiError(cause).message))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [])

  return { error, legal, loading, orders }
}
