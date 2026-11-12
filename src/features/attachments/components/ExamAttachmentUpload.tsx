import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { sendResumableFile } from '../../uploads/resumable-upload'
import { cancelUpload } from '../../uploads/upload-api'
import { getUploadLimits } from '../../uploads/upload-limits'
import {
  attachmentCategoryLabels,
  type AttachmentCategory,
  type ExamAttachment,
} from '../exam-attachments.types'
export const ExamAttachmentUpload = ({
  examId,
  unitId,
  previous,
  onDone,
  onCancel,
  onBusyChange,
}: {
  examId: string
  unitId: string
  previous: ExamAttachment | null
  onDone: () => void
  onCancel: () => void
  onBusyChange: (busy: boolean) => void
}) => {
  const [category, setCategory] = useState<AttachmentCategory>(previous?.category ?? 'ORDER'),
    [file, setFile] = useState<File | null>(null),
    [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [progress, setProgress] = useState(0),
    [session, setSession] = useState<string | null>(null),
    [limit, setLimit] = useState<number | null>(null)
  const controller = useRef<AbortController | null>(null)
  useEffect(() => {
    let active = true
    void getUploadLimits()
      .then((value) => {
        if (active) setLimit(value.documentMaxBytes)
      })
      .catch(() => {
        if (active) setError('Limites de envio indisponíveis.')
      })
    return () => {
      active = false
      controller.current?.abort()
    }
  }, [])
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!file || !limit) return
    if (!file.size || file.size > limit) {
      setError('Arquivo vazio ou acima do limite.')
      return
    }
    controller.current = new AbortController()
    setBusy(true)
    onBusyChange(true)
    setError('')
    try {
      await sendResumableFile(
        file,
        {
          kind: 'ATTACHMENT',
          unitId,
          examId,
          category,
          ...(previous
            ? { replacesId: previous.id, expectedVersion: previous.version, reason }
            : {}),
        },
        { signal: controller.current.signal, onSession: setSession, onProgress: setProgress },
      )
      onDone()
    } catch (error) {
      setError(
        error instanceof DOMException && error.name === 'AbortError'
          ? 'Envio pausado. Selecione o mesmo arquivo e clique em retomar.'
          : 'Envio interrompido. Confira o arquivo e tente retomar.',
      )
    } finally {
      setBusy(false)
      onBusyChange(false)
    }
  }
  const cancel = async () => {
    controller.current?.abort()
    if (session) {
      try {
        await cancelUpload(session)
        setSession(null)
        setProgress(0)
        setError('Envio cancelado.')
      } catch {
        setError('Arquivo já recebido ou cancelamento indisponível. Atualize a lista.')
      }
    }
  }
  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
    >
      <h3 className="font-bold">
        {previous ? `Substituir ${previous.name}` : 'Adicionar documento'}
      </h3>
      <label className="block text-sm font-semibold">
        Categoria
        <select
          aria-label="Categoria do anexo"
          value={category}
          disabled={busy || Boolean(previous)}
          onChange={(event) => setCategory(event.target.value as AttachmentCategory)}
          className="mt-1 w-full rounded-lg border bg-white p-2"
        >
          {Object.entries(attachmentCategoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold">
        PDF ou imagem{limit ? `, até ${(limit / 1024 / 1024).toFixed(0)} MB` : ''}
        <input
          aria-label="Arquivo do exame"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
          required
          disabled={busy}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="mt-2 block w-full text-sm"
        />
      </label>
      {previous ? (
        <Input
          label="Justificativa da substituição"
          required
          maxLength={500}
          value={reason}
          disabled={busy}
          onChange={(event) => setReason(event.target.value)}
        />
      ) : null}
      {session || busy ? (
        <div>
          <progress className="w-full" max={100} value={progress} aria-label="Progresso do envio" />
          <p className="text-xs">
            {progress.toFixed(0)}% enviado. A disponibilidade depende da validação.
          </p>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-amber-800">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={busy || !file || !limit || (Boolean(previous) && !reason.trim())}
        >
          {busy ? 'Enviando…' : session ? 'Retomar envio' : 'Enviar documento'}
        </Button>
        {busy ? (
          <Button variant="outline" onClick={() => controller.current?.abort()}>
            Pausar
          </Button>
        ) : null}
        {session ? (
          <Button variant="ghost" onClick={() => void cancel()}>
            Cancelar envio
          </Button>
        ) : null}
        {previous ? (
          <Button variant="ghost" disabled={busy} onClick={onCancel}>
            Cancelar substituição
          </Button>
        ) : null}
      </div>
    </form>
  )
}
