import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type { ContrastField } from '../contrast-protocol.types'
export const ContrastFieldsEditor = ({
  fields,
  onChange,
}: {
  fields: ContrastField[]
  onChange: (fields: ContrastField[]) => void
}) => {
  const update = (index: number, data: Partial<ContrastField>) =>
    onChange(fields.map((field, i) => (i === index ? { ...field, ...data } : field)))
  return (
    <div className="space-y-3">
      <h3 className="font-bold">Campos de preenchimento</h3>
      {fields.map((field, index) => (
        <div key={index} className="grid gap-2 rounded-xl border bg-slate-50 p-3 sm:grid-cols-2">
          <Input
            label="Chave do campo"
            value={field.key}
            onChange={(event) => update(index, { key: event.target.value })}
            required
            pattern="[a-zA-Z][a-zA-Z0-9_]{0,29}"
          />
          <Input
            label="Nome exibido"
            value={field.label}
            onChange={(event) => update(index, { label: event.target.value })}
            required
            maxLength={120}
          />
          <label className="text-sm">
            Tipo
            <select
              aria-label={`Tipo do campo ${index + 1}`}
              value={field.kind}
              onChange={(event) =>
                update(index, { kind: event.target.value as ContrastField['kind'] })
              }
              className="ml-2 rounded-lg border p-2"
            >
              <option value="TEXT">Texto</option>
              <option value="NUMBER">Número informado</option>
            </select>
          </label>
          <Input
            label="Unidade de medida"
            value={field.unit}
            onChange={(event) => update(index, { unit: event.target.value })}
            maxLength={30}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(event) => update(index, { required: event.target.checked })}
            />
            Obrigatório
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(fields.filter((_field, i) => i !== index))}
          >
            Remover campo
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        disabled={fields.length >= 30}
        onClick={() =>
          onChange([...fields, { key: '', label: '', kind: 'TEXT', unit: '', required: true }])
        }
      >
        Adicionar campo
      </Button>
    </div>
  )
}
