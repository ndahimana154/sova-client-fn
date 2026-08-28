import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AuthModal } from './features/auth/AuthModal'
import { RequireSession } from './features/auth/RequireSession'
import { loadClientSession } from './lib/clientAuth'
import { AppRoutes } from './router/routes'
import { setSession } from './store/authSlice'
import { useAppDispatch, useAppSelector } from './store/hooks'

export default function App() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const session = useAppSelector((state) => state.auth.session)

  useEffect(() => {
    const sync = () => dispatch(setSession(loadClientSession()))
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [dispatch])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <>
      <AppRoutes requireSession={requireSession(Boolean(session))} />
      <AuthModal />
    </>
  )
}

/** Guests keep the page they asked for; the sign-in modal opens over it. */
function requireSession(authenticated: boolean) {
  return (screen: ReactNode): ReactNode =>
    authenticated ? screen : <RequireSession>{screen}</RequireSession>
}
