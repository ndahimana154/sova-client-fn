import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthActions } from './hooks/useAuthActions'
import { loadClientSession } from './lib/clientAuth'
import { AuthPage } from './pages/auth/AuthPage'
import { appPaths } from './router/paths'
import { AppRoutes } from './router/routes'
import { setSession } from './store/authSlice'
import { useAppDispatch, useAppSelector } from './store/hooks'


export default function App() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const session = useAppSelector((state) => state.auth.session)
  const { authenticate } = useAuthActions()

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
    <AppRoutes
      authScreen={session ? <Navigate replace to={appPaths.home} /> : <AuthPage onAuthenticate={authenticate} />}
      requireSession={requireSession(session, location.pathname)}
    />
  )
}

/** Screens that need an account redirect guests to the login page. */
function requireSession(session: unknown, pathname: string) {
  return (screen: ReactNode): ReactNode =>
    session ? screen : <Navigate replace state={{ from: pathname }} to={appPaths.login} />
}
