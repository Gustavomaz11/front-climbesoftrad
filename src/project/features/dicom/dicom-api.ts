import { apiRequestJson } from '../auth/auth-http-client'
export interface DicomSource {
  id: string
  name: string
  unitId: string
  active: boolean
  lastSeenAt: string | null
  diagnostics: {
    version?: string
    pending?: number
    failed?: number
    freeBytes?: number
    errorCode?: string
  }
}
export interface DicomReview {
  id: string
  uploadId: string
  unitId: string
  examId: string | null
  kind: string
  status: string
  version: number
  details: {
    received?: Record<string, unknown>
    issues?: string[]
    reason?: string
    candidateExamIds?: string[]
  }
}
export interface ExamImages {
  status: string
  items: Array<{
    id: string
    studyUid: string
    examId: string
    status: string
    series: number
    instances: number
    archived: number
    failed: number
    lastReceivedAt: string
    completedAt: string | null
  }>
}
const post = (path: string, body: unknown = {}) =>
  apiRequestJson(path, { method: 'POST', body: JSON.stringify(body) }, { authenticated: true })
export const listDicomSources = () =>
  apiRequestJson<DicomSource[]>('/dicom-sources', {}, { authenticated: true })
export const createDicomSource = (unitId: string, name: string) =>
  apiRequestJson<{ id: string; token: string }>(
    '/dicom-sources',
    { method: 'POST', body: JSON.stringify({ unitId, name }) },
    { authenticated: true },
  )
export const revokeDicomSource = (id: string) => post(`/dicom-sources/${id}/revoke`)
export const listDicomReviews = () =>
  apiRequestJson<DicomReview[]>('/dicom-reviews', {}, { authenticated: true })
export const resolveDicomReview = (
  review: DicomReview,
  action: 'ACKNOWLEDGE' | 'CORRECT',
  reason: string,
  exam?: Record<string, unknown>,
) =>
  post(`/dicom-reviews/${review.id}/resolve`, {
    expectedVersion: review.version,
    action,
    reason,
    ...(exam ? { exam } : {}),
  })
export const getExamImages = (id: string) =>
  apiRequestJson<ExamImages>(`/exams/${id}/images`, {}, { authenticated: true })
export const retryExamArchive = (id: string) => post(`/exams/${id}/images/retry-archive`)
export const completeExamImages = (id: string, reason: string) =>
  post(`/exams/${id}/images/complete`, { reason })
export const getStudyViewer = (id: string, previousExamId?: string) =>
  apiRequestJson<{ url: string; expiresAt: string }>(
    `/exams/${id}/images/viewer`,
    { method: 'POST', body: JSON.stringify({ previousExamId }) },
    { authenticated: true },
  )
export const getStudyDownload = (id: string) =>
  apiRequestJson<{ url: string }>(
    `/exams/${id}/images/download`,
    { method: 'POST' },
    { authenticated: true },
  )
