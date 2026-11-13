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
})
