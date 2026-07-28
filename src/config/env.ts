const rawApiUrl = import.meta.env.VITE_API_URL?.trim()

export const env = {
  apiUrl: rawApiUrl,
  requestTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15_000,
} as const
