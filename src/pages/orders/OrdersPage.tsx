import { ChevronRight, PackageSearch } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { OrderStatusPill } from '../../features/checkout/OrderStatusPill'
import { OrderFilterTabs } from '../../features/orders/OrderFilterTabs'
import {
  EMPTY_COPY,
  ORDER_FILTERS,
  bucketOf,
  countByBucket,
  type OrderFilterId,
} from '../../features/orders/orderFilters'
import { useOrders } from '../../hooks/useOrders'
import { PRODUCT_PLACEHOLDER } from '../../lib/constants'
import { mediaUrl } from '../../lib/mediaUrl'
import { formatDateTime } from '../../lib/formatDate'
import { formatMoney } from '../../lib/money'
import { appPaths } from '../../router/paths'

export function OrdersPage() {
  const { error, loading, orders } = useOrders()
  const [filter, setFilter] = useState<OrderFilterId>('all')

  const counts = useMemo(() => countByBucket(orders), [orders])
  const visible = useMemo(
    () => (filter === 'all' ? orders : orders.filter((order) => bucketOf(order) === filter)),
    [filter, orders],
  )

  return (
    <main className="min-h-[70vh] bg-soft/50 py-6 sm:py-8">
      <div className="page-container">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-xl font-black tracking-[-0.03em] text-ink sm:text-2xl">Your orders</h1>
          <p className="text-[11px] text-muted">Every item you have ordered, newest first.</p>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-[11px] font-bold text-red-700">{error}</p>}

        {orders.length > 0 && (
          <div className="mt-4">
            <OrderFilterTabs counts={counts} onChange={setFilter} value={filter} />
            <p className="mt-2 text-[11px] text-muted">
              {ORDER_FILTERS.find((entry) => entry.id === filter)?.hint}
            </p>
          </div>
        )}

        {loading && !orders.length && <p className="mt-4 text-xs text-muted">Loading your orders…</p>}

        {!loading && !error && visible.length === 0 && (
          <div className="mt-4 grid place-items-center rounded-2xl border border-line bg-white p-12 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-primary-light text-primary-dark">
              <PackageSearch size={24} />
            </span>
            <h2 className="mt-4 text-sm font-black text-ink">
              {orders.length ? 'Nothing here' : 'No orders yet'}
            </h2>
            <p className="mt-1.5 text-xs text-muted">{EMPTY_COPY[filter]}</p>
            {!orders.length && (
              <Link className="primary-button mt-5" to={appPaths.home}>Start shopping</Link>
            )}
          </div>
        )}

        <ul className="mt-4 space-y-2">
          {visible.map((order) => (
            <li key={order.id}>
              <Link
                className="group block rounded-2xl border border-line bg-white p-3.5 transition hover:border-primary/40 hover:shadow-soft"
                to={appPaths.orderDetails(order.orderNumber)}
              >
                <div className="flex items-center justify-between gap-3 border-b border-line pb-2.5">
                  <span className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="truncate text-[10px] font-bold text-muted">{order.orderNumber}</span>
                    <span className="whitespace-nowrap rounded-full bg-soft px-2 py-0.5 text-[10px] font-semibold text-muted">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </span>
                  <OrderStatusPill status={order.deliveryStatus ?? order.status} />
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <img
                    alt=""
                    className="size-14 shrink-0 rounded-xl bg-soft object-cover"
                    src={order.imageUrl ? mediaUrl(order.imageUrl) : PRODUCT_PLACEHOLDER}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-ink">{order.productName}</p>
                    <p className="truncate text-[10px] text-muted">
                      {order.variantName ? `${order.variantName} · ` : ''}{order.shopName}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted">× {order.quantity}</p>
                  </div>

                  <div className="shrink-0 text-right">
                    <strong className="block text-sm font-black text-ink">
                      {formatMoney(order.totalAmount)}
                    </strong>
                    {order.awaitingPayment && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-black text-primary-dark">
                        Payment needed
                      </span>
                    )}
                  </div>

                  <ChevronRight
                    className="hidden shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary-dark sm:block"
                    size={16}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
