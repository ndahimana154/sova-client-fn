import { ChevronDown, RotateCcw } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { formatPrice } from '../../lib/formatPrice'
import type { MarketplaceProductFacets } from '../../lib/marketplaceApi'
import type { MultiFilter, SearchFilterState } from './useSearchFilters'

/** How many options a list shows before it needs a "show all". */
const COLLAPSED_OPTIONS = 6

interface SearchFilterPanelProps {
  activeCount: number
  facets: MarketplaceProductFacets
  filters: SearchFilterState
  onClear: () => void
  onSetValue: (key: string, value: string) => void
  onSetValues: (values: Record<string, string>) => void
  onToggle: (filter: MultiFilter, value: string) => void
  /** Off inside the mobile drawer, which already carries its own title bar. */
  showTitle?: boolean
}

export function SearchFilterPanel({
  activeCount,
  facets,
  filters,
  onClear,
  onSetValue,
  onSetValues,
  onToggle,
  showTitle = true,
}: SearchFilterPanelProps) {
  const nothingToFilter =
    !facets.categories.length && !facets.shops.length && !facets.brands.length && !facets.price

  return (
    <div>
      {/* With a title this is the same box as the results toolbar, so "Filters" and
          "Results for …" sit on one line and the rule under each column lands at the
          same height. The drawer has its own title bar and needs no such spacer. */}
      <div
        className={`flex items-center ${
          showTitle ? 'min-h-[52px] justify-between pb-4' : 'justify-end'
        } ${!showTitle && activeCount > 0 ? 'pb-3' : ''}`}
      >
        {showTitle && <h2 className="text-sm font-black tracking-[-0.02em] text-ink">Filters</h2>}
        {activeCount > 0 && (
          <button
            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-dark transition hover:underline"
            onClick={onClear}
            type="button"
          >
            <RotateCcw size={12} /> Clear all ({activeCount})
          </button>
        )}
      </div>

      {nothingToFilter && (
        <p className="rounded-2xl border border-dashed border-line bg-soft/40 px-4 py-6 text-xs leading-5 text-muted">
          Filters appear once a search returns products.
        </p>
      )}

      {facets.categories.length > 0 && (
        <FilterSection title="Category">
          <OptionList
            options={facets.categories.map((category) => ({
              checked: filters.categoryIds.includes(category.id),
              count: category.count,
              key: category.id,
              label: category.name,
              onChange: () => onToggle('categoryIds', category.id),
            }))}
          />
        </FilterSection>
      )}

      {facets.price && (
        <FilterSection title="Price">
          <PriceFilter
            max={facets.price.max}
            maxValue={filters.maxPrice}
            min={facets.price.min}
            minValue={filters.minPrice}
            onApply={onSetValues}
          />
        </FilterSection>
      )}

      {facets.shops.length > 0 && (
        <FilterSection title="Shop">
          <OptionList
            options={facets.shops.map((shop) => ({
              checked: filters.shopSlugs.includes(shop.slug),
              count: shop.count,
              key: shop.slug,
              label: shop.name,
              onChange: () => onToggle('shopSlugs', shop.slug),
            }))}
            searchable
            searchLabel="Find a shop"
          />
        </FilterSection>
      )}

      {facets.brands.length > 0 && (
        <FilterSection title="Brand">
          <OptionList
            options={facets.brands.map((brand) => ({
              checked: filters.brands.includes(brand.name),
              count: brand.count,
              key: brand.name,
              label: brand.name,
              onChange: () => onToggle('brands', brand.name),
            }))}
            searchable
            searchLabel="Find a brand"
          />
        </FilterSection>
      )}

      {facets.onSaleCount > 0 && (
        <FilterSection title="Offers">
          <OptionList
            options={[{
              checked: filters.onSale,
              count: facets.onSaleCount,
              key: 'sale',
              label: 'Discounted only',
              onChange: () => onSetValue('sale', filters.onSale ? '' : '1'),
            }]}
          />
        </FilterSection>
      )}
    </div>
  )
}

function FilterSection({ children, title }: { children: ReactNode; title: string }) {
  const [open, setOpen] = useState(true)
  return (
    <section className="border-t border-line py-3">
      <button
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left text-[11px] font-black uppercase tracking-[0.14em] text-ink"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {title}
        <ChevronDown className={`text-muted transition ${open ? 'rotate-180' : ''}`} size={14} />
      </button>
      {open && <div className="pt-3">{children}</div>}
    </section>
  )
}

interface Option {
  checked: boolean
  count: number
  key: string
  label: string
  onChange: () => void
}

