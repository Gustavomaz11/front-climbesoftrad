import { PatientHistoryPanel } from '../patients/components/PatientHistoryPanel'
import { PrescriptionProtocolPanel } from '../contrast-protocols/components/PrescriptionProtocolPanel'
import { useWorkflowStatus } from '../exam-workflow/use-workflow-status'
import { WorkflowEditorBanner } from '../exam-workflow/WorkflowEditorBanner'
import type { ProtocolSource } from '../contrast-protocols/contrast-protocol.types'
import type { DocumentPresentation } from '../companies/company.types'
import type { JSONContent } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import { ArrowLeft, BadgeCheck, Cloud, CloudAlert, LoaderCircle, Printer } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { useAuthentication } from '../auth/auth-context'
import { hasPermission } from '../auth/auth.types'
import { ReportToolbar } from '../reports/components/ReportToolbar'
import { reportEditorExtensions } from '../reports/report-editor.extensions'
import '../reports/report-editor.css'
import {
  getExamPrescription,
  saveExamPrescription,
  signExamPrescription,
  uploadPrescriptionImage,
} from './prescription-api'
import type { PrescriptionExamSummary, PrescriptionSignature } from './prescription.types'
import { PrescriptionSignatureBlock } from './components/PrescriptionSignatureBlock'
import {
  setEditorEditableWithoutContentUpdate,
  shouldRunScheduledPrescriptionSave,
} from './prescription-save-policy'

type SaveStatus = 'loading' | 'pending' | 'saving' | 'saved' | 'error'
const emptyDocument: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] }

const statusLabel = (status: SaveStatus, signature: PrescriptionSignature | null) => {
  if (status === 'saving') return 'Salvando...'
  if (status === 'pending') return 'Alterações pendentes'
  if (status === 'error') return 'Falha ao salvar'
  if (signature) return `Assinada por ${signature.name}`
  return 'Prescrição salva'
}

