import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { workflowPost } from './workflow-api'
import { preparationLabels, type PreparationItem, type PreparationPolicy } from './workflow.types'

export const PreparationPolicyForm = ({ unitId, examTypeId, policy, onSaved }: { unitId: string; examTypeId: string; policy: PreparationPolicy | undefined; onSaved: () => void }) => {
  const [items, setItems] = useState<PreparationItem[]>(policy?.required_items ?? ['ORDER', 'IMAGES']), [reason, setReason] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const save = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      await workflowPost('/preparation-policies', { unitId, ...(examTypeId ? { examTypeId } : {}), expectedVersion: policy?.version ?? 0, requiredItems: items, reason: reason.trim() })
      onSaved()
    } catch { setError('Não foi possível salvar. Confira a justificativa e atualize a regra antes de tentar novamente.') }
    finally { setBusy(false) }
  }
  return <form onSubmit={event => void save(event)} className="space-y-4 rounded-xl border bg-white p-5">
    <p className="text-sm font-bold">{policy ? `Revisar regra versão ${policy.version}` : 'Cadastrar requisitos de preparação'}</p>
    <p className="text-sm text-slate-600">Uma nova versão exige nova conferência dos exames afetados. A seleção precisa ser aprovada pela equipe responsável pela unidade.</p>
    {(Object.keys(preparationLabels) as PreparationItem[]).map(item => <label key={item} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={items.includes(item)} disabled={busy} onChange={event => setItems(event.target.checked ? [...items, item] : items.filter(value => value !== item))} />{preparationLabels[item]}</label>)}
    {!items.length ? <p className="text-sm text-amber-800">Esta regra dispensará documentos e imagens. Registre a justificativa dessa decisão.</p> : null}
    <label className="block text-sm font-semibold">Justificativa<input className="mt-2 w-full rounded-lg border p-3" value={reason} minLength={3} maxLength={500} required disabled={busy} onChange={event => setReason(event.target.value)} /></label>
    {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    <Button type="submit" disabled={busy || reason.trim().length < 3}>{busy ? 'Salvando…' : 'Salvar nova versão'}</Button>
  </form>
}
