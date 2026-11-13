import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { workflowAction } from './workflow-api'
import type { WorkflowStatus } from './use-workflow-status'
import { workflowLabels } from './workflow.types'
import { Link } from 'react-router-dom'
import { useAuthentication } from '../auth/auth-context'

export const WorkflowEditorBanner = ({ id, status, canStart, onChange }: { id: string; status: WorkflowStatus | null; canStart?: boolean; onChange: () => void }) => {
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const { user } = useAuthentication()
  const start = async () => {
    if (!status) return
    setBusy(true); setError('')
    try { await workflowAction(id, 'start', status.workflowVersion, 'Elaboração iniciada no laudário pelo usuário'); onChange() } catch { setError('Não foi possível iniciar. Confira o recebimento dos arquivos e seu acesso, e atualize o exame.'); onChange() } finally { setBusy(false) }
  }
  return <aside className="report-editor-chrome flex flex-wrap items-center gap-3 border-b bg-amber-500/10 px-6 py-3 text-sm">
    <p>{status ? `Estado: ${workflowLabels[status.workflowState]}${status.archivedAt ? ' · Arquivado' : ''}` : 'Verificando situação operacional…'}</p>
    {user?.role === 'DOCTOR' && status?.reportingUserId === user.id && <Link className="font-semibold underline" to="/my-queue">Exame na Minha fila</Link>}
    {status && (['TO_PREPARE', 'READY'].includes(status.workflowState) || (user?.role === 'DOCTOR' && status.workflowState === 'IN_PROGRESS' && !status.reportingUserId)) && !status.archivedAt && canStart ? <><Button size="sm" disabled={busy} onClick={() => void start()}>Iniciar elaboração</Button><p className="text-xs text-muted-foreground">Ao iniciar, o exame será vinculado à sua fila. Preparação opcional.</p></> : null}
    {status?.workflowState === 'CANCELLED' || status?.archivedAt ? <p className="font-semibold">Consulta histórica. Gravação indisponível.</p> : null}
    {error ? <p role="alert" className="text-red-600 dark:text-red-400">{error}</p> : null}
  </aside>
}
