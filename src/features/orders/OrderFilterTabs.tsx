import {
  ORDER_FILTERS,
  type OrderFilterId,
} from './orderFilters'

interface OrderFilterTabsProps {
  counts: Record<OrderFilterId, number>
  onChange: (id: OrderFilterId) => void
  value: OrderFilterId
}

export function OrderFilterTabs({ counts, onChange, value }: OrderFilterTabsProps) {
  // Empty buckets stay hidden so no tab ever leads to nothing.
  const visible = ORDER_FILTERS.filter((entry) => entry.id === 'all' || counts[entry.id] > 0)

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div
        className="flex min-w-max gap-1 rounded-2xl border border-line bg-white p-1.5"
        role="tablist"
      >
        {visible.map(({ icon: Icon, id, label }) => {
          const active = id === value
          return (
            <button
              aria-selected={active}
              className={`group relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[11px] font-bold transition ${
                active
                  ? 'bg-ink text-white shadow-soft'
                  : 'text-muted hover:bg-soft hover:text-ink'
              }`}
              key={id}
              onClick={() => onChange(id)}
              role="tab"
              type="button"
            >
              <Icon
                className={active ? 'text-white' : 'text-muted group-hover:text-ink'}
                size={14}
              />
              {label}
              <span
                className={`grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px] font-black tabular-nums ${
                  active ? 'bg-white/20 text-white' : 'bg-soft text-muted'
                }`}
              >
                {counts[id]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
