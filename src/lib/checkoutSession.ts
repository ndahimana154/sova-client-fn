const activeKey = 'sova-active-checkout'
const guestContactKey = 'sova-checkout-contact'

export interface ActiveCheckout {
  checkoutNumber: string
  contact: string
}

export function saveActiveCheckout(active: ActiveCheckout) {
  try {
    sessionStorage.setItem(activeKey, JSON.stringify(active))
    localStorage.setItem(guestContactKey, active.contact)
  } catch {
    // Storage is unavailable in private windows; the flow still works in memory.
  }
}

export function loadActiveCheckout(): ActiveCheckout | null {
  try {
    const stored = JSON.parse(sessionStorage.getItem(activeKey) || 'null') as ActiveCheckout | null
    return stored?.checkoutNumber ? stored : null
  } catch {
    return null
  }
}

export function loadCheckoutContact(): string {
  try {
    return localStorage.getItem(guestContactKey) || ''
  } catch {
    return ''
  }
}

export function clearActiveCheckout() {
  try {
    sessionStorage.removeItem(activeKey)
  } catch {
    // Nothing to clear.
  }
}

export function newIdempotencyKey(): string {
  if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID()
  return `k-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const PREFERRED_METHOD_KEY = 'sova-preferred-payment-method'

/** Carries the channel chosen at checkout over to the payment page. */
export function savePreferredMethod(methodId: string) {
  try {
    if (methodId) localStorage.setItem(PREFERRED_METHOD_KEY, methodId)
    else localStorage.removeItem(PREFERRED_METHOD_KEY)
  } catch {
    // A blocked storage API must not break checkout.
  }
}

export function loadPreferredMethod(): string {
  try {
    return localStorage.getItem(PREFERRED_METHOD_KEY) ?? ''
  } catch {
    return ''
  }
}
