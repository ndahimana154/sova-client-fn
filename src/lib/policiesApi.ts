import { api } from '../api/request'

export interface SystemParameter {
  dataType: string
  description: string | null
  group: string
  key: string
  label: string
  validation: { max?: number; min?: number; required?: boolean; unit?: string } | null
  value: unknown
}

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

export const policiesApi = {
  byGroup: async (group: string) =>
    (await api.get<ApiEnvelope<SystemParameter[]>>(
      `/system-parameters/public?group=${encodeURIComponent(group)}`,
    )).data,
}

export function readString(parameters: SystemParameter[], key: string): string {
  const value = parameters.find((item) => item.key === key)?.value
  return typeof value === 'string' ? value : ''
}

export function readNumber(parameters: SystemParameter[], key: string): number | null {
  const value = parameters.find((item) => item.key === key)?.value
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}
