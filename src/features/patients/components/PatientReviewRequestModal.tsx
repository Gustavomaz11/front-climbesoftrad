import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { Alert } from '../../../components/ui/Alert'
import { openPatientReview } from '../patients-api'
import type { Patient } from '../patient.types'
export const PatientReviewRequestModal = ({
  patient,
  onClose,
  onSaved,
}: {
  patient: Patient
  onClose: () => void
  onSaved: () => void
}) => {
  const [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await openPatientReview(patient, reason)
      onSaved()
    } catch {
      setError('O cadastro mudou ou não pode ser conferido neste contexto. Recarregue os dados.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal
      open
      title="Revisar associação do paciente"
      description="Abra uma conferência para comparar os identificadores e exames deste cadastro com outro paciente."
      onClose={() => {
        if (!busy) onClose()
      }}
      footer={
        <>
          <Button variant="ghost" disabled={busy} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="open-review" loading={busy}>
            Abrir conferência
          </Button>
        </>
      }
    >
      <form id="open-review" onSubmit={(e) => void submit(e)} className="space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}
        <p className="text-sm font-bold">{patient.fullName}</p>
        <Input
          label="Motivo da conferência"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          minLength={3}
          maxLength={500}
        />
      </form>
    </Modal>
  )
}
