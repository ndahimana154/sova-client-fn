import type { OrderTimelineEntry } from '../../lib/ordersApi'
import { mediaUrl } from '../../lib/mediaUrl'
import { formatDateTime } from '../../lib/formatDate'

export function OrderTimeline({ entries }: { entries: OrderTimelineEntry[] }) {
  if (!entries.length) {
    return <p className="text-xs text-muted">Nothing has happened on this order yet.</p>
  }
  return (
    <ol className="space-y-4">
      {entries.map((entry, index) => (
        <li className="relative flex gap-4 pl-1" key={`${entry.at}-${index}`}>
          <span className="relative flex flex-col items-center">
            <span className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />
            {index < entries.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
          </span>
          <div className="min-w-0 flex-1 pb-1">
            <p className="text-xs font-bold text-ink">{entry.description ?? entry.eventType.replace(/_/g, ' ')}</p>
            <p className="mt-0.5 text-[11px] text-muted">
              {formatDateTime(entry.at)}
              {entry.status ? ` · ${entry.status.replace(/_/g, ' ')}` : ''}
            </p>
            {entry.note && (
              <p className="mt-1.5 rounded-lg bg-soft px-2.5 py-1.5 text-[11px] leading-4 text-muted">
                {entry.note}
              </p>
            )}
            {entry.proofImage && (
              <a href={mediaUrl(entry.proofImage)} rel="noreferrer" target="_blank">
                <img
                  alt="Photo recorded at this step"
                  className="mt-2 max-h-40 rounded-xl border border-line object-cover"
                  src={mediaUrl(entry.proofImage)}
                />
              </a>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
