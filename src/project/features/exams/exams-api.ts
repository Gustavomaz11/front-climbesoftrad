import { apiRequestJson } from '../auth/auth-http-client'
import type { CreateExamPayload, Exam, ExamFiltersValue, PaginatedExams } from './exam.types'

interface ListExamsOptions extends ExamFiltersValue {
  page: number
  pageSize: number
}

export const listExams = ({
  periodDays,
  examDate,
  patientName,
  page,
  pageSize,
  workflowState,
  queue,
}: ListExamsOptions) => {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (periodDays) query.set('periodDays', String(periodDays))
  if (examDate) query.set('examDate', examDate)
  if (patientName.trim()) query.set('patientName', patientName.trim())
  if (workflowState) query.set('workflowState', workflowState)
  if (queue) query.set('queue', queue)

  return apiRequestJson<PaginatedExams>(
    `/exams?${query.toString()}`,
    { method: 'GET' },
    { authenticated: true },
  )
}

export const createExam = (payload: CreateExamPayload) =>
  apiRequestJson<Exam>(
    '/exams',
    { method: 'POST', body: JSON.stringify(payload) },
    { authenticated: true },
  )
