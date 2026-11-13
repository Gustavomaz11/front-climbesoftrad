import type { JSONContent } from '@tiptap/core'
import { apiRequestJson } from '../auth/auth-http-client'
import type { ExamReport, SavedExamReport, UploadedReportImage } from './report.types'

export const getExamReport = (examId: string) =>
  apiRequestJson<ExamReport>(
    `/exams/${examId}/report`,
    { method: 'GET' },
    { authenticated: true },
  )

export const saveExamReport = (examId: string, content: JSONContent, clientId:string) =>
  apiRequestJson<SavedExamReport>(
    `/exams/${examId}/report`,
    { method: 'PUT', body: JSON.stringify({ content,clientId }) },
    { authenticated: true },
  )

export const uploadReportImage = (examId: string, file: File, clientId:string) => {
  const body = new FormData()
  body.set('file', file)
  return apiRequestJson<UploadedReportImage>(
    `/exams/${examId}/report/images`,
    { method: 'POST', body,headers:{'X-Report-Client-Id':clientId} },
    { authenticated: true },
  )
}

export const touchReportPresence = (examId: string, clientId: string) =>
  apiRequestJson<{ active: true;releaseRequested:boolean;releaseReason:string|null }>(
    `/exams/${examId}/report/presence/${clientId}`,
    { method: 'PUT' },
    { authenticated: true },
  )

export const closeReportSession = (examId:string,clientId:string,content?:JSONContent,keepalive=false) =>
  apiRequestJson<{active:false}>(`/exams/${examId}/report/session/close`,{method:'POST',body:JSON.stringify({clientId,content}),keepalive},{authenticated:true})

export const releaseReportPresence = (examId: string, clientId: string) =>
  apiRequestJson<{ active: false }>(
    `/exams/${examId}/report/presence/${clientId}`,
    { method: 'DELETE', keepalive: true },
    { authenticated: true },
  )
