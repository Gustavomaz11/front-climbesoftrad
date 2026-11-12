import type { WorkspaceSelection } from '../companies/company.types'
import { createContext, useContext } from 'react'
import type { AuthenticatedUser, AuthenticationStatus, LoginCredentials } from './auth.types'

export type ContextChangeGuard = () => Promise<void | (() => void)>

export interface AuthenticationContextValue {
  workspaceEpoch: number
  switchingContext: boolean
  selectWorkspace: (selection: WorkspaceSelection) => Promise<void>
  refreshUser: () => Promise<void>
  registerContextChangeGuard: (guard: ContextChangeGuard) => () => void
  status: AuthenticationStatus
  user: AuthenticatedUser | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

export const AuthenticationContext = createContext<AuthenticationContextValue | null>(null)

export const useAuthentication = (): AuthenticationContextValue => {
  const context = useContext(AuthenticationContext)

  if (!context) {
    throw new Error('useAuthentication deve ser utilizado dentro de AuthenticationProvider.')
  }

  return context
}
