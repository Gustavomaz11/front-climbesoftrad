import { NativeSelect as SurfaceNativeSelect } from '@/components/ui/native-select'
import { useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import type { ExamType } from '../../exam-catalog/exam-catalog.types'
import type { Physician } from '../../physicians/physician.types'
import { createExamPrice } from '../exam-pricing-api'
export const ExamPriceForm = ({
  types,
  units,
  physicians,
  allUnits,
  onClose,
  onSaved,
}: {
  types: ExamType[]
  units: Array<{ id: string; name: string }>
  physicians: Physician[]
  allUnits: boolean
  onClose: () => void
  onSaved: () => void
}) => {
  const [form, setForm] = useState({
      examTypeId: '',
      unitId: !allUnits && units.length === 1 ? units[0]!.id : '',
      physicianId: '',
      kind: 'BILLING',
      amount: '',
      validFrom: '',
      validTo: '',
      reason: '',
    }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const save = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await createExamPrice({
        examTypeId: form.examTypeId,
        ...(form.unitId ? { unitId: form.unitId } : {}),
        ...(form.kind === 'PAYOUT' && form.physicianId ? { physicianId: form.physicianId } : {}),
        kind: form.kind,
        currency: 'BRL',
        amount: form.amount,
        validFrom: form.validFrom,
        ...(form.validTo ? { validTo: form.validTo } : {}),
        reason: form.reason,
      })
      onSaved()
    } catch {
      setError('Confira valor, vigência, vínculo e se há outra regra sobreposta no mesmo escopo.')
    } finally {
      setBusy(false)
    }
  }
  const selectClass = 'mt-1 block w-full rounded-lg border border-input bg-card p-2'
  return (
    <Modal open title="Nova regra de preço" dismissible={!busy} onClose={onClose}>
      <form onSubmit={(event) => void save(event)} className="space-y-4">
        <label className="block text-sm font-semibold">
          Tabela
          <SurfaceNativeSelect
            aria-label="Tabela de preço"
            value={form.kind}
            onChange={(event) => setForm({ ...form, kind: event.target.value, physicianId: '' })}
            className={selectClass}
          >
            <option value="BILLING">Faturamento à unidade</option>
            <option value="PAYOUT">Repasse ao médico</option>
          </SurfaceNativeSelect>
        </label>
        <label className="block text-sm font-semibold">
          Tipo do catálogo
          <SurfaceNativeSelect
            aria-label="Tipo da regra de preço"
            required
            value={form.examTypeId}
            onChange={(event) => setForm({ ...form, examTypeId: event.target.value })}
            className={selectClass}
          >
            <option value="">Selecione</option>
            {types
              .filter((type) => type.active)
              .map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} · {type.modality}
                </option>
              ))}
          </SurfaceNativeSelect>
        </label>
        <label className="block text-sm font-semibold">
          Unidade
          <SurfaceNativeSelect
            aria-label="Unidade da regra de preço"
            required={!allUnits}
            value={form.unitId}
            onChange={(event) => setForm({ ...form, unitId: event.target.value })}
            className={selectClass}
          >
            {allUnits ? (
              <option value="">Todas as unidades</option>
            ) : (
              <option value="">Selecione</option>
            )}
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </SurfaceNativeSelect>
        </label>
        {form.kind === 'PAYOUT' ? (
          <label className="block text-sm font-semibold">
            Médico
            <SurfaceNativeSelect
              aria-label="Beneficiário do repasse"
              value={form.physicianId}
              onChange={(event) => setForm({ ...form, physicianId: event.target.value })}
              className={selectClass}
            >
              <option value="">Regra geral para médicos</option>
              {physicians
                .filter((physician) => physician.active)
                .map((physician) => (
                  <option key={physician.id} value={physician.id}>
                    {physician.name}
                  </option>
                ))}
            </SurfaceNativeSelect>
          </label>
        ) : null}
        <Input
          label="Valor em reais (BRL)"
          value={form.amount}
          onChange={(event) => setForm({ ...form, amount: event.target.value })}
          required
          inputMode="decimal"
          pattern="(?:0|[1-9][0-9]{0,8})(?:[.,][0-9]{1,2})?"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Vigência inicial"
            type="date"
            value={form.validFrom}
            onChange={(event) => setForm({ ...form, validFrom: event.target.value })}
            required
          />
          <Input
            label="Último dia de vigência (opcional)"
            type="date"
            value={form.validTo}
            min={form.validFrom}
            onChange={(event) => setForm({ ...form, validTo: event.target.value })}
          />
        </div>
        <Input
          label="Justificativa"
          value={form.reason}
          onChange={(event) => setForm({ ...form, reason: event.target.value })}
          required
          minLength={3}
          maxLength={500}
        />
        {error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={busy}>
          {busy ? 'Salvando...' : 'Cadastrar regra'}
        </Button>
      </form>
    </Modal>
  )
}
