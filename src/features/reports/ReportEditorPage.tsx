import { PatientHistoryPanel } from '../patients/components/PatientHistoryPanel'
import { useWorkflowStatus } from '../exam-workflow/use-workflow-status'
import { WorkflowEditorBanner } from '../exam-workflow/WorkflowEditorBanner'
import type { DocumentPresentation } from '../companies/company.types'
import type { JSONContent } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import { ArrowLeft, Cloud, CloudAlert, LoaderCircle, Printer } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { useAuthentication } from '../auth/auth-context'
import { hasPermission } from '../auth/auth.types'
import {
  getExamReport,
  releaseReportPresence,
  saveExamReport,
  touchReportPresence,
  uploadReportImage,
} from './report-api'
import { reportEditorExtensions } from './report-editor.extensions'
import type { ReportExamSummary } from './report.types'
import { ReportToolbar } from './components/ReportToolbar'
import './report-editor.css'
import { apiRequestJson } from '../auth/auth-http-client'
import type { WorkflowStatus } from '../exam-workflow/use-workflow-status'
import { CompletedReportView } from './CompletedReportView'
import { getCompletedReport, finalizeReport, reportCompletionError, type CompletedReport } from './completed-report'
import { SignReportModal } from './SignReportModal'

type SaveStatus = 'loading' | 'pending' | 'saving' | 'saved' | 'error'

const emptyDocument: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] }

const savedLabel = (status: SaveStatus, updatedAt: string | null) => {
  if (status === 'saving') return 'Salvando...'
  if (status === 'pending') return 'Alterações pendentes'
  if (status === 'error') return 'Falha ao salvar'
  if (!updatedAt) return 'Novo laudo'
  return `Salvo às ${new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(updatedAt))}`
}

