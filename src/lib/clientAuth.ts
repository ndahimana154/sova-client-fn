import { api } from '../api/request'
import {
  saveClientSession,
  type ClientSession,
  type ClientUser,
} from './clientSession'

export {
  clearClientSession,
  isSeller,
  loadClientSession,
  type ClientSession,
  type ClientUser,
} from './clientSession'

interface LoginResponse {
  accessToken: string
  expiresIn: number
  tokenType: string
  user: ClientUser
}

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

export async function loginClient(email: string, password: string): Promise<ClientSession> {
  const response = await api.post<ApiEnvelope<LoginResponse>, { email: string; password: string }>(
    '/clients/auth/login',
    { email, password },
  )
  const result = response.data
  const session = {
    accessToken: result.accessToken,
    expiresAt: Date.now() + result.expiresIn * 1000,
    tokenType: result.tokenType,
    user: result.user,
  }
  saveClientSession(session)
  return session
}

export async function registerBuyer(email: string, password: string): Promise<void> {
  await api.post<ApiEnvelope<unknown>, { email: string; password: string }>(
    '/clients/auth/register/buyer',
    { email, password },
  )
}
