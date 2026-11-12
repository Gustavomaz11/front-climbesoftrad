import { describe, expect, it } from 'vitest'
import { authenticationErrorKindForStatus } from './authenticate'

describe('authenticationErrorKindForStatus', () => {
  it('identifica bloqueio temporÃ¡rio por excesso de requisiÃ§Ãµes', () => {
    expect(authenticationErrorKindForStatus(429)).toBe('rate-limited')
  })

  it('identifica uma conta com acesso revogado', () => {
    expect(authenticationErrorKindForStatus(403)).toBe('access-revoked')
  })

  it('preserva o erro genérico de credenciais para 401', () => {
    expect(authenticationErrorKindForStatus(401)).toBe('invalid-credentials')
  })
})
