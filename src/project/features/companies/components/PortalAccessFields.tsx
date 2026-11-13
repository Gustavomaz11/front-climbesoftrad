import { Checkbox } from '../../../components/ui/Checkbox'
import { portalKinds, portalNames, type PortalKind } from '../../auth/portal-access'

export const PortalAccessFields = ({ value, onChange, disabled = false }: {
  value: PortalKind[]; onChange: (value: PortalKind[]) => void; disabled?: boolean
}) => <fieldset className="space-y-3 rounded-xl border border-border p-4" disabled={disabled}>
  <legend className="px-1 text-sm font-bold text-muted-foreground">Portais autorizados *</legend>
  <p className="text-xs text-muted-foreground">Selecione onde esta pessoa poderá entrar. As ações continuam dependendo do cargo e das unidades autorizadas.</p>
  {portalKinds.map(portal => <Checkbox key={portal} label={portalNames[portal]} checked={value.includes(portal)}
    onChange={event => onChange(event.target.checked ? [...value, portal] : value.filter(p => p !== portal))} />)}
</fieldset>
