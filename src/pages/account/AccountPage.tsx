import { Bell, ChevronLeft, LogOut, Mail, MapPin, ShieldCheck, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuthActions } from '../../hooks/useAuthActions'

interface AccountSettings {
  deals: boolean
  email: string
  name: string
  orderUpdates: boolean
  productNews: boolean
}

const defaultSettings: AccountSettings = {
  deals: true,
  email: '',
  name: '',
  orderUpdates: true,
  productNews: false,
}

function loadSettings(): AccountSettings {
  try {
    const storedSettings = localStorage.getItem('sova-account-settings')
    return storedSettings ? { ...defaultSettings, ...JSON.parse(storedSettings) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

export function AccountPage() {
  const { logout, notify } = useAuthActions()
  const onLogout = () => void logout()
  const onSaved = () => notify('Your settings have been saved')
  const [settings, setSettings] = useState<AccountSettings>(loadSettings)

  function updateSetting<Key extends keyof AccountSettings>(key: Key, value: AccountSettings[Key]) {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    localStorage.setItem('sova-account-settings', JSON.stringify(settings))
    onSaved()
  }

  return (
    <main className="min-h-[70vh] bg-soft/60 py-8 sm:py-12">
      <div className="page-container">
        <a className="inline-flex items-center gap-2 text-xs font-bold text-muted transition hover:text-primary-dark" href="#">
          <ChevronLeft size={16} /> Back to shopping
        </a>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-3xl border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center gap-4 border-b border-line pb-5">
              <span className="grid size-12 place-items-center rounded-full bg-primary-light text-primary-dark">
                <UserRound size={22} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{settings.name || 'SOVA customer'}</p>
                <p className="mt-1 truncate text-xs text-muted">{settings.email || 'Add your account details'}</p>
              </div>
            </div>
            <nav aria-label="Account navigation" className="mt-4 space-y-1">
              <span aria-current="page" className="flex items-center gap-3 rounded-xl bg-primary-light px-3 py-3 text-xs font-bold text-primary-dark">
                <UserRound size={17} /> Account settings
              </span>
              <span className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold text-muted">
                <MapPin size={17} /> Delivery addresses
              </span>
              <span className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold text-muted">
                <ShieldCheck size={17} /> Privacy & security
              </span>
              <button
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
                onClick={onLogout}
                type="button"
              >
                <LogOut size={17} /> Log out
              </button>
            </nav>
          </aside>

          <form className="space-y-6" onSubmit={saveSettings}>
            <section className="rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary-dark">Your account</p>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-ink">Account settings</h1>
                <p className="mt-2 text-sm text-muted">Manage your profile and choose how SOVA keeps in touch.</p>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold text-ink">Full name</span>
                  <span className="mt-2 flex items-center rounded-xl border border-line bg-white px-4 focus-within:border-primary">
                    <UserRound className="text-muted" size={17} />
                    <input
                      autoComplete="name"
                      className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-ink outline-none"
                      onChange={(event) => updateSetting('name', event.target.value)}
                      placeholder="Your full name"
                      type="text"
                      value={settings.name}
                    />
                  </span>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-ink">Email address</span>
                  <span className="mt-2 flex items-center rounded-xl border border-line bg-white px-4 focus-within:border-primary">
                    <Mail className="text-muted" size={17} />
                    <input
                      autoComplete="email"
                      className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-ink outline-none"
                      onChange={(event) => updateSetting('email', event.target.value)}
                      placeholder="you@example.com"
                      type="email"
                      value={settings.email}
                    />
                  </span>
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-primary-light text-primary-dark">
                  <Bell size={18} />
                </span>
                <div>
                  <h2 className="text-lg font-black text-ink">Notifications</h2>
                  <p className="text-xs text-muted">Choose the updates you want to receive.</p>
                </div>
              </div>
              <div className="mt-6 divide-y divide-line">
                <Preference
                  checked={settings.orderUpdates}
                  description="Delivery progress, payment receipts, and important order changes."
                  label="Order updates"
                  onChange={(checked) => updateSetting('orderUpdates', checked)}
                />
                <Preference
                  checked={settings.deals}
                  description="Price drops and offers selected for you."
                  label="Deals and offers"
                  onChange={(checked) => updateSetting('deals', checked)}
                />
                <Preference
                  checked={settings.productNews}
                  description="New collections, brands, and marketplace announcements."
                  label="Product news"
                  onChange={(checked) => updateSetting('productNews', checked)}
                />
              </div>
            </section>

            <div className="flex justify-end">
              <button className="primary-button min-w-36" type="submit">Save settings</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

function Preference({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean
  description: string
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 py-5 first:pt-0 last:pb-0">
      <span>
        <span className="block text-sm font-bold text-ink">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-muted">{description}</span>
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? 'bg-primary' : 'bg-line'}`}>
        <input
          checked={checked}
          className="peer sr-only"
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition ${checked ? 'left-6' : 'left-1'}`} />
      </span>
    </label>
  )
}