function OptionList({
  options,
  searchable = false,
  searchLabel = 'Search',
}: {
  options: Option[]
  searchable?: boolean
  searchLabel?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const [term, setTerm] = useState('')
  const filtered = term.trim()
    ? options.filter((option) => option.label.toLowerCase().includes(term.trim().toLowerCase()))
    : options
  // A ticked option always stays visible, even when the list is collapsed.
  const visible = expanded || term.trim()
    ? filtered
    : filtered.filter((option, index) => index < COLLAPSED_OPTIONS || option.checked)

  return (
    <div className="space-y-2">
      {searchable && options.length > COLLAPSED_OPTIONS && (
        <input
          aria-label={searchLabel}
          className="w-full rounded-full border border-line bg-white px-3 py-1.5 text-xs text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
          onChange={(event) => setTerm(event.target.value)}
          placeholder={searchLabel}
          value={term}
        />
      )}
      <ul className="space-y-1.5">
        {visible.map((option) => (
          <li key={option.key}>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-ink transition hover:text-primary-dark">
              <input
                checked={option.checked}
                className="size-3.5 shrink-0 rounded border-line accent-primary"
                onChange={option.onChange}
                type="checkbox"
              />
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              <span className="shrink-0 text-[10px] font-semibold text-muted">{option.count}</span>
            </label>
          </li>
        ))}
      </ul>
      {!filtered.length && <p className="text-[11px] text-muted">No match.</p>}
      {!term.trim() && filtered.length > COLLAPSED_OPTIONS && (
        <button
          className="text-[11px] font-bold text-primary-dark transition hover:underline"
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          {expanded ? 'Show less' : `Show all ${filtered.length}`}
        </button>
      )}
    </div>
  )
}

/**
 * Bounds are typed freely and only committed on submit, and the shortcuts are
 * cut from the span of the current results rather than from fixed brackets.
 */
function PriceFilter({
  max,
  maxValue,
  min,
  minValue,
  onApply,
}: {
  max: number
  maxValue: string
  min: number
  minValue: string
  onApply: (values: Record<string, string>) => void
}) {
  const [draft, setDraft] = useState({ max: maxValue, min: minValue })

  useEffect(() => { setDraft({ max: maxValue, min: minValue }) }, [maxValue, minValue])

  function commit() {
    const low = draft.min.trim()
    const high = draft.max.trim()
    // A reversed pair is what the shopper meant, just entered the other way round.
    const flipped = Boolean(low && high) && Number(low) > Number(high)
    onApply({ max: flipped ? low : high, min: flipped ? high : low })
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted">
        Results run from {formatPrice(min)} to {formatPrice(max)}
      </p>
      <form
        className="flex items-center gap-2"
        onSubmit={(event) => { event.preventDefault(); commit() }}
      >
        <PriceInput
          label="Minimum price"
          onChange={(value) => setDraft((current) => ({ ...current, min: value }))}
          placeholder={String(min)}
          value={draft.min}
        />
        <span className="text-xs text-muted">–</span>
        <PriceInput
          label="Maximum price"
          onChange={(value) => setDraft((current) => ({ ...current, max: value }))}
          placeholder={String(max)}
          value={draft.max}
        />
        <button
          className="shrink-0 rounded-full bg-ink px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-primary-dark"
          type="submit"
        >
          Go
        </button>
      </form>
      <div className="flex flex-wrap gap-1.5">
        {priceBuckets(min, max).map((bucket) => {
          const active = String(bucket.min) === minValue && String(bucket.max) === maxValue
          return (
            <button
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
                active
                  ? 'border-primary bg-primary-light text-primary-dark'
                  : 'border-line text-muted hover:border-primary hover:text-primary-dark'
              }`}
              key={bucket.label}
              onClick={() => onApply({
                max: active ? '' : String(bucket.max),
                min: active ? '' : String(bucket.min),
              })}
              type="button"
            >
              {bucket.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PriceInput({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <input
      aria-label={label}
      className="min-w-0 flex-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
      inputMode="numeric"
      onChange={(event) => onChange(event.target.value.replace(/[^0-9]/g, ''))}
      placeholder={placeholder}
      value={value}
    />
  )
}

/** Splits the result's own price span into a few round, tappable brackets. */
function priceBuckets(min: number, max: number) {
  if (max <= min) return []
  const step = Math.max(1, roundStep((max - min) / 4))
  const edges: number[] = []
  for (let edge = Math.ceil(min / step) * step; edge < max && edges.length < 3; edge += step) {
    if (edge > min) edges.push(edge)
  }
  const bounds = [min, ...edges, max]
  return bounds.slice(0, -1).map((low, index) => {
    const high = bounds[index + 1]
    return { label: `${compact(low)} – ${compact(high)}`, max: high, min: low }
  })
}

function roundStep(value: number) {
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(value, 1)))
  return Math.max(magnitude, Math.round(value / magnitude) * magnitude)
}

function compact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 ? 1 : 0)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(value % 1_000 ? 1 : 0)}K`
  return String(value)
}
