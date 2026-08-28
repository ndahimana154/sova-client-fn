import type { ReactNode } from 'react'

interface CheckoutFieldProps {
  children: ReactNode
  error?: string
  icon: ReactNode
  label: string
  required?: boolean
}

export function CheckoutField({ children, error, icon, label, required }: CheckoutFieldProps) {
  return (
    <label className="block">
      <span className="form-label">
        {label}
        {required && <span aria-hidden className="ml-0.5 text-red-600">*</span>}
      </span>
      <span
        className={`form-input ${error ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-500/10' : ''}`}
      >
        <span className="shrink-0 text-muted">{icon}</span>
        {children}
      </span>
      {error && <span className="mt-1.5 block text-[11px] font-bold text-red-600" role="alert">{error}</span>}
    </label>
  )
}
