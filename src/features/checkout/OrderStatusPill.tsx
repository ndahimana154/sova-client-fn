const tones: Record<string, string> = {
  cancelled: 'bg-red-50 text-red-700',
  completed: 'bg-emerald-50 text-emerald-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
  out_for_delivery: 'bg-amber-50 text-amber-700',
  pending: 'bg-amber-50 text-amber-700',
  picked_up: 'bg-amber-50 text-amber-700',
  processing: 'bg-sky-50 text-sky-700',
  rejected: 'bg-red-50 text-red-700',
  submitted: 'bg-sky-50 text-sky-700',
}

export function OrderStatusPill({ status }: { status: string }) {
  const tone = tones[status] ?? 'bg-soft text-muted'
  return <span className={`status-pill ${tone}`}>{status.replace(/_/g, ' ')}</span>
}
