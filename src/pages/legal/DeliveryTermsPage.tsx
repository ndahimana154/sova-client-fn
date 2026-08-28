import { RichTextView } from '../../features/policy/RichTextView'
import { useCurrentPolicies } from '../../hooks/useCurrentPolicies'
import { usePolicies } from '../../hooks/usePolicies'
import { formatMoney } from '../../lib/money'
import { readNumber } from '../../lib/policiesApi'
import { LegalPageShell } from './LegalPageShell'

export function DeliveryTermsPage() {
  const { error, loading, policy } = useCurrentPolicies()
  const { orders } = usePolicies()
  const terms = policy('delivery_terms')

  const fee = readNumber(orders, 'orders.delivery_fee')
  const freeFrom = readNumber(orders, 'orders.free_delivery_threshold')
  const daysMin = readNumber(orders, 'orders.delivery_estimated_days_min')
  const daysMax = readNumber(orders, 'orders.delivery_estimated_days_max')
  const returnDays = readNumber(orders, 'orders.return_window_days')
  const payHours = readNumber(orders, 'orders.checkout_expiry_hours')

  const facts = [
    { label: 'Delivery fee', value: fee === null ? null : fee === 0 ? 'Free' : formatMoney(fee) },
    { label: 'Free delivery from', value: freeFrom ? formatMoney(freeFrom) : null },
    {
      label: 'Estimated delivery',
      value:
        daysMin === null || daysMax === null
          ? null
          : daysMin === daysMax
            ? `${daysMin} working day${daysMin === 1 ? '' : 's'}`
            : `${daysMin}–${daysMax} working days`,
    },
    { label: 'Time to pay', value: payHours === null ? null : `${payHours} hours` },
    { label: 'Return window', value: returnDays === null ? null : `${returnDays} days after delivery` },
  ].filter((fact) => fact.value)

  return (
    <LegalPageShell
      intro="What to expect once your payment is confirmed."
      title="Delivery terms"
      version={terms?.version}
    >
      {loading && <p className="text-xs text-muted">Loading…</p>}
      {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[11px] font-bold text-red-700">{error}</p>}

      {!loading && !error && (
        <>
          {facts.length > 0 && (
            <dl className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {facts.map((fact) => (
                <div className="rounded-xl bg-soft/60 px-3.5 py-3" key={fact.label}>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">{fact.label}</dt>
                  <dd className="mt-1 text-sm font-black text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <RichTextView html={terms?.body ?? ''} />
        </>
      )}
    </LegalPageShell>
  )
}
