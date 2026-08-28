import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { appPaths } from '../../router/paths'
import { openAuthModal } from '../../store/uiSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

/**
 * `/login` still exists for emails, bookmarks and old links. It now lands on the
 * storefront with the sign-in modal already open.
 */
export function LoginRedirect() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const session = useAppSelector((state) => state.auth.session)
  const from = (location.state as { from?: string } | null)?.from

  useEffect(() => {
    if (!session) dispatch(openAuthModal(from ?? ''))
  }, [dispatch, from, session])

  return <Navigate replace to={appPaths.home} />
}
