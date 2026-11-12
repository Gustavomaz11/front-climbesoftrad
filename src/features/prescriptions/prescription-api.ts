import type { JSONContent } from '@tiptap/core'
import { apiRequestJson } from '../auth/auth-http-client'
import type { ExamPrescription, SavedPrescription, UploadedPrescriptionImage } from './prescription.types'

export const getExamPrescription = (examId: string) =>
  apiRequestJson<ExamPrescription>(
    `/exams/${examId}/prescription`,
    { method: 'GET' },
    { authenticated: true },
  )

export const saveExamPrescription = (examId: string, content: JSONContent, protocolSelectionId?: string) =>
  apiRequestJson<SavedPrescription>(
    `/exams/${examId}/prescription`,
    { method: 'PUT', body: JSON.stringify({ content, protocolSelectionId }) },
    { authenticated: true },
  )

export const signExamPrescription = (examId: string, content: JSONContent, protocolSelectionId?: string) =>
  apiRequestJson<SavedPrescription>(
    `/exams/${examId}/prescription/sign`,
    { method: 'PUT', body: JSON.stringify({ content, protocolSelectionId }) },
    { authenticated: true },
  )

export const uploadPrescriptionImage = (examId: string, file: File) => {
  const body = new FormData()
  body.set('file', file)
  return apiRequestJson<UploadedPrescriptionImage>(
    `/exams/${examId}/prescription/images`,
    { method: 'POST', body },
    { authenticated: true },
  )
}
