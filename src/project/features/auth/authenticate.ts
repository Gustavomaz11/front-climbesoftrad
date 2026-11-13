import {
  acceptAccessToken,
  apiRequest,
  apiRequestJson,
  clearAccessToken,
  HttpResponseError,
  isTokenResponse,
  oauthClientId,
  refreshAccessToken,
} from './auth-http-client'
import {
  AuthenticationError,
  type AuthenticatedUser,
  type AuthorizationCodeResponse,
  type LoginCredentials,
} from './auth.types'
import { isAuthenticatedUser } from './auth-user.contract'
import { selectRequestWorkspace } from '../companies/company-request-context'
import { createPkceAttempt } from './pkce'
import { portalWorkspace } from './portal-workspace'

const isAuthorizationCodeResponse = (value: unknown): value is AuthorizationCodeResponse => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const response = value as Record<string, unknown>
  return (
    typeof response.authorizationCode === 'string' &&
    typeof response.state === 'string' &&
    typeof response.expiresIn === 'number'
  )
}

export const getAuthenticatedUser = async (recoverContext = true): Promise<AuthenticatedUser> => {
  let user: unknown
  try {
    user = await apiRequestJson<unknown>('/auth/me', { method: 'GET' }, { authenticated: true })
  } catch (error) {
    if (
      !recoverContext ||
      !(error instanceof HttpResponseError) ||
      ![400, 403, 404].includes(error.status)
    )
      throw error
    selectRequestWorkspace({ companyId: null, unitId: null })
    user = await apiRequestJson<unknown>('/auth/me', {}, { authenticated: true })
  }

  if (!isAuthenticatedUser(user)) {
    throw new AuthenticationError('server')
  }

  const selection=portalWorkspace(user,import.meta.env.VITE_PORTAL_KIND)
  if (selection && (selection.companyId!==user.activeCompany?.id || selection.unitId!==user.activeCompany?.selectedUnitId)) {
    selectRequestWorkspace(selection)
    const central=await apiRequestJson<unknown>('/auth/me',{}, {authenticated:true})
    if (!isAuthenticatedUser(central)) throw new AuthenticationError('server')
    return central
  }

  return user
}

export const authenticationErrorKindForStatus = (status: number) => {
  if (status === 401) return 'invalid-credentials' as const
  if (status === 403) return 'access-revoked' as const
  if (status === 429) return 'rate-limited' as const
  return 'server' as const
}

export const authenticate = async (credentials: LoginCredentials): Promise<AuthenticatedUser> => {
  try {
    const pkce = await createPkceAttempt()
    const authorization = await apiRequestJson<unknown>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        portalKind: import.meta.env.VITE_PORTAL_KIND || 'sourad',
        email: credentials.email,
        password: credentials.password,
        remember: credentials.remember,
        clientId: oauthClientId,
        codeChallenge: pkce.codeChallenge,
        codeChallengeMethod: 'S256',
        state: pkce.state,
      }),
    })

    if (!isAuthorizationCodeResponse(authorization) || authorization.state !== pkce.state) {
      throw new AuthenticationError('server')
    }

    const token = await apiRequestJson<unknown>('/auth/token', {
      method: 'POST',
      body: JSON.stringify({
        grantType: 'authorization_code',
        clientId: oauthClientId,
        authorizationCode: authorization.authorizationCode,
        codeVerifier: pkce.codeVerifier,
      }),
    })

    if (!isTokenResponse(token)) {
      throw new AuthenticationError('server')
    }

    acceptAccessToken(token)
    return await getAuthenticatedUser()
  } catch (error: unknown) {
    clearAccessToken()

    if (error instanceof AuthenticationError) {
      throw error
    }

    if (error instanceof HttpResponseError) {
      throw new AuthenticationError(authenticationErrorKindForStatus(error.status))
    }

    if (error instanceof TypeError) {
      throw new AuthenticationError('connection')
    }

    throw new AuthenticationError('server')
  }
}

const restoreSession = async (): Promise<AuthenticatedUser | null> => {
  try {
    const token = await refreshAccessToken()
    return token ? await getAuthenticatedUser() : null
  } catch {
    clearAccessToken()
    return null
  }
}

let restoration:Promise<AuthenticatedUser|null>|null=null
export const restoreAuthentication = ():Promise<AuthenticatedUser|null> => {
  if(restoration)return restoration
  // Share both token rotation and workspace recovery. Concurrent React mounts
  // must not invalidate each other's requests when a legacy selection is reset.
  restoration=restoreSession().finally(()=>{restoration=null})
  return restoration
}

export const logout = async (): Promise<void> => {
  try {
    await apiRequest('/auth/logout', { method: 'POST' }, { authenticated: true })
  } finally {
    clearAccessToken()
  }
}

export const changeOwnPassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<AuthenticatedUser> => {
  const user = await apiRequestJson<unknown>(
    '/auth/password',
    { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) },
    { authenticated: true },
  )
  if (!isAuthenticatedUser(user)) throw new AuthenticationError('server')
  return user
}
