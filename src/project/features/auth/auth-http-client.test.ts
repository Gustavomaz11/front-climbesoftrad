import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  acceptAccessToken,
  apiRequestJson,
  clearAccessToken,
  refreshAccessToken,
} from './auth-http-client'
import { selectRequestWorkspace } from '../companies/company-request-context'

afterEach(() => {
  vi.unstubAllGlobals()
  clearAccessToken()
  selectRequestWorkspace({ companyId: null, unitId: null })
})

describe('Company-aware HTTP requests', () => {
  it('sends the tab selection as explicit headers', async () => {
    selectRequestWorkspace({ companyId: 'company-a', unitId: 'unit-a' })
    acceptAccessToken({ accessToken: 'current-token', tokenType: 'Bearer', expiresIn: 600 })
    const fetch = vi.fn(async (_url: string, init: RequestInit) => {
      const headers = new Headers(init.headers)
      expect(headers.get('X-Company-Id')).toBe('company-a')
      expect(headers.get('X-Unit-Id')).toBe('unit-a')
      expect(headers.get('Authorization')).toBe('Bearer current-token')
      return new Response(JSON.stringify({ total: 1 }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetch)
    await expect(apiRequestJson('/exams', {}, { authenticated: true })).resolves.toEqual({
      total: 1,
    })
  })

  it('rejects an old JSON body even when headers arrived before switching', async () => {
    let release: (value: unknown) => void = () => {}
    const body = new Promise((resolve) => {
      release = resolve
    })
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: () => body })),
    )
    selectRequestWorkspace({ companyId: 'company-a', unitId: null })
    const request = apiRequestJson('/exams', {}, { authenticated: true })
    await Promise.resolve()
    await Promise.resolve()
    selectRequestWorkspace({ companyId: 'company-b', unitId: null })
    release({ patient: 'Patient A' })
    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('does not restore an old token after the identity changed during refresh', async () => {
    let complete: (value: Response) => void = () => {}
    const response = new Promise<Response>((resolve) => {
      complete = resolve
    })
    vi.stubGlobal('navigator', {})
    vi.stubGlobal(
      'fetch',
      vi.fn(() => response),
    )
    const refresh = refreshAccessToken()
    acceptAccessToken({ accessToken: 'new-identity-token', tokenType: 'Bearer', expiresIn: 600 })
    complete(
      new Response(
        JSON.stringify({ accessToken: 'old-identity-token', tokenType: 'Bearer', expiresIn: 600 }),
        { status: 200 },
      ),
    )
    await expect(refresh).resolves.toBeNull()
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        expect(new Headers(init.headers).get('Authorization')).toBe('Bearer new-identity-token')
        return new Response('{}')
      }),
    )
    await apiRequestJson('/exams', {}, { authenticated: true })
  })
})
