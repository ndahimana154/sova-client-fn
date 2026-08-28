import { useEffect, useState } from 'react'
import { policyApi, type PolicySlug } from '../lib/policyApi'

/** Current published version per policy, for showing what is being accepted. */
export function usePolicyVersions() {
  const [statuses, setStatuses] = useState<Partial<Record<PolicySlug, string>>>({})

  useEffect(() => {
    policyApi
      .current()
      .then((policies) =>
        setStatuses(
          Object.fromEntries(policies.map((entry) => [entry.slug, entry.version])),
        ),
      )
      .catch(() => undefined)
  }, [])

  return { statuses }
}
