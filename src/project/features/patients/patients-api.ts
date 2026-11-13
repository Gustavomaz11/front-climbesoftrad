import { apiRequestJson } from '../auth/auth-http-client'
import type {
  Patient,
  PatientDetail,
  PatientCandidate,
  PatientReview,
  PatientExam,
  ExamAvailability,
  Comparative,
  ImportReport,
  ImportRow,
  ImportData,
} from './patient.types'
const get = <T>(path: string) => apiRequestJson<T>(path, { method: 'GET' }, { authenticated: true })
const send = <T>(path: string, body: unknown, method = 'POST') =>
  apiRequestJson<T>(path, { method, body: JSON.stringify(body) }, { authenticated: true })
export const listPatients = (search = '') =>
  get<Patient[]>('/patients?' + new URLSearchParams({ search }))
export const getPatient = (id: string) => get<PatientDetail>('/patients/' + id)
export const savePatient = (body: unknown, id?: string) =>
  send<Patient>(id ? '/patients/' + id : '/patients', body, id ? 'PUT' : 'POST')
export const addPatientIdentifier = (id: string, body: unknown) =>
  send('/patients/' + id + '/identifiers', body)
export const patientCandidates = (fullName: string, birthDate?: string, sex?: string) =>
  get<PatientCandidate[]>(
    '/patients/candidates?' +
      new URLSearchParams({
        fullName,
        ...(birthDate ? { birthDate } : {}),
        ...(sex ? { sex } : {}),
      }),
  )
export const listPatientReviews = (status = 'OPEN') =>
  get<PatientReview[]>('/patient-reviews?status=' + status)
export const decidePatientReview = (id: string, body: unknown) =>
  send('/patient-reviews/' + id + '/decision', body)
export const undoPatientAssociation = (id: string, expectedVersion: number, reason: string) =>
  send('/patient-reviews/associations/' + id + '/undo', { expectedVersion, reason })
export const patientHistory = (id: string) => get<PatientExam[]>('/patients/' + id + '/history')
export const examPatientHistory = (id: string) =>
  get<{
    patientId: string
    patient: { id: string; fullName: string; birthDate: string | null; revision: number }
    current: PatientExam
    items: PatientExam[]
  }>('/exams/' + id + '/patient-history')
export const examAvailability = (patientId: string, examId: string) =>
  get<ExamAvailability>('/patients/' + patientId + '/history/' + examId + '/availability')
export const listComparatives = (id: string) => get<Comparative[]>('/exams/' + id + '/comparatives')
export const linkComparative = (id: string, comparativeExamId: string) =>
  send('/exams/' + id + '/comparatives', { comparativeExamId })
export const removeComparative = (id: string, linkId: string) =>
  send('/exams/' + id + '/comparatives/' + linkId, undefined, 'DELETE')
export const listPatientImports = () => get<ImportReport['batch'][]>('/patient-imports')
export const getPatientImport = (id: string) => get<ImportReport>('/patient-imports/' + id)
export const previewPatientImport = (file: File) => {
  const body = new FormData()
  body.set('file', file)
  return apiRequestJson<ImportReport>(
    '/patient-imports',
    { method: 'POST', body },
    { authenticated: true },
  )
}
export const reviewImportRow = (
  batchId: string,
  row: ImportRow,
  included: boolean,
  reason: string,
  data?: ImportData,
) =>
  send<ImportReport>(
    '/patient-imports/' + batchId + '/rows/' + row.id,
    { expectedVersion: row.version, included, reason, ...(data ? { data } : {}) },
    'PUT',
  )
export const approveReadyImportRows = (id: string) =>
  send<ImportReport>('/patient-imports/' + id + '/approve-ready', {})
export const commitPatientImport = (id: string, limit = 50) =>
  send<ImportReport>('/patient-imports/' + id + '/commit', { limit })

export const undoImportRow = (batchId: string, row: ImportRow, reason: string) =>
  send<ImportReport>('/patient-imports/' + batchId + '/rows/' + row.id + '/undo', {
    expectedVersion: row.version,
    reason,
  })

export const openPatientReview = (patient: Patient, reason: string) =>
  send('/patient-reviews/patients/' + patient.id, { expectedVersion: patient.revision, reason })
