import { Checkbox } from '../../../components/ui/Checkbox'
import { useAuthentication } from '../../auth/auth-context'

export const MembershipUnitsFields = ({
  allUnits,
  unitIds,
  onChange,
  disabled = false,
}: {
  allUnits: boolean
  unitIds: string[]
  onChange: (allUnits: boolean, unitIds: string[]) => void
  disabled?: boolean
}) => {
  const { user } = useAuthentication()
  const active = user?.activeCompany
  const company = user?.companies.find((item) => item.id === active?.id)
  const units =
    company?.units.filter((unit) => active?.allUnits || active?.unitIds.includes(unit.id)) ?? []
  return (
    <fieldset className="space-y-3 rounded-xl border border-border p-4" disabled={disabled}>
      <legend className="px-1 text-sm font-bold text-muted-foreground">Hospitais (unidades) de atendimento</legend>
      <Checkbox
        label="Todos os hospitais cadastrados na ClimbeSoftRad"
        checked={allUnits}
        disabled={!active?.allUnits}
        onChange={(event) => onChange(event.target.checked, [])}
      />
      {!allUnits ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {units.map((unit) => (
            <Checkbox
              key={unit.id}
              label={unit.name}
              checked={unitIds.includes(unit.id)}
              onChange={(event) =>
                onChange(
                  false,
                  event.target.checked
                    ? [...unitIds, unit.id]
                    : unitIds.filter((id) => id !== unit.id),
                )
              }
            />
          ))}
          {!units.length ? (
            <p className="text-sm text-muted-foreground">Nenhuma unidade disponível neste contexto.</p>
          ) : null}
        </div>
      ) : null}
    </fieldset>
  )
}
