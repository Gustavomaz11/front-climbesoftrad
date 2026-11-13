export interface ExamCommentAttachment {
  id: string
  name: string
  contentType: string
  sizeBytes: number
  url: string
}

export interface ExamComment {
  id: string
  body: string
  authorName: string
  createdAt: string
  attachments: ExamCommentAttachment[]
  replies: ExamComment[]
}

export interface ExamCommentsResponse {
  items: ExamComment[]
  total: number
}
