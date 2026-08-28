import { api } from '../api/request'

export type PolicySlug = 'terms_and_conditions' | 'delivery_terms'

export interface PolicyVersion {
  body: string
  id: string
  publishedAt: string
  publishedBy: string | null
  slug: PolicySlug
  version: string
}

export interface PolicyStatus {
  acceptedAt: string | null
  acceptedVersion: string | null
  currentVersion: string | null
  currentVersionId: string | null
  label: string
  needsAcceptance: boolean
  slug: PolicySlug
}

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

export const policyApi = {
  current: async () =>
    (await api.get<ApiEnvelope<PolicyVersion[]>>('/policies/current')).data,

  status: async () =>
    (await api.get<ApiEnvelope<PolicyStatus[]>>('/buyer/policies/status')).data,

  accept: async (slugs: PolicySlug[]) =>
    (await api.post<ApiEnvelope<PolicyStatus[]>, { slugs: PolicySlug[] }>(
      '/buyer/policies/accept',
      { slugs },
    )).data,
}
