import { ChevronDown, Clapperboard, Heart, MapPin, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../../data/catalog'
import { appPaths } from '../../router/paths'
import { Brand } from '../ui/Brand'

interface StoreHeaderProps {
  accountActive: boolean
  authenticated: boolean
  cartCount: number
  favoriteCount: number
  onAccountOpen: () => void
  onCartOpen: () => void
  onCategoryOpen: (category: string) => void
  onFavoritesOpen: () => void
  onLoginOpen: () => void
  onSearch: (query: string) => void
  onSellOnSova: () => void
  onSellerDashboardOpen?: () => void
  seller: boolean
}

const links = ['New arrivals', 'Electronics', 'Fashion', 'Home & living', 'Beauty', 'Groceries']

export function StoreHeader({
  accountActive,
  authenticated,
  cartCount,
  favoriteCount,
  onAccountOpen,
  onCartOpen,
  onCategoryOpen,
  onFavoritesOpen,
  onLoginOpen,
  onSearch,
  onSellOnSova,
  onSellerDashboardOpen,
  seller,
}: StoreHeaderProps) {
  const [mobileCategory, setMobileCategory] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = searchQuery.trim()
    if (query) onSearch(query)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="bg-ink px-4 py-2 text-center text-[11px] font-medium text-white">
        Free delivery on orders above Rwf 50,000 <span className="mx-2 text-white/30">•</span> Easy returns within 14 days
      </div>
      <div className="page-container flex h-[72px] items-center gap-4">
        <Brand />
        <SearchForm onChange={setSearchQuery} onSubmit={submitSearch} query={searchQuery} />
        <div className="ml-auto flex items-center gap-1">
          <button className="header-location">
            <MapPin size={17} /><span><small>Deliver to</small><strong>Kigali</strong></span>
          </button>
          {authenticated && !seller && (
            <button
              className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-dark lg:inline-flex"
              onClick={onAccountOpen}
              type="button"
            >
              <UserRound size={16} /> Account
            </button>
          )}
          <CountButton count={favoriteCount} icon={<Heart size={19} />} label="Favorites" onClick={onFavoritesOpen} />
          <CountButton count={cartCount} icon={<ShoppingBag size={19} />} label="Cart" onClick={onCartOpen} />
          {authenticated ? (
            <>
              {seller && (
                <button className="header-login-link hidden sm:block" onClick={onSellerDashboardOpen}>
                  Seller dashboard
                </button>
              )}
              {seller ? (
                <button
                  aria-current={accountActive ? 'page' : undefined}
                  aria-label="Account settings"
                  className={`icon-control ${accountActive ? 'bg-primary-light text-primary-dark' : ''}`}
                  onClick={onAccountOpen}
                >
                  <UserRound size={19} />
                </button>
              ) : (
                <button className="header-login-link" onClick={onSellOnSova}>Sell on SOVA</button>
              )}
            </>
          ) : (
            <div className="ml-1 flex items-center gap-1 sm:gap-2">
              <button className="header-login-link" onClick={onSellOnSova}>Sell on SOVA</button>
              <button className="header-signup-link" onClick={onLoginOpen}><UserRound size={14} /> Account</button>
            </div>
          )}
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
              onClick={() => {
                setSearchQuery('')
                setMobileSearchOpen(false)
              }}
              type="button"
            >
              <X size={16} />
            </button>
          </form>
        ) : (
          <>
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Browse categories</span>
              <select
                aria-label="Browse categories"
                className="h-10 w-full appearance-none rounded-full border border-line bg-white pl-3 pr-8 text-xs font-bold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                onChange={(event) => {
                  const category = event.target.value
                  setMobileCategory(category)
                  if (category) onCategoryOpen(category)
                }}
                value={mobileCategory}
              >
                <option value="">All categories</option>
                {categories.map((category) => <option key={category.name} value={category.name}>{category.name}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
            </label>
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
        {!seller && (
          <button
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 text-[10px] font-black text-white shadow-sm transition hover:bg-primary-dark"
            onClick={authenticated ? onAccountOpen : onLoginOpen}
            type="button"
          >
            <UserRound size={14} /> Account
          </button>
        )}
      </div>
      <nav className="hidden border-t border-line lg:block">
        <div className="page-container flex h-11 items-center gap-7 text-xs font-semibold text-ink/75">
          <button className="flex items-center gap-2 text-primary" onClick={() => onCategoryOpen('All products')}><Menu size={16} /> All products</button>
          <Link className="flex items-center gap-1.5 transition-colors hover:text-primary" to={appPaths.videos}><Clapperboard size={15} /> Shop videos</Link>
          {links.map((link) => <button className="transition-colors hover:text-primary" key={link} onClick={() => onCategoryOpen(link)}>{link}</button>)}
          <a className="ml-auto rounded-full bg-primary-light px-3 py-1.5 text-primary-dark" href="#deals">Today&apos;s deals</a>
        </div>
      </nav>
    </header>
  )
}

function SearchForm({ onChange, onSubmit, query }: { onChange: (query: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; query: string }) {
  return (
    <form className="mx-auto hidden max-w-xl flex-1 items-center rounded-full bg-soft px-4 py-3 text-muted focus-within:ring-2 focus-within:ring-primary/20 md:flex" onSubmit={onSubmit} role="search">
      <button aria-label="Search" className="shrink-0 transition hover:text-primary-dark" type="submit"><Search size={18} /></button>
      <input aria-label="Search products" className="min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none" onChange={(event) => onChange(event.target.value)} placeholder="Search products, categories or brands" value={query} />
      <span className="rounded-md bg-white px-2 py-1 text-[10px] shadow-sm">Enter</span>
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
