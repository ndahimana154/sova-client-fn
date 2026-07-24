import type { Product } from '../../data/catalog'

export interface CartItem {
  product: Product
  quantity: number
}
