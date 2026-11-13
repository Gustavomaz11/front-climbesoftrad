import { describe, expect, it } from 'vitest'
import type { HospitalIntake } from './hospital-api'
import { initialHospitalFields, reviewedHospitalFields } from './hospital-review-fields'

const intake = (fields: HospitalIntake['fields']) => ({ fields }) as HospitalIntake
describe('Hospital DICOM review values', () => {
  it('prefills original study date/time when an absolute timestamp is absent', () => {
    const result = initialHospitalFields(intake({ studyDate: '2026-08-13', studyTime: '11:34:57', heightMeters: 1.51, weightKg: 71 }))
    expect(result).toMatchObject({ performedAt: '2026-08-13T11:34:57', studyDate: '2026-08-13', studyTime: '11:34:57', heightMeters: '1.51', weightKg: '71' })
  })
  it('keeps an already reviewed exam timestamp instead of replacing it from metadata', () => {
    const timestamp = '2026-08-14T12:00:00Z'
    const result = initialHospitalFields(intake({ performedAt: timestamp, studyDate: '2026-08-13', studyTime: '11:34:57' }))
    expect(new Date(result.performedAt!).toISOString()).toBe(timestamp.replace('00Z', '00.000Z'))
    expect(result.studyDate).toBe('2026-08-13')
  })
  it('uses numeric measurements and preserves explicit clearing in reviewed drafts', () => {
    expect(reviewedHospitalFields({ heightMeters: '1.55', weightKg: '', institutionName: '', studyId: 'STUDY-123' })).toEqual({ heightMeters: 1.55, weightKg: null, institutionName: '', studyId: 'STUDY-123' })
    expect(() => reviewedHospitalFields({ weightKg: '71kg' })).toThrow()
  })
  it('does not create absent measurements during a review', () => {
    expect(reviewedHospitalFields({ patientName: 'Paciente de teste' })).toEqual({ patientName: 'Paciente de teste' })
  })
})
