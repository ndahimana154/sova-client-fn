export interface ClientUser {
  email: string
  id: string
  name: string
  permissions: string[]
  roles: string[]
}

export interface ClientSession {
  accessToken: string
  expiresAt: number
  tokenType: string
  user: ClientUser
}

const sessionKey = 'sova-client-session'

export function loadClientSession(): ClientSession | null {
  try {
    const session = JSON.parse(localStorage.getItem(sessionKey) || 'null') as ClientSession | null
    if (!session?.accessToken || !session.user || session.expiresAt <= Date.now()) {
      clearClientSession()
      return null
    }
    return session
  } catch {
    clearClientSession()
    return null
  }
}

export function clearClientSession() {
  localStorage.removeItem(sessionKey)
  localStorage.removeItem('sova-authenticated')
}

export function isSeller(session: ClientSession | null): boolean {
  return Boolean(session?.user.roles.some((role) => role.toUpperCase() === 'SELLER'))
}

export function saveClientSession(session: ClientSession) {
  localStorage.setItem(sessionKey, JSON.stringify(session))
}
