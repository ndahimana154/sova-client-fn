import { ChevronDown, Heart, MapPin, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
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
  onSignupOpen: () => void
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
  onSignupOpen,
}: StoreHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
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
        <button aria-label="Open menu" className="icon-control lg:hidden" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
        <Brand />
        <SearchForm onChange={setSearchQuery} onSubmit={submitSearch} query={searchQuery} />
        <div className="ml-auto flex items-center gap-1">
          <button className="header-location">
            <MapPin size={17} /><span><small>Deliver to</small><strong>Kigali</strong></span>
          </button>
          <CountButton count={favoriteCount} icon={<Heart size={19} />} label="Favorites" onClick={onFavoritesOpen} />
          <CountButton count={cartCount} icon={<ShoppingBag size={19} />} label="Cart" onClick={onCartOpen} />
          {authenticated ? (
            <button
              aria-current={accountActive ? 'page' : undefined}
              aria-label="Account settings"
              className={`icon-control ${accountActive ? 'bg-primary-light text-primary-dark' : ''}`}
              onClick={onAccountOpen}
            >
              <UserRound size={19} />
            </button>
          ) : (
            <div className="ml-1 flex items-center gap-1 sm:gap-2">
              <button className="header-login-link" onClick={onLoginOpen}>Log in</button>
              <button className="header-signup-link" onClick={onSignupOpen}>Sign up</button>
            </div>
          )}
        </div>
      </div>
      <div className="page-container pb-3 md:hidden">
        <form className="flex items-center rounded-full bg-soft px-4 py-2.5 text-muted focus-within:ring-2 focus-within:ring-primary/20" onSubmit={submitSearch} role="search">
          <button aria-label="Search" className="shrink-0" type="submit"><Search size={17} /></button>
          <input aria-label="Search products" className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search SOVA" value={searchQuery} />
        </form>
      </div>
      <nav className="hidden border-t border-line lg:block">
        <div className="page-container flex h-11 items-center gap-7 text-xs font-semibold text-ink/75">
          <button className="flex items-center gap-2 text-primary" onClick={() => onCategoryOpen('All products')}><Menu size={16} /> All categories <ChevronDown size={13} /></button>
          {links.map((link) => <button className="transition-colors hover:text-primary" key={link} onClick={() => onCategoryOpen(link)}>{link}</button>)}
          <a className="ml-auto rounded-full bg-primary-light px-3 py-1.5 text-primary-dark" href="#deals">Today&apos;s deals</a>
        </div>
      </nav>
      {menuOpen && <MobileMenu onCategoryOpen={onCategoryOpen} onClose={() => setMenuOpen(false)} />}
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

function MobileMenu({ onCategoryOpen, onClose }: { onCategoryOpen: (category: string) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-ink/25" onMouseDown={onClose}>
      <aside className="h-full w-72 bg-white p-5 shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between"><Brand /><button className="icon-control" onClick={onClose}><X size={19} /></button></div>
        <nav className="mt-8 space-y-1">
          <button className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-soft" onClick={() => { onCategoryOpen('All products'); onClose() }} type="button">All categories</button>
          {links.map((link) => <button className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-soft" key={link} onClick={() => { onCategoryOpen(link); onClose() }} type="button">{link}</button>)}
        </nav>
      </aside>
    </div>
  )
}
