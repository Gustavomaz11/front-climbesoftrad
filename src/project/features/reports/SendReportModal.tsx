import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import type { Exam } from '../exams/exam.types'
import { sendReport, reportCompletionError } from './completed-report'

export const SendReportModal = ({
  exam,
  onClose,
  onDone,
}: {
  exam: Exam
  onClose: () => void
  onDone: () => void
}) => {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const send = async () => {
    if (!exam.reportCompletionId || busy) return
    setBusy(true)
    setError('')
    try {
      await sendReport(exam.id, exam.reportCompletionId)
      onDone()
    } catch (failure) {
      setError(reportCompletionError(failure))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal
      open
      title="Enviar laudo ao hospital"
      description="O resultado ficará disponível para o hospital de origem do exame."
      onClose={onClose}
      dismissible={!busy}
    >
      <p className="mt-4 text-sm">
        <strong>{exam.patientName}</strong> · {exam.studyDescription}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Será disponibilizada a versão finalizada pelo médico. O hospital poderá abrir e imprimir o
        laudo.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" disabled={busy} onClick={onClose}>
          Cancelar
        </Button>
        <Button disabled={busy} onClick={() => void send()}>
          {busy ? 'Enviando…' : 'Confirmar envio'}
        </Button>
      </div>
    </Modal>
  )
}
