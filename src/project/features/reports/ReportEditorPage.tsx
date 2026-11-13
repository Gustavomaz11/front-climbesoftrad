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
  closeReportSession,
  saveExamReport,
  uploadReportImage,
} from './report-api'
import {useReportSession} from './use-report-session'
import {Modal} from '../../components/ui/Modal'
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
  const [loadRevision,setLoadRevision]=useState(0)
  const [finalizing, setFinalizing] = useState(false), [confirmFinalize, setConfirmFinalize] = useState(false), [finishError, setFinishError] = useState('')
  const finishingRef = useRef(false)
  const [clientId,setClientId]=useState(()=>crypto.randomUUID())
  const [leaseHeld,setLeaseHeld]=useState(false),[confirmExit,setConfirmExit]=useState(false),[exitBusy,setExitBusy]=useState(false),[exitError,setExitError]=useState('')
  const lastContentRef=useRef<JSONContent>(emptyDocument)
  const assignedToOther = Boolean(workflow.value?.reportingUserId && workflow.value.reportingUserId !== user?.id)
  const canEdit = Boolean(user?.role==='DOCTOR' && leaseHeld && !exitBusy && !assignedToOther && workflow.value?.reportingUserId === user.id && workflow.value?.workflowState === 'IN_PROGRESS' && loadedExamId === examId && hasPermission(user, 'reports.edit') && workflow.mutable && !completion && !finalizing)
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
    onUpdate: ({editor:current}) => {
      if (!loadedRef.current || !canEdit) return
      lastContentRef.current=current.getJSON()
      revisionRef.current += 1
      setRevision(revisionRef.current)
      setStatus('pending')
    },
  })

  const session=useReportSession({examId,clientId,enabled:Boolean(user?.role==='DOCTOR' && loadedExamId===examId && workflow.value?.workflowState==='IN_PROGRESS' && workflow.value?.reportingUserId===user.id && !completion),onHeld:setLeaseHeld,content:()=>lastContentRef.current})

  const queueSave = useCallback(
    (content: JSONContent, targetRevision: number) => {
      if (!examId || !canEdit || finishingRef.current) return Promise.resolve()
      setStatus('saving')
      const operation = saveChainRef.current
        .catch(() => undefined)
        .then(async () => {
          if (finishingRef.current) return
          try {
            const result = await saveExamReport(examId, content,clientId)
            setUpdatedAt(result.updatedAt)
            if (revisionRef.current === targetRevision) setStatus('saved')
          } catch {
            if (revisionRef.current === targetRevision) setStatus('error')
          }
        })
      saveChainRef.current = operation
      return operation
    },
    [canEdit, examId,clientId],
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
        lastContentRef.current=report.content
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
  }, [editor, examId,loadRevision])



  useEffect(() => {
    if (!editor || revision === 0 || !canEdit) return
    const timeout = window.setTimeout(() => {
      void queueSave(editor.getJSON(), revision)
    }, 700)
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
      const image = await uploadReportImage(examId, file,clientId)
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
        if (!editor || !examId || !loadedRef.current || !leaseHeld) return
        editor.setEditable(false, false)
        const restore = () => {
          if (!editor.isDestroyed) editor.setEditable(canEdit, false)
        }
        try {
          await saveChainRef.current
          await closeReportSession(examId,clientId,editor.getJSON())
          setLeaseHeld(false);workflow.refresh()
          setStatus('saved')
          return restore
        } catch (error) {
          setStatus('error')
          restore()
          throw error
        }
      }),
    [canEdit, editor, examId, registerContextChangeGuard, leaseHeld,clientId,workflow],
  )

  useEffect(() => {
    if (!examId || !['SIGNED','RESIGNED','REVIEW','REVALIDATED'].includes(workflow.value?.workflowState??'') || completion) return
    let active = true
    void getCompletedReport(examId).then(result => { if (active) setCompletion(result) }).catch(() => undefined)
    return () => { active = false }
  }, [examId, workflow.value?.workflowState, completion])

  const finish = async (signatureId: string) => {
    if (!editor || !examId || finishingRef.current || !canEdit) return
    finishingRef.current = true; setFinalizing(true); setFinishError(''); editor.setEditable(false)
    try {
      await saveChainRef.current
      const saved = await saveExamReport(examId, editor.getJSON(),clientId)
      setUpdatedAt(saved.updatedAt); setStatus('saved')
      const current = await apiRequestJson<WorkflowStatus>(`/exams/${examId}/workflow-status`, {}, { authenticated: true })
      const result = await finalizeReport(examId, current.workflowVersion, saved.contentHash, signatureId,clientId)
      setCompletion(result); setConfirmFinalize(false); workflow.refresh()
    } catch (failure) { setFinishError(reportCompletionError(failure)) }
    finally { finishingRef.current = false; setFinalizing(false) }
  }

  const leave=useCallback(async(forced=false)=>{
    if(!examId || !editor || exitBusy)return
    setExitBusy(true);setExitError('');editor.setEditable(false)
    try{await saveChainRef.current;await closeReportSession(examId,clientId,editor.getJSON());setLeaseHeld(false);setStatus('saved');navigate('/my-queue',{replace:true,state:forced?{message:'Laudo salvo. Edição encerrada pela administração.'}:undefined})}
    catch{setExitError('Não foi possível salvar e encerrar. Mantenha o painel aberto e tente novamente.');setExitBusy(false)}
  },[examId,editor,clientId,exitBusy,navigate])
  useEffect(()=>{
    if(!session.releaseReason || exitBusy || exitError)return
    let active=true
    queueMicrotask(()=>{if(active)void leave(true)})
    return()=>{active=false}
  },[session.releaseReason,exitBusy,exitError,leave])

  if (!editor) return null
  if (completion) return <CompletedReportView document={completion} canSend={Boolean(user?.permissions.includes('reports.deliver'))}
    onBack={() => navigate('/dashboard')} onRevisionStarted={()=>window.location.reload()} onSent={sentAt => setCompletion(current => current ? { ...current, sentAt } : current)} />

  return (
    <main className="min-h-screen bg-muted">
      {examId ? <WorkflowEditorBanner id={examId} status={workflow.value} canStart={Boolean(user?.role==='DOCTOR' && (!assignedToOther || workflow.value?.workflowState==='TYPED') && hasPermission(user, 'reports.edit'))} onChange={()=>{setClientId(crypto.randomUUID());setLoadedExamId(null);setLoadRevision(n=>n+1);workflow.refresh()}} /> : null}
      {session.error && <p role="alert" className="report-editor-chrome p-4 text-sm text-destructive">{session.error}</p>}
      {session.releaseReason && <aside role="alert" className="report-editor-chrome border-b p-4 text-sm">Encerramento solicitado pela administração: {session.releaseReason}. Salvando o conteúdo antes de sair.{exitError && <><p>{exitError}</p><Button disabled={exitBusy} onClick={()=>void leave(true)}>Tentar salvar e encerrar</Button></>}</aside>}
      {examId ? <PatientHistoryPanel examId={examId} /> : null}
      <header className="report-editor-chrome flex min-h-16 flex-wrap items-center justify-between gap-3 bg-card px-4 py-3 text-white sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-card/10 hover:text-white"
            onClick={() => {
              if(leaseHeld){setConfirmExit(true);return}
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
            className="text-white hover:bg-card/10 hover:text-white"
            disabled
            title="Assine o laudo para imprimir ou exportar a versão liberada"
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
      <div className="report-editor-canvas overflow-auto bg-muted px-3 py-8 sm:px-8">
        <article
          className="report-document mx-auto min-h-[1120px] w-full max-w-[850px] bg-card px-8 py-12 shadow-xl sm:px-16 sm:py-16"
          style={{ zoom: documentZoom }}
        >
          <p className="mb-8 whitespace-pre-line text-center font-semibold">
            {presentation.headerText}
          </p>
          <EditorContent editor={editor} />
          <p className="mt-12 whitespace-pre-line text-center text-xs text-muted-foreground">
            {presentation.footerText}
          </p>
        </article>
      </div>
      <Modal open={confirmExit} title="Salvar e sair do laudário" description="O conteúdo será mantido como Digitado, no seu nome." onClose={()=>{if(!exitBusy)setConfirmExit(false)}} dismissible={!exitBusy}>
        {exitError&&<p role="alert" className="text-destructive">{exitError}</p>}<div className="flex justify-end gap-3"><Button variant="outline" disabled={exitBusy} onClick={()=>setConfirmExit(false)}>Continuar laudando</Button><Button disabled={exitBusy} onClick={()=>void leave()}>{exitBusy?'Salvando…':'Salvar e sair'}</Button></div>
      </Modal>
      <SignReportModal open={confirmFinalize} busy={finalizing} error={finishError} patientName={exam?.patientName} onClose={() => { if (!finalizing) setConfirmFinalize(false) }} onSign={signatureId => void finish(signatureId)} />
    </main>
  )
}
