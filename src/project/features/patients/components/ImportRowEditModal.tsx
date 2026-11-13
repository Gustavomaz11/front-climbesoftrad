import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Alert } from '../../../components/ui/Alert'
import { reviewImportRow } from '../patients-api'
import type { ImportRow, ImportReport } from '../patient.types'
export const ImportRowEditModal = ({
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
  const [values, setValues] = useState(row.data),
    [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      onSaved(await reviewImportRow(batchId, row, true, reason, values))
      onClose()
    } catch {
      setError('Não foi possível revisar. Confira o cadastro e o escopo da unidade.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal
      open
      title={'Revisar linha ' + row.line}
      description="Corrija o mapeamento e aprove somente após conferir o paciente e a origem."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" form="import-row-edit" loading={busy}>
            Conferir e aprovar linha
          </Button>
        </>
      }
    >
      <form id="import-row-edit" onSubmit={(e) => void submit(e)} className="space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}
        {(
          [
            ['unitId', 'ID da unidade'],
            ['patientId', 'ID do cadastro de paciente'],
            ['issuer', 'Sistema emissor atual'],
            ['externalId', 'Identificador atual'],
            ['legacyIssuer', 'Sistema emissor legado'],
            ['legacyExternalId', 'Identificador legado'],
          ] as const
        ).map(([key, label]) => (
          <Input
            key={key}
            label={label}
            required={!key.startsWith('legacy')}
            maxLength={120}
            value={values[key]}
            onChange={(e) => setValues({ ...values, [key]: e.target.value })}
          />
        ))}
        <Input
          label="Justificativa da revisão"
          required
          minLength={3}
          maxLength={500}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </form>
    </Modal>
  )
}
