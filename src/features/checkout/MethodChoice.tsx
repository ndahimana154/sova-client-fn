import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

interface MethodChoiceProps {
  aside?: ReactNode
  description?: string | null
  error?: boolean
  logo?: ReactNode
  onSelect: () => void
  selected: boolean
  title: string
}

export function MethodChoice({
  aside,
  description,
  error,
  logo,
  onSelect,
  selected,
  title,
}: MethodChoiceProps) {
  return (
    <button
      aria-pressed={selected}
      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${
        selected
          ? 'border-primary bg-primary-light/40 ring-2 ring-primary/15'
          : error
            ? 'border-red-300 hover:border-red-400'
            : 'border-line hover:border-primary/40 hover:bg-soft/40'
      }`}
      onClick={onSelect}
      type="button"
    >
      <span
        className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border transition ${
          selected ? 'border-primary bg-primary text-white' : 'border-line bg-white'
        }`}
      >
        {selected && <Check size={11} />}
      </span>

      {logo}

      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-ink">{title}</span>
        {description && (
          <span className="mt-0.5 block whitespace-pre-line text-[11px] leading-5 text-muted">
            {description}
          </span>
        )}
      </span>

      {aside && <span className="shrink-0 text-right">{aside}</span>}
    </button>
  )
}
