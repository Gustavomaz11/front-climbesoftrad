import { describe, it, expect } from 'vitest'
import { examFormSchema, initialExamFormValues } from './exam-form'
const valid = () => ({
  ...initialExamFormValues(),
  patientName: 'Paciente Teste',
  birthDate: '1990-01-01',
  studyDescription: 'Estudo Teste',
  unitId: '11111111-1111-4111-8111-111111111111',
})
describe('Identificação na criação de exames', () => {
  it('exige emissor quando um identificador externo é informado', () => {
    const result = examFormSchema.safeParse({ ...valid(), externalPatientId: '000123' })
    expect(result.success).toBe(false)
    if (!result.success)
      expect(result.error.issues.some((i) => i.path[0] === 'originIssuer')).toBe(true)
  })
  it('preserva zeros e espaços de um identificador de origem', () => {
    const parsed = examFormSchema.parse({
      ...valid(),
      originIssuer: ' MV ',
      externalPatientId: ' 000123 ',
    })
    expect(parsed.externalPatientId).toBe(' 000123 ')
    expect(parsed.originIssuer).toBe('MV')
  })
  it('aceita ausência de identificador para conferência posterior', () =>
    expect(examFormSchema.safeParse(valid()).success).toBe(true))
  it('rejeita identificador composto somente por espaços', () =>
    expect(
      examFormSchema.safeParse({ ...valid(), originIssuer: 'MV', externalPatientId: '   ' })
        .success,
    ).toBe(false))
})
