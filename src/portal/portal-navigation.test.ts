import { describe, expect, it } from 'vitest'
import { portalNavigation } from './portal-navigation'
import type { AuthenticatedUser } from '@/project/features/auth/auth.types'

const user = (permissions: string[], role: AuthenticatedUser['role'] = 'USER') => ({ role, permissions } as AuthenticatedUser)

describe('Reporting navigation access', () => {
  it('shows only routes granted to the current user', () => {
    expect(portalNavigation(user(['patients.view'])).map(item => item.to)).toEqual(['/patients'])
    expect(portalNavigation(user([]))).toEqual([])
  })
  it('keeps reporting, overview and patients available for the platform administrator', () => {
    expect(portalNavigation(user([], 'ADMIN')).map(item => item.to)).toEqual(['/overview', '/dashboard', '/patients'])
  })
  it('exposes the personal queue only to doctors with exam access', () => {
    expect(portalNavigation(user(['exams.view'], 'DOCTOR')).map(item => item.to)).toEqual(['/overview', '/dashboard', '/my-queue'])
    expect(portalNavigation(user(['exams.view'])).some(item => item.to === '/my-queue')).toBe(false)
    expect(portalNavigation(user([], 'DOCTOR'))).toEqual([])
  })
})
