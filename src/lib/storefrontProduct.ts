import type { Product } from '../data/catalog'
import type { MarketplaceProduct } from './marketplaceApi'
import { PRODUCT_PLACEHOLDER } from './constants'
import { mediaUrl } from './mediaUrl'
import { defaultVariant } from './variants'

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
    // Buy Now needs a concrete SKU. Single-version products resolve it here so
    // the buyer never reaches checkout with nothing selected.
    variantId: defaultVariant(item.variants ?? [])?.id,
  }
}
