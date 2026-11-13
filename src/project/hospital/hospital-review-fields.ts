import type { HospitalFields, HospitalIntake } from './hospital-api'

const localDateTime = (value: unknown) => {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) return ''
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().replace(/(?:\.000)?Z$/, '')
}

export const initialHospitalFields = (intake: HospitalIntake): Record<string, string> => {
  const fields = Object.fromEntries(Object.entries(intake.fields).map(([key, value]) => [key, value == null ? '' : String(value)]))
  const sourceTime = fields.studyDate && fields.studyTime ? `${fields.studyDate}T${fields.studyTime}` : ''
  return { ...fields, country: fields.country || 'Brasil', priority: fields.priority || 'ROTINA',
    performedAt: localDateTime(intake.fields.performedAt) || sourceTime }
}

export const reviewedHospitalFields = (fields: Record<string, string>): HospitalFields => {
  const result: HospitalFields = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== ''))
  for (const key of ['heightMeters', 'weightKg'] as const) {
    if (!Object.hasOwn(fields, key)) continue
    const value = fields[key]!.trim()
    if (value && !Number.isFinite(Number(value))) throw new Error('Medida inválida.')
    result[key] = value ? Number(value) : null
  }
  for (const key of ['institutionName', 'studyId', 'requesterName']) {
    if (Object.hasOwn(fields, key)) result[key] = fields[key]!
  }
  if (fields.performedAt) result.performedAt = new Date(fields.performedAt).toISOString()
  return result
}
