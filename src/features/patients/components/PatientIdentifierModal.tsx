import { useState } from 'react'
import { useHospitalUnits } from '../../hospital-units/useHospitalUnits'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { Alert } from '../../../components/ui/Alert'
import { Modal } from '../../../components/ui/Modal'
import { addPatientIdentifier } from '../patients-api'
export const PatientIdentifierModal = ({
  patientId,
  onClose,
  onSaved,
}: {
  patientId: string
  onClose: () => void
  onSaved: () => void
}) => {
  const { units } = useHospitalUnits()
  const [unitId, setUnitId] = useState(''),
    [issuer, setIssuer] = useState(''),
    [value, setValue] = useState(''),
    [reason, setReason] = useState(''),
    [saving, setSaving] = useState(false),
    [error, setError] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await addPatientIdentifier(patientId, { unitId, issuer, originalValue: value, reason })
      onSaved()
      onClose()
    } catch {
      setError('Não foi possível associar. Identificadores de outro cadastro exigem conferência.')
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal
      open
      title="Adicionar identificador de origem"
      description="Informe o sistema emissor e preserve o valor original do identificador."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="patient-identifier" loading={saving}>
            Associar identificador
          </Button>
        </>
      }
    >
      <form id="patient-identifier" onSubmit={(e) => void submit(e)} className="space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}
        <label className="block text-sm font-semibold">
          Unidade
          <select
            aria-label="Unidade do identificador"
            value={unitId}
            required
            onChange={(e) => setUnitId(e.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3"
          >
            <option value="">Selecione</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Sistema emissor"
          required
          minLength={2}
          maxLength={120}
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
        />
        <Input
          label="Valor original do identificador"
          required
          maxLength={120}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Input
          label="Justificativa"
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
