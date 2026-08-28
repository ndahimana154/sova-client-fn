import { useCallback, useEffect, useState } from 'react'
import { normalizeApiError } from '../api/errors'
import {
  profileApi,
  type BuyerProfile,
  type UpdateBuyerProfileInput,
} from '../lib/profileApi'

export function useBuyerProfile(enabled = true) {
  const [profile, setProfile] = useState<BuyerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      setProfile(await profileApi.get())
    } catch (cause) {
      setError(normalizeApiError(cause).message)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    void reload()
  }, [reload])

  const save = useCallback(async (input: UpdateBuyerProfileInput) => {
    setSaving(true)
    setError('')
    try {
      const updated = await profileApi.update(input)
      setProfile(updated)
      return updated
    } catch (cause) {
      setError(normalizeApiError(cause).message)
      return null
    } finally {
      setSaving(false)
    }
  }, [])

  return { error, loading, profile, reload, save, saving }
}
