import { ChevronDown, Heart, MapPin, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Brand } from '../ui/Brand'

interface StoreHeaderProps {
  cartCount: number
  favoriteCount: number
  onCartOpen: () => void
  onFavoritesOpen: () => void
}

const links = ['New arrivals', 'Electronics', 'Fashion', 'Home & living', 'Beauty', 'Groceries']

export function StoreHeader({ cartCount, favoriteCount, onCartOpen, onFavoritesOpen }: StoreHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="bg-ink px-4 py-2 text-center text-[11px] font-medium text-white">
        Free delivery on orders above Rwf 50,000 <span className="mx-2 text-white/30">•</span> Easy returns within 14 days
      </div>
      <div className="page-container flex h-[72px] items-center gap-4">
        <button aria-label="Open menu" className="icon-control lg:hidden" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
        <Brand />
        <label className="mx-auto hidden max-w-xl flex-1 items-center rounded-full bg-soft px-4 py-3 text-muted md:flex">
          <Search size={18} />
          <input className="min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none" placeholder="Search products, categories or brands" />
          <kbd className="rounded-md bg-white px-2 py-1 text-[10px] shadow-sm">⌘ K</kbd>
        </label>
        <div className="ml-auto flex items-center gap-1">
          <button className="header-location">
            <MapPin size={17} /><span><small>Deliver to</small><strong>Kigali</strong></span>
          </button>
          <CountButton count={favoriteCount} icon={<Heart size={19} />} label="Favorites" onClick={onFavoritesOpen} />
          <CountButton count={cartCount} icon={<ShoppingBag size={19} />} label="Cart" onClick={onCartOpen} />
          <button className="icon-control" aria-label="Sign in"><UserRound size={19} /></button>
        </div>
      </div>
      <div className="page-container pb-3 md:hidden">
        <label className="flex items-center rounded-full bg-soft px-4 py-2.5 text-muted">
          <Search size={17} /><input className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" placeholder="Search SOVA" />
        </label>
      </div>
      <nav className="hidden border-t border-line lg:block">
        <div className="page-container flex h-11 items-center gap-7 text-xs font-semibold text-ink/75">
          <button className="flex items-center gap-2 text-primary"><Menu size={16} /> All categories <ChevronDown size={13} /></button>
          {links.map((link) => <a className="transition-colors hover:text-primary" href={`#${link.toLowerCase().replaceAll(' ', '-')}`} key={link}>{link}</a>)}
          <a className="ml-auto rounded-full bg-primary-light px-3 py-1.5 text-primary-dark" href="#deals">Today’s deals</a>
        </div>
      </nav>
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </header>
  )
}

function CountButton({ count, icon, label, onClick }: { count: number; icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button className="icon-control relative" aria-label={label} onClick={onClick}>
      {icon}{count > 0 && <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-white">{count}</span>}
    </button>
  )
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-ink/25" onMouseDown={onClose}>
      <aside className="h-full w-72 bg-white p-5 shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between"><Brand /><button className="icon-control" onClick={onClose}><X size={19} /></button></div>
        <nav className="mt-8 space-y-1">{links.map((link) => <a className="block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-soft" href="#" key={link}>{link}</a>)}</nav>
      </aside>
    </div>
  )
}
