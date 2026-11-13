import { describe, expect, it } from 'vitest'
import type { AuthenticatedUser } from './auth.types'
import { canAccessPortal } from './portal-access'

describe('Explicit portal grants', () => {
  const profile = (allowedPortals?: AuthenticatedUser['allowedPortals']) => ({ isPlatformAdmin: false, role: 'DOCTOR', permissions: ['users.create', 'hospital.intake.view'], allowedPortals }) as AuthenticatedUser
  it('uses portal selection independently of broad role permissions', () => {
    const doctor = profile(['sourad'])
    expect(canAccessPortal(doctor, 'sourad')).toBe(true)
    expect(canAccessPortal(doctor, 'hospital')).toBe(false)
    expect(canAccessPortal(doctor, 'configuracoes')).toBe(false)
  })
  it('fails closed when the identity or explicit grant is missing', () => {
    expect(canAccessPortal(null, 'sourad')).toBe(false)
    expect(canAccessPortal(profile(), 'sourad')).toBe(false)
  })
  it('allows platform administration to recover and manage portal grants', () => {
    const administrator = { ...profile([]), isPlatformAdmin: true }
    expect(canAccessPortal(administrator, 'configuracoes')).toBe(true)
  })
})
