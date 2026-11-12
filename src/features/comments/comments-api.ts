import { apiRequestJson } from '../auth/auth-http-client'
import type { ExamCommentsResponse } from './comment.types'

export const getExamComments = (examId: string) =>
  apiRequestJson<ExamCommentsResponse>(
    `/exams/${examId}/comments`,
    { method: 'GET' },
    { authenticated: true },
  )

export const createExamComment = (
  examId: string,
  body: string,
  parentCommentId: string | null,
  files: File[],
) => {
  const form = new FormData()
  form.set('body', body)
  if (parentCommentId) form.set('parentCommentId', parentCommentId)
  files.forEach((file) => form.append('attachments', file))

  return apiRequestJson<ExamCommentsResponse>(
    `/exams/${examId}/comments`,
    { method: 'POST', body: form },
    { authenticated: true },
  )
}
