export interface UploadSession {
  id: string
  kind: 'ATTACHMENT' | 'DICOM'
  name: string
  status: string
  sizeBytes: number
  sha256: string
  partSize: number
  parts: Array<{ number: number; size: number; etag: string }>
  expiresAt: string
  resultId: string | null
  examId: string | null
  validationReason: string | null
  metadata: null | {
    dto: Record<string, unknown>
    issues: string[]
    tags: { studyUid: string; seriesUid: string; instanceUid: string }
  }
}
export interface UploadInput {
  deliveryId?: string
  deliveryFileId?: string
  deliveryTotal?: number
  hospitalIntake?: boolean
  kind: 'ATTACHMENT' | 'DICOM'
  unitId: string
  examId?: string
  name: string
  contentType: string
  sizeBytes: number
  sha256: string
  category?: string
  replacesId?: string
  expectedVersion?: number
  reason?: string
}
