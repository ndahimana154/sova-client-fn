import type { Product } from '../../data/catalog'

export interface CartItem {
  /** The chosen options, e.g. ["Colour: Red"]. Empty when there was nothing to choose. */
  options: string[]
  product: Product
  quantity: number
}

/**
 * What makes two lines the same line. A product sold in several versions has one
 * line per SKU, so the variant decides wherever there is one.
 */
export const cartLineKey = (item: CartItem): string =>
  item.product.variantId ?? item.product.slug ?? item.product.name
