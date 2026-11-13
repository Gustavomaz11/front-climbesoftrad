import { LoaderCircle, MessageSquareText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Modal } from '../../../components/ui/Modal'
import { AttachmentViewer } from '../../attachments/components/AttachmentViewer'
import type { Exam } from '../../exams/exam.types'
import { createExamComment, getExamComments } from '../comments-api'
import type { ExamComment, ExamCommentAttachment, ExamCommentsResponse } from '../comment.types'
import { CommentComposer } from './CommentComposer'
import { CommentThread } from './CommentThread'

interface ExamCommentsModalProps {
  exam: Exam | null
  onClose: () => void
  onCountChange: (examId: string, count: number) => void
}

const emptyComments: ExamCommentsResponse = { items: [], total: 0 }

export const ExamCommentsModal = ({ exam, onClose, onCountChange }: ExamCommentsModalProps) => {
  const [comments, setComments] = useState<ExamCommentsResponse>(emptyComments)
  const [replyingTo, setReplyingTo] = useState<ExamComment | null>(null)
  const [loading, setLoading] = useState(Boolean(exam))
  const [loadError, setLoadError] = useState(false)
  const [viewerAttachment, setViewerAttachment] = useState<ExamCommentAttachment | null>(null)

  useEffect(() => {
    if (!exam) return

    let active = true
    void getExamComments(exam.id)
      .then((response) => {
        if (!active) return
        setComments(response)
        onCountChange(exam.id, response.total)
      })
      .catch(() => {
        if (active) setLoadError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [exam, onCountChange])

  const submit = async (body: string, files: File[]) => {
    if (!exam) return
    const response = await createExamComment(exam.id, body, replyingTo?.id ?? null, files)
    setComments(response)
    setReplyingTo(null)
    onCountChange(exam.id, response.total)
  }

  return (
    <>
      <Modal
        open={Boolean(exam)}
        title={exam ? `Comentários — ${exam.patientName}` : 'Comentários'}
        description={exam?.studyDescription}
        size="lg"
        onClose={onClose}
      >
        <div className="space-y-5">
          {loadError ? <Alert variant="error">Não foi possível carregar os comentários.</Alert> : null}
          {loading ? (
            <div className="grid min-h-40 place-items-center text-sm font-semibold text-muted-foreground">
              <span className="flex items-center gap-2"><LoaderCircle size={18} className="animate-spin" />Carregando comentários...</span>
            </div>
          ) : comments.items.length > 0 ? (
            <CommentThread comments={comments.items} onReply={setReplyingTo} onOpenAttachment={setViewerAttachment} />
          ) : (
            <div className="grid min-h-36 place-items-center rounded-xl border border-dashed border-input bg-muted text-center">
              <div>
                <MessageSquareText size={24} className="mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm font-bold text-muted-foreground">Nenhum comentário</p>
                <p className="mt-1 text-xs text-muted-foreground">Inicie uma conversa sobre este exame.</p>
              </div>
            </div>
          )}
          <CommentComposer replyingTo={replyingTo} onCancelReply={() => setReplyingTo(null)} onSubmit={submit} />
        </div>
      </Modal>
      <AttachmentViewer
        key={viewerAttachment?.id ?? 'attachment-closed'}
        attachment={viewerAttachment}
        onClose={() => setViewerAttachment(null)}
      />
    </>
  )
}
