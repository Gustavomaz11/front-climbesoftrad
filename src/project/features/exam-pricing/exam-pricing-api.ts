import { apiRequestJson } from '../auth/auth-http-client'
export interface ExamPriceRule {
  id: string
  unitId: string | null
  physicianId: string | null
  examTypeId: string
  modality: string
  kind: 'BILLING' | 'PAYOUT'
  currency: string
  amountCents: string
  validFrom: string
  validTo: string | null
  version: number
  reason: string
}
export const listExamPrices = () =>
  apiRequestJson<ExamPriceRule[]>('/exam-prices', {}, { authenticated: true })
export const createExamPrice = (data: unknown) =>
  apiRequestJson<ExamPriceRule>(
    '/exam-prices',
    { method: 'POST', body: JSON.stringify(data) },
    { authenticated: true },
  )
export const closeExamPrice = (record: ExamPriceRule, validTo: string, reason: string) =>
  apiRequestJson(
    `/exam-prices/${record.id}/close`,
    {
      method: 'POST',
      body: JSON.stringify({
        validTo,
        expectedVersion: record.version,
        reason,
      }),
    },
    { authenticated: true },
  )
export const resolveExamPrices = (examId: string, date: string, physicianId?: string) =>
  apiRequestJson<{
    billing: ExamPriceRule | null
    payout: ExamPriceRule | null
    reason: string | null
  }>(
    '/exam-prices/resolve?' +
      new URLSearchParams({
        examId,
        date,
        ...(physicianId ? { physicianId } : {}),
      }),
    {},
    { authenticated: true },
  )
