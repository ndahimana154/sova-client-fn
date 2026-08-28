import { Check, X } from 'lucide-react'

const STAGES = ['Placed', 'Payment', 'On the way', 'Delivered'] as const

/** Where this order sits on the journey, from the order and delivery states. */
function stageIndex(status: string, deliveryStatus?: string, paymentSubmitted?: boolean): number {
  if (status === 'completed') return 3
  if (deliveryStatus === 'delivered') return 3
  if (deliveryStatus === 'out_for_delivery' || deliveryStatus === 'picked_up') return 2
  if (status === 'processing') return 2
  if (status === 'confirmed') return 1
  // Paid but not yet verified sits between placed and confirmed.
  if (paymentSubmitted) return 1
  return 0
}

interface OrderProgressProps {
  deliveryStatus?: string
  paymentSubmitted?: boolean
  status: string
}

export function OrderProgress({ deliveryStatus, paymentSubmitted, status }: OrderProgressProps) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2.5 rounded-xl bg-red-50 px-4 py-3">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-red-600 text-white">
          <X size={13} />
        </span>
        <p className="text-xs font-bold text-red-700">This order was cancelled.</p>
      </div>
    )
  }

  const current = stageIndex(status, deliveryStatus, paymentSubmitted)

  return (
    <ol className="flex items-start">
      {STAGES.map((stage, index) => {
        const done = index < current
        const active = index === current
        return (
          <li className="flex min-w-0 flex-1 flex-col items-center" key={stage}>
            <div className="flex w-full items-center">
              <span className={`h-0.5 flex-1 ${index === 0 ? 'bg-transparent' : done || active ? 'bg-primary' : 'bg-line'}`} />
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-black transition ${
                  done ? 'bg-primary text-white' : active ? 'bg-ink text-white ring-4 ring-ink/10' : 'bg-line text-muted'
                }`}
              >
                {done ? <Check size={12} /> : index + 1}
              </span>
              <span className={`h-0.5 flex-1 ${index === STAGES.length - 1 ? 'bg-transparent' : done ? 'bg-primary' : 'bg-line'}`} />
            </div>
            <span className={`mt-1.5 truncate text-[10px] font-bold ${active || done ? 'text-ink' : 'text-muted'}`}>
              {stage}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
