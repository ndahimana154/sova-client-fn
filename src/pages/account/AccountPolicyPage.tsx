import { RichTextView } from '../../features/policy/RichTextView'
import { PolicyAcceptanceNotice } from '../../features/policy/PolicyAcceptanceNotice'
import { useCurrentPolicies } from '../../hooks/useCurrentPolicies'
import type { PolicySlug } from '../../lib/policyApi'

interface AccountPolicyPageProps {
  intro: string
  slug: PolicySlug
  title: string
}

/** The same published policy, read inside the account shell instead of a new tab. */
export function AccountPolicyPage({ intro, slug, title }: AccountPolicyPageProps) {
  const { error, loading, policy } = useCurrentPolicies()
  const document = policy(slug)

  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-4">
        <h1 className="text-base font-black text-ink">{title}</h1>
        <p className="text-[11px] text-muted">
          {intro}
          {document && <span className="ml-1">Version {document.version}.</span>}
        </p>
      </header>

      <div className="mt-5">
        <PolicyAcceptanceNotice slug={slug} />
        {loading && <p className="text-xs text-muted">Loading…</p>}
        {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[11px] font-bold text-red-700">{error}</p>}
        {!loading && !error && <RichTextView html={document?.body ?? ''} />}
      </div>
    </section>
  )
}
