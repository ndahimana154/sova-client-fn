import type { CartItem } from '../features/cart/types'

export const cartLineKey = (item: CartItem): string =>
  item.product.variantId ?? item.product.slug ?? item.product.name
