export interface Patient {
  id: string
  companyId: string
  fullName: string
  socialName: string | null
  birthDate: string | null
  sex: 'MASCULINO' | 'FEMININO' | null
  country: string
  email: string | null
  revision: number
  mergedIntoId: string | null
  canManage: boolean
}
export interface PatientIdentifier {
  id: string
  unitId: string
  unitName: string
  issuer: string
  originalValue: string
  source: string
  version: number
}
export interface PatientRevision {
  id: string
  version: number
  demographics: Partial<Patient>
  reason: string
  createdAt: string
}
export interface PatientDetail extends Patient {
  identifiers: PatientIdentifier[]
  revisions: PatientRevision[]
  reviews: Array<{ id: string; kind: string; status: string }>
}
export interface PatientCandidate {
  patientId: string
  fullName: string
  birthDate: string | null
  sex: string | null
  revision: number
  confidence: string
  reasons: string[]
  automatic: false
}
export interface PatientReview {
  id: string
  unitId: string
  patientId: string
  examId: string | null
  kind: string
  status: string
  version: number
  reason: string | null
  differences: string[]
  patient: Patient
  candidates: PatientCandidate[]
  canManage: boolean
  decision: {
    id: string
    status: string
    version: number
    targetPatientId: string | null
    examCount: number
    identifierCount: number
  } | null
}
export interface PatientExam {
  id: string
  patientId: string
  patientName: string
  birthDate: string
  unitId: string
  unit: string
  modality: string
  studyDescription: string
  performedAt: string
  examTypeId: string | null
  patientIdentityStatus: string
  normalizationStatus: string
}
export interface ExamAvailability {
  report: string
  prescription: string
  images: string
  publishedReport: string
  attachments: string
  attachmentCount: number
}
export interface Comparative {
  id: string
  version: number
  status: string
  exam: PatientExam | null
}
export interface ImportData {
  unitId: string
  issuer: string
  externalId: string
  patientId: string
  legacyIssuer: string
  legacyExternalId: string
}
export interface ImportRow {
  id: string
  line: number
  data: ImportData
  status: string
  included: boolean
  message: string | null
  version: number
  result: { identifierIds: string[] } | null
}
export interface ImportReport {
  batch: { id: string; name: string; status: string; createdAt: string }
  rows: ImportRow[]
  counts: Record<string, number>
}
