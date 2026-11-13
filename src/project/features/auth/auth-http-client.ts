import type { TokenResponse } from './auth.types'
import { companyRequestContext, type ContextStamp } from '../companies/company-request-context'

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '')
const oauthClientId = import.meta.env.VITE_OAUTH_CLIENT_ID ?? 'crm-web'
let accessToken: string | null = null
let credentialGeneration = 0
let refreshPromise: Promise<string | null> | null = null

export class HttpResponseError extends Error {
  readonly status: number
  constructor(status: number) {
    super(`HTTP ${status}`)
    this.name = 'HttpResponseError'
    this.status = status
  }
}

const isTokenResponse = (value: unknown): value is TokenResponse => {
  if (!value || typeof value !== 'object') return false
  const token = value as Record<string, unknown>
  return (
    typeof token.accessToken === 'string' &&
    token.tokenType === 'Bearer' &&
    typeof token.expiresIn === 'number'
  )
}

const sendRequest = async (
  path: string,
  init: RequestInit,
  token: string | null,
  stamp?: ContextStamp,
) => {
  const headers = new Headers(init.headers)
  headers.set('X-Portal-Kind', import.meta.env.VITE_PORTAL_KIND || 'sourad')
  headers.set('Accept', 'application/json')
  headers.set('X-Requested-With', 'XMLHttpRequest')
  if (typeof init.body==='string' && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (stamp?.selection.companyId) headers.set('X-Company-Id', stamp.selection.companyId)
  if (stamp?.selection.unitId) headers.set('X-Unit-Id', stamp.selection.unitId)
  const controller = new AbortController()
  const untrack = stamp ? companyRequestContext.track(controller) : () => {}
  const signal = init.signal ? AbortSignal.any([init.signal, controller.signal]) : controller.signal
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers,
      signal,
      credentials: 'include',
    })
    if (stamp) companyRequestContext.assertCurrent(stamp)
    return response
  } finally {
    untrack()
  }
}

export const clearAccessToken = () => {
  accessToken = null
  credentialGeneration += 1
  companyRequestContext.invalidate()
}

const rotateToken = async () => {
  const generation = credentialGeneration
  const response = await sendRequest(
    '/auth/token',
    {
      method: 'POST',
      body: JSON.stringify({ grantType: 'refresh_token', clientId: oauthClientId }),
    },
    null,
  )
  if (generation !== credentialGeneration) return null
  if (!response.ok) {
    clearAccessToken()
    return null
  }
  const payload: unknown = await response.json()
  if (generation !== credentialGeneration) return null
  if (!isTokenResponse(payload)) {
    clearAccessToken()
    return null
  }
  accessToken = payload.accessToken
  return accessToken
}

export const refreshAccessToken = (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise
  // Native Web Locks serialize cookie rotation across tabs without persisting tokens.
  const request =
    typeof navigator !== 'undefined' && navigator.locks
      ? Promise.resolve(navigator.locks.request('sourad.refresh-session', rotateToken))
      : rotateToken()
  refreshPromise = request.finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

interface ApiRequestOptions {
  authenticated?: boolean
  retryOnUnauthorized?: boolean
}

export const apiRequest = async (
  path: string,
  init: RequestInit = {},
  options: ApiRequestOptions = {},
) => {
  const stamp = options.authenticated ? companyRequestContext.capture() : undefined
  const response = await sendRequest(path, init, options.authenticated ? accessToken : null, stamp)
  if (response.status !== 401 || !options.authenticated || options.retryOnUnauthorized === false)
    return response
  const renewed = await refreshAccessToken()
  if (!renewed) return response
  if (stamp) companyRequestContext.assertCurrent(stamp)
  return sendRequest(path, init, renewed, stamp)
}

export const apiRequestJson = async <ResponseBody>(
  path: string,
  init: RequestInit = {},
  options: ApiRequestOptions = {},
) => {
  const stamp = options.authenticated ? companyRequestContext.capture() : undefined
  const response = await apiRequest(path, init, options)
  if (!response.ok) throw new HttpResponseError(response.status)
  const body: unknown = await response.json()
  if (stamp) companyRequestContext.assertCurrent(stamp)
  return body as ResponseBody
}

export const acceptAccessToken = (token: TokenResponse) => {
  credentialGeneration += 1
  accessToken = token.accessToken
}
export { isTokenResponse, oauthClientId }
