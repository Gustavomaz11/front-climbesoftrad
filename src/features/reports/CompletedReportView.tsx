import { EditorContent, useEditor } from '@tiptap/react'
import { useState } from 'react'
import { Printer, Send } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { reportEditorExtensions } from './report-editor.extensions'
import { reportCompletionError, sendReport, type CompletedReport } from './completed-report'
import './report-editor.css'

export const CompletedReportView = ({
  document,
  onBack,
  canSend = false,
  onSent,
}: {
  document: CompletedReport
  onBack: () => void
  canSend?: boolean
  onSent?: (sentAt: string) => void
}) => {
  const editor = useEditor(
    { extensions: reportEditorExtensions, content: document.content, editable: false },
    [document.id],
  )
  const [confirm, setConfirm] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const [signatureReady, setSignatureReady] = useState(!document.signature)
  const send = async () => {
    setBusy(true)
    setError('')
    try {
      const result = await sendReport(document.examId, document.id)
      onSent?.(result.sentAt)
      setConfirm(false)
    } catch (failure) {
      setError(reportCompletionError(failure))
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="completed-report-page min-h-screen bg-slate-100 pb-10">
      <header className="report-editor-chrome flex flex-wrap items-center justify-between gap-3 bg-brand-950 px-6 py-4 text-white">
        <Button variant="ghost" className="text-white hover:text-white" onClick={onBack}>
          ← Voltar
        </Button>
        <h1 className="font-bold">
          {document.sentAt ? 'Laudo enviado ao hospital' : 'Laudo finalizado'}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={!signatureReady} onClick={() => window.print()} leftIcon={<Printer size={16} />}>
            Imprimir / Salvar PDF
          </Button>
          {canSend && !document.sentAt && document.originUnitName && (
            <Button onClick={() => setConfirm(true)} leftIcon={<Send size={16} />}>
              Enviar ao hospital
            </Button>
          )}
        </div>
      </header>
      <div
        role="status"
        className="report-editor-chrome mx-auto max-w-[850px] px-4 py-4 text-sm text-brand-900"
      >
        {document.sentAt
          ? `Disponibilizado ao hospital em ${new Date(document.sentAt).toLocaleString('pt-BR')}.`
          : document.originUnitName
            ? `Pronto para envio ao hospital ${document.originUnitName}.`
            : 'Este exame não possui hospital de origem vinculado.'}
        <p className="mt-1 text-xs text-slate-500">
          Versão finalizada pelo médico. Assinatura digital por certificado não aplicada.
        </p>
      </div>
      <article className="report-document completed-report mx-auto min-h-[1120px] w-full max-w-[850px] bg-white px-6 py-10 shadow-sm sm:px-16 sm:py-14">
        <p className="mb-6 whitespace-pre-line text-center font-semibold">
          {document.presentation.headerText}
        </p>
        <div className="mb-8 border-b border-slate-200 pb-5 text-sm">
          <h2 className="text-xl font-bold">{document.exam.patientName}</h2>
          <p className="mt-2">
            {document.exam.modality} · {document.exam.studyDescription}
          </p>
          <p>Hospital: {document.originUnitName ?? document.exam.unit}</p>
          <p>Exame: {new Date(document.exam.performedAt).toLocaleString('pt-BR')}</p>
        </div>
        <EditorContent editor={editor} />
        <div className="report-physician-signature text-sm">
          {document.signature && <img src={document.signature.dataUrl} alt={`Assinatura de ${document.physician.name}`} onLoad={() => setSignatureReady(true)} onError={() => { setSignatureReady(false); setError('Não foi possível carregar a assinatura para impressão. Atualize a página.') }} />}
          <p className="mt-2 font-bold">CRM {document.physician.crm}</p>
          <p className="mt-1">{document.physician.name}</p>
          <p className="mt-2 text-xs text-slate-500">
            Finalizado em {new Date(document.finalizedAt).toLocaleString('pt-BR')} · Versão{' '}
            {document.version}
          </p>
        </div>
        {error && <p role="alert" className="report-editor-chrome mt-4 text-sm text-red-700">{error}</p>}
        <p className="mt-8 whitespace-pre-line text-center text-xs text-slate-600">
          {document.presentation.footerText}
        </p>
      </article>
      <Modal
        open={confirm}
        title="Enviar laudo ao hospital"
        description={`O laudo de ${document.exam.patientName} ficará disponível para ${document.originUnitName}.`}
        onClose={() => {
          if (!busy) setConfirm(false)
        }}
        dismissible={!busy}
      >
        <p className="mt-4 text-sm text-slate-600">
          Será enviada a versão finalizada por {document.physician.name}, CRM{' '}
          {document.physician.crm}.
        </p>
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" disabled={busy} onClick={() => setConfirm(false)}>
            Cancelar
          </Button>
          <Button disabled={busy} onClick={() => void send()}>
            {busy ? 'Enviando…' : 'Confirmar envio'}
          </Button>
        </div>
      </Modal>
    </main>
  )
}
