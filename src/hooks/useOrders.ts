import { useCallback, useEffect, useState } from 'react'
import { normalizeApiError } from '../api/errors'
import {
  ordersApi,
  type OrderDetail,
  type OrderSummary,
  type OrderTracking,
} from '../lib/ordersApi'
import { useAppSelector } from '../store/hooks'

export function useOrders() {
  const session = useAppSelector((state) => state.auth.session)
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (!session) return
    setLoading(true)
    setError('')
    try {
      setOrders(await ordersApi.list())
    } catch (cause) {
      setError(normalizeApiError(cause).message)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    void reload()
  }, [reload])

  return { error, loading, orders, reload }
}

export function useOrder(orderNumber?: string) {
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderNumber) return
    let active = true
    setLoading(true)
    setError('')
    ordersApi
      .get(orderNumber)
      .then((found) => {
        if (active) setOrder(found)
      })
      .catch((cause: unknown) => {
        if (active) setError(normalizeApiError(cause).message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [orderNumber])

  return { error, loading, order }
}

export function useOrderTracking(token?: string) {
  const [order, setOrder] = useState<OrderTracking | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const lookup = useCallback(async (orderNumber: string, contact: string) => {
    setLoading(true)
    setError('')
    try {
      setOrder(await ordersApi.trackByNumber(orderNumber, contact))
    } catch (cause) {
      setError(normalizeApiError(cause).message)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!token) return
    let active = true
    setLoading(true)
    setError('')
    ordersApi
      .trackByToken(token)
      .then((found) => {
        if (active) setOrder(found)
      })
      .catch((cause: unknown) => {
        if (active) setError(normalizeApiError(cause).message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [token])

  return { error, loading, lookup, order }
}
