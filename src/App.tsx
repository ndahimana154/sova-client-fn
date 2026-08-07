import { lazy, useEffect, type ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuthActions } from './hooks/useAuthActions'
import { isSeller, loadClientSession } from './lib/clientAuth'
import { AuthPage } from './pages/auth/AuthPage'
import { appPaths } from './router/paths'
import { AppRoutes } from './router/routes'
import { setSession } from './store/authSlice'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { setToast } from './store/uiSlice'

// Seller screens load on demand, so shoppers never download the dashboard.
const SellerApplicationPage = lazy(() => import('./pages/seller/SellerApplicationPage').then((module) => ({ default: module.SellerApplicationPage })))
const SellerDashboardPage = lazy(() => import('./pages/seller/SellerDashboardPage').then((module) => ({ default: module.SellerDashboardPage })))

export default function App() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const session = useAppSelector((state) => state.auth.session)
  const { authenticate, logout } = useAuthActions()

  // Keep Redux in step with the stored session on load and on browser navigation.
  useEffect(() => {
    const sync = () => dispatch(setSession(loadClientSession()))
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [dispatch])

  useEffect(() => {
    const slug = categorySlugFromPath()
    setCategorySlug(slug)
    if (slug) {
      setPage('category')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [routerLocation.pathname])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  // A non-seller landing on the dashboard is sent home with an explanation.
  useEffect(() => {
    if (location.pathname.startsWith(appPaths.sellerDashboard) && !isSeller(session)) {
      navigate(session ? appPaths.home : appPaths.login, { replace: true })
      if (session) {
        dispatch(setToast('Seller access is required for that page'))
        window.setTimeout(() => dispatch(setToast('')), 1800)
      }
    }
  }, [dispatch, location.pathname, navigate, session])

  return (
    <AppRoutes
      authScreen={session ? <Navigate replace to={appPaths.home} /> : <AuthPage onAuthenticate={authenticate} />}
      requireSeller={requireSession(session, location.pathname)}
      sellerApplication={<SellerApplicationPage />}
      sellerLayout={
        session && isSeller(session)
          ? <SellerDashboardPage onLogout={() => void logout()} onStorefrontOpen={() => navigate(appPaths.home)} user={session.user} />
          : <Navigate replace to={session ? appPaths.home : appPaths.login} />
      }
    />
  )
}

/** Screens that need an account redirect guests to the login page. */
function requireSession(session: unknown, pathname: string) {
  return (screen: ReactNode): ReactNode =>
    session ? screen : <Navigate replace state={{ from: pathname }} to={appPaths.login} />
}
