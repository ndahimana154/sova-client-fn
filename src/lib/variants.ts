import type { MarketplaceVariant } from './marketplaceApi'

/** Only SKUs a shopper can actually buy are worth offering. */
export const sellableVariants = (variants: MarketplaceVariant[]) =>
  variants.filter((variant) => variant.isActive)

/**
 * The SKU a listing stands for, and what the product page opens on: the one the
 * seller nominated as default, preferring one that is actually in stock.
 */
export function defaultVariant(variants: MarketplaceVariant[]): MarketplaceVariant | null {
  const sellable = sellableVariants(variants)
  return (
    sellable.find((variant) => variant.isDefault && variant.stockQuantity > 0) ??
    sellable.find((variant) => variant.stockQuantity > 0) ??
    sellable.find((variant) => variant.isDefault) ??
    sellable[0] ??
    null
  )
}

/** The SKU behind an id, falling back to the default rather than to nothing. */
export function resolveVariant(
  variants: MarketplaceVariant[],
  variantId: string,
): MarketplaceVariant | null {
  return (
    sellableVariants(variants).find((variant) => variant.id === variantId) ??
    defaultVariant(variants)
  )
}

/** What to call a version. Sellers name them; the SKU stands in if one slips through. */
export const variantLabel = (variant: MarketplaceVariant): string =>
  variant.name?.trim() || variant.sku

/** A SKU's own options as label/value pairs — its specifications. */
export function variantOptions(variant: MarketplaceVariant): Record<string, string> {
  return Object.fromEntries(
    variant.attributes.map((entry) => [entry.name, entry.value]),
  )
}
