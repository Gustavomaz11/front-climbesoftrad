import type { DocumentPresentation } from '../companies/company.types'
import type { JSONContent } from '@tiptap/core'
import type { ProtocolSource } from '../contrast-protocols/contrast-protocol.types'

export interface PrescriptionExamSummary {
  companyId: string
  unitId: string
  unit: string
  id: string
  patientName: string
  studyDescription: string
  performedAt: string
  modality: string
}

export interface PrescriptionSignature {
  userId: string
  name: string
  specialty: string
  crm: string
  signedAt: string
}

export interface ExamPrescription {
  protocolSource?: ProtocolSource | null
  presentation: DocumentPresentation
  exam: PrescriptionExamSummary
  content: JSONContent
  updatedAt: string | null
  signature: PrescriptionSignature | null
}

export interface SavedPrescription {
  presentation?: DocumentPresentation
  updatedAt: string
  signature: PrescriptionSignature | null
}

export interface UploadedPrescriptionImage {
  storageKey: string
  url: string
}
