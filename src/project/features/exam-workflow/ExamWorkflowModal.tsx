import { Textarea as SurfaceTextarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { useAuthentication } from '../auth/auth-context'
import { hasPermission } from '../auth/auth.types'
import type { Exam } from '../exams/exam.types'
import { workspaceDocumentUrl } from '../companies/company-request-context'
import { PreparationChecklist } from './PreparationChecklist'
import { WorkflowFieldsForm } from './WorkflowFieldsForm'
import { WorkflowIssuesPanel } from './WorkflowIssuesPanel'
import { useExamWorkflow } from './use-exam-workflow'
import { workflowLabels } from './workflow.types'

export const ExamWorkflowModal = ({ exam, onClose, onDocuments }: { exam: Exam; onClose: () => void; onDocuments: () => void }) => {
  const { user } = useAuthentication(), { data, error, busy, act, refresh } = useExamWorkflow(exam.id)
  const [tab, setTab] = useState('PREPARATION'), [reason, setReason] = useState('')
  if (!user) return null
  const can = (permission: string) => hasPermission(user, permission)
  const mutable = data && !data.exam.archivedAt && !['CANCELLED','SIGNED','RESIGNED','REVIEW','REVALIDATED'].includes(data.exam.workflowState)
  return <Modal open title={`Preparação · ${exam.patientName}`} description={exam.studyDescription} size="lg" dismissible={!busy} onClose={onClose}>
    <div className="space-y-5">
      {error ? <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={busy} onClick={refresh}>Atualizar</Button>{can('attachments.view') ? <Button variant="outline" disabled={busy} onClick={onDocuments}>Documentos / complementar</Button> : null}{can('exams.viewer.open') ? <Button variant="outline" onClick={() => window.open(workspaceDocumentUrl(`/images/${exam.id}`, user.activeCompany!.id, exam.unitId), '_blank', 'noopener,noreferrer')}>Conferir imagens</Button> : null}</div>
      {!data ? <p>Carregando preparação…</p> : <>
        <div className="rounded-xl bg-muted p-3"><p className="font-bold">{workflowLabels[data.exam.workflowState]}{data.exam.archivedAt ? ' · Arquivado' : ''}</p><p className="mt-1 text-xs">{data.exam.preparedAt ? `Preparação completa: ${new Date(data.exam.preparedAt).toLocaleString('pt-BR')}` : 'Preparação opcional: não é necessária para iniciar o laudo.'}</p></div>
        <label className="block text-sm font-semibold">Motivo da ação / resolução<SurfaceTextarea className="mt-2 w-full rounded-xl border p-3 font-normal" rows={2} maxLength={500} value={reason} disabled={busy} onChange={event => setReason(event.target.value)} placeholder="Justifique a conferência, alteração ou resolução" /></label>
        <div className="flex gap-2" role="tablist" aria-label="Preparação do exame">{[['PREPARATION','Checklist'],['ISSUES','Pendências / reconvocação'],['HISTORY','Histórico']].map(([value,label]) => <button key={value} role="tab" aria-selected={tab === value} className={`rounded-lg px-3 py-2 text-sm font-bold ${tab === value ? 'bg-brand-800 text-white' : 'bg-background'}`} onClick={() => setTab(value)}>{label}</button>)}</div>
        {tab === 'PREPARATION' ? <><PreparationChecklist key={`${data.exam.workflowVersion}`} data={data} busy={busy} canPrepare={can('exams.prepare')} canExcept={can('exams.preparation.exception')} act={act} reason={reason} /><WorkflowFieldsForm key={`fields-${data.exam.workflowVersion}`} data={data} busy={busy} canFields={can('exams.fields.edit')} canPriority={can('exams.priority.edit')} act={act} reason={reason} /></> : null}
        {tab === 'ISSUES' ? <WorkflowIssuesPanel data={data} busy={busy} canManage={can('exams.issues.manage')} act={act} reason={reason} /> : null}
        {tab === 'HISTORY' ? <ol className="space-y-3">{data.history.map(item => <li key={item.id} className="rounded-xl border p-3 text-sm"><p className="font-semibold">{workflowLabels[item.from_state]} → {workflowLabels[item.to_state]}</p><p>{item.reason}</p><p className="mt-1 text-xs text-muted-foreground">{item.actor_name ?? 'Sistema'} · {item.origin === 'SYSTEM' ? 'Reavaliação automática' : 'Ação do usuário'} · {new Date(item.occurred_at).toLocaleString('pt-BR')} · versão {item.version}</p></li>)}</ol> : null}
        <div className="flex flex-wrap gap-2 border-t pt-4">
          {mutable && user.role==='DOCTOR' && (!data.exam.reportingUserId || data.exam.reportingUserId === user.id || data.exam.workflowState==='TYPED') && (['TO_PREPARE','READY','TYPED'].includes(data.exam.workflowState) || (data.exam.workflowState === 'IN_PROGRESS' && !data.exam.reportingUserId)) && can('reports.edit') ? <Button disabled={busy || Boolean(data.exam.workflowState==='TYPED' && data.exam.reportingUserId!==user.id && reason.trim().length<10)} onClick={() => void act('start', reason.trim() || 'Elaboração iniciada diretamente, com preparação opcional',data.exam.workflowState==='TYPED' && data.exam.reportingUserId!==user.id ? {takeoverReason:reason}:{} )}>Iniciar elaboração</Button> : null}
          {mutable && ['READY','IN_PROGRESS','TYPED'].includes(data.exam.workflowState) && can('exams.prepare') ? <Button variant="outline" disabled={busy} onClick={() => void act('reopen', reason)}>Reabrir preparação</Button> : null}
          {mutable && can('exams.cancel') ? <Button variant="outline" disabled={busy} onClick={() => void act('cancel', reason)}>Cancelar exame</Button> : null}
          {can('exams.archive') ? <Button variant="outline" disabled={busy || data.exam.workflowState === 'IN_PROGRESS'} onClick={() => void act(data.exam.archivedAt ? 'unarchive' : 'archive', reason)}>{data.exam.archivedAt ? 'Restaurar na fila' : 'Arquivar da fila'}</Button> : null}
        </div>
      </>}
    </div>
  </Modal>
}
