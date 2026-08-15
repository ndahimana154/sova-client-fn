import { Check } from 'lucide-react'
import { AttributeTags } from '../../components/ui/AttributeTags'
import { formatPrice } from '../../lib/formatPrice'
import type { MarketplaceVariant } from '../../lib/marketplaceApi'
import { sellableVariants, variantLabel, variantOptions } from '../../lib/variants'

interface VariantListProps {
  onSelect: (variantId: string) => void
  selectedId: string
  variants: MarketplaceVariant[]
}

export function VariantList({ onSelect, selectedId, variants }: VariantListProps) {
  const sellable = sellableVariants(variants)
  if (sellable.length < 2) return null

  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
      {sellable.map((variant) => {
        const options = variantOptions(variant)
        const selected = variant.id === selectedId
        const out = variant.stockQuantity < 1
        const discount = variant.discountPercent ?? 0
        return (
          <li key={variant.id}>
            <button
              aria-pressed={selected}
              className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                selected ? 'border-primary bg-primary-light/40' : 'border-line hover:border-primary/50'
              } ${out ? 'opacity-60' : ''}`}
              disabled={out}
              onClick={() => onSelect(variant.id)}
              type="button"
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <strong className="truncate text-sm text-ink">{variantLabel(variant)}</strong>
                  {selected && <Check className="shrink-0 text-primary" size={14} />}
                </span>
                {Object.keys(options).length > 0 && (
                  <span className="mt-2 block">
                    <AttributeTags attributes={options} size="sm" />
                  </span>
                )}
                <span className="mt-2 flex flex-wrap items-baseline gap-2">
                  <strong className="text-sm text-ink">{formatPrice(variant.salePrice)}</strong>
                  {discount > 0 && (
                    <s className="text-[11px] text-muted">{formatPrice(variant.price)}</s>
                  )}
                  <span className={`text-[11px] font-bold ${out ? 'text-red-600' : 'text-green-700'}`}>
                    {out ? 'Out of stock' : `${variant.stockQuantity} in stock`}
                  </span>
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
