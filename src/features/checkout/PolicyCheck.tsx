interface PolicyCheckProps {
  checked: boolean
  error?: string
  href: string
  label: string
  onChange: (next: boolean) => void
  version?: string
}

export function PolicyCheck({ checked, error, href, label, onChange, version }: PolicyCheckProps) {
  return (
    <div>
    <label className={`flex cursor-pointer items-start gap-2.5 rounded-xl px-2 py-1.5 ${error ? 'bg-red-50/60' : ''}`}>
      <input
        checked={checked}
        className="mt-0.5 size-3.5 shrink-0 accent-primary"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span className="text-[11px] leading-5 text-muted">
        I accept the{' '}
        <a className="font-bold text-primary-dark hover:underline" href={href} rel="noreferrer" target="_blank">
          {label}
        </a>
        {version && <span className="text-muted/70"> (v{version})</span>}
        <span aria-hidden className="ml-0.5 text-red-600">*</span>
      </span>
    </label>
    {error && <p className="mt-1 px-2 text-[11px] font-bold text-red-600" role="alert">{error}</p>}
    </div>
  )
}
