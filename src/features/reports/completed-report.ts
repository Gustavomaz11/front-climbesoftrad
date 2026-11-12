import type { JSONContent } from '@tiptap/core'
import type { DocumentPresentation } from '../companies/company.types'
import type { ReportExamSummary } from './report.types'
import { apiRequestJson, HttpResponseError } from '../auth/auth-http-client'
import type { PhysicianSignatureImage } from '../physicians/physician-signature-api'

export interface CompletedReport {
  signature?: PhysicianSignatureImage
  id: string
  examId: string
  version: number
  finalizedAt: string
  sentAt: string | null
  content: JSONContent
  presentation: DocumentPresentation
  exam: ReportExamSummary & { birthDate: string }
  physician: { name: string; crm: string }
  originUnitName: string | null
  digitallySigned: boolean
}
export type HospitalResult = Omit<
  CompletedReport,
  'content' | 'presentation' | 'version' | 'digitallySigned'
> & { originUnitId: string }
export const getCompletedReport = async (examId: string) => {
  const result = await apiRequestJson<CompletedReport | { completion: null }>(
    `/exams/${examId}/report/completion`,
    {},
    { authenticated: true },
  )
  return 'completion' in result ? null : result
}
export const finalizeReport = (examId: string, expectedVersion: number, contentHash: string, signatureId: string) =>
  apiRequestJson<CompletedReport>(
    `/exams/${examId}/report/finalize`,
    { method: 'POST', body: JSON.stringify({ expectedVersion, contentHash, signatureId }) },
    { authenticated: true },
  )
export const sendReport = (examId: string, completionId: string) =>
  apiRequestJson<{ id: string; sentAt: string }>(
    `/exams/${examId}/report/send`,
    { method: 'POST', body: JSON.stringify({ completionId }) },
    { authenticated: true },
  )
export const listHospitalResults = () =>
  apiRequestJson<HospitalResult[]>('/hospital/results', {}, { authenticated: true })
export const getHospitalResult = (id: string) =>
  apiRequestJson<CompletedReport>(`/hospital/results/${id}`, {}, { authenticated: true })
export const reportCompletionError = (error: unknown) =>
  error instanceof HttpResponseError && error.status === 409
    ? 'O exame, o rascunho ou a assinatura foi atualizado, ou ainda não está pronto. Atualize a página e confira a versão e a assinatura antes de continuar.'
    : error instanceof HttpResponseError && error.status === 400
      ? 'Preencha o texto do laudo e confira as imagens anexadas antes de finalizar.'
      : error instanceof HttpResponseError && error.status === 403
        ? 'Seu acesso não permite esta operação. A finalização exige um médico cadastrado e autorizado para o hospital.'
        : 'Não foi possível concluir a operação. Confira a conexão e tente novamente.'
