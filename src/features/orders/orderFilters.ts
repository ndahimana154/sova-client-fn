import {
  CheckCircle2,
  ClipboardCheck,
  LayoutGrid,
  Package,
  RotateCcw,
  Truck,
  Wallet,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import type { OrderSummary } from '../../lib/ordersApi'

export type OrderFilterId =
  | 'all'
  | 'to_pay'
  | 'awaiting_packing'
  | 'awaiting_pickup'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

/**
 * The order status now carries the whole lifecycle, so a bucket is just the
 * status — except "to pay", which also covers a confirmed order with a
 * balance still outstanding.
 */
export function bucketOf(order: OrderSummary): Exclude<OrderFilterId, 'all'> {
  if (order.status === 'cancelled') return 'cancelled'
  if (order.status === 'refunded') return 'refunded'
  if (order.status === 'pending_payment') return 'to_pay'
  if (order.status === 'delivered') return 'delivered'
  if (order.status === 'in_transit') return 'in_transit'
  if (order.status === 'awaiting_pickup') return 'awaiting_pickup'
  return 'awaiting_packing'
}

export interface OrderFilter {
  hint: string
  icon: LucideIcon
  id: OrderFilterId
  label: string
}

export const ORDER_FILTERS: OrderFilter[] = [
  { hint: 'Everything you have ordered.', icon: LayoutGrid, id: 'all', label: 'All' },
  {
    hint: 'Send the payment so we can confirm these.',
    icon: Wallet,
    id: 'to_pay',
    label: 'To pay',
  },
  {
    hint: 'Paid and confirmed. The shop is about to pack them.',
    icon: ClipboardCheck,
    id: 'awaiting_packing',
    label: 'Await packing',
  },
  { hint: 'Packed and waiting for a courier.', icon: Package, id: 'awaiting_pickup', label: 'Awaiting pickup' },
  { hint: 'On the way to you right now.', icon: Truck, id: 'in_transit', label: 'In transit' },
  {
    hint: 'Delivered and complete.',
    icon: CheckCircle2,
    id: 'delivered',
    label: 'Delivered',
  },
  { hint: 'These orders were cancelled.', icon: XCircle, id: 'cancelled', label: 'Cancelled' },
  { hint: 'These orders were refunded.', icon: RotateCcw, id: 'refunded', label: 'Refunded' },
]

export function countByBucket(orders: OrderSummary[]): Record<OrderFilterId, number> {
  const counts: Record<OrderFilterId, number> = {
    all: orders.length,
    awaiting_packing: 0,
    cancelled: 0,
    delivered: 0,
    in_transit: 0,
    awaiting_pickup: 0,
    refunded: 0,
    to_pay: 0,
  }
  for (const order of orders) counts[bucketOf(order)] += 1
  return counts
}

export const EMPTY_COPY: Record<OrderFilterId, string> = {
  all: 'When you place an order it will show up here.',
  awaiting_packing: 'Nothing is waiting to be packed.',
  cancelled: 'You have no cancelled orders.',
  delivered: 'Nothing has been delivered yet.',
  in_transit: 'Nothing is on the way right now.',
  awaiting_pickup: 'No orders are waiting for a courier right now.',
  refunded: 'You have no refunded orders.',
  to_pay: 'Nothing is waiting on payment.',
}