export const PrescriptionEditorPage = () => {
  const { examId } = useParams()
  const navigate = useNavigate()
  const { user, registerContextChangeGuard } = useAuthentication()
  const workflow = useWorkflowStatus(examId)
  const canEdit = Boolean(user && hasPermission(user, 'prescriptions.edit') && workflow.mutable)
  const canUploadImage = Boolean(canEdit && user && hasPermission(user, 'prescriptions.images.upload'))
  const canSign = Boolean(canEdit && user?.role === 'DOCTOR' && hasPermission(user, 'prescriptions.sign'))
  const [presentation, setPresentation] = useState<DocumentPresentation>({
    headerText: '',
    footerText: '',
    signatureText: '',
  })
  const [exam, setExam] = useState<PrescriptionExamSummary | null>(null)
  const [signature, setSignature] = useState<PrescriptionSignature | null>(null)
  const [protocolSource, setProtocolSource] = useState<ProtocolSource | null>(null)
  const protocolSourceRef = useRef<ProtocolSource | null>(null)
  const [status, setStatus] = useState<SaveStatus>('loading')
  const [signing, setSigning] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [revision, setRevision] = useState(0)
  const loadedRef = useRef(false)
  const revisionRef = useRef(0)
  const signedRevisionRef = useRef(-1)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const signatureRef = useRef<HTMLDivElement>(null)
  const saveChainRef = useRef<Promise<void>>(Promise.resolve())

  const editor = useEditor({
    extensions: reportEditorExtensions,
    content: emptyDocument,
    editable: canEdit,
    onUpdate: () => {
      if (!loadedRef.current || !canEdit) return
      revisionRef.current += 1
      signedRevisionRef.current = -1
      setRevision(revisionRef.current)
      setSignature(null)
      setStatus('pending')
    },
  })

  const queueSave = useCallback(
    (content: JSONContent, targetRevision: number) => {
      if (!examId || !canEdit) return Promise.resolve()
      setStatus('saving')
      const protocolSelectionId = protocolSourceRef.current?.selectionId
      const operation = saveChainRef.current
        .catch(() => undefined)
        .then(async () => {
          try {
            await saveExamPrescription(examId, content, protocolSelectionId)
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
    if (signedRevisionRef.current === revisionRef.current) return
    void queueSave(editor.getJSON(), revisionRef.current)
  }, [canEdit, editor, queueSave, status])

  useEffect(() => {
    editor?.setEditable(canEdit)
  }, [canEdit, editor])

  useEffect(() => {
    if (!editor || !examId) return
    let active = true
    void getExamPrescription(examId)
      .then((prescription) => {
        if (!active) return
        editor.commands.setContent(prescription.content)
        loadedRef.current = true
        signedRevisionRef.current = prescription.signature ? 0 : -1
        setExam(prescription.exam)
        setPresentation(prescription.presentation)
        setSignature(prescription.signature)
        protocolSourceRef.current = prescription.protocolSource ?? null
        setProtocolSource(protocolSourceRef.current)
        setStatus('saved')
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
    if (!editor || revision === 0 || signedRevisionRef.current === revision || !canEdit) return
    const timeout = window.setTimeout(() => {
      if (!shouldRunScheduledPrescriptionSave(revision, signedRevisionRef.current)) return
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
    const protectChanges = (event: BeforeUnloadEvent) => {
      if (status !== 'pending' && status !== 'saving' && !signing) return
      event.preventDefault()
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('beforeunload', protectChanges)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('beforeunload', protectChanges)
    }
  }, [saveNow, signing, status])

  const signNow = async () => {
    if (!editor || !examId || signing || !canSign) return
    const targetRevision = revisionRef.current
    const content = editor.getJSON()
    const protocolSelectionId = protocolSourceRef.current?.selectionId
    signedRevisionRef.current = targetRevision
    setEditorEditableWithoutContentUpdate(editor, false)
    setSigning(true)
    setStatus('saving')
    const operation = saveChainRef.current
      .catch(() => undefined)
      .then(async () => {
        const result = await signExamPrescription(examId, content, protocolSelectionId)
        setSignature(result.signature)
        if (result.presentation) setPresentation(result.presentation)
        setStatus('saved')
        window.requestAnimationFrame(() => {
          signatureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
      })
    saveChainRef.current = operation
    try {
      await operation
    } catch {
      signedRevisionRef.current = -1
      setStatus('error')
    } finally {
      setEditorEditableWithoutContentUpdate(editor, canEdit)
      setSigning(false)
    }
  }

  const insertImage = async (file: File) => {
    if (!editor || !examId || !canUploadImage) return
    setUploadingImage(true)
    try {
      const image = await uploadPrescriptionImage(examId, file)
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
        if (!editor || !examId || !loadedRef.current || !canEdit) return
        if (status === 'saved' && !signing) return
        editor.setEditable(false, false)
        const restore = () => {
          if (!editor.isDestroyed) editor.setEditable(canEdit, false)
        }
        try {
          await saveChainRef.current
          if (signedRevisionRef.current !== revisionRef.current) {
            await saveExamPrescription(examId, editor.getJSON(), protocolSourceRef.current?.selectionId)
          }
          setStatus('saved')
          return restore
        } catch (error) {
          setStatus('error')
          restore()
          throw error
        }
      }),
    [canEdit, editor, examId, registerContextChangeGuard, signing, status],
  )

  if (!editor) return null

  return (
    <main className="min-h-screen bg-muted">
      {examId ? <WorkflowEditorBanner id={examId} status={workflow.value} onChange={workflow.refresh} /> : null}
      {examId ? <PatientHistoryPanel examId={examId} /> : null}
      {examId && canEdit && user && hasPermission(user, 'contrast.protocols.view') ? <PrescriptionProtocolPanel examId={examId} source={protocolSource} disabled={!exam || signing || status === 'loading'} onApply={(content, source) => { protocolSourceRef.current = source; setProtocolSource(source); editor.commands.setContent(content); }} /> : null}
      <header className="report-editor-chrome flex min-h-16 flex-wrap items-center justify-between gap-3 bg-card px-4 py-3 text-white sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-card/10 hover:text-white"
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
              Prescrição Médica — {exam?.patientName ?? 'Carregando...'}
            </p>
            <p className="truncate text-xs text-cyan-100/65">
              {exam ? `${exam.modality} • ${exam.studyDescription}` : 'Editor de prescrição'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
            {statusLabel(status, signature)}
          </span>
          {canSign ? (
            <Button
              size="sm"
              loading={signing}
              disabled={!exam || status === 'loading'}
              leftIcon={<BadgeCheck size={16} />}
              onClick={() => void signNow()}
            >
              {signature ? 'Assinada' : 'Assinar prescrição'}
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-card/10 hover:text-white"
            onClick={() => window.print()}
            aria-label="Imprimir prescrição"
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
          zoom={zoom}
          editable={canEdit}
          canUploadImage={canUploadImage}
          onSave={saveNow}
          onInsertImage={() => imageInputRef.current?.click()}
          onZoomIn={() => setZoom((value) => Math.min(2, value + 0.25))}
          onZoomOut={() => setZoom((value) => Math.max(0.75, value - 0.25))}
          onResetZoom={() => setZoom(1)}
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
          <Alert variant="error">Não foi possível carregar a prescrição.</Alert>
        </div>
      ) : null}
      <div className="report-editor-canvas overflow-auto bg-muted px-3 py-8 sm:px-8">
        <article
          className="report-document mx-auto min-h-[1120px] w-full max-w-[850px] bg-card px-8 py-12 shadow-xl sm:px-16 sm:py-16"
          style={{ zoom }}
        >
          <p className="mb-8 whitespace-pre-line text-center font-semibold">
            {presentation.headerText}
          </p>
          <EditorContent editor={editor} />
          {signature ? (
            <div ref={signatureRef}>
              <PrescriptionSignatureBlock
                signature={signature}
                signatureText={presentation.signatureText}
              />
            </div>
          ) : null}
          <p className="mt-12 whitespace-pre-line text-center text-xs text-muted-foreground">
            {presentation.footerText}
          </p>
        </article>
      </div>
    </main>
  )
}
