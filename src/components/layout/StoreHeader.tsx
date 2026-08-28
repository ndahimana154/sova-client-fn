import { Clapperboard, Heart, MapPin, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { useEffect, useId, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { flattenCategories, marketplaceApi, type MarketplaceCategory } from '../../lib/marketplaceApi'
import { appPaths } from '../../router/paths'
import { AccountMenu } from './AccountMenu'
import { Brand } from '../ui/Brand'
import { Select } from '../ui/Select'
import { CategoryNav } from './CategoryNav'

interface StoreHeaderProps {
  authenticated: boolean
  cartCount: number
  favoriteCount: number
  onCartOpen: () => void
  onFavoritesOpen: () => void
  onSearch: (query: string) => void
  onSignIn: () => void
  seller: boolean
}

export function StoreHeader({
  authenticated,
  cartCount,
  favoriteCount,
  onCartOpen,
  onFavoritesOpen,
  onSearch,
  onSignIn,
  seller,
}: StoreHeaderProps) {
  const [params] = useSearchParams()
  const activeQuery = params.get('q') ?? ''
  const categoryLabelId = useId()
  const [mobileCategory, setMobileCategory] = useState('')
  // On a result page the term matters more than the category picker it replaces.
  const [mobileSearchOpen, setMobileSearchOpen] = useState(Boolean(activeQuery))
  const [searchQuery, setSearchQuery] = useState(activeQuery)
  const navigate = useNavigate()
  const [categories, setCategories] = useState<MarketplaceCategory[]>([])

  useEffect(() => {
    marketplaceApi.categories().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => { setSearchQuery(activeQuery) }, [activeQuery])

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = searchQuery.trim()
    if (query) onSearch(query)
  }

  function clearSearch() {
    setSearchQuery('')
    setMobileSearchOpen(false)
    if (activeQuery) navigate(appPaths.home)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="bg-ink px-4 py-2 text-center text-[11px] font-medium text-white">
        Free delivery in Kigali <span className="mx-2 text-white/30">•</span> Easy returns within 3 days
      </div>
      <div className="page-container flex h-[72px] items-center gap-4">
        <Brand />
        <SearchForm onChange={setSearchQuery} onClear={clearSearch} onSubmit={submitSearch} query={searchQuery} />
        <div className="ml-auto flex items-center gap-1">
          <button className="header-location">
            <MapPin size={17} /><span><small>Deliver to</small><strong>Kigali</strong></span>
          </button>
          <CountButton count={favoriteCount} icon={<Heart size={19} />} label="Favorites" onClick={onFavoritesOpen} />
          <CountButton count={cartCount} icon={<ShoppingBag size={19} />} label="Cart" onClick={onCartOpen} />

          <div className="ml-1 flex items-center gap-1 sm:gap-2">

            {authenticated ? (
              <AccountMenu />
            ) : (
              <>

                <Link className="header-login-link" to={appPaths.sellerPortal()}
                  target="_blank">Sell on SOVA
                </Link>
                <button className="header-signup-link" onClick={onSignIn} type="button"><UserRound size={14} /> Account</button>
              </>
            )}
          </div>

        </div>
      </div>
      <div className="page-container flex items-center gap-2 pb-3 md:hidden">
        {mobileSearchOpen ? (
          <form className="flex min-w-0 flex-1 items-center rounded-full bg-soft px-3 py-2.5 text-muted focus-within:ring-2 focus-within:ring-primary/20" onSubmit={submitSearch} role="search">
            <button aria-label="Search" className="shrink-0" type="submit"><Search size={17} /></button>
            <input
              aria-label="Search products"
              autoFocus
              className="min-w-0 flex-1 bg-transparent px-2 text-sm text-ink outline-none"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search SOVA"
              value={searchQuery}
            />
            <button
              aria-label="Close search"
              className="shrink-0"
              onClick={clearSearch}
              type="button"
            >
              <X size={16} />
            </button>
          </form>
        ) : (
          <>
            <span className="sr-only" id={categoryLabelId}>Browse categories</span>
            <Select
              aria-labelledby={categoryLabelId}
              className="min-w-0 flex-1 [&>button]:h-10 [&>button]:rounded-full [&>button]:font-bold"
              onChange={(slug) => {
                setMobileCategory(slug)
                if (slug) navigate(appPaths.categoryDetails(slug))
              }}
              options={[
                { label: 'All categories', value: '' },
                ...flattenCategories(categories).map((category) => ({
                  label: category.name,
                  value: category.slug,
                })),
              ]}
              placeholder="All categories"
              value={mobileCategory}
            />
            <button
              aria-label="Open search"
              className="icon-control shrink-0"
              onClick={() => setMobileSearchOpen(true)}
              type="button"
            >
              <Search size={18} />
            </button>
          </>
        )}
        {!seller && (authenticated ? (
          <Link
            className="hidden h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 text-[10px] font-black text-white shadow-sm transition hover:bg-primary-dark lg:inline-flex"
            to={appPaths.account}
          >
            <UserRound size={14} /> Account
          </Link>
        ) : (
          <button
            className="hidden h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 text-[10px] font-black text-white shadow-sm transition hover:bg-primary-dark lg:inline-flex"
            onClick={onSignIn}
            type="button"
          >
            <UserRound size={14} /> Account
          </button>
        ))}
      </div>
      <nav className="hidden border-t border-line lg:block">
        <div className="page-container flex h-11 items-center gap-7 text-xs font-semibold text-ink/75">
          <Link className="flex shrink-0 items-center gap-1.5 transition-colors hover:text-primary"
            to={appPaths.videos}>
            <Clapperboard size={15} />
            The FLOW
          </Link>
          <CategoryNav categories={categories} />
          <Link className="ml-auto shrink-0 rounded-full bg-primary-light px-3 py-1.5 text-primary-dark" to={appPaths.deals}>Today&apos;s deals</Link>
        </div>
      </nav>
    </header>
  )
}

function SearchForm({ onChange, onClear, onSubmit, query }: { onChange: (query: string) => void; onClear: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; query: string }) {
  return (
    <form className="mx-auto hidden max-w-xl flex-1 items-center rounded-full bg-soft px-4 py-3 text-muted focus-within:ring-2 focus-within:ring-primary/20 md:flex" onSubmit={onSubmit} role="search">
      <button aria-label="Search" className="shrink-0 transition hover:text-primary-dark" type="submit"><Search size={18} /></button>
      <input aria-label="Search products" className="min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none" onChange={(event) => onChange(event.target.value)} placeholder="Search products, categories, shops or brands" value={query} />
      {query ? (
        <button aria-label="Clear search" className="shrink-0 transition hover:text-ink" onClick={onClear} type="button"><X size={16} /></button>
      ) : (
        <span className="rounded-md bg-white px-2 py-1 text-[10px] shadow-sm">Enter</span>
      )}
    </form>
  )
}

function CountButton({ count, icon, label, onClick }: { count: number; icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button className="icon-control relative" aria-label={label} onClick={onClick}>
      {icon}{count > 0 && <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-white">{count}</span>}
    </button>
  )
}
