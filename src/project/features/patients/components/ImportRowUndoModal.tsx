import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { Alert } from '../../../components/ui/Alert'
import { undoImportRow } from '../patients-api'
import type { ImportReport, ImportRow } from '../patient.types'
export const ImportRowUndoModal = ({
  batchId,
  row,
  onClose,
  onSaved,
}: {
  batchId: string
  row: ImportRow
  onClose: () => void
  onSaved: (report: ImportReport) => void
}) => {
  const [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      onSaved(await undoImportRow(batchId, row, reason))
      onClose()
    } catch {
      setError(
        'A linha mudou ou seus identificadores já foram utilizados. Abra a conferência do paciente para corrigir vínculos com exames.',
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal
      open
      title="Desfazer linha importada"
      description="Os identificadores novos desta linha serão removidos se ainda não tiverem sido usados em exames. A operação ficará registrada."
      onClose={() => {
        if (!busy) onClose()
      }}
      footer={
        <>
          <Button variant="ghost" disabled={busy} onClick={onClose}>
            Cancelar
          </Button>
          <Button form="undo-import" type="submit" loading={busy}>
            Desfazer importação
          </Button>
        </>
      }
    >
      <form id="undo-import" onSubmit={(e) => void submit(e)} className="space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}
        <p className="text-sm">
          Linha {row.line} · {row.data.issuer}: {row.data.externalId}
        </p>
        <Input
          required
          label="Justificativa"
          minLength={3}
          maxLength={500}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </form>
    </Modal>
  )
}
