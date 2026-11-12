import { useEffect, useState } from 'react'
import { useWorkflowStatus } from '../../exam-workflow/use-workflow-status'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { hasPermission } from '../../auth/auth.types'
import { useAuthentication } from '../../auth/auth-context'
import { listExamAttachments, openExamAttachment,revalidateExamAttachment } from '../exam-attachments-api'
import {
  attachmentCategoryLabels,
  type AttachmentAccess,
  type ExamAttachment,
} from '../exam-attachments.types'
import { AttachmentViewer } from './AttachmentViewer'
import { ExamAttachmentUpload } from './ExamAttachmentUpload'
import { UploadSessionsList } from '../../uploads/components/UploadSessionsList'

export const ExamAttachmentsModal = ({
  exam,
  onClose,
  readOnly = false,
}: {
  exam: { id: string; patientName: string; unitId: string } | null
  onClose: () => void
  readOnly?: boolean
}) => {
  const { user } = useAuthentication()
  const workflow = useWorkflowStatus(exam?.id)
  const [items, setItems] = useState<ExamAttachment[]>([])
  const [previous, setPrevious] = useState<ExamAttachment | null>(null)
  const [viewer, setViewer] = useState<AttachmentAccess | null>(null)
  const [versions, setVersions] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [uploadBusy, setUploadBusy] = useState(false)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const canView = Boolean(user && hasPermission(user, 'attachments.view'))
  const canUpload = !readOnly && workflow.mutable && Boolean(user && hasPermission(user, 'attachments.upload'))
  const canRevalidate=Boolean(user&&hasPermission(user,'documents.validation.manage'))
  const examId = exam?.id
  useEffect(() => {
    if (!examId || !canView) return
    let active = true
    void listExamAttachments(examId)
      .then((records) => {
        if (active) {
          setItems(records)
          setError('')
        }
      })
      .catch(() => {
        if (active) setError('Não foi possível consultar os anexos.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [examId, canView, reload])
  const open = async (item: ExamAttachment) => {
    if (!examId) return
    setBusy(true)
    setError('')
    try {
      setViewer(await openExamAttachment(examId, item.id))
    } catch {
      setError(
        'Arquivo indisponível, sem autorização ou com integridade pendente. Atualize a lista e tente novamente.',
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <Modal
        open={Boolean(exam)}
        title="Documentos do exame"
        description={exam?.patientName}
        size="lg"
        dismissible={!busy && !uploadBusy && !viewer}
        onClose={onClose}
      >
        <div className="space-y-4">
          {canUpload && examId && exam ? (
            <>
              <ExamAttachmentUpload
                key={previous?.id ?? `new-${reload}`}
                examId={examId}
                unitId={exam.unitId}
                previous={previous}
                onBusyChange={setUploadBusy}
                onCancel={() => setPrevious(null)}
                onDone={() => {
                  setPrevious(null)
                  setLoading(true)
                  setReload((value) => value + 1)
                }}
              />
              <UploadSessionsList examId={examId} reload={reload} />
            </>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold text-slate-900">Arquivos anexados</h2>
            {canView ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => setVersions(!versions)}>
                  {versions ? 'Mostrar vigentes' : 'Mostrar versões anteriores'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loading || uploadBusy}
                  onClick={() => {
                    setLoading(true)
                    setReload((value) => value + 1)
                  }}
                >
                  Atualizar
                </Button>
              </div>
            ) : null}
          </div>
          {error ? (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {canView && loading ? (
            <p className="text-sm text-slate-500">Consultando documentos...</p>
          ) : null}
          {!canView ? (
            <p className="text-sm text-slate-500">
              A consulta de arquivos exige permissão de visualização de anexos.
            </p>
          ) : null}
          {canView && !loading && !items.length ? (
            <p className="text-sm text-slate-500">Nenhum documento anexado.</p>
          ) : null}
          {canView
            ? items
                .filter((item) => versions || item.current)
                .map((item) => (
                  <article key={item.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="break-all font-bold text-slate-900">{item.name}</p>
                        <p className="mt-1 text-xs text-slate-600">
                          {attachmentCategoryLabels[item.category]} · Versão {item.version} ·{' '}
                          {item.current ? 'Vigente' : 'Substituída'} ·{' '}
                          {(item.sizeBytes / 1024).toFixed(1)} KB
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.authorName} · {new Date(item.createdAt).toLocaleString('pt-BR')}
                        </p>
                        {item.reason ? (
                          <p className="mt-2 text-sm text-slate-600">{item.reason}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                  disabled={busy || uploadBusy || item.validationStatus!=='APPROVED'}
                          onClick={() => void open(item)}
                        >
                          Visualizar
                        </Button>
                {canRevalidate&&item.validationStatus!=='APPROVED'?<Button size="sm" variant="outline" disabled={busy} onClick={()=>{if(!examId)return;setBusy(true);void revalidateExamAttachment(examId,item.id).then(()=>setReload(x=>x+1)).catch(()=>setError('Não foi possível revalidar o anexo.')).finally(()=>setBusy(false))}}>Revalidar arquivo</Button>:null}
                        {canUpload && item.current ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={uploadBusy}
                            onClick={() => setPrevious(item)}
                          >
                            Substituir
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))
            : null}
        </div>
      </Modal>
      <AttachmentViewer
        key={viewer?.id ?? 'closed'}
        attachment={viewer}
        onClose={() => setViewer(null)}
      />
    </>
  )
}
