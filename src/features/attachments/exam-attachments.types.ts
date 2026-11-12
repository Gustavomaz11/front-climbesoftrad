export const attachmentCategoryLabels = {
  ORDER: 'Pedido médico', QUESTIONNAIRE: 'Questionário', COMPARATIVE: 'Comparativo',
} as const
export type AttachmentCategory = keyof typeof attachmentCategoryLabels
export interface ExamAttachment {
  id: string; category: AttachmentCategory; version: number; replacesId: string | null
  current: boolean; validationStatus: string; reason: string | null; createdAt: string
  authorName: string; name: string; contentType: string; sizeBytes: number; sha256: string
}
export interface AttachmentAccess {
  id: string; name: string; contentType: string; sizeBytes: number; url: string; expiresAt: string
}
