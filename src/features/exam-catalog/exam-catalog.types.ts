import type { ExamModality } from '../exams/exam.types'
export interface ExamType {
  id: string
  name: string
  modality: ExamModality
  groupName: string
  active: boolean
  version: number
}
export interface ExamAlias {
  id: string
  examTypeId: string
  unitId: string | null
  issuer: string | null
  description: string
  modality: ExamModality
  active: boolean
  version: number
}
export interface ExamCatalog {
  types: ExamType[]
  aliases: ExamAlias[]
}
export interface ExamClassification {
  status: 'APPROVED' | 'UNKNOWN' | 'AMBIGUOUS'
  examTypeId: string | null
  ruleVersion: number | null
  aliasId?: string | null
}
