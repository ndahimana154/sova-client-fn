import { FileText, LogOut, Truck, UserRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuthActions } from '../../hooks/useAuthActions'
import { useBuyerProfile } from '../../hooks/useBuyerProfile'
import { appPaths } from '../../router/paths'

const links = [
  { icon: UserRound, label: 'Account settings', to: appPaths.account },
  { icon: FileText, label: 'Terms & conditions', to: appPaths.accountTerms },
  { icon: Truck, label: 'Delivery terms', to: appPaths.accountDeliveryTerms },
]

export type BuyerProfileContext = ReturnType<typeof useBuyerProfile>

export function AccountLayout() {
  const { logout } = useAuthActions()
  const profileState = useBuyerProfile()
  const { profile } = profileState
  const initials = (profile?.name || profile?.email || '?').trim().charAt(0).toUpperCase()

  return (
    <main className="min-h-[70vh] bg-soft/50 py-6 sm:py-8">
      <div className="page-container grid gap-5 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-light text-sm font-black text-primary-dark">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-black text-ink">{profile?.name || 'SOVA customer'}</p>
              <p className="truncate text-[11px] text-muted">{profile?.email || 'Loading…'}</p>
            </div>
          </div>

          <nav aria-label="Account navigation" className="mt-3 space-y-0.5">
            {links.map(({ icon: Icon, label, to }) => (
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[11px] font-bold transition ${
                    isActive ? 'bg-primary-light text-primary-dark' : 'text-muted hover:bg-soft hover:text-ink'
                  }`
                }
                end
                key={to}
                to={to}
              >
                <Icon size={16} /> {label}
              </NavLink>
            ))}
          </nav>

          <button
            className="mt-3 flex w-full items-center gap-2.5 rounded-xl border-t border-line px-3 pb-1 pt-4 text-left text-[11px] font-bold text-red-600 transition hover:text-red-700"
            onClick={() => void logout()}
            type="button"
          >
            <LogOut size={16} /> Log out
          </button>
        </aside>

        <div className="min-w-0">
          <Outlet context={profileState} />
        </div>
      </div>
    </main>
  )
}
