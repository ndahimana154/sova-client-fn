import { Mail, Phone, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { OtpInput } from '../../components/ui/OtpInput'
import type { CheckoutContact } from '../../hooks/useCheckout'
import { PHONE_HINT, PHONE_PLACEHOLDER, formatPhone } from '../../lib/phone'
import { CheckoutField } from './CheckoutField'
import { contactErrors, type ContactErrors } from './validation'

interface ContactStepProps {
  authenticated: boolean
  busy: boolean
  contact: CheckoutContact
  emailError: string
  onChange: <Key extends keyof CheckoutContact>(key: Key, value: CheckoutContact[Key]) => void
  onConfirmCode: (code: string) => void
  onContinue: () => void
  onSendCode: () => void
  otp: string
  otpSent: boolean
  setOtp: (value: string) => void
  verified: boolean
}

export function ContactStep({
  authenticated, busy, contact, emailError, onChange, onConfirmCode, onContinue,
  onSendCode, otp, otpSent, setOtp, verified,
}: ContactStepProps) {
  const [errors, setErrors] = useState<ContactErrors>({})

  function clear(field: keyof ContactErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function attemptContinue() {
    const found = contactErrors(contact, verified)
    setErrors(found)
    if (!Object.values(found).some(Boolean)) onContinue()
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <CheckoutField error={errors.recipientName} icon={<UserRound size={15} />} label="Full name" required>
          <input
            autoComplete="name"
            onChange={(event) => { onChange('recipientName', event.target.value); clear('recipientName') }}
            placeholder="Your full name"
            value={contact.recipientName}
          />
        </CheckoutField>

        <CheckoutField error={errors.recipientPhone} icon={<Phone size={15} />} label="Phone number" required>
          <input
            autoComplete="tel"
            inputMode="tel"
            onChange={(event) => { onChange('recipientPhone', formatPhone(event.target.value)); clear('recipientPhone') }}
            placeholder={PHONE_PLACEHOLDER}
            value={contact.recipientPhone}
          />
        </CheckoutField>

        <p className="-mt-1 text-[10px] text-muted sm:col-span-2">Phone: {PHONE_HINT}.</p>

        <div className="sm:col-span-2">
          <CheckoutField error={errors.recipientEmail} icon={<Mail size={15} />} label="Email address" required>
            <input
              autoComplete="email"
              disabled={authenticated}
              onChange={(event) => { onChange('recipientEmail', event.target.value); clear('recipientEmail') }}
              placeholder="you@example.com"
              type="email"
              value={contact.recipientEmail}
            />
          </CheckoutField>
        </div>
      </div>

      {!authenticated && (
        <div className={`rounded-xl border p-3.5 ${errors.verification ? 'border-red-400 bg-red-50/40' : 'border-line bg-soft/50'}`}>
          <p className="flex items-center gap-2 text-[11px] font-black text-ink">
            <ShieldCheck className="text-primary-dark" size={14} /> Verify your email
            <span aria-hidden className="text-red-600">*</span>
          </p>
          <p className="mt-1 text-[11px] leading-5 text-muted">
            We email a code so you can track this order without an account.
          </p>

          {verified ? (
            <p className="mt-3 rounded-lg bg-primary-light px-3 py-2 text-[11px] font-bold text-primary-dark">
              {contact.recipientEmail} is verified.
            </p>
          ) : otpSent ? (
            <div className="mt-3">
              <OtpInput disabled={busy} label="Verification code" onChange={setOtp} onComplete={onConfirmCode} value={otp} />
              <button className="mt-2.5 text-[11px] font-bold text-primary-dark hover:underline" disabled={busy} onClick={onSendCode} type="button">
                Send another code
              </button>
            </div>
          ) : (
            <div className="mt-3">
              <button className="secondary-button" disabled={busy} onClick={onSendCode} type="button">
                Email me a code
              </button>
              {emailError && <p className="mt-2 text-[11px] font-bold text-red-600" role="alert">{emailError}</p>}
            </div>
          )}

          {errors.verification && !verified && (
            <p className="mt-2 text-[11px] font-bold text-red-600" role="alert">{errors.verification}</p>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button className="primary-button" onClick={attemptContinue} type="button">
          Continue to delivery
        </button>
      </div>
    </div>
  )
}
