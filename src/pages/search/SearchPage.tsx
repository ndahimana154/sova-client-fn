import { Loader2, SearchX, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useId, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Select } from '../../components/ui/Select'
import { ProductFeed } from '../../features/catalog/InfiniteProductGrid'
import { SearchFilterPanel } from '../../features/search/SearchFilterPanel'
import { sortOptions, useSearchFilters } from '../../features/search/useSearchFilters'
import { useCommerce } from '../../hooks/useCommerce'
import { useInfiniteProducts } from '../../hooks/useInfiniteProducts'
import { useProductNavigation } from '../../hooks/useProductNavigation'
import { appPaths } from '../../router/paths'

export function SearchPage() {
  const [, setParams] = useSearchParams()
  const { activeCount, clearAll, filters, productQuery, setValue, setValues, toggle } = useSearchFilters()
  const { buyNow, isFavorite, toggleFavorite } = useCommerce()
  const openProduct = useProductNavigation()
  const feed = useInfiniteProducts(productQuery)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const sortLabelId = useId()

  const query = filters.query.trim()
  const { facets, loaded, totalItems } = feed
  const renderPanel = (showTitle: boolean) => (
    <SearchFilterPanel
      activeCount={activeCount}
      facets={facets}
      filters={filters}
      onClear={clearAll}
      onSetValue={setValue}
      onSetValues={setValues}
      onToggle={toggle}
      showTitle={showTitle}
    />
  )

  return (
    <main className="min-h-[65vh]">
      {loaded && feed.suggestions.length > 0 && (
        <section className="border-b border-line bg-soft/60">
          <div className="page-container py-2">
            <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
              Did you mean
              {feed.suggestions.map((suggestion) => (
                <button
                  className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-bold text-ink transition hover:border-primary hover:text-primary-dark"
                  key={suggestion}
                  onClick={() => setParams({ q: suggestion }, { replace: true })}
                  type="button"
                >
                  {suggestion}
                </button>
              ))}
            </p>

          </div>
        </section>
      )}
      <section className="page-container py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100dvh-9rem)] overflow-y-auto pr-1">{renderPanel(true)}</div>
          </aside>

          <div>
            <div className="mb-5 flex items-center gap-3 border-b border-line pb-4">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-xs font-bold text-ink transition hover:border-primary lg:hidden"
                onClick={() => setFiltersOpen(true)}
                type="button"
              >
                <SlidersHorizontal size={14} /> Filters
                {activeCount > 0 && (
                  <span className="grid size-4 place-items-center rounded-full bg-primary text-[9px] text-white">
                    {activeCount}
                  </span>
                )}
              </button>
              <h1 className=" text-xl font-black tracking-[-0.045em] text-ink ">
                {query ? `Results for “${query}”` : 'Browse everything'}
              </h1>
              <p className="hidden text-xs text-muted sm:block">
                {!loaded
                  ? 'Searching…'
                  : `${totalItems} ${totalItems === 1 ? 'product' : 'products'}`}
                {loaded && activeCount > 0 && ` of ${facets.totalMatches}`}
              </p>
              <div className="ml-auto flex items-center gap-2 text-xs text-muted">
                <span id={sortLabelId}>Sort</span>
                <Select
                  aria-labelledby={sortLabelId}
                  className="w-44"
                  onChange={(next) => setValue('sort', next)}
                  options={sortOptions
                    .filter((option) => option.key !== 'relevance' || query)
                    .map((option) => ({ label: option.label, value: option.key }))}
                  size="sm"
                  value={filters.sort}
                />
              </div>
            </div>

            {loaded && !feed.products.length ? (
              <EmptyResults onClear={activeCount > 0 ? clearAll : undefined} query={query} />
            ) : (
              <ProductFeed
                emptyMessage="Nothing matched this search yet."
                isFavorite={isFavorite}
                feed={feed}
                onAdd={buyNow}
                onFavorite={toggleFavorite}
                onOpen={openProduct}
              />
            )}
            {!loaded && (
              <p className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
                <Loader2 className="animate-spin" size={16} /> Searching the marketplace…
              </p>
            )}
          </div>
        </div>
      </section>

      {filtersOpen && (
        <FilterDrawer onClose={() => setFiltersOpen(false)} resultCount={totalItems}>
          {renderPanel(false)}
        </FilterDrawer>
      )}
    </main>
  )
}

function EmptyResults({ onClear, query }: { onClear?: () => void; query: string }) {
  return (
    <div className="rounded-3xl border border-line bg-soft/70 px-6 py-14 text-center">
      <SearchX className="mx-auto text-muted" size={34} />
      <h2 className="mt-4 text-lg font-black text-ink">
        {query ? `No products matched “${query}”` : 'No products match these filters'}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        {onClear
          ? 'Your filters may be too narrow — clearing them brings the rest of the matches back.'
          : 'Try a product name, a category such as Electronics, or a shop name.'}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {onClear && (
          <button className="primary-button" onClick={onClear} type="button">Clear filters</button>
        )}
        <Link className="secondary-button" to={appPaths.home}>Browse all products</Link>
      </div>
    </div>
  )
}

/** Full-screen filters for narrow viewports, where the sidebar has no room. */
function FilterDrawer({
  children,
  onClose,
  resultCount,
}: {
  children: ReactNode
  onClose: () => void
  resultCount: number
}) {
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <button aria-label="Close filters" className="absolute inset-0 bg-ink/40" onClick={onClose} type="button" />
      <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-sm font-black text-ink">Filters</h2>
          <button aria-label="Close filters" className="icon-control" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">{children}</div>
        <div className="border-t border-line p-4">
          <button className="primary-button w-full" onClick={onClose} type="button">
            Show {resultCount} {resultCount === 1 ? 'product' : 'products'}
          </button>
        </div>
      </div>
    </div>
  )
}
