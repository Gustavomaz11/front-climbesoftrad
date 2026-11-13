import { apiRequestJson, HttpResponseError } from '../features/auth/auth-http-client'
export type HospitalFields = Record<string, string | number | null>

export interface HospitalIntake {
  id: string
  unitId: string
  studyUid: string
  version: number
  status: 'RECEIVING' | 'DRAFT' | 'SUBMITTED'
  receipt?: { receiving: boolean; expected: number | null; validated: number; failed: number }
  fields: HospitalFields
  issues: string[]
  fileCount: number
  examId: string | null
  submittedFields: HospitalFields | null
  submittedAt: string | null
  destination: { companyId: string; companyName: string; recipientUnitId: string; unitName: string } | null
  files: Array<{ id: string; name: string; status: string; sizeBytes: number }>
}
export const listHospitalIntakes = () => apiRequestJson<HospitalIntake[]>('/hospital/intakes', {}, { authenticated: true })
export const getHospitalIntake = (id: string) => apiRequestJson<HospitalIntake>(`/hospital/intakes/${id}`, {}, { authenticated: true })
export const getHospitalDicomViewer = (id: string, signal: AbortSignal) =>
  apiRequestJson<{ url: string; expiresAt: string; instanceCount: number }>(`/hospital/intakes/${id}/images/viewer`, { method: 'POST', signal }, { authenticated: true })
export const saveHospitalIntake = (intake: HospitalIntake, fields: HospitalFields, submit: boolean) =>
  apiRequestJson(`/hospital/intakes/${intake.id}${submit ? '/submit' : ''}`, {
    method: submit ? 'POST' : 'PATCH', body: JSON.stringify({ expectedVersion: intake.version, fields }),
  }, { authenticated: true })
export const intakeError = (error: unknown) => error instanceof HttpResponseError && error.status === 409
  ? 'O estudo está recebendo arquivos ou foi atualizado. Aguarde o recebimento completo e reabra a conferência.'
  : error instanceof HttpResponseError && error.status === 403
    ? 'Seu acesso não permite esta operação. Verifique o vínculo com a unidade.'
    : 'Não foi possível concluir. Confira os campos e a conexão e tente novamente.'
