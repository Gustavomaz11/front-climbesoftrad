import { standardModalities } from '../exam-modalities/standard-modalities'
export const examModalities = standardModalities.map(item => item.code)

export const examPriorities = [
  'IMEDIATA',
  'PRIORITARIA',
  'EMERGENCIA',
  'URGENTE',
  'ALTA',
  'ROTINA',
] as const

export type ExamModality = (typeof examModalities)[number]
export type ExamPriority = (typeof examPriorities)[number]
export type ExamSex = 'MASCULINO' | 'FEMININO'
export type ExamPeriod = 7 | 15 | 30

export interface Exam {
  heightMeters?: number | null
  weightKg?: number | null
  studyDate?: string | null
  studyTime?: string | null
  institutionName?: string | null
  studyId?: string | null
  workflowState: import('../exam-workflow/workflow.types').WorkflowState
  workflowVersion: number
  evidenceVersion: number
  preparedAt: string | null
  preparedByUserId: string | null
  archivedAt: string | null
  patientId: string
  encounterId: string
  patientIdentityStatus: string
  normalizationStatus: string
  examTypeId: string | null

  id: string
  patientName: string
  socialName: string | null
  sex: ExamSex
  birthDate: string
  identity: string | null
  country: string
  email: string | null
  studyDescription: string
  code: string | null
  accessionNumber: string | null
  orderCode: string | null
  modality: ExamModality
  unitId: string
  unit: string
  priority: ExamPriority
  requesterReference: string | null
  requesterName: string | null
  performingPhysician: string | null
  healthInsurance: string | null
  performedAt: string
  auxiliaryField1: string | null
  auxiliaryField2: string | null
  createdAt: string
  updatedAt: string
  reportingUserName: string | null
  reportCompletionId?: string | null
  reportFinalizedAt?: string | null
  reportSentAt?: string | null
  reportHasOrigin?: boolean
  commentCount: number
  imageStatus?:'NO_IMAGES'|'RECEIVING'|'RECEIVED'
  imageSeriesCount?:number
  imageInstanceCount?:number
  lastImageReceivedAt?:string|null
}

export interface ExamFiltersValue {
  workflowState?: import('../exam-workflow/workflow.types').WorkflowState
  queue?: 'ACTIVE' | 'PREPARATION' | 'HISTORY' | 'ARCHIVED' | 'ALL'
  periodDays?: ExamPeriod
  examDate: string
  patientName: string
}

export interface PaginatedExams {
  items: Exam[]
  total: number
  page: number
  pageSize: number
}

export interface CreateExamPayload {
  patientId?: string
  originIssuer?: string
  externalPatientId?: string
  externalEncounterId?: string
  sourceExamId?: string
  examTypeId?: string

  patientName: string
  socialName?: string
  sex: ExamSex
  birthDate: string
  identity?: string
  country: string
  email?: string
  studyDescription: string
  code?: string
  accessionNumber?: string
  orderCode?: string
  modality: ExamModality
  unitId: string
  priority: ExamPriority
  requesterReference?: string
  requesterName?: string
  performingPhysician?: string
  healthInsurance?: string
  performedAt: string
  auxiliaryField1?: string
  auxiliaryField2?: string
}
