import type { JSONContent } from '@tiptap/core'
import { apiRequestJson } from '../auth/auth-http-client'
import type { ExamReport, SavedExamReport, UploadedReportImage } from './report.types'

export const getExamReport = (examId: string) =>
  apiRequestJson<ExamReport>(
    `/exams/${examId}/report`,
    { method: 'GET' },
    { authenticated: true },
  )

export const saveExamReport = (examId: string, content: JSONContent) =>
  apiRequestJson<SavedExamReport>(
    `/exams/${examId}/report`,
    { method: 'PUT', body: JSON.stringify({ content }) },
    { authenticated: true },
  )

export const uploadReportImage = (examId: string, file: File) => {
  const body = new FormData()
  body.set('file', file)
  return apiRequestJson<UploadedReportImage>(
    `/exams/${examId}/report/images`,
    { method: 'POST', body },
    { authenticated: true },
  )
}

export const touchReportPresence = (examId: string, clientId: string) =>
  apiRequestJson<{ active: true }>(
    `/exams/${examId}/report/presence/${clientId}`,
    { method: 'PUT' },
    { authenticated: true },
  )

export const releaseReportPresence = (examId: string, clientId: string) =>
  apiRequestJson<{ active: false }>(
    `/exams/${examId}/report/presence/${clientId}`,
    { method: 'DELETE', keepalive: true },
    { authenticated: true },
  )
