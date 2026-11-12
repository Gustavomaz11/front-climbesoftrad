import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { getWorkflowEvidence, listWorkflowResponsibles } from './workflow-api'
import type { ExamWorkflow, WorkflowEvidenceOptions } from './workflow.types'
import { WorkflowIssueResolution } from './WorkflowIssueResolution'

export const WorkflowIssuesPanel = ({ data, canManage, busy, reason, act }: {
  data: ExamWorkflow; canManage: boolean; busy: boolean; reason: string
  act: (action: string, reason: string, body?: Record<string, unknown>) => Promise<boolean>
}) => {
  const [kind, setKind] = useState('PENDING'), [category, setCategory] = useState('DOCUMENT'), [action, setAction] = useState('ACQUISITION'), [responsible, setResponsible] = useState(''), [relatedAttachment, setRelatedAttachment] = useState(''), [relatedComment, setRelatedComment] = useState(''), [resolving, setResolving] = useState('')
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]), [options, setOptions] = useState<WorkflowEvidenceOptions | null>(null), [loadError, setLoadError] = useState(false)
  const mutable = !data.exam.archivedAt && !['CANCELLED','SIGNED'].includes(data.exam.workflowState)
  useEffect(() => {
    let active = true
    void Promise.all([listWorkflowResponsibles(data.exam.unitId), getWorkflowEvidence(data.exam.id)]).then(([people, evidence]) => { if (active) { setUsers(people); setOptions(evidence); setLoadError(false) } }).catch(() => { if (active) setLoadError(true) })
    return () => { active = false }
  }, [data.exam.id, data.exam.unitId, data.exam.workflowVersion])
  return <section className="space-y-4">
    <h3 className="font-bold">Pendências e reconvocações</h3>
    <p className="text-sm text-slate-600">O responsável será notificado na fila interna. Os intervalos são registrados; a abertura não pausa automaticamente o SLA.</p>
    {loadError ? <p role="alert" className="text-sm text-red-700">Não foi possível consultar responsáveis e evidências. Atualize a preparação.</p> : null}
    {canManage && mutable ? <div className="space-y-3 rounded-xl border p-4">
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold">Solicitação<select className="mt-1 w-full rounded-lg border p-2" value={kind} disabled={busy} onChange={event => setKind(event.target.value)}><option value="PENDING">Pendência / devolução</option><option value="RECALL">Reconvocação</option></select></label>
        <label className="text-xs font-semibold">Categoria<select className="mt-1 w-full rounded-lg border p-2" value={category} disabled={busy} onChange={event => setCategory(event.target.value)}><option value="DOCUMENT">Documento</option><option value="IMAGES">Imagens</option><option value="IDENTITY">Identificação</option><option value="CLASSIFICATION">Classificação</option><option value="OTHER">Outro</option></select></label>
        <label className="text-xs font-semibold">Responsável<select className="mt-1 w-full rounded-lg border p-2" value={responsible} disabled={busy} onChange={event => setResponsible(event.target.value)}><option value="">Equipe desta unidade</option>{users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
        {kind === 'RECALL' ? <label className="text-xs font-semibold">Ação solicitada<select className="mt-1 w-full rounded-lg border p-2" value={action} disabled={busy} onChange={event => setAction(event.target.value)}><option value="ACQUISITION">Nova aquisição de imagens</option><option value="DOCUMENTS">Complementação documental</option></select></label> : null}
        <label className="text-xs font-semibold">Anexo relacionado (opcional)<select className="mt-1 w-full rounded-lg border p-2" value={relatedAttachment} onChange={event => setRelatedAttachment(event.target.value)} disabled={busy}><option value="">Nenhum</option>{options?.attachments.filter(a => a.exam_id === data.exam.id).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
        <label className="text-xs font-semibold">Comentário relacionado (opcional)<select className="mt-1 w-full rounded-lg border p-2" value={relatedComment} onChange={event => setRelatedComment(event.target.value)} disabled={busy}><option value="">Nenhum</option>{options?.comments.map(c => <option key={c.id} value={c.id}>{new Date(c.created_at).toLocaleString('pt-BR')}</option>)}</select></label>
      </div>
      <Button disabled={busy || loadError} onClick={() => void act('issues', reason, { kind, category, ...(kind === 'RECALL' ? { requestedAction: action } : {}), ...(responsible ? { responsibleUserId: responsible } : {}), attachmentIds: relatedAttachment ? [relatedAttachment] : [], commentIds: relatedComment ? [relatedComment] : [] })}>Registrar {kind === 'RECALL' ? 'reconvocação' : 'pendência / devolução'}</Button>
    </div> : null}
    {!data.issues.length ? <p className="text-sm text-slate-500">Nenhuma solicitação registrada.</p> : null}
    {data.issues.map(issue => <article key={issue.id} className="rounded-xl border p-4">
      <p className="text-sm font-bold">{issue.kind === 'RECALL' ? 'Reconvocação' : 'Pendência'} · {issue.resolved_at ? 'Resolvida' : 'Aberta'}</p>
      <p className="mt-1 text-sm">{issue.reason}</p><p className="mt-2 text-xs text-slate-500">Responsável: {issue.responsible_name ?? 'Equipe desta unidade'} · Etapa: {issue.phase === 'REPORTING' ? 'Elaboração' : 'Preparação'}</p>
      <p className="mt-1 text-xs text-slate-500">Abertura: {new Date(issue.opened_at).toLocaleString('pt-BR')}{issue.resolved_at ? ` · Resolução: ${new Date(issue.resolved_at).toLocaleString('pt-BR')}` : ''}</p>
      <p className="mt-1 text-xs text-slate-500">Intervalo registrado: {Math.floor(issue.elapsed_seconds / 60)} min · sem pausa automática de SLA</p>
      {issue.resolution_reason ? <p className="mt-2 text-sm">Resolução: {issue.resolution_reason} · {issue.resolution_study_ids.length} estudos / {issue.resolution_attachment_ids.length} documentos{issue.complement_exam_id ? ' em exame complementar vinculado' : ''}</p> : null}
      {issue.attachment_ids.length || issue.comment_ids.length ? <p className="mt-1 text-xs text-slate-500">Relacionados: {issue.attachment_ids.length} anexos / {issue.comment_ids.length} comentários</p> : null}
      {canManage && mutable && !issue.resolved_at && options ? (resolving === issue.id ? <WorkflowIssueResolution issue={issue} options={options} examId={data.exam.id} reason={reason} busy={busy} act={act} onDone={() => setResolving('')} /> : <Button className="mt-3" variant="outline" disabled={busy} onClick={() => setResolving(issue.id)}>Resolver solicitação</Button>) : null}
    </article>)}
  </section>
}
