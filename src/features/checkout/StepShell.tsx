import { Check, Pencil } from 'lucide-react'
import type { ReactNode } from 'react'

interface StepShellProps {
  children: ReactNode
  complete: boolean
  index: number
  onEdit: () => void
  open: boolean
  summary?: ReactNode
  title: string
}

export function StepShell({ children, complete, index, onEdit, open, summary, title }: StepShellProps) {
  return (
    <section className={`rounded-2xl border bg-white transition ${open ? 'border-primary/40 shadow-soft' : 'border-line'}`}>
      <header className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
        <span
          className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-black ${
            complete ? 'bg-primary text-white' : open ? 'bg-ink text-white' : 'bg-soft text-muted'
          }`}
        >
          {complete && !open ? <Check size={13} /> : index}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className={`text-xs font-black ${open ? 'text-ink' : 'text-muted'}`}>{title}</h2>
          {!open && summary && <p className="mt-0.5 truncate text-[11px] text-muted">{summary}</p>}
        </div>

        {!open && complete && (
          <button
            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-primary-dark hover:underline"
            onClick={onEdit}
            type="button"
          >
            <Pencil size={11} /> Edit
          </button>
        )}
      </header>

      {open && <div className="border-t border-line px-4 py-4 sm:px-5">{children}</div>}
    </section>
  )
}
