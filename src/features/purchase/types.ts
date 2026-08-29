import type { Product } from '../../data/catalog'

/** A single item being bought right now. One purchase, one order, one payment. */
export interface PurchaseItem {
  options: string[]
  product: Product
  quantity: number
}
