import { Wallet } from 'lucide-react'
import { Select } from '../../components/ui/Select'
import { usePaymentMethods } from '../../hooks/usePaymentMethods'

interface PaymentPreviewProps {
  authenticated: boolean
  methodId: string
  onChange: (methodId: string) => void
}

/**
 * Shown before the order exists so buyers can see how they will pay and read
 * the instructions up front. The choice carries over to the payment page.
 */
export function PaymentPreview({ authenticated, methodId, onChange }: PaymentPreviewProps) {
  const { loading, methods } = usePaymentMethods(authenticated)
  const chosen = methods.find((method) => method.id === methodId)

  if (loading) {
    return <p className="rounded-xl bg-soft/40 px-3.5 py-3 text-[11px] text-muted">Loading payment options…</p>
  }
  if (!methods.length) return null

  return (
    <div className="rounded-xl border border-line bg-soft/40 p-3.5">
      <p className="flex items-center gap-2 text-[11px] font-black text-ink">
        <Wallet className="text-primary-dark" size={14} /> How you will pay
      </p>
      <p className="mt-1 text-[11px] leading-5 text-muted">
        Pick a channel to see the payment instructions. You confirm the payment on the next step.
      </p>

      <div className="mt-3">
        <Select
          onChange={onChange}
          options={methods.map((method) => ({ label: method.name, value: method.id }))}
          placeholder="Choose a payment channel"
          value={methodId}
        />
      </div>

      {chosen?.description && (
        <div className="mt-3 rounded-xl border border-line bg-white px-3.5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
            {chosen.name} instructions
          </p>
          <p className="mt-1.5 whitespace-pre-line text-[11px] leading-5 text-ink">{chosen.description}</p>
        </div>
      )}
    </div>
  )
}
