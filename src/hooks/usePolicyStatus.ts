import { useCallback, useEffect, useState } from 'react'
import { normalizeApiError } from '../api/errors'
import { policyApi, type PolicySlug, type PolicyStatus } from '../lib/policyApi'

export function usePolicyStatus() {
  const [statuses, setStatuses] = useState<PolicyStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setStatuses(await policyApi.status())
      setError('')
    } catch (cause) {
      setError(normalizeApiError(cause).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const accept = useCallback(async (slugs: PolicySlug[]) => {
    try {
      setStatuses(await policyApi.accept(slugs))
      setError('')
      return true
    } catch (cause) {
      setError(normalizeApiError(cause).message)
      return false
    }
  }, [])

  return {
    accept,
    error,
    loading,
    outstanding: statuses.filter((status) => status.needsAcceptance),
    reload,
    statuses,
  }
}
