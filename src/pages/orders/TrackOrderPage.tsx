import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Search, Truck } from 'lucide-react'
import { OrderStatusPill } from '../../features/checkout/OrderStatusPill'
import { formatDateTime } from '../../lib/formatDate'
import { OrderTimeline } from '../../features/checkout/OrderTimeline'
import { useOrderTracking } from '../../hooks/useOrders'
import { loadCheckoutContact } from '../../lib/checkoutSession'
import { mediaUrl } from '../../lib/mediaUrl'
import { PRODUCT_PLACEHOLDER } from '../../lib/constants'

export function TrackOrderPage() {
  const { token } = useParams()
  const { error, loading, lookup, order } = useOrderTracking(token)
  const [orderNumber, setOrderNumber] = useState('')
  const [contact, setContact] = useState(loadCheckoutContact)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void lookup(orderNumber, contact)
  }

  return (
    <main className="min-h-[70vh] bg-soft/50 py-6 sm:py-8">
      <div className="page-container max-w-3xl">
        <h1 className="text-2xl font-black tracking-[-0.04em] text-ink sm:text-3xl">Track your order</h1>

        {!token && (
          <form className="surface-card mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]" onSubmit={submit}>
            <label className="block">
              <span className="form-label">Order number</span>
              <span className="form-input">
                <input
                  onChange={(event) => setOrderNumber(event.target.value)}
                  placeholder="ORD-000123"
                  required
                  value={orderNumber}
                />
              </span>
            </label>
            <label className="block">
              <span className="form-label">Email or phone</span>
              <span className="form-input">
                <input
                  onChange={(event) => setContact(event.target.value)}
                  placeholder="The contact you ordered with"
                  required
                  value={contact}
                />
              </span>
            </label>
            <button className="primary-button self-end" disabled={loading} type="submit">
              <Search size={15} /> Track
            </button>
          </form>
        )}

        {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</p>}
        {loading && <p className="mt-6 text-sm text-muted">Looking up your order…</p>}

        {order && (
          <div className="mt-6 space-y-5">
            <section className="surface-card">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-black text-ink">{order.orderNumber}</h2>
                <OrderStatusPill status={order.status} />
              </div>
              <div className="mt-4 flex gap-4">
                <img
                  alt=""
                  className="size-20 shrink-0 rounded-2xl bg-soft object-cover"
                  src={order.imageUrl ? mediaUrl(order.imageUrl) : PRODUCT_PLACEHOLDER}
                />
                <div className="min-w-0 flex-1 text-xs">
                  <p className="text-sm font-bold text-ink">{order.productName}</p>
                  <p className="text-muted">
                    {order.variantName ? `${order.variantName} · ` : ''}{order.shopName} · × {order.quantity}
                  </p>
                  <p className="mt-2 text-muted">
                    Placed {formatDateTime(order.placedAt)} · For {order.recipientName}
                  </p>
                </div>
              </div>
              {order.delivery && (
                <div className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-xs">
                  <Truck className="text-primary-dark" size={15} />
                  <OrderStatusPill status={order.delivery.status} />
                  {order.delivery.courierName && <span className="text-muted">via {order.delivery.courierName}</span>}
                </div>
              )}
            </section>

            <section className="surface-card">
              <h2 className="text-sm font-black text-ink">Timeline</h2>
              <div className="mt-4"><OrderTimeline entries={order.timeline} /></div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
