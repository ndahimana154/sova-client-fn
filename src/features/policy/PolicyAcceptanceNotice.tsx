import { AlertTriangle, Check } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatDate } from '../../lib/formatDate'
import { usePolicyStatus } from '../../hooks/usePolicyStatus'
import type { PolicySlug } from '../../lib/policyApi'

export function PolicyAcceptanceNotice({ slug }: { slug: PolicySlug }) {
  const { accept, error, loading, statuses } = usePolicyStatus()
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const status = statuses.find((entry) => entry.slug === slug)

  if (loading || !status) return null

  async function acceptThis() {
    setSaving(true)
    await accept([slug])
    setSaving(false)
    setConfirming(false)
  }

  if (status.needsAcceptance) {
    return (
      <div className="mb-5 rounded-xl border border-primary/30 bg-primary-light px-4 py-3.5">
        <p className="flex items-center gap-2 text-xs font-black text-ink">
          <AlertTriangle size={15} /> Please accept this version
        </p>
        <p className="mt-1 text-[11px] leading-5 text-muted">
          {status.acceptedVersion
            ? `You accepted v${status.acceptedVersion}. Version ${status.currentVersion} is now published and applies to new orders.`
            : `Version ${status.currentVersion} is published and applies to your orders.`}
        </p>
        {error && <p className="mt-2 text-[11px] font-bold text-red-700">{error}</p>}
        <button className="primary-button mt-3" disabled={saving} onClick={() => setConfirming(true)} type="button">
          {saving ? 'Saving…' : `Accept v${status.currentVersion}`}
        </button>

        {confirming && (
          <ConfirmDialog
            body={
              <>
                You are accepting <strong>{status.label}</strong> version{' '}
                <strong>{status.currentVersion}</strong>. We record the version and the date, and
                this cannot be undone.
              </>
            }
            busy={saving}
            confirmLabel={`Yes, accept v${status.currentVersion}`}
            onCancel={() => setConfirming(false)}
            onConfirm={() => void acceptThis()}
            title="Accept this version?"
          />
        )}
      </div>
    )
  }

  return (
    <p className="mb-5 flex flex-wrap items-center gap-2 rounded-xl bg-soft px-4 py-3 text-[11px] text-muted">
      <Check className="text-primary-dark" size={14} />
      You accepted <strong className="text-ink">v{status.acceptedVersion}</strong>
      {status.acceptedAt && <>on {formatDate(status.acceptedAt)}</>}
    </p>
  )
}
