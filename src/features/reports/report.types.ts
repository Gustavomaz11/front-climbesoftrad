import type { DocumentPresentation } from '../companies/company.types'
import type { JSONContent } from '@tiptap/core'

export interface ReportExamSummary {
  companyId: string
  unitId: string
  unit: string
  id: string
  patientName: string
  studyDescription: string
  performedAt: string
  modality: string
}

export interface ExamReport {
  presentation: DocumentPresentation
  exam: ReportExamSummary
  content: JSONContent
  updatedAt: string | null
}

export interface SavedExamReport {
  updatedAt: string
  contentHash: string
}

export interface UploadedReportImage {
  storageKey: string
  url: string
}
