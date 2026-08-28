import { LogIn } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { openAuthModal } from '../../store/uiSlice'
import { useAppDispatch } from '../../store/hooks'

/**
 * Rather than bouncing guests to a separate page, we keep them on the URL they
 * asked for and open the sign-in modal over a short prompt.
 */
export function RequireSession({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const location = useLocation()

  useEffect(() => {
    dispatch(openAuthModal(location.pathname))
  }, [dispatch, location.pathname])

  return (
    <main className="grid min-h-[60vh] place-items-center bg-soft/50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary-light text-primary-dark">
          <LogIn size={20} />
        </span>
        <h1 className="mt-4 text-sm font-black text-ink">Sign in to continue</h1>
        <p className="mt-1.5 text-[11px] leading-5 text-muted">
          This page needs an account. Signing in brings you straight back here.
        </p>
        <button
          className="primary-button mt-5"
          onClick={() => dispatch(openAuthModal(location.pathname))}
          type="button"
        >
          Sign in
        </button>
      </div>
      <div aria-hidden className="sr-only">{children}</div>
    </main>
  )
}
