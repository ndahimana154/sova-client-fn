import type { Product } from '../data/catalog'
import type { MarketplaceProduct } from './marketplaceApi'
import { mediaUrl } from './mediaUrl'

export const PRODUCT_PLACEHOLDER = '/images/storefront-hero.png'

/**
 * The one place the API's product shape becomes a card. Every grid, the
 * homepage picks and the detail page go through it, so a listing never has to
 * know that the quoted price is the cheapest variant's or that the struck-through
 * price is that same variant's pre-discount one.
 */
export function toStorefrontProduct(item: MarketplaceProduct): Product {
  const images = item.media.filter((media) => media.mediaType === 'IMAGE')
  const cover = images.find((media) => media.isPrimary) ?? images[0]
  const discounted = item.discountPercent > 0
  return {
    badge: discounted ? `${item.discountPercent}% off` : undefined,
    brand: item.brand ?? undefined,
    category: item.categories[0]?.name ?? '',
    image: cover ? mediaUrl(cover.url) : PRODUCT_PLACEHOLDER,
    name: item.name,
    oldPrice: discounted ? item.listPrice : undefined,
    price: item.price,
    rating: 0,
    reviews: 0,
    slug: item.slug,
    variantCount: item.variantCount,
  }
}
