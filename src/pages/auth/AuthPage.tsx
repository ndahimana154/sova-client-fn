import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Brand } from '../../components/ui/Brand'

export type AuthMode = 'login' | 'signup'

interface AuthPageProps {
  mode: AuthMode
  onAuthenticate: (name?: string, email?: string) => void
  onModeChange: (mode: AuthMode) => void
}

export function AuthPage({ mode, onAuthenticate, onModeChange }: AuthPageProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    const confirmation = String(data.get('confirmation') ?? '')

    if (mode === 'signup' && password !== confirmation) {
      setError('The passwords do not match. Please try again.')
      return
    }

    setError('')
    setSubmitting(true)
    window.setTimeout(() => onAuthenticate(name || undefined, email), 450)
  }

  return (
    <main className="auth-page">
      <a aria-label="Back to the store" className="auth-back" href="#">
        <ArrowLeft size={18} />
        <span>Back to store</span>
      </a>

      <section className="auth-shell">
        <div className="auth-form-panel">
          <div className="auth-form-wrap">
            <Brand />

            <div className="mt-5">
              <p className="auth-eyebrow">{mode === 'login' ? 'Welcome back' : 'Join the marketplace'}</p>
              <h1 className="mt-1.5 text-[1.7rem] font-black tracking-[-0.045em] text-ink sm:text-[1.95rem]">
                {mode === 'login' ? 'Login to SOVA' : 'Create your account'}
              </h1>
              <p className="mt-1.5 max-w-md text-xs leading-5 text-muted">
                {mode === 'login'
                  ? 'Enter your details to access your orders, favorites, and more.'
                  : 'Sign up as a client and make every SOVA shopping trip simpler.'}
              </p>
            </div>

            <div className="auth-tabs" aria-label="Authentication options">
              <button aria-selected={mode === 'login'} onClick={() => onModeChange('login')} role="tab" type="button">Login</button>
              <button aria-selected={mode === 'signup'} onClick={() => onModeChange('signup')} role="tab" type="button">Sign up</button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={submit}>
              {mode === 'signup' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <AuthField icon={<UserRound size={17} />} label="Full name">
                    <input autoComplete="name" name="name" placeholder="Your full name" required type="text" />
                  </AuthField>
                  <AuthField icon={<Phone size={17} />} label="Phone number">
                    <input autoComplete="tel" name="phone" placeholder="+250 7XX XXX XXX" required type="tel" />
                  </AuthField>
                </div>
              )}

              <AuthField icon={<Mail size={17} />} label="Email address">
                <input autoComplete="email" name="email" placeholder="you@example.com" required type="email" />
              </AuthField>

              <div className={mode === 'signup' ? 'grid gap-3 sm:grid-cols-2' : ''}>
                <AuthField icon={<LockKeyhole size={17} />} label="Password">
                  <input
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    minLength={6}
                    name="password"
                    placeholder={mode === 'login' ? 'Enter your password' : 'At least 6 characters'}
                    required
                    type={showPassword ? 'text' : 'password'}
                  />
                  <button
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    type="button"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </AuthField>

                {mode === 'signup' && (
                  <AuthField icon={<LockKeyhole size={17} />} label="Confirm password">
                    <input
                      autoComplete="new-password"
                      name="confirmation"
                      placeholder="Repeat password"
                      required
                      type={showPassword ? 'text' : 'password'}
                    />
                  </AuthField>
                )}
              </div>

              {mode === 'login' ? (
                <div className="flex items-center justify-between gap-3 text-xs">
                  <label className="flex cursor-pointer items-center gap-2 text-ink">
                    <input className="auth-checkbox" defaultChecked type="checkbox" />
                    Remember me
                  </label>
                  <button className="font-semibold text-primary-dark hover:underline" type="button">Forgot password?</button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-muted">
                  <input className="auth-checkbox mt-0.5" required type="checkbox" />
                  <span>I agree to SOVA&apos;s <a className="font-bold text-ink hover:text-primary-dark" href="#terms">Terms of service</a> and Privacy policy.</span>
                </label>
              )}

              {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700" role="alert">{error}</p>}

              <button className="auth-submit" disabled={submitting} type="submit">
                {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create client account'}
              </button>
            </form>

            <div className="auth-divider"><span>or continue with</span></div>

            <button className="auth-google" onClick={() => onAuthenticate(mode === 'signup' ? 'SOVA client' : undefined, 'client@gmail.com')} type="button">
              <GoogleMark />
              Google
            </button>

            <p className="mt-4 text-center text-xs text-muted">
              {mode === 'login' ? 'New to SOVA?' : 'Already have an account?'}{' '}
              <button className="font-bold text-primary-dark hover:underline" onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')} type="button">
                {mode === 'login' ? 'Create an account' : 'Log in'}
              </button>
            </p>
          </div>
        </div>

        <aside className="auth-visual">
          <div className="auth-visual-shade" />
          <div className="auth-visual-copy">
            <span className="grid size-11 place-items-center rounded-full bg-white/15 backdrop-blur">
              <Check size={21} />
            </span>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">Made for better shopping</p>
            <h2 className="mt-3 max-w-md text-3xl font-black leading-tight tracking-[-0.04em] text-white">
              Everything you love, all in one place.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">Save favorites, track orders, and discover offers picked for you.</p>
          </div>
        </aside>
      </section>
    </main>
  )
}

function AuthField({ children, icon, label }: { children: React.ReactNode; icon: React.ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-ink">{label}</span>
      <span className="auth-input">
        <span className="text-muted">{icon}</span>
        {children}
      </span>
    </label>
  )
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" height="18" viewBox="0 0 24 24" width="18">
      <path d="M21.6 12.23c0-.71-.06-1.23-.2-1.77H12v3.4h5.52a4.77 4.77 0 0 1-2.05 3.03l-.02.11 2.97 2.3.2.02c1.84-1.7 2.98-4.2 2.98-7.09Z" fill="#4285F4" />
      <path d="M12 22c2.69 0 4.95-.89 6.6-2.42l-3.14-2.43c-.84.57-1.97.97-3.46.97a5.99 5.99 0 0 1-5.67-4.14l-.1.01-3.09 2.39-.04.1A9.97 9.97 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.33 13.98A6.16 6.16 0 0 1 6 12c0-.69.12-1.35.32-1.98v-.12L3.2 7.47l-.1.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.1 4.48l3.23-2.5Z" fill="#FBBC05" />
      <path d="M12 5.88c1.87 0 3.13.8 3.85 1.47l2.82-2.75C16.94 2.99 14.69 2 12 2a9.97 9.97 0 0 0-8.9 5.52l3.22 2.5A6.01 6.01 0 0 1 12 5.88Z" fill="#EA4335" />
    </svg>
  )
}
