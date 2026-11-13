import { describe, expect, it, vi } from 'vitest'
import { CompanyRequestContext, selectRequestWorkspace } from './company-request-context'

describe('Per-tab company request context', () => {
  it('updates context parameters so reload does not restore the old company', () => {
    const replaceState = vi.fn()
    const setItem = vi.fn()
    vi.stubGlobal('window', {
      location: { href: 'http://localhost/dashboard?company=old&unit=old-unit&filter=7' },
      history: { state: { idx: 1 }, replaceState },
      sessionStorage: { setItem },
    })
    try {
      selectRequestWorkspace({ companyId: 'new-company', unitId: null })
      const url = replaceState.mock.calls[0]?.[2] as URL
      expect(url.searchParams.get('company')).toBe('new-company')
      expect(url.searchParams.has('unit')).toBe(false)
      expect(url.searchParams.get('filter')).toBe('7')
      expect(setItem).toHaveBeenCalledWith(
        'sourad.workspace',
        JSON.stringify({ companyId: 'new-company', unitId: null }),
      )
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('aborts outstanding requests and rejects stale responses on company changes', () => {
    const context = new CompanyRequestContext({ companyId: 'a', unitId: null })
    const stamp = context.capture()
    const controller = new AbortController()
    context.track(controller)
    context.select({ companyId: 'b', unitId: null })
    expect(controller.signal.aborted).toBe(true)
    expect(() => context.assertCurrent(stamp)).toThrow()
    expect(context.capture().selection.companyId).toBe('b')
  })

  it('keeps independent tab contexts and treats a unit change as a new context', () => {
    const tabA = new CompanyRequestContext({ companyId: 'a', unitId: null })
    const tabB = new CompanyRequestContext({ companyId: 'b', unitId: null })
    const stamp = tabA.capture()
    tabB.select({ companyId: 'c', unitId: null })
    expect(() => tabA.assertCurrent(stamp)).not.toThrow()
    tabA.select({ companyId: 'a', unitId: 'unit-a' })
    expect(() => tabA.assertCurrent(stamp)).toThrow()
  })
})
