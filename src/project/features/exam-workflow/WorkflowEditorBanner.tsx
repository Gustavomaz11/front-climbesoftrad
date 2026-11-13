import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { workflowAction } from './workflow-api'
import type { WorkflowStatus } from './use-workflow-status'
import { workflowLabels } from './workflow.types'
import { Link } from 'react-router-dom'
import { useAuthentication } from '../auth/auth-context'
import {Textarea} from '@/components/ui/textarea'
import {forceReleaseReport} from '../reports/report-lifecycle-api'

export const WorkflowEditorBanner = ({ id, status, canStart, onChange }: { id: string; status: WorkflowStatus | null; canStart?: boolean; onChange: () => void }) => {
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const { user } = useAuthentication()
  const [reason,setReason]=useState('')
  const takeover=status?.workflowState==='TYPED' && status.reportingUserId && status.reportingUserId!==user?.id
  const locked=Boolean(status?.editingUserId && status.editingUserId!==user?.id)
  const start = async () => {
    if (!status) return
    setBusy(true); setError('')
    try { await workflowAction(id, 'start', status.workflowVersion, takeover?reason:'Elaboração iniciada no laudário pelo usuário',takeover?{takeoverReason:reason}:{}); onChange() } catch { setError('Não foi possível iniciar. Confira a justificativa, o recebimento dos arquivos e se outro painel está aberto.'); onChange() } finally { setBusy(false) }
  }
  return <aside className="report-editor-chrome flex flex-wrap items-center gap-3 border-b bg-amber-500/10 px-6 py-3 text-sm">
    <p>{status ? `Estado: ${workflowLabels[status.workflowState]}${status.archivedAt ? ' · Arquivado' : ''}` : 'Verificando situação operacional…'}</p>
    {user?.role === 'DOCTOR' && status?.reportingUserId === user.id && <Link className="font-semibold underline" to="/my-queue">Exame na Minha fila</Link>}
    {locked && <p>Laudário aberto por {status?.editingUserName??'outro médico'}. Edição exclusiva.</p>}
    {(takeover || (locked && user?.permissions.includes('reports.session.force'))) && <label className="w-full max-w-xl">Justificativa obrigatória<Textarea value={reason} onChange={e=>setReason(e.target.value)} maxLength={500} placeholder="Descreva o motivo (mínimo de 10 caracteres)" /></label>}
    {locked && user?.permissions.includes('reports.session.force') && <Button disabled={busy || status?.releaseRequested || reason.trim().length<10} variant="outline" onClick={async()=>{setBusy(true);setError('');try{await forceReleaseReport(id,reason);onChange()}catch{setError('Não foi possível solicitar o encerramento.')}finally{setBusy(false)}}}>{status?.releaseRequested?'Aguardando salvamento do médico…':'Solicitar encerramento forçado'}</Button>}
    {status && !locked && (['TO_PREPARE','READY','TYPED'].includes(status.workflowState) || (user?.role === 'DOCTOR' && status.workflowState === 'IN_PROGRESS' && !status.reportingUserId)) && !status.archivedAt && canStart ? <><Button size="sm" disabled={busy || Boolean(takeover && reason.trim().length<10)} onClick={() => void start()}>{takeover?'Assumir laudo digitado':'Iniciar elaboração'}</Button><p className="text-xs text-muted-foreground">Ao iniciar, o exame será vinculado à sua fila. Preparação opcional.</p></> : null}
    {status?.workflowState === 'CANCELLED' || status?.archivedAt ? <p className="font-semibold">Consulta histórica. Gravação indisponível.</p> : null}
    {error ? <p role="alert" className="text-red-600 dark:text-red-400">{error}</p> : null}
  </aside>
}
