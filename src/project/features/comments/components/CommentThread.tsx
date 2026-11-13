import { FileText, Paperclip, Reply } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import type { ExamComment, ExamCommentAttachment } from '../comment.types'

interface CommentThreadProps {
  comments: ExamComment[]
  onReply: (comment: ExamComment) => void
  onOpenAttachment: (attachment: ExamCommentAttachment) => void
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))

const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const AttachmentLink = ({ attachment, onOpen }: { attachment: ExamCommentAttachment; onOpen: () => void }) => (
  <a
    href={attachment.url}
    onClick={(event) => {
      event.preventDefault()
      onOpen()
    }}
    className="inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-xs font-semibold text-muted-foreground transition hover:border-brand-300 hover:text-brand-800"
    title={`Abrir ${attachment.name}`}
  >
    {attachment.contentType.startsWith('image/') ? <Paperclip size={14} /> : <FileText size={14} />}
    <span className="truncate">{attachment.name}</span>
    <span className="shrink-0 text-muted-foreground">{formatSize(attachment.sizeBytes)}</span>
  </a>
)

const CommentCard = ({
  comment,
  reply,
  onReply,
  onOpenAttachment,
}: {
  comment: ExamComment
  reply?: boolean
  onReply: (comment: ExamComment) => void
  onOpenAttachment: (attachment: ExamCommentAttachment) => void
}) => (
  <article className={reply ? 'border-l-2 border-brand-100 pl-4' : ''}>
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-extrabold text-brand-800">
        {comment.authorName.slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-bold text-foreground">{comment.authorName}</p>
          <time className="text-[0.7rem] text-muted-foreground">{formatDateTime(comment.createdAt)}</time>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{comment.body}</p>
        {comment.attachments.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {comment.attachments.map((attachment) => <AttachmentLink key={attachment.id} attachment={attachment} onOpen={() => onOpenAttachment(attachment)} />)}
          </div>
        ) : null}
        <Button variant="ghost" size="sm" className="mt-2 -ml-3" leftIcon={<Reply size={14} />} onClick={() => onReply(comment)}>
          Responder
        </Button>
      </div>
    </div>
  </article>
)

export const CommentThread = ({ comments, onReply, onOpenAttachment }: CommentThreadProps) => (
  <div className="space-y-6">
    {comments.map((comment) => (
      <section key={comment.id} className="rounded-xl border border-border bg-muted/70 p-4">
        <CommentCard comment={comment} onReply={onReply} onOpenAttachment={onOpenAttachment} />
        {comment.replies.length > 0 ? (
          <div className="mt-4 space-y-4 pl-6">
            {comment.replies.map((reply) => <CommentCard key={reply.id} comment={reply} reply onReply={onReply} onOpenAttachment={onOpenAttachment} />)}
          </div>
        ) : null}
      </section>
    ))}
  </div>
)
