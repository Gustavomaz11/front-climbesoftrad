import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { acknowledgeWorkflowNotification, listWorkflowNotifications } from './workflow-api'
import type { WorkflowNotification } from './workflow.types'

export const WorkflowNotifications = ({ onOpen, refreshVersion }: { onOpen: (examId: string) => void; refreshVersion: number }) => {
  const [items, setItems] = useState<WorkflowNotification[]>([]), [error, setError] = useState(''), [expanded, setExpanded] = useState(false), [busy, setBusy] = useState(''), [reload, setReload] = useState(0)
  useEffect(() => {
    let active = true
    const load = () => void listWorkflowNotifications().then(value => { if (active) { setItems(value); setError('') } }).catch(() => { if (active) setError('Não foi possível consultar os avisos da unidade.') })
    load()
    const timer = window.setInterval(load, 30000)
    return () => { active = false; window.clearInterval(timer) }
  }, [refreshVersion, reload])
  const acknowledge = async (id: string) => {
    setBusy(id)
    try { await acknowledgeWorkflowNotification(id); setReload(n => n + 1) } catch { setError('Não foi possível registrar a ciência.') } finally { setBusy('') }
  }
  if (!items.length && !error) return null
  return <section className="rounded-xl border bg-white p-4">
    <button className="font-bold text-amber-800" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>Pendências da unidade: {items.length} · {items.filter(item => !item.seen_at).length} sem ciência</button>
    {error ? <p role="alert" className="mt-2 text-sm text-red-700">{error}</p> : null}
    {expanded ? <ul className="mt-3 space-y-3">{items.map(item => <li key={item.id} className="rounded-lg bg-amber-50 p-3 text-sm"><p className="font-semibold">{item.patient_name} · {item.kind === 'RECALL' ? 'Reconvocação' : 'Pendência'}</p><p>{item.reason}</p><p className="mt-1 text-xs text-slate-500">Aberta há {Math.floor(item.elapsed_seconds / 60)} min · {item.phase === 'REPORTING' ? 'Elaboração' : 'Preparação'}</p><div className="mt-2 flex gap-2"><Button variant="outline" size="sm" onClick={() => onOpen(item.exam_id)}>Acompanhar</Button>{!item.seen_at ? <Button variant="ghost" size="sm" disabled={Boolean(busy)} onClick={() => void acknowledge(item.id)}>Registrar ciência</Button> : <span className="text-xs">Ciência registrada</span>}</div></li>)}</ul> : null}
  </section>
}
