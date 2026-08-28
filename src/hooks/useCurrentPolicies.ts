import { useCallback, useEffect, useState } from 'react'
import { normalizeApiError } from '../api/errors'
import { policyApi, type PolicySlug, type PolicyVersion } from '../lib/policyApi'

/** The published policies, straight from the public endpoint. No account needed. */
export function useCurrentPolicies() {
  const [policies, setPolicies] = useState<PolicyVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    policyApi
      .current()
      .then((result) => live && setPolicies(result))
      .catch((cause) => live && setError(normalizeApiError(cause).message))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [])

  const policy = useCallback(
    (slug: PolicySlug) => policies.find((entry) => entry.slug === slug),
    [policies],
  )

  return { error, loading, policies, policy }
}
