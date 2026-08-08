import { MessageCircle, Star } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import type { Feedback } from '../../hooks/useLocalFeedback'

interface FeedbackSectionProps {
  average: number
  emptyMessage: string
  eyebrow?: string
  feedback: Feedback[]
  formTitle: string
  id?: string
  intro: string
  onSubmit: (entry: { comment: string; name: string; rating: number }) => void
  placeholder: string
  title: string
}

/** Star rating plus written feedback, shared by the shop and product pages. */
export function FeedbackSection({
  average,
  emptyMessage,
  eyebrow = 'Customer experiences',
  feedback,
  formTitle,
  id,
  intro,
  onSubmit,
  placeholder,
  title,
}: FeedbackSectionProps) {
  const [rating, setRating] = useState(0)
  const [error, setError] = useState('')
  const form = useRef<HTMLFormElement>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!rating) {
      setError('Please select a star rating.')
      return
    }
    const data = new FormData(event.currentTarget)
    onSubmit({
      comment: String(data.get('comment')).trim(),
      name: String(data.get('name')).trim(),
      rating,
    })
    setRating(0)
    setError('')
    form.current?.reset()
  }

  return (
    <section className="page-container py-12 sm:py-16" id={id}>
      <div className="grid gap-8 lg:grid-cols-[minmax(300px,0.7fr)_minmax(0,1.3fr)]">
        <div>
          <p className="auth-eyebrow">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-ink">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{intro}</p>

          {feedback.length > 0 && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-line bg-soft/60 px-4 py-3">
              <strong className="text-2xl font-black leading-none text-ink">{average.toFixed(1)}</strong>
              <div>
                <StarRow rating={Math.round(average)} size={14} />
                <span className="mt-1 block text-[11px] text-muted">
                  {feedback.length} {feedback.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>
          )}

          <form className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-soft" onSubmit={handleSubmit} ref={form}>
            <h3 className="text-sm font-black text-ink">{formTitle}</h3>
            <div className="mt-4 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button aria-label={`${star} star rating`} key={star} onClick={() => setRating(star)} type="button">
                  <Star className={`${star <= rating ? 'fill-primary text-primary' : 'text-line'} transition hover:scale-110`} size={24} />
                </button>
              ))}
            </div>
            <label className="mt-4 block">
              <span className="text-xs font-bold text-ink">Display name</span>
              <input className="review-input" name="name" placeholder="Your name" required />
            </label>
            <label className="mt-4 block">
              <span className="text-xs font-bold text-ink">Your feedback</span>
              <textarea className="review-input min-h-28 resize-y" name="comment" placeholder={placeholder} required />
            </label>
            {error && <p className="mt-3 text-xs font-semibold text-red-600" role="alert">{error}</p>}
            <button className="auth-submit mt-5" type="submit"><MessageCircle size={16} /> Post feedback</button>
          </form>
        </div>

        <div className="space-y-4">
          {feedback.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line bg-soft/40 px-4 py-12 text-center text-sm text-muted">
              {emptyMessage}
            </p>
          ) : feedback.map((item) => (
            <article className="rounded-2xl border border-line bg-white p-5 transition hover:border-primary/30 hover:shadow-soft sm:p-6" key={item.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <StarRow rating={item.rating} size={14} />
                  <p className="mt-3 text-sm leading-6 text-muted">{item.comment}</p>
                </div>
                <span className="shrink-0 text-[11px] text-muted">{item.date}</span>
              </div>
              <p className="mt-4 text-xs font-bold text-ink">{item.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function StarRow({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star className={star <= rating ? 'fill-primary text-primary' : 'text-line'} key={star} size={size} />
      ))}
    </span>
  )
}
