import type { MarketplaceVariant } from './marketplaceApi'

export const sellableVariants = (variants: MarketplaceVariant[]) =>
  variants.filter((variant) => variant.isActive)

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

export function resolveVariant(
  variants: MarketplaceVariant[],
  variantId: string,
): MarketplaceVariant | null {
  return (
    sellableVariants(variants).find((variant) => variant.id === variantId) ??
    defaultVariant(variants)
  )
}

export const variantLabel = (variant: MarketplaceVariant): string =>
  variant.name?.trim() || variant.sku

export function variantOptions(variant: MarketplaceVariant): Record<string, string> {
  return Object.fromEntries(
    variant.attributes.map((entry) => [entry.name, entry.value]),
  )
}
