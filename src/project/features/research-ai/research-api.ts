import { apiRequest, apiRequestJson, HttpResponseError } from '../auth/auth-http-client'
export interface Mask {
  x: number
  y: number
  width: number
  height: number
}
export interface ResearchFrame {
  id: string
  sequence: number
  width: number
  height: number
  masks: Mask[]
  automaticMasks: Mask[]
  revision: number
  reviewed: boolean
}
export interface Finding {
  imageId: string
  label: string
  description: string
  box: [number, number, number, number]
}
export interface ResearchCase {
  canRetry?: boolean
  id: string
  examId: string
  status: 'PREPARING' | 'REVIEW' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'STALE'
  model: string
  promptVersion: string
  anonymizationVersion: string
  framesExpected: number
  framesPrepared: number
  batchesCompleted: number
  result: {
    summary: string
    limitations: string[]
    imagesReviewed: string[]
    findings: Finding[]
  } | null
  errorCode: string | null
  createdAt: string
  feedback: { useful: boolean; comment: string } | null
  frames: ResearchFrame[]
}
export interface ResearchHistory {
  enabled: boolean
  items: Array<Pick<ResearchCase, 'id' | 'status' | 'model' | 'promptVersion' | 'createdAt'>>
}
const request = <T>(path: string, method = 'GET', body?: unknown) =>
  apiRequestJson<T>(
    '/research-ai' + path,
    { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) },
    { authenticated: true },
  )
export const history = (exam: string) => request<ResearchHistory>(`/exams/${exam}/cases`)
export const prepare = (exam: string) => request<ResearchCase>(`/exams/${exam}/cases`, 'POST')
export const getCase = (id: string) => request<ResearchCase>(`/cases/${id}`)
export const retry = (id: string) => request<ResearchCase>(`/cases/${id}/retry`, 'POST')
export const saveMasks = (id: string, frame: ResearchFrame, masks: Mask[]) =>
  request<ResearchCase>(`/cases/${id}/frames/${frame.id}/masks`, 'PUT', {
    expectedRevision: frame.revision,
    masks,
  })
export const review = (id: string, frame: ResearchFrame, reviewed: boolean) =>
  request<ResearchCase>(`/cases/${id}/frames/${frame.id}/review`, 'PATCH', {
    expectedRevision: frame.revision,
    reviewed,
  })
export const run = (id: string) =>
  request<ResearchCase>(`/cases/${id}/run`, 'POST', {
    confirmsAnonymization: true,
    nonClinicalResearch: true,
  })
export const feedback = (id: string, useful: boolean, comment: string) =>
  request<ResearchCase>(`/cases/${id}/feedback`, 'POST', { useful, comment })
export const image = async (id: string, frame: string, original: boolean, signal: AbortSignal) => {
  const response = await apiRequest(
    `/research-ai/cases/${id}/frames/${frame}/image${original ? '?original=1' : ''}`,
    { signal },
    { authenticated: true },
  )
  if (!response.ok) throw new HttpResponseError(response.status)
  return response.blob()
}
