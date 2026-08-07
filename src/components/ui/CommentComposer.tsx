import { LogIn, Send, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'

interface CommentComposerProps {
  autoFocus?: boolean
  busy?: boolean
  disabled?: boolean
  onCancel?: () => void
  /** Called when a signed-out visitor taps the disabled field. */
  onSignIn?: () => void
  onSubmit: (content: string) => void | Promise<void>
  placeholder?: string
  /** Shown above the field when replying to someone. */
  replyingTo?: string
}

const MAX_LENGTH = 1000

/**
 * Auto-growing comment field. Enter sends, Ctrl/Cmd+Enter starts a new line,
 * and the box grows as the text wraps instead of scrolling inside one line.
 */
export function CommentComposer({
  autoFocus = false,
  busy = false,
  disabled = false,
  onCancel,
  onSignIn,
  onSubmit,
  placeholder = 'Add a comment…',
  replyingTo,
}: CommentComposerProps) {
  const [value, setValue] = useState('')
  const field = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const node = field.current
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${Math.min(node.scrollHeight, 160)}px`
  }, [value])

  useEffect(() => {
    if (autoFocus) field.current?.focus()
  }, [autoFocus])

  async function send() {
    const content = value.trim()
    if (!content || busy || disabled) return
    try {
      await onSubmit(content)
      setValue('')
    } catch {
      // Posting failed — keep what was typed so it can be retried.
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Escape' && onCancel) { onCancel(); return }
    if (event.key !== 'Enter') return
    if (event.ctrlKey || event.metaKey) {
      // Deliberate new line: let the textarea insert it.
      return
    }
    if (event.shiftKey) return
    event.preventDefault()
    void send()
  }

  if (disabled && onSignIn) {
    return (
      <button
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 text-xs font-bold text-ink transition hover:border-primary hover:bg-primary-light/40 hover:text-primary-dark"
        onClick={onSignIn}
        type="button"
      >
        <LogIn size={14} /> Sign in to join the conversation
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-2.5">
      {replyingTo && (
        <p className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-soft px-2.5 py-1.5 text-[11px] text-muted">
          <span className="truncate">Replying to <strong className="text-ink">@{replyingTo}</strong></span>
          {onCancel && (
            <button aria-label="Cancel reply" className="shrink-0 text-muted hover:text-ink" onClick={onCancel} type="button">
              <X size={13} />
            </button>
          )}
        </p>
      )}
      <div className="flex items-end gap-2">
        <textarea
          className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-1 py-1.5 text-xs leading-5 text-ink outline-none placeholder:text-muted disabled:opacity-60"
          disabled={disabled || busy}
          maxLength={MAX_LENGTH}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Sign in to join the conversation' : placeholder}
          ref={field}
          rows={1}
          value={value}
        />
        <button
          aria-label="Post comment"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white transition hover:bg-primary-dark disabled:opacity-35"
          disabled={!value.trim() || busy || disabled}
          onClick={() => void send()}
          type="button"
        >
          <Send size={15} />
        </button>
      </div>
      {!disabled && (
        <p className="mt-1 px-1 text-[10px] text-muted">
          Enter to post · Ctrl+Enter for a new line{value.length > MAX_LENGTH - 100 ? ` · ${MAX_LENGTH - value.length} left` : ''}
        </p>
      )}
    </div>
  )
}
