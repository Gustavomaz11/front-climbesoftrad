import { apiRequestJson } from '../auth/auth-http-client'
export interface ExamModalityRecord { code: string; name: string; active: boolean; standard: boolean }
export const listExamModalities = () => apiRequestJson<ExamModalityRecord[]>('/exam-modalities', {}, { authenticated: true })
export const saveExamModality = (record: Pick<ExamModalityRecord, 'code' | 'name' | 'active'>, update: boolean) =>
  apiRequestJson<ExamModalityRecord>('/exam-modalities' + (update ? '/' + encodeURIComponent(record.code) : ''), { method: update ? 'PUT' : 'POST', body: JSON.stringify(record) }, { authenticated: true })
