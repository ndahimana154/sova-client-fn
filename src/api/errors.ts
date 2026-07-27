import axios from 'axios'

export interface ApiError {
  code?: string
  details?: unknown
  message: string
  status?: number
}

export function normalizeApiError(error: unknown): ApiError {
  if (isApiError(error)) return error
  if (!axios.isAxiosError(error)) {
    return { message: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
  const data = error.response?.data as Partial<ApiError> | undefined
  const message = Array.isArray(data?.message)
    ? data.message.join(' ')
    : data?.message
  return {
    code: data?.code ?? error.code,
    details: data?.details,
    message: message ?? (error.code === 'ECONNABORTED' ? 'The request timed out' : error.message),
    status: error.response?.status,
  }
}

function isApiError(error: unknown): error is ApiError {
  return Boolean(
    error &&
    typeof error === 'object' &&
    typeof (error as ApiError).message === 'string' &&
    ('status' in error || 'code' in error || 'details' in error),
  )
}
