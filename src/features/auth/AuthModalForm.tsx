import { Mail } from 'lucide-react'
import type { FormEvent } from 'react'
import { OtpInput } from '../../components/ui/OtpInput'

export interface AuthFieldErrors {
  email?: string
  otp?: string
  terms?: string
}

interface AuthModalFormProps {
  acceptTerms: boolean
  email: string
  errors: AuthFieldErrors
  formError: string
  onAcceptTerms: (next: boolean) => void
  onBack: () => void
  onEmailInput: () => void
  onOtpChange: (value: string) => void
  onOtpComplete: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  otp: string
  otpLength: number
  step: 'email' | 'otp'
  submitting: boolean
  termsHref: string
  termsVersion: string
}

export function AuthModalForm({
  acceptTerms, email, errors, formError, onAcceptTerms, onBack, onEmailInput,
  onOtpChange, onOtpComplete, onSubmit, otp, otpLength, step, submitting,
  termsHref, termsVersion,
}: AuthModalFormProps) {
  return (
    <form className="mt-5 space-y-4" noValidate onSubmit={onSubmit}>
      {step === 'email' ? (
        <>
          <div>
            <label className="block">
              <span className="form-label">Email address</span>
              <span className={`form-input ${errors.email ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-500/10' : ''}`}>
                <Mail className="shrink-0 text-muted" size={15} />
                <input
                  aria-describedby={errors.email ? 'auth-email-error' : undefined}
                  aria-invalid={Boolean(errors.email)}
                  autoComplete="email"
                  autoFocus
                  name="email"
                  onInput={onEmailInput}
                  placeholder="you@example.com"
                  type="email"
                />
              </span>
            </label>
            {errors.email && (
              <p className="mt-1.5 text-[11px] font-bold text-red-600" id="auth-email-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-3.5 py-3 transition ${errors.terms ? 'border-red-400 bg-red-50/50' : 'border-line'}`}>
              <input
                aria-describedby={errors.terms ? 'auth-terms-error' : undefined}
                aria-invalid={Boolean(errors.terms)}
                checked={acceptTerms}
                className="mt-0.5 size-3.5 shrink-0 accent-primary"
                onChange={(event) => onAcceptTerms(event.target.checked)}
                type="checkbox"
              />
              <span className="text-[11px] leading-5 text-muted">
                I accept the{' '}
                <a className="font-bold text-primary-dark hover:underline" href={termsHref} rel="noreferrer" target="_blank">
                  terms and conditions
                </a>
                {termsVersion && <span className="text-muted/70"> (v{termsVersion})</span>}
              </span>
            </label>
            {errors.terms && (
              <p className="mt-1.5 text-[11px] font-bold text-red-600" id="auth-terms-error" role="alert">
                {errors.terms}
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="rounded-xl bg-soft px-4 py-3 text-[11px] text-muted">
            Signing in as <strong className="text-ink">{email}</strong>
          </p>
          <div>
            <OtpInput
              autoFocus
              disabled={submitting}
              invalid={Boolean(errors.otp || formError)}
              label=""
              length={otpLength}
              onChange={onOtpChange}
              onComplete={onOtpComplete}
              value={otp}
            />
            {errors.otp && (
              <p className="mt-1.5 text-[11px] font-bold text-red-600" role="alert">{errors.otp}</p>
            )}
          </div>
          <button className="text-[11px] font-bold text-primary-dark hover:underline" onClick={onBack} type="button">
            Use a different email
          </button>
        </>
      )}

      {formError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-[11px] font-bold text-red-700" role="alert">{formError}</p>
      )}

      <button className="primary-button w-full" disabled={submitting} type="submit">
        {submitting ? 'Please wait…' : step === 'email' ? 'Continue with email' : 'Verify and sign in'}
      </button>
    </form>
  )
}
