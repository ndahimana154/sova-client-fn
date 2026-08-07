import { LogIn, UserRound } from 'lucide-react'
import { Modal } from './Modal'

interface SignInPromptProps {
  /** What the visitor was trying to do, e.g. "like this video". */
  action: string
  onClose: () => void
  onSignIn: () => void
}

/** Shown when a guest tries something that needs an account. */
export function SignInPrompt({ action, onClose, onSignIn }: SignInPromptProps) {
  return (
    <Modal
      footer={<>
        <button className="seller-outline-button" onClick={onClose} type="button">Not now</button>
        <button className="seller-primary-button" onClick={onSignIn} type="button">
          <LogIn size={14} /> Sign in
        </button>
      </>}
      onClose={onClose}
      size="sm"
      title="Sign in to continue"
    >
      <div className="flex gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-light text-primary-dark">
          <UserRound size={19} />
        </span>
        <p className="text-xs leading-5 text-muted">
          You need a SOVA account to {action}. Signing in takes a moment — we send a
          code to your email, no password needed.
        </p>
      </div>
    </Modal>
  )
}
