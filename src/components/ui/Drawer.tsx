import { X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'

interface DrawerProps {
  ariaLabel: string
  children: ReactNode
  onClose: () => void
  subtitle?: string
  title: string
}

export function Drawer({ ariaLabel, children, onClose, subtitle, title }: DrawerProps) {
  const titleId = useId()

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div className="overlay-backdrop z-[60]" onMouseDown={onClose}>
      <aside
        aria-label={ariaLabel}
        aria-labelledby={titleId}
        aria-modal="true"
        className="drawer-panel ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-ink" id={titleId}>{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          <button aria-label={`Close ${ariaLabel.toLowerCase()}`} className="icon-control" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </aside>
    </div>
  )
}
