import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginClient, logoutClient } from '../lib/clientAuth'
import { appPaths } from '../router/paths'
import { clearSession, setSession } from '../store/authSlice'
import { resetCommerce } from '../store/commerceSlice'
import { useAppDispatch } from '../store/hooks'
import { setToast } from '../store/uiSlice'

/** Sign-in and sign-out, including where each one lands. */
export function useAuthActions() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const notify = useCallback((text: string) => {
    dispatch(setToast(text))
    window.setTimeout(() => dispatch(setToast('')), 1800)
  }, [dispatch])

  const authenticate = useCallback(async (
    email: string,
    otp: string,
    acceptTerms: boolean,
    redirectTo?: string,
  ) => {
    const session = await loginClient(email, otp, acceptTerms)
    dispatch(setSession(session))
    if (redirectTo) navigate(redirectTo)
    notify('Welcome to SOVA')
  }, [dispatch, navigate, notify])

  const logout = useCallback(async () => {
    try {
      await logoutClient()
    } finally {
      dispatch(clearSession())
      dispatch(resetCommerce())
      navigate(appPaths.home)
      notify('You have been logged out')
    }
  }, [dispatch, navigate, notify])

  return { authenticate, logout, notify }
}
