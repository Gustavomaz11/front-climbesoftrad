import { apiRequestJson } from '../auth/auth-http-client'
import type { ExamCatalog, ExamType, ExamAlias, ExamClassification } from './exam-catalog.types'
import type { Exam } from '../exams/exam.types'
export const getExamCatalog = () =>
  apiRequestJson<ExamCatalog>('/exam-catalog', { method: 'GET' }, { authenticated: true })
export const saveExamType = (body: unknown, id?: string) =>
  apiRequestJson<ExamType>(
    id ? '/exam-catalog/types/' + id : '/exam-catalog/types',
    { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) },
    { authenticated: true },
  )
export const saveExamAlias = (body: unknown, id?: string) =>
  apiRequestJson<ExamAlias>(
    id ? '/exam-catalog/aliases/' + id : '/exam-catalog/aliases',
    { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) },
    { authenticated: true },
  )
export const previewExamClassification = (body: unknown) =>
  apiRequestJson<ExamClassification>(
    '/exam-catalog/resolve',
    { method: 'POST', body: JSON.stringify(body) },
    { authenticated: true },
  )
export const listUnclassifiedExams = () =>
  apiRequestJson<Exam[]>('/exam-catalog/pending', { method: 'GET' }, { authenticated: true })
export const classifyExam = (id: string, body: unknown) =>
  apiRequestJson<Exam>(
    '/exam-catalog/exams/' + id + '/classification',
    { method: 'POST', body: JSON.stringify(body) },
    { authenticated: true },
  )
