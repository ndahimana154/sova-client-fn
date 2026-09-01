import { X } from 'lucide-react'
import { createContext, useContext, useEffect, useId, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const ModalFooterSlot = createContext<HTMLElement | null>(null)

interface ModalProps {
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  size?: 'lg' | 'md' | 'sm'
  subtitle?: string
  title: string
}

const WIDTHS = { lg: 'max-w-3xl', md: 'max-w-lg', sm: 'max-w-sm' }

export function Modal({ children, footer, onClose, size = 'md', subtitle, title }: ModalProps) {
  const titleId = useId()
  const [slot, setSlot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return createPortal(
    <div className="overlay-backdrop z-[110] grid place-items-center p-4" onMouseDown={onClose}>
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className={`overlay-panel flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden ${WIDTHS[size]} rounded-2xl border border-line bg-white shadow-[0_30px_80px_rgb(23_26_31/0.22)]`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-sm font-black text-ink" id={titleId}>{title}</h2>
            {subtitle && <p className="mt-0.5 text-[11px] text-muted">{subtitle}</p>}
          </div>
          <button aria-label="Close" className="seller-icon-button" onClick={onClose} type="button"><X size={15} /></button>
        </header>
        <ModalFooterSlot.Provider value={slot}>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        </ModalFooterSlot.Provider>
        <footer
          className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3.5 empty:hidden"
          ref={setSlot}
        >
          {footer}
        </footer>
      </div>
    </div>,
    document.body,
  )
}

export function ModalFooter({ children }: { children: ReactNode }) {
  const slot = useContext(ModalFooterSlot)
  if (!slot) return <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>
  return createPortal(<>{children}</>, slot)
}
