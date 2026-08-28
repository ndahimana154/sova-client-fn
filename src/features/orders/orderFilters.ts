import { CheckCircle2, LayoutGrid, Package, Truck, Wallet, XCircle, type LucideIcon } from 'lucide-react'
import type { OrderSummary } from '../../lib/ordersApi'

export type OrderFilterId =
  | 'all'
  | 'to_pay'
  | 'packing'
  | 'in_transit'
  | 'shipped'
  | 'cancelled'

const IN_TRANSIT = ['picked_up', 'out_for_delivery']

/** Which bucket an order belongs to, from its order, payment and delivery states. */
export function bucketOf(order: OrderSummary): Exclude<OrderFilterId, 'all'> {
  if (order.status === 'cancelled') return 'cancelled'
  if (order.status === 'completed' || order.deliveryStatus === 'delivered') return 'shipped'
  if (order.awaitingPayment) return 'to_pay'
  if (order.deliveryStatus && IN_TRANSIT.includes(order.deliveryStatus)) return 'in_transit'
  return 'packing'
}

export interface OrderFilter {
  hint: string
  icon: LucideIcon
  id: OrderFilterId
  label: string
}

export const ORDER_FILTERS: OrderFilter[] = [
  { hint: 'Everything you have ordered.', icon: LayoutGrid, id: 'all', label: 'All' },
  { hint: 'Send the payment so we can confirm these.', icon: Wallet, id: 'to_pay', label: 'To pay' },
  { hint: 'Paid and being prepared by the shop.', icon: Package, id: 'packing', label: 'Packing' },
  { hint: 'On the way to you right now.', icon: Truck, id: 'in_transit', label: 'In transit' },
  { hint: 'Delivered and complete.', icon: CheckCircle2, id: 'shipped', label: 'Shipped' },
  { hint: 'These orders were cancelled.', icon: XCircle, id: 'cancelled', label: 'Cancelled' },
]

export function countByBucket(orders: OrderSummary[]): Record<OrderFilterId, number> {
  const counts: Record<OrderFilterId, number> = {
    all: orders.length,
    cancelled: 0,
    in_transit: 0,
    packing: 0,
    shipped: 0,
    to_pay: 0,
  }
  for (const order of orders) counts[bucketOf(order)] += 1
  return counts
}

export const EMPTY_COPY: Record<OrderFilterId, string> = {
  all: 'When you place an order it will show up here.',
  cancelled: 'You have no cancelled orders.',
  in_transit: 'Nothing is on the way right now.',
  packing: 'No orders are being prepared right now.',
  shipped: 'Nothing has been delivered yet.',
  to_pay: 'Nothing is waiting on payment.',
}
