import { ShieldCheck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { OtpInput } from '../../components/ui/OtpInput'

interface VerifyEmailModalProps {
  busy: boolean
  email: string
  error: string
  onClose: () => void
  onResend: () => void
  onVerify: (code: string) => void
  verified: boolean
}

export function VerifyEmailModal({
  busy,
  email,
  error,
  onClose,
  onResend,
  onVerify,
  verified,
}: VerifyEmailModalProps) {
  const [otp, setOtp] = useState('')

  useEffect(() => {
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-light text-primary-dark">
            <ShieldCheck size={19} />
          </span>
          <button
            aria-label="Close"
            className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-soft hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        <h2 className="mt-3 text-base font-black text-ink">Confirm your email</h2>
        <p className="mt-1.5 text-xs leading-5 text-muted">
          We sent a code to <strong className="text-ink">{email}</strong>. Enter it to place
          your order — this is how you track it afterwards.
        </p>

        <div className="mt-4">
          <OtpInput
            disabled={busy || verified}
            label="Verification code"
            onChange={setOtp}
            onComplete={onVerify}
            value={otp}
          />
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-[11px] font-bold text-red-700" role="alert">
            {error}
          </p>
        )}

        {verified && (
          <p className="mt-3 rounded-xl bg-primary-light px-3.5 py-2.5 text-[11px] font-bold text-primary-dark">
            Verified. Placing your order…
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3.5">
          <button
            className="text-[11px] font-bold text-primary-dark hover:underline disabled:opacity-50"
            disabled={busy}
            onClick={onResend}
            type="button"
          >
            Send another code
          </button>
          <button
            className="primary-button"
            disabled={busy || otp.length < 6}
            onClick={() => onVerify(otp)}
            type="button"
          >
            {busy ? 'Checking…' : 'Verify and place order'}
          </button>
        </div>
      </div>
    </div>
  )
}
