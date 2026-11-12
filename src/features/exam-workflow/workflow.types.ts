import type { Exam } from '../exams/exam.types'

export const workflowLabels = { TO_PREPARE: 'A preparar', READY: 'Pronto', IN_PROGRESS: 'Em elaboração', TYPED: 'Digitado', SIGNED: 'Assinado', PENDING: 'Pendente', RECALLED: 'Reconvocado', CANCELLED: 'Cancelado' } as const
export type WorkflowState = keyof typeof workflowLabels
export const preparationLabels = { ORDER: 'Pedido médico', QUESTIONNAIRE: 'Questionário', IMAGES: 'Imagens completas conferidas', COMPARATIVE: 'Comparativo' } as const
export type PreparationItem = keyof typeof preparationLabels
export interface PreparationPolicy {
  id: string; unit_id: string; exam_type_id: string | null; version: number; active: boolean; required_items: PreparationItem[]; reason: string
}
export interface PreparationCheck {
  item: PreparationItem; available: boolean; confirmed: boolean; exceptionReason: string | null
  evidenceIds: string[]; checkedByUserId: string | null; checkedAt: string | null
}
export interface WorkflowIssue {
  id: string; exam_id: string; kind: 'PENDING' | 'RECALL'; category: string; reason: string; requested_action: string | null
  responsible_user_id: string | null; responsible_name: string | null; unit_id: string
  phase: 'PREPARATION' | 'REPORTING'; opened_at: string; resolved_at: string | null; resolution_reason: string | null
  elapsed_seconds: number
  attachment_ids: string[]; comment_ids: string[]; resolution_study_ids: string[]; resolution_attachment_ids: string[]; complement_exam_id: string | null
}
export interface WorkflowHistory {
  id: string; from_state: WorkflowState; to_state: WorkflowState; action: string; reason: string
  actor_name: string | null; origin: 'SYSTEM' | 'USER'; occurred_at: string; version: number
}
export interface ExamWorkflow {
  exam: Exam & { workflowState: WorkflowState; workflowVersion: number; evidenceVersion: number; preparedAt: string | null; preparedByUserId: string | null; archivedAt: string | null }
  checklist: { policy: PreparationPolicy | null; items: PreparationCheck[]; blockers: string[]; satisfied: boolean }
  history: WorkflowHistory[]; issues: WorkflowIssue[]
}
export interface WorkflowEvidenceOptions {
  attachments: Array<{ id: string; exam_id: string; name: string; created_at: string }>
  studies: Array<{ id: string; exam_id: string; name: string; created_at: string; completed_at: string | null }>
  complements: Array<{ id: string; name: string; created_at: string }>
  comments: Array<{ id: string; created_at: string }>
}
export interface WorkflowNotification extends WorkflowIssue {
  patient_name: string; study_description: string; seen_at: string | null; elapsed_seconds: number
}