export const ReportEditorPage = () => {
  const { examId } = useParams()
  const navigate = useNavigate()
  const { user, registerContextChangeGuard } = useAuthentication()
  const workflow = useWorkflowStatus(examId)
  const [completion, setCompletion] = useState<CompletedReport | null>(null)
  const [loadedExamId, setLoadedExamId] = useState<string | null>(null)
  const [finalizing, setFinalizing] = useState(false), [confirmFinalize, setConfirmFinalize] = useState(false), [finishError, setFinishError] = useState('')
  const finishingRef = useRef(false)
  const canEdit = Boolean(user && loadedExamId === examId && hasPermission(user, 'reports.edit') && workflow.mutable && workflow.value?.workflowState !== 'TYPED' && !completion && !finalizing)
  const canUploadImage = Boolean(canEdit && user && hasPermission(user, 'reports.images.upload'))
  const [presentation, setPresentation] = useState<DocumentPresentation>({
    headerText: '',
    footerText: '',
    signatureText: '',
  })
  const [exam, setExam] = useState<ReportExamSummary | null>(null)
  const [status, setStatus] = useState<SaveStatus>('loading')
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [revision, setRevision] = useState(0)
  const [documentZoom, setDocumentZoom] = useState(1)
  const loadedRef = useRef(false)
  const revisionRef = useRef(0)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const saveChainRef = useRef<Promise<void>>(Promise.resolve())

  const editor = useEditor({
    extensions: reportEditorExtensions,
    content: emptyDocument,
    editable: canEdit,
    onUpdate: () => {
      if (!loadedRef.current || !canEdit) return
      revisionRef.current += 1
      setRevision(revisionRef.current)
      setStatus('pending')
    },
  })

  const queueSave = useCallback(
    (content: JSONContent, targetRevision: number) => {
      if (!examId || !canEdit || finishingRef.current) return Promise.resolve()
      setStatus('saving')
      const operation = saveChainRef.current
        .catch(() => undefined)
        .then(async () => {
          if (finishingRef.current) return
          try {
            const result = await saveExamReport(examId, content)
            setUpdatedAt(result.updatedAt)
            if (revisionRef.current === targetRevision) setStatus('saved')
          } catch {
            if (revisionRef.current === targetRevision) setStatus('error')
          }
        })
      saveChainRef.current = operation
      return operation
    },
    [canEdit, examId],
  )

  const saveNow = useCallback(() => {
    if (!editor || status === 'loading' || !canEdit) return
    void queueSave(editor.getJSON(), revisionRef.current)
  }, [canEdit, editor, queueSave, status])

  useEffect(() => {
    editor?.setEditable(canEdit)
  }, [canEdit, editor])

  useEffect(() => {
    if (!editor || !examId) return
    let active = true
    void getCompletedReport(examId)
      .then(async (finalized) => {
        if (!active) return
        if (finalized) {
          setCompletion(finalized)
          setStatus('saved')
          return
        }
        const report = await getExamReport(examId)
        if (!active) return
        editor.commands.setContent(report.content)
        loadedRef.current = true
        setExam(report.exam)
        setPresentation(report.presentation)
        setUpdatedAt(report.updatedAt)
        setStatus('saved')
        setLoadedExamId(examId)
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
      loadedRef.current = false
    }
  }, [editor, examId])

  useEffect(() => {
    if (!examId || !exam || !canEdit) return
    const clientId = crypto.randomUUID()
    const touch = () => void touchReportPresence(examId, clientId).catch(() => undefined)
    const release = () => void releaseReportPresence(examId, clientId).catch(() => undefined)

    touch()
    const heartbeat = window.setInterval(touch, 15_000)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') touch()
    }
    window.addEventListener('pagehide', release)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearInterval(heartbeat)
      window.removeEventListener('pagehide', release)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      release()
    }
  }, [canEdit, exam, examId])

  useEffect(() => {
    if (!editor || revision === 0 || !canEdit) return
    const timeout = window.setTimeout(() => {
      void queueSave(editor.getJSON(), revision)
    }, 1200)
    return () => window.clearTimeout(timeout)
  }, [canEdit, editor, queueSave, revision])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 's') return
      event.preventDefault()
      saveNow()
    }
    const protectUnsavedChanges = (event: BeforeUnloadEvent) => {
      if (status !== 'pending' && status !== 'saving') return
      event.preventDefault()
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('beforeunload', protectUnsavedChanges)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('beforeunload', protectUnsavedChanges)
    }
  }, [saveNow, status])

  const insertImage = async (file: File) => {
    if (!editor || !examId || !canUploadImage) return
    setUploadingImage(true)
    try {
      const image = await uploadReportImage(examId, file)
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'image',
          attrs: { src: image.url, storageKey: image.storageKey, alt: file.name },
        })
        .run()
    } finally {
      setUploadingImage(false)
    }
  }

  useEffect(
    () =>
      registerContextChangeGuard(async () => {
        if (finishingRef.current) throw new Error('Aguarde a finalização do laudo antes de trocar o contexto.')
        if (!editor || !examId || !loadedRef.current || !canEdit || status === 'saved') return
        editor.setEditable(false, false)
        const restore = () => {
          if (!editor.isDestroyed) editor.setEditable(canEdit, false)
        }
        try {
          await saveChainRef.current
          const saved = await saveExamReport(examId, editor.getJSON())
          setUpdatedAt(saved.updatedAt)
          setStatus('saved')
          return restore
        } catch (error) {
          setStatus('error')
          restore()
          throw error
        }
      }),
    [canEdit, editor, examId, registerContextChangeGuard, status],
  )

  useEffect(() => {
    if (!examId || workflow.value?.workflowState !== 'TYPED' || completion) return
    let active = true
    void getCompletedReport(examId).then(result => { if (active) setCompletion(result) }).catch(() => undefined)
    return () => { active = false }
  }, [examId, workflow.value?.workflowState, completion])

  const finish = async (signatureId: string) => {
    if (!editor || !examId || finishingRef.current || !canEdit) return
    finishingRef.current = true; setFinalizing(true); setFinishError(''); editor.setEditable(false)
    try {
      await saveChainRef.current
      const saved = await saveExamReport(examId, editor.getJSON())
      setUpdatedAt(saved.updatedAt); setStatus('saved')
      const current = await apiRequestJson<WorkflowStatus>(`/exams/${examId}/workflow-status`, {}, { authenticated: true })
      const result = await finalizeReport(examId, current.workflowVersion, saved.contentHash, signatureId)
      setCompletion(result); setConfirmFinalize(false); workflow.refresh()
    } catch (failure) { setFinishError(reportCompletionError(failure)) }
    finally { finishingRef.current = false; setFinalizing(false) }
  }

  if (!editor) return null
  if (completion) return <CompletedReportView document={completion} canSend={Boolean(user?.permissions.includes('reports.deliver'))}
    onBack={() => navigate('/dashboard')} onSent={sentAt => setCompletion(current => current ? { ...current, sentAt } : current)} />

  return (
    <main className="min-h-screen bg-slate-200">
      {examId ? <WorkflowEditorBanner id={examId} status={workflow.value} canStart={Boolean(user && hasPermission(user, 'reports.edit'))} onChange={workflow.refresh} /> : null}
      {examId ? <PatientHistoryPanel examId={examId} /> : null}
      <header className="report-editor-chrome flex min-h-16 flex-wrap items-center justify-between gap-3 bg-brand-950 px-4 py-3 text-white sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={() => {
              window.close()
              navigate('/dashboard')
            }}
            aria-label="Voltar aos exames"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {exam?.patientName ?? 'Carregando laudo...'}
            </p>
            <p className="truncate text-xs text-cyan-100/65">
              {exam ? `${exam.modality} • ${exam.studyDescription}` : 'Laudário'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === 'DOCTOR' && user.permissions.includes('reports.finalize') && <Button disabled={!canEdit || workflow.value?.workflowState !== 'IN_PROGRESS' || !exam} onClick={() => setConfirmFinalize(true)}>Finalizar laudo</Button>}
          <span
            className={`hidden items-center gap-2 text-xs font-semibold sm:flex ${status === 'error' ? 'text-red-300' : 'text-cyan-100/75'}`}
          >
            {status === 'saving' || status === 'loading' ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : status === 'error' ? (
              <CloudAlert size={15} />
            ) : (
              <Cloud size={15} />
            )}
            {savedLabel(status, updatedAt)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={() => window.print()}
            aria-label="Imprimir laudo"
          >
            <Printer size={19} />
          </Button>
        </div>
      </header>

      <div className="report-editor-chrome sticky top-0 z-20">
        <ReportToolbar
          editor={editor}
          saving={status === 'saving'}
          uploadingImage={uploadingImage}
          zoom={documentZoom}
          onSave={saveNow}
          onInsertImage={() => imageInputRef.current?.click()}
          onZoomIn={() => setDocumentZoom((value) => Math.min(2, value + 0.25))}
          onZoomOut={() => setDocumentZoom((value) => Math.max(0.75, value - 0.25))}
          onResetZoom={() => setDocumentZoom(1)}
          editable={canEdit}
          canUploadImage={canUploadImage}
        />
      </div>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void insertImage(file)
          event.target.value = ''
        }}
      />

      {status === 'error' && !exam ? (
        <div className="mx-auto max-w-3xl p-6">
          <Alert variant="error">
            Não foi possível carregar o laudo. Verifique o acesso e a conexão.
          </Alert>
        </div>
      ) : null}
      <div className="report-editor-canvas overflow-auto bg-slate-200 px-3 py-8 sm:px-8">
        <article
          className="report-document mx-auto min-h-[1120px] w-full max-w-[850px] bg-white px-8 py-12 shadow-xl sm:px-16 sm:py-16"
          style={{ zoom: documentZoom }}
        >
          <p className="mb-8 whitespace-pre-line text-center font-semibold">
            {presentation.headerText}
          </p>
          <EditorContent editor={editor} />
          <p className="mt-12 whitespace-pre-line text-center text-xs text-slate-600">
            {presentation.footerText}
          </p>
        </article>
      </div>
      <SignReportModal open={confirmFinalize} busy={finalizing} error={finishError} patientName={exam?.patientName} onClose={() => { if (!finalizing) setConfirmFinalize(false) }} onSign={signatureId => void finish(signatureId)} />
    </main>
  )
}
