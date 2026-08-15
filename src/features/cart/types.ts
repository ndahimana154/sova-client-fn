import type { Product } from '../../data/catalog'

export interface CartItem {
  options: string[]
  product: Product
  quantity: number
}
