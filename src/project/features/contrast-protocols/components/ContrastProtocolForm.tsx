import { Textarea as SurfaceTextarea } from '@/components/ui/textarea'
import { NativeSelect as SurfaceNativeSelect } from '@/components/ui/native-select'
import { ContrastFieldsEditor } from './ContrastFieldsEditor'
import { useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { createContrastProtocol } from '../contrast-protocol-api'
import type { ContrastField, ContrastProtocol } from '../contrast-protocol.types'
import type { ExamType } from '../../exam-catalog/exam-catalog.types'
export const ContrastProtocolForm = ({
  previous,
  types,
  units,
  allUnits,
  onClose,
  onSaved,
}: {
  previous: ContrastProtocol | null
  types: ExamType[]
  units: Array<{ id: string; name: string }>
  allUnits: boolean
  onClose: () => void
  onSaved: () => void
}) => {
  const [name, setName] = useState(previous?.name ?? ''),
    [examTypeId, setType] = useState(previous?.examTypeId ?? ''),
    [unitId, setUnit] = useState(
      previous?.unitId ?? (!allUnits && units.length === 1 ? units[0]!.id : ''),
    )
  const [template, setTemplate] = useState(previous?.template ?? ''),
    [notes, setNotes] = useState(previous?.notes ?? ''),
    [fields, setFields] = useState<ContrastField[]>(previous?.fields ?? []),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const save = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await createContrastProtocol({
        name,
        examTypeId,
        ...(unitId ? { unitId } : {}),
        template,
        notes,
        fields,
        ...(previous ? { previousId: previous.id } : {}),
      })
      onSaved()
    } catch {
      setError('Confira os campos, os marcadores no texto, o escopo e a versão mais recente.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal
      open
      title={previous ? 'Nova versão do protocolo' : 'Novo protocolo de contraste'}
      size="lg"
      dismissible={!busy}
      onClose={onClose}
    >
      <form onSubmit={(event) => void save(event)} className="space-y-4">
        <Input
          label="Nome do protocolo"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          minLength={2}
          maxLength={180}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Tipo de exame
            <SurfaceNativeSelect
              aria-label="Tipo do protocolo"
              required
              disabled={Boolean(previous)}
              value={examTypeId}
              onChange={(event) => setType(event.target.value)}
              className="mt-1 block w-full rounded-lg border p-2"
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
          <label className="text-sm font-semibold">
            Unidade
            <SurfaceNativeSelect
              aria-label="Unidade do protocolo"
              required={!allUnits}
              disabled={Boolean(previous)}
              value={unitId}
              onChange={(event) => setUnit(event.target.value)}
              className="mt-1 block w-full rounded-lg border p-2"
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
        </div>
        <ContrastFieldsEditor fields={fields} onChange={setFields} />
        <label className="block text-sm font-semibold">
          Texto do protocolo
          <SurfaceTextarea
            aria-label="Texto do protocolo"
            value={template}
            onChange={(event) => setTemplate(event.target.value)}
            required
            maxLength={10000}
            rows={6}
            className="mt-1 w-full rounded-lg border p-3"
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Use {'{{chave}}'} para cada campo e {'{{observations}}'} para as observações. O texto será
          preenchido com os valores informados.
        </p>
        <label className="block text-sm font-semibold">
          Orientações do responsável clínico
          <SurfaceTextarea
            aria-label="Orientações do protocolo"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={2000}
            rows={3}
            className="mt-1 w-full rounded-lg border p-3"
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={busy}>
          {busy ? 'Salvando...' : 'Salvar rascunho'}
        </Button>
      </form>
    </Modal>
  )
}
