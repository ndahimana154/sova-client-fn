import { useCallback, useEffect, useMemo, useState } from 'react'

export interface Feedback {
  comment: string
  date: string
  id: string
  name: string
  rating: number
}

/**
 * Feedback kept on the visitor's own device until the API exposes reviews.
 * `subject` scopes the entries, e.g. `shop-nuru-home` or `product-some-slug`.
 */
export function useLocalFeedback(subject: string) {
  const [feedback, setFeedback] = useState<Feedback[]>(() => load(subject))

  useEffect(() => { setFeedback(load(subject)) }, [subject])

  const submit = useCallback((entry: { comment: string; name: string; rating: number }) => {
    const item: Feedback = {
      ...entry,
      id: `${Date.now()}`,
      date: new Intl.DateTimeFormat('en', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date()),
    }
    setFeedback((current) => {
      const next = [item, ...current]
      localStorage.setItem(storageKey(subject), JSON.stringify(next))
      return next
    })
  }, [subject])

  const average = useMemo(
    () => feedback.length
      ? feedback.reduce((total, item) => total + item.rating, 0) / feedback.length
      : 0,
    [feedback],
  )

  return { average, feedback, submit }
}

function storageKey(subject: string) {
  return `sova-feedback-${subject.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`
}

function load(subject: string): Feedback[] {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(subject)) || '[]') as Feedback[]
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}
