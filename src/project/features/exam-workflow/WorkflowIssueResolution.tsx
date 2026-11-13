import { NativeSelect as SurfaceNativeSelect } from '@/components/ui/native-select'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import type { WorkflowEvidenceOptions, WorkflowIssue } from './workflow.types'

export const WorkflowIssueResolution = ({ issue, options, examId, reason, busy, act, onDone }: {
  issue: WorkflowIssue; options: WorkflowEvidenceOptions; examId: string; reason: string; busy: boolean; onDone: () => void
  act: (action: string, reason: string, body?: Record<string, unknown>) => Promise<boolean>
}) => {
  const [complement, setComplement] = useState(''), [studyIds, setStudies] = useState<string[]>([]), [attachmentIds, setAttachments] = useState<string[]>([])
  const [acquisitionConfirmed, setAcquisitionConfirmed] = useState(false)
  const target = complement || examId
  const toggle = (id: string, values: string[], change: (ids: string[]) => void) => change(values.includes(id) ? values.filter(value => value !== id) : [...values, id])
  return <div className="mt-3 space-y-3 rounded-xl bg-muted p-4">
    <p className="text-sm font-bold">Evidências da resolução</p>
    {issue.kind === 'RECALL' ? <p className="text-xs text-muted-foreground">{issue.requested_action === 'ACQUISITION' ? 'Selecione o estudo conferido com instâncias novas recebidas após a reconvocação.' : 'Selecione o documento novo aprovado após a reconvocação.'} A resolução retorna o exame à preparação para nova liberação.</p> : null}
    <label className="block text-xs font-semibold">Exame que recebeu a complementação<SurfaceNativeSelect value={complement} disabled={busy} className="mt-1 w-full rounded-lg border p-2" onChange={event => { setComplement(event.target.value); setStudies([]); setAttachments([]) }}>
      <option value="">Este exame</option>{options.complements.filter(e => new Date(e.created_at) > new Date(issue.opened_at)).map(e => <option key={e.id} value={e.id}>{e.name} · {new Date(e.created_at).toLocaleString('pt-BR')}</option>)}
    </SurfaceNativeSelect></label>
    <fieldset className="space-y-2"><legend className="mb-2 text-xs font-bold">Estudos conferidos</legend>{options.studies.filter(s => s.exam_id === target && s.completed_at).map(s => <label key={s.id} className="flex items-center gap-2 break-all text-xs"><input type="checkbox" disabled={busy} checked={studyIds.includes(s.id)} onChange={() => toggle(s.id, studyIds, setStudies)} />{s.name}</label>)}</fieldset>
    <fieldset className="space-y-2"><legend className="mb-2 text-xs font-bold">Documentos aprovados</legend>{options.attachments.filter(a => a.exam_id === target).map(a => <label key={a.id} className="flex items-center gap-2 text-xs"><input type="checkbox" disabled={busy} checked={attachmentIds.includes(a.id)} onChange={() => toggle(a.id, attachmentIds, setAttachments)} />{a.name} · {new Date(a.created_at).toLocaleString('pt-BR')}</label>)}</fieldset>
    {issue.requested_action === 'ACQUISITION' ? <label className="flex items-start gap-2 text-xs font-semibold"><input type="checkbox" checked={acquisitionConfirmed} disabled={busy} onChange={event => setAcquisitionConfirmed(event.target.checked)} />Conferi que as imagens selecionadas correspondem à nova aquisição solicitada. Recebimento tardio ou contagem isolada não comprova nova aquisição.</label> : null}
    <div className="flex gap-2"><Button disabled={busy || (issue.requested_action === 'ACQUISITION' && !acquisitionConfirmed)} onClick={() => { void act(`issues/${issue.id}/resolve`, reason, { studyIds, attachmentIds, ...(issue.requested_action === 'ACQUISITION' ? { acquisitionConfirmed } : {}), ...(complement ? { complementExamId: complement } : {}) }).then(done => { if (done) onDone() }) }}>Registrar resolução</Button><Button variant="ghost" disabled={busy} onClick={onDone}>Voltar</Button></div>
  </div>
}
