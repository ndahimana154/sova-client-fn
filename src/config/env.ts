const rawApiUrl = import.meta.env.VITE_API_URL?.trim()

export const env = {
  apiUrl: rawApiUrl,
  /** The seller portal, now a separate app. */
  sellerPortalUrl: import.meta.env.VITE_SELLER_PORTAL_URL?.trim() || 'http://localhost:5174',
  requestTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15_000,
} as const
