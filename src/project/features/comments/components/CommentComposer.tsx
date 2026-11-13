import { Textarea as SurfaceTextarea } from '@/components/ui/textarea'
import { Paperclip, Send, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import type { ExamComment } from '../comment.types'

interface CommentComposerProps {
  replyingTo: ExamComment | null
  onCancelReply: () => void
  onSubmit: (body: string, files: File[]) => Promise<void>
}

const acceptedFiles = '.pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx,.txt'

export const CommentComposer = ({ replyingTo, onCancelReply, onSubmit }: CommentComposerProps) => {
  const [body, setBody] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const submit = async () => {
    if (!body.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(body.trim(), files)
      setBody('')
      setFiles([])
    } catch {
      setError('Não foi possível enviar o comentário. Verifique os anexos e tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm" onSubmit={(event) => { event.preventDefault(); void submit() }}>
      {replyingTo ? (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-brand-800">
          <span>Respondendo a {replyingTo.authorName}</span>
          <button type="button" onClick={onCancelReply} aria-label="Cancelar resposta"><X size={15} /></button>
        </div>
      ) : null}
      {error ? <Alert variant="error">{error}</Alert> : null}
      <SurfaceTextarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={4000}
        rows={4}
        placeholder={replyingTo ? 'Digite sua resposta...' : 'Digite um novo comentário...'}
        className="w-full resize-y rounded-xl border border-input px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand-600 focus:ring-3 focus:ring-cyan-100"
      />
      {files.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <span key={`${file.name}-${index}`} className="inline-flex max-w-full items-center gap-2 rounded-lg bg-background px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">
              <span className="truncate">{file.name}</span>
              <button type="button" onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remover ${file.name}`}><X size={13} /></button>
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <input ref={fileInputRef} type="file" multiple accept={acceptedFiles} className="hidden" onChange={(event) => {
            const selected = Array.from(event.target.files ?? [])
            setFiles((current) => [...current, ...selected].slice(0, 5))
            event.target.value = ''
          }} />
          <Button type="button" variant="outline" size="sm" leftIcon={<Paperclip size={15} />} disabled={files.length >= 5 || submitting} onClick={() => fileInputRef.current?.click()}>
            Anexar arquivos {files.length > 0 ? `(${files.length}/5)` : ''}
          </Button>
        </div>
        <Button type="submit" size="sm" loading={submitting} loadingText="Enviando..." disabled={!body.trim()} leftIcon={<Send size={15} />}>
          {replyingTo ? 'Enviar resposta' : 'Adicionar comentário'}
        </Button>
      </div>
    </form>
  )
}
