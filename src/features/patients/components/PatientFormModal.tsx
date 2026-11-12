import { useState } from 'react'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { Alert } from '../../../components/ui/Alert'
import { Modal } from '../../../components/ui/Modal'
import { useHospitalUnits } from '../../hospital-units/useHospitalUnits'
import { savePatient } from '../patients-api'
import type { Patient } from '../patient.types'
export const PatientFormModal = ({
  patient,
  onClose,
  onSaved,
}: {
  patient?: Patient
  onClose: () => void
  onSaved: (patient: Patient) => void
}) => {
  const { units } = useHospitalUnits()
  const [values, setValues] = useState({
    fullName: patient?.fullName ?? '',
    socialName: patient?.socialName ?? '',
    birthDate: patient?.birthDate ?? '',
    sex: patient?.sex ?? '',
    country: patient?.country ?? 'Brasil',
    email: patient?.email ?? '',
    unitId: units[0]?.id ?? '',
    reason: '',
  })
  const [saving, setSaving] = useState(false),
    [error, setError] = useState('')
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const body = {
        fullName: values.fullName.trim(),
        socialName: values.socialName || null,
        birthDate: values.birthDate || null,
        sex: values.sex || null,
        country: values.country,
        email: values.email || null,
        ...(patient
          ? { expectedVersion: patient.revision, reason: values.reason }
          : { unitId: values.unitId }),
      }
      onSaved(await savePatient(body, patient?.id))
      onClose()
    } catch {
      setError('Não foi possível salvar. Confira os dados, a unidade e se o cadastro foi alterado.')
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal
      open
      title={patient ? 'Corrigir cadastro' : 'Cadastrar paciente'}
      description="Dados do cadastro interno. Informações recebidas em exames anteriores são preservadas."
      onClose={() => {
        if (!saving) onClose()
      }}
      footer={
        <>
          <Button variant="ghost" disabled={saving} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="patient-form" loading={saving}>
            Salvar cadastro
          </Button>
        </>
      }
    >
      <form
        id="patient-form"
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => void submit(event)}
      >
        {error ? (
          <Alert variant="error" className="sm:col-span-2">
            {error}
          </Alert>
        ) : null}
        {(
          [
            ['fullName', 'Nome completo'],
            ['socialName', 'Nome social'],
            ['birthDate', 'Nascimento'],
            ['country', 'País'],
            ['email', 'E-mail'],
          ] as const
        ).map(([key, label]) => (
          <Input
            key={key}
            label={label}
            value={values[key]}
            type={key === 'birthDate' ? 'date' : key === 'email' ? 'email' : 'text'}
            required={['fullName', 'country'].includes(key)}
            minLength={key === 'fullName' ? 2 : undefined}
            maxLength={key === 'email' ? 255 : 120}
            onChange={(event) => setValues({ ...values, [key]: event.target.value })}
          />
        ))}
        <label className="text-sm font-semibold text-slate-700">
          Sexo
          <select
            aria-label="Sexo do paciente"
            value={values.sex}
            onChange={(e) => setValues({ ...values, sex: e.target.value })}
            className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3"
          >
            <option value="">Não informado</option>
            <option value="FEMININO">Feminino</option>
            <option value="MASCULINO">Masculino</option>
          </select>
        </label>
        {!patient ? (
          <label className="text-sm font-semibold text-slate-700">
            Unidade
            <select
              aria-label="Unidade do paciente"
              required
              value={values.unitId}
              onChange={(e) => setValues({ ...values, unitId: e.target.value })}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3"
            >
              <option value="">Selecione a unidade</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <Input
            label="Justificativa da correção"
            required
            minLength={3}
            maxLength={500}
            value={values.reason}
            onChange={(e) => setValues({ ...values, reason: e.target.value })}
            containerClassName="sm:col-span-2"
          />
        )}
      </form>
    </Modal>
  )
}
