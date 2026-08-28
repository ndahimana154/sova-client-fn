import { RichTextView } from '../../features/policy/RichTextView'
import { useCurrentPolicies } from '../../hooks/useCurrentPolicies'
import { LegalPageShell } from './LegalPageShell'

export function TermsPage() {
  const { error, loading, policy } = useCurrentPolicies()
  const terms = policy('terms_and_conditions')

  return (
    <LegalPageShell
      intro="The terms you agree to when you use SOVA."
      title="Terms &amp; conditions"
      version={terms?.version}
    >
      {loading && <p className="text-xs text-muted">Loading…</p>}
      {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[11px] font-bold text-red-700">{error}</p>}
      {!loading && !error && <RichTextView html={terms?.body ?? ''} />}
    </LegalPageShell>
  )
}
