import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, ExternalLink, MapPin, Truck } from 'lucide-react'
import { OrderStatusPill } from '../../features/checkout/OrderStatusPill'
import { OrderTimeline } from '../../features/checkout/OrderTimeline'
import { OrderProgress } from '../../features/orders/OrderProgress'
import { useOrder } from '../../hooks/useOrders'
import { PRODUCT_PLACEHOLDER } from '../../lib/constants'
import { mediaUrl } from '../../lib/mediaUrl'
import { formatDateTime } from '../../lib/formatDate'
import { formatMoney } from '../../lib/money'
import { appPaths } from '../../router/paths'

export function OrderDetailPage() {
  const { orderNumber } = useParams()
  const { error, loading, order } = useOrder(orderNumber)

  if (loading) return <main className="page-container py-16 text-sm text-muted">Loading your order…</main>
  if (error || !order) {
    return (
      <main className="page-container py-16 text-center">
        <h1 className="text-xl font-black text-ink">We could not open that order</h1>
        <p className="mt-2 text-sm text-muted">{error || 'It may belong to another account.'}</p>
        <Link className="primary-button mt-6" to={appPaths.orders}>Back to your orders</Link>
      </main>
    )
  }

  const awaitingPayment = order.awaitingPayment
  const underReview =
    !awaitingPayment &&
    order.status === 'pending' &&
    (order.paymentStatus === 'submitted' || order.paymentStatus === 'verifying')
  const paymentRejected = order.paymentStatus === 'rejected' || order.paymentStatus === 'failed'
  const lineTotal = order.unitPrice * order.quantity

  return (
    <main className="min-h-[70vh] bg-soft/50 py-6 sm:py-8">
      <div className="page-container">
        <Link className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted transition hover:text-primary-dark" to={appPaths.orders}>
          <ChevronLeft size={14} /> Your orders
        </Link>

        <section className="mt-3 rounded-2xl border border-line bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-black tracking-[-0.02em] text-ink sm:text-xl">{order.orderNumber}</h1>
                <OrderStatusPill status={order.status} />
              </div>
              <p className="mt-1 text-[11px] text-muted">
                Placed {formatDateTime(order.createdAt)}
              </p>
            </div>

          </div>

          <div className="mt-5 border-t border-line pt-5">
            <OrderProgress
              paymentSubmitted={underReview}
              status={order.status}
            />
          </div>

        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="text-xs font-black uppercase tracking-[0.12em] text-muted">Item</h2>
              <div className="mt-4 flex gap-3.5">
                <img
                  alt=""
                  className="size-16 shrink-0 rounded-xl bg-soft object-cover"
                  src={order.imageUrl ? mediaUrl(order.imageUrl) : PRODUCT_PLACEHOLDER}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-ink">{order.productName}</p>
                  <p className="text-[11px] text-muted">
                    {order.variantName ? `${order.variantName} · ` : ''}{order.shopName}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">{order.quantity} × {formatMoney(order.unitPrice)}</p>
                </div>
              </div>

              <dl className="mt-4 space-y-1.5 border-t border-line pt-3.5">
                <Row label="Items" value={formatMoney(lineTotal)} />
                {order.discountAmount > 0 && (
                  <Row label="Discount" value={`−${formatMoney(order.discountAmount)}`} />
                )}
                <div className="flex items-center justify-between border-t border-line pt-2.5">
                  <span className="text-xs font-black text-ink">Order total</span>
                  <strong className="text-sm font-black text-ink">{formatMoney(order.totalAmount)}</strong>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="text-xs font-black uppercase tracking-[0.12em] text-muted">Timeline</h2>
              <div className="mt-4"><OrderTimeline entries={order.timeline} /></div>
            </section>
          </div>

          <aside className="h-fit space-y-4">
            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="text-xs font-black uppercase tracking-[0.12em] text-muted">Delivery</h2>
              <div className="mt-3.5 space-y-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <Truck className="text-primary-dark" size={14} />
                  <OrderStatusPill status={order.status} />
                </div>
                {order.courierName ? (
                  <p className="text-muted">
                    Courier <strong className="text-ink">{order.courierName}</strong>
                  </p>
                ) : (
                  <p className="text-muted">A courier picks this up once it is packed.</p>
                )}
                {order.amountDue > 0 && order.amountPaid > 0 && (
                  <p className="rounded-lg bg-primary-light px-2.5 py-2 font-bold text-primary-dark">
                    {formatMoney(order.amountDue)} due on delivery
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="text-xs font-black uppercase tracking-[0.12em] text-muted">Delivering to</h2>
              <div className="mt-3.5 space-y-1 text-[11px] text-muted">
                <p className="font-bold text-ink">{order.recipientName}</p>
                <p>{order.recipientPhone}</p>
                {order.recipientEmail && <p className="break-words">{order.recipientEmail}</p>}
                <p className="flex items-start gap-1.5 pt-1">
                  <MapPin className="mt-px shrink-0" size={12} />
                  <span className="break-words">{order.deliveryAddress}</span>
                </p>
                {order.deliveryNote && (
                  <p className="rounded-lg bg-soft px-2.5 py-2 italic">{order.deliveryNote}</p>
                )}
              </div>

              {order.mapsUrl && (
                <a
                  className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-dark hover:underline"
                  href={order.mapsUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink size={12} /> View pinned location
                </a>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <dt className="text-muted">{label}</dt>
      <dd className="font-bold text-ink">{value}</dd>
    </div>
  )
}
