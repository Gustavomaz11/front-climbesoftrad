import type { PortalKind } from './portal-access'
import type { AccessibleCompany, ActiveCompany } from '../companies/company.types'

export interface LoginCredentials {
  email: string
  password: string
  remember: boolean
}

export interface AuthenticatedUser {
  allowedPortals?: PortalKind[]
  centralCompanyId?: string
  id: string
  email: string
  username: string | null
  fullName: string
  role: 'USER' | 'ADMIN' | 'DOCTOR'
  mustChangePassword: boolean
  mustUploadSignature?: boolean
  isPlatformAdmin: boolean
  companies: AccessibleCompany[]
  activeCompany: ActiveCompany | null
  accessRole: {
    id: string
    code: string
    name: string
  }
  permissions: string[]
}

export const hasPermission = (user: AuthenticatedUser, permission: string) =>
  user.permissions.includes(permission)

export const hasAnyPermission = (user: AuthenticatedUser, permissions: string[]) =>
  permissions.some((permission) => user.permissions.includes(permission))

export interface AuthorizationCodeResponse {
  authorizationCode: string
  state: string
  expiresIn: number
}

export interface TokenResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

export type AuthenticationStatus = 'loading' | 'authenticated' | 'unauthenticated'

export type AuthenticationErrorKind =
  'invalid-credentials' | 'access-revoked' | 'rate-limited' | 'connection' | 'server'

export class AuthenticationError extends Error {
  readonly kind: AuthenticationErrorKind

  constructor(kind: AuthenticationErrorKind) {
    super(kind)
    this.name = 'AuthenticationError'
    this.kind = kind
  }
}
