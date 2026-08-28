import { formatMoney } from '../../lib/money'
import type { CartItem } from '../cart/types'

interface OrderSummaryProps {
  deliveryFee: number
  freeThreshold: number
  items: CartItem[]
  loaded: boolean
  subtotal: number
  total: number
}

export function OrderSummary({ deliveryFee, freeThreshold, items, loaded, subtotal, total }: OrderSummaryProps) {
  return (
    <>
      <ul className="space-y-3 border-b border-line pb-4">
        {items.map((item) => (
          <li className="flex gap-3" key={`${item.product.slug}-${item.product.variantId}`}>
            <img alt="" className="size-12 shrink-0 rounded-xl bg-soft object-cover" src={item.product.image} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold text-ink">{item.product.name}</p>
              {item.options.length > 0 && (
                <p className="truncate text-[10px] text-muted">{item.options.join(' · ')}</p>
              )}
              <p className="text-[10px] text-muted">× {item.quantity}</p>
            </div>
            <strong className="text-[11px] text-ink">{formatMoney(item.product.price * item.quantity)}</strong>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2">
        <Row label="Subtotal" value={formatMoney(subtotal)} />
        <Row label="Delivery" value={!loaded ? '—' : deliveryFee === 0 ? 'Free' : formatMoney(deliveryFee)} />
        <div className="flex items-center justify-between border-t border-line pt-2">
          <span className="text-sm font-black text-ink">Total</span>
          <strong className="text-base font-black text-ink">{formatMoney(total)}</strong>
        </div>
      </div>

      {freeThreshold > 0 && subtotal < freeThreshold && (
        <p className="mt-2 text-[11px] text-muted">
          Add {formatMoney(freeThreshold - subtotal)} more for free delivery.
        </p>
      )}
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted">{label}</span>
      <span className="font-bold text-ink">{value}</span>
    </div>
  )
}
