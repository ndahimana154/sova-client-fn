import { X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { normalizeApiError } from '../../api/errors'
import { useAuthActions } from '../../hooks/useAuthActions'
import { requestLoginOtp } from '../../lib/clientAuth'
import { policyApi } from '../../lib/policyApi'
import { appPaths } from '../../router/paths'
import { closeAuthModal } from '../../store/uiSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { AuthModalForm, type AuthFieldErrors } from './AuthModalForm'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const OTP_LENGTH = 6

export function AuthModal() {
  const dispatch = useAppDispatch()
  const open = useAppSelector((state) => state.ui.authModalOpen)
  const redirect = useAppSelector((state) => state.ui.authRedirect)
  const { authenticate } = useAuthActions()

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [termsVersion, setTermsVersion] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<AuthFieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const verifying = useRef(false)

  const close = useCallback(() => dispatch(closeAuthModal()), [dispatch])

  useEffect(() => {
    if (!open) return
    setStep('email')
    setOtp('')
    setError('')
    setErrors({})
    setMessage('')
    setAcceptTerms(false)
    policyApi
      .current()
      .then((policies) => {
        const terms = policies.find((entry) => entry.slug === 'terms_and_conditions')
        if (terms) setTermsVersion(terms.version)
      })
      .catch(() => undefined)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [close, open])

  const verify = useCallback(async (code: string) => {
    if (verifying.current) return
    if (code.length !== OTP_LENGTH) {
      setErrors({ otp: `Enter all ${OTP_LENGTH} characters of your code.` })
      return
    }
    verifying.current = true
    setError('')
    setErrors({})
    setSubmitting(true)
    try {
      await authenticate(email, code, acceptTerms, redirect || undefined)
      dispatch(closeAuthModal())
    } catch (cause) {
      setError(normalizeApiError(cause).message)
    } finally {
      verifying.current = false
      setSubmitting(false)
    }
  }, [acceptTerms, authenticate, dispatch, email, redirect])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (step === 'otp') { await verify(otp); return }

    const nextEmail = String(new FormData(event.currentTarget).get('email') ?? '').trim().toLowerCase()
    const nextErrors: AuthFieldErrors = {}
    if (!nextEmail) nextErrors.email = 'Enter your email address.'
    else if (!EMAIL_PATTERN.test(nextEmail)) nextErrors.email = 'Enter a valid email address.'
    if (!acceptTerms) nextErrors.terms = 'You must accept the terms to continue.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setError('')
    setSubmitting(true)
    try {
      const challenge = await requestLoginOtp(nextEmail)
      setEmail(nextEmail)
      setMessage(challenge.message)
      setOtp('')
      setStep('otp')
    } catch (cause) {
      setError(normalizeApiError(cause).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[130] grid place-items-center bg-ink/45 p-4 backdrop-blur-sm" onMouseDown={close}>
      <div
        aria-labelledby="auth-modal-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-7"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            {/* <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary-dark">Passwordless</p> */}
            <h2 className="mt-1.5 text-xl font-black tracking-[-0.03em] text-ink" id="auth-modal-title">
              {step === 'email' ? 'Sign in to SOVA' : 'Enter your code'}
            </h2>
          </div>
          <button aria-label="Close" className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-soft hover:text-ink" onClick={close} type="button">
            <X size={16} />
          </button>
        </div>

        <p className="mt-2 text-xs leading-5 text-muted">
          {step === 'email' ? 'Enter your email. No password required.' : message}
        </p>

        <AuthModalForm
          acceptTerms={acceptTerms}
          email={email}
          errors={errors}
          formError={error}
          onAcceptTerms={(next) => { setAcceptTerms(next); setErrors((current) => ({ ...current, terms: undefined })) }}
          onBack={() => { setStep('email'); setOtp(''); setError(''); setErrors({}); setMessage('') }}
          onEmailInput={() => setErrors((current) => ({ ...current, email: undefined }))}
          onOtpChange={(value) => { setOtp(value); setError(''); setErrors((current) => ({ ...current, otp: undefined })) }}
          onOtpComplete={(value) => void verify(value)}
          onSubmit={submit}
          otp={otp}
          otpLength={OTP_LENGTH}
          step={step}
          submitting={submitting}
          termsHref={appPaths.terms}
          termsVersion={termsVersion}
        />
      </div>
    </div>,
    document.body,
  )
}
