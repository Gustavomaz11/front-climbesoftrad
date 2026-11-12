import { apiRequestJson } from '../auth/auth-http-client'
import type { ExamWorkflow, PreparationPolicy, WorkflowEvidenceOptions, WorkflowNotification } from './workflow.types'

const get = <T,>(path: string) => apiRequestJson<T>(path, {}, { authenticated: true })
export const workflowPost = <T,>(path: string, body: unknown) => apiRequestJson<T>(path, { method: 'POST', body: JSON.stringify(body) }, { authenticated: true })
export const getExamWorkflow = (id: string) => get<ExamWorkflow>(`/exams/${id}/workflow`)
export const workflowAction = (id: string, action: string, version: number, reason: string, body: Record<string, unknown> = {}) =>
  workflowPost(`/exams/${id}/workflow/${action}`, { expectedVersion: version, reason, ...body })
export const listPreparationPolicies = (unitId: string) => get<PreparationPolicy[]>(`/preparation-policies?unitId=${encodeURIComponent(unitId)}`)
export const listWorkflowResponsibles = (unitId: string) => get<Array<{ id: string; name: string }>>(`/workflow-responsibles?unitId=${encodeURIComponent(unitId)}`)
export const getWorkflowEvidence = (id: string) => get<WorkflowEvidenceOptions>(`/exams/${id}/workflow/evidence`)
export const listWorkflowNotifications = () => get<WorkflowNotification[]>('/workflow-notifications')
export const acknowledgeWorkflowNotification = (id: string) => workflowPost(`/workflow-notifications/${id}/acknowledge`, {})
