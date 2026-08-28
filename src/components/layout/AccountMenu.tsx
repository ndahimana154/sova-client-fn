import { ChevronDown, LogOut, MapPin, Package, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthActions } from '../../hooks/useAuthActions'
import { appPaths } from '../../router/paths'

const items = [
  { icon: UserRound, label: 'Profile', to: appPaths.account },
  { icon: Package, label: 'My orders', to: appPaths.orders },
  { icon: MapPin, label: 'Track order', to: appPaths.track },
]

export function AccountMenu({ name }: { name?: string }) {
  const { logout } = useAuthActions()
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [])

  return (
    <div className="relative" ref={container}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-primary-dark"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <UserRound size={16} />
        <span className="hidden sm:inline">{name?.split(' ')[0] || 'My Account'}</span>
        <ChevronDown className={`transition ${open ? 'rotate-180' : ''}`} size={14} />
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg"
          role="menu"
        >
          {items.map(({ icon: Icon, label, to }) => (
            <Link
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-ink transition hover:bg-soft"
              key={to}
              onClick={() => setOpen(false)}
              role="menuitem"
              to={to}
            >
              <Icon className="text-muted" size={16} /> {label}
            </Link>
          ))}
          <button
            className="mt-1 flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-left text-xs font-bold text-red-600 transition hover:bg-red-50"
            onClick={() => { setOpen(false); void logout() }}
            role="menuitem"
            type="button"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}
    </div>
  )
}
