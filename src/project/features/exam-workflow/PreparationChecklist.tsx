import { Input as SurfaceInput } from '@/components/ui/input'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { preparationLabels, type ExamWorkflow } from './workflow.types'

export const PreparationChecklist = ({ data, canPrepare, canExcept, busy, act, reason }: {
  data: ExamWorkflow; canPrepare: boolean; canExcept: boolean; busy: boolean; reason: string
  act: (action: string, reason: string, body?: Record<string, unknown>) => Promise<boolean>
}) => {
  const [items, setItems] = useState(data.checklist.items.map(item => ({ item: item.item, confirmed: item.confirmed, exceptionReason: item.exceptionReason ?? '' })))
  const editable = canPrepare && ['TO_PREPARE', 'PENDING', 'RECALLED'].includes(data.exam.workflowState) && !data.exam.archivedAt
  return <section className="space-y-4">
    <h3 className="font-bold">Checklist de preparação</h3>
    <p className="text-sm text-muted-foreground">Confira o conteúdo dos documentos e a completude das imagens antes de marcar os requisitos. A presença de arquivos não substitui essa conferência.</p>
    {!data.checklist.policy ? <p className="rounded-lg bg-amber-500/10 p-3 text-sm">O gestor precisa cadastrar os requisitos em Gestão → Preparação.</p> : <p className="text-xs text-muted-foreground">Regra versão {data.checklist.policy.version} · {data.checklist.policy.exam_type_id ? 'Específica do tipo de exame' : 'Padrão da unidade'}</p>}
    {data.checklist.policy && !items.length ? <p className="text-sm">A regra aprovada não exige documentos ou imagens. A liberação continuará registrada com responsável.</p> : null}
    {items.map((item, index) => <div key={item.item} className="rounded-xl border border-border p-3">
      <label className="flex items-center gap-3 text-sm font-semibold">
        <input type="checkbox" checked={item.confirmed} disabled={!editable || busy} onChange={event => setItems(items.map((value, i) => i === index ? { ...value, confirmed: event.target.checked } : value))} />{preparationLabels[item.item]}
      </label>
      <p className="mt-2 text-xs text-muted-foreground">{data.checklist.items[index].available ? 'Evidência disponível para conferência' : 'Evidência ausente, indisponível ou imagens ainda recebendo'}</p>
      {(canExcept || item.exceptionReason) ? <label className="mt-3 block text-xs font-semibold">Justificativa de exceção autorizada
        <SurfaceInput className="mt-1 w-full rounded-lg border p-2 text-sm" value={item.exceptionReason} maxLength={500} disabled={!editable || !canExcept || busy} onChange={event => setItems(items.map((value, i) => i === index ? { ...value, exceptionReason: event.target.value } : value))} />
      </label> : null}
    </div>)}
    {data.checklist.blockers.length ? <ul className="list-disc space-y-1 pl-5 text-sm text-amber-600 dark:text-amber-400">{data.checklist.blockers.map(text => <li key={text}>{text}</li>)}</ul> : null}
    {editable && data.checklist.policy ? <Button disabled={busy} onClick={() => void act('check', reason, { items: items.map(item => ({ item: item.item, confirmed: item.confirmed, ...(item.exceptionReason.trim() ? { exceptionReason: item.exceptionReason.trim() } : {}) })) })}>Salvar conferência</Button> : null}
    {canPrepare && data.exam.workflowState === 'TO_PREPARE' ? <Button disabled={busy || !data.checklist.satisfied || Boolean(data.exam.archivedAt)} onClick={() => void act('release', reason)}>Liberar para laudo</Button> : null}
  </section>
}
