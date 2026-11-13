import { apiRequestJson } from '../auth/auth-http-client'
import type { AttachmentAccess, AttachmentCategory, ExamAttachment } from './exam-attachments.types'
export const revalidateExamAttachment=(examId:string,id:string)=>apiRequestJson(`/exams/${examId}/attachments/${id}/reprocess`,{method:'POST'},{authenticated:true})
export const listExamAttachments = (examId: string) =>
  apiRequestJson<ExamAttachment[]>(`/exams/${examId}/attachments`, {}, { authenticated: true })
export const openExamAttachment = (examId: string, id: string) =>
  apiRequestJson<AttachmentAccess>(`/exams/${examId}/attachments/${id}/access`, {}, { authenticated: true })
export const uploadExamAttachment = (examId: string, file: File, category: AttachmentCategory, previous?: ExamAttachment, reason?: string) => {
  const body = new FormData()
  body.set('file', file)
  body.set('category', category)
  if (previous) {
    body.set('replacesId', previous.id)
    body.set('expectedVersion', String(previous.version))
    body.set('reason', reason ?? '')
  }
  return apiRequestJson<{ id: string; version: number }>(`/exams/${examId}/attachments`, { method: 'POST', body }, { authenticated: true })
}
