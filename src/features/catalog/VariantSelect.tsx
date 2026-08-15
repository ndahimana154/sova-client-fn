import { Select } from '../../components/ui/Select'
import { formatPrice } from '../../lib/formatPrice'
import type { MarketplaceVariant } from '../../lib/marketplaceApi'
import { sellableVariants, variantLabel } from '../../lib/variants'

/** Past this many versions, chips stop being scannable and a searchable list wins. */
const CHIP_LIMIT = 5

interface VariantSelectProps {
  labelId: string
  onSelect: (variantId: string) => void
  selectedId: string
  variants: MarketplaceVariant[]
}

/**
 * Picks the version by the name the seller gave it. Names resolve to one SKU
 * every time, which option-by-option chips cannot promise once a SKU leaves an
 * option blank — and a shopper recognises "Red v6" faster than they assemble it.
 */
export function VariantSelect({ labelId, onSelect, selectedId, variants }: VariantSelectProps) {
  const sellable = sellableVariants(variants)
  if (sellable.length < 2) return null

  if (sellable.length > CHIP_LIMIT) {
    return (
      <Select
        aria-labelledby={labelId}
        className="mt-2 w-full"
        onChange={onSelect}
        options={sellable.map((variant) => ({
          disabled: variant.stockQuantity < 1,
          hint: variant.stockQuantity < 1
            ? 'Out of stock'
            : formatPrice(variant.salePrice),
          label: variantLabel(variant),
          value: variant.id,
        }))}
        value={selectedId}
      />
    )
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {sellable.map((variant) => {
        const active = variant.id === selectedId
        const out = variant.stockQuantity < 1
        return (
          <button
            aria-pressed={active}
            className={`rounded-xl border px-3.5 py-2 text-left transition ${
              active
                ? 'border-primary bg-primary-light text-primary-dark'
                : 'border-line text-ink hover:border-primary hover:text-primary-dark'
            } ${out ? 'opacity-55' : ''}`}
            disabled={out}
            key={variant.id}
            onClick={() => onSelect(variant.id)}
            type="button"
          >
            <span className="block text-xs font-bold">{variantLabel(variant)}</span>
            <span className="mt-0.5 block text-[10px] font-semibold text-muted">
              {out ? 'Out of stock' : formatPrice(variant.salePrice)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
