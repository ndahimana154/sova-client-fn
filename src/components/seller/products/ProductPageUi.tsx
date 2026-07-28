import { Plus, X } from 'lucide-react'
import { type ReactNode } from 'react'
import { normalizeApiError } from '../../../api/errors'
import { env } from '../../../config/env'

export interface AttributeRow { id: string; property: string; value: string }

export function AttributeEditor({ onChange, rows }: { onChange: (rows: AttributeRow[]) => void; rows: AttributeRow[] }) {
  const update = (id: string, field: 'property' | 'value', value: string) =>
    onChange(rows.map((row) => row.id === id ? { ...row, [field]: value } : row))
  return (
    <fieldset>
      <div className="flex items-center justify-between">
        <div><legend className="text-[11px] font-semibold text-muted">Attributes</legend><p className="mt-1 text-[10px] text-muted">Add specifications as property and value pairs.</p></div>
        <button className="seller-outline-button" onClick={() => onChange([...rows, { id: crypto.randomUUID(), property: '', value: '' }])} type="button"><Plus size={13} /> Add attribute</button>
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((row) => <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_32px] gap-2" key={row.id}>
          <input className="seller-plain-input" onChange={(event) => update(row.id, 'property', event.target.value)} placeholder="Property" value={row.property} />
          <input className="seller-plain-input" onChange={(event) => update(row.id, 'value', event.target.value)} placeholder="Value" value={row.value} />
          <button aria-label="Remove attribute" className="seller-icon-button text-red-600" onClick={() => onChange(rows.filter((item) => item.id !== row.id))} type="button"><X size={13} /></button>
        </div>)}
        {!rows.length && <p className="rounded-xl border border-dashed border-line bg-soft/50 p-4 text-center text-[10px] text-muted">No attributes added.</p>}
      </div>
    </fieldset>
  )
}

export function attributesObject(rows: AttributeRow[]): Record<string, string> {
  const attributes: Record<string, string> = {}
  for (const row of rows) {
    const property = row.property.trim().toLowerCase()
    const value = row.value.trim()
    if (!property && !value) continue
    if (!property || !value) throw new Error('Every attribute needs both a property and a value.')
    if (attributes[property] !== undefined) throw new Error(`Attribute “${property}” was added more than once.`)
    attributes[property] = value
  }
  return attributes
}

export const attributeRows = (attributes: Record<string, string>): AttributeRow[] =>
  Object.entries(attributes).map(([property, value]) => ({ id: crypto.randomUUID(), property, value }))
export const attributesText = (attributes: Record<string, string>) =>
  Object.entries(attributes).map(([key, value]) => `${key}: ${value}`).join(', ')

export function Field({ children, className = '', label }: { children: ReactNode; className?: string; label: string }) {
  return <label className={className}><span className="mb-1.5 block text-[11px] font-semibold text-muted">{label}</span><span className="seller-form-control">{children}</span></label>
}

export function Feedback({ error, notice = '' }: { error?: string; notice?: string }) {
  if (!error && !notice) return null
  return <p className={`rounded-xl border px-3 py-2 text-xs font-semibold ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>{error || notice}</p>
}

export function StatusBadge({ value }: { value?: string | null }) {
  const normalized = value?.trim() || 'UNKNOWN'
  const success = normalized === 'ACTIVE' || normalized === 'IN_STOCK'
  return <span className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-bold ${success ? 'border-green-200 bg-green-50 text-green-700' : normalized === 'OUT_OF_STOCK' || normalized === 'REJECTED' ? 'border-red-200 bg-red-50 text-red-700' : 'border-line bg-soft text-muted'}`}>{normalized.replaceAll('_', ' ')}</span>
}

export function PageTitle({ actions, subtitle, title }: { actions?: ReactNode; subtitle: string; title: string }) {
  return <div className="flex flex-wrap items-center gap-3"><div className="min-w-0 flex-1"><h1 className="truncate text-lg font-bold">{title}</h1><p className="mt-1 text-xs text-muted">{subtitle}</p></div>{actions && <div className="flex items-center gap-2">{actions}</div>}</div>
}

export function mediaUrl(url: string) {
  if (/^https?:\/\//.test(url)) return url
  return `${env.apiUrl?.replace(/\/$/, '') ?? ''}/${url.replace(/^\/+/, '')}`
}
export const errorMessage = (error: unknown) => normalizeApiError(error).message
