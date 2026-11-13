import { Input as SurfaceInput } from '@/components/ui/input'
import { NativeSelect as SurfaceNativeSelect } from '@/components/ui/native-select'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { examPriorities } from '../exams/exam.types'
import type { ExamWorkflow } from './workflow.types'

export const WorkflowFieldsForm = ({ data, canFields, canPriority, reason, busy, act }: {
  data: ExamWorkflow; canFields: boolean; canPriority: boolean; reason: string; busy: boolean
  act: (action: string, reason: string, body?: Record<string, unknown>) => Promise<boolean>
}) => {
  const fields = { requesterName: 'Solicitante', requesterReference: 'Referência do solicitante', performingPhysician: 'Médico executante', healthInsurance: 'Convênio' } as const
  const [values, setValues] = useState(Object.fromEntries(Object.keys(fields).map(key => [key, data.exam[key as keyof typeof fields] ?? ''])))
  const [priority, setPriority] = useState(data.exam.priority)
  const editable = ['TO_PREPARE', 'PENDING', 'RECALLED'].includes(data.exam.workflowState) && !data.exam.archivedAt
  if (!editable || (!canFields && !canPriority)) return null
  return <section className="space-y-3 border-t pt-4">
    <h3 className="font-bold">Correções operacionais</h3>
    {canFields ? <><div className="grid gap-3 sm:grid-cols-2">{Object.entries(fields).map(([key, label]) => <label key={key} className="text-xs font-semibold">{label}<SurfaceInput className="mt-1 w-full rounded-lg border p-2 text-sm" value={values[key]} maxLength={key === 'requesterReference' ? 140 : key === 'healthInsurance' ? 100 : 120} disabled={busy} onChange={event => setValues({ ...values, [key]: event.target.value })} /></label>)}</div><Button variant="outline" disabled={busy} onClick={() => void act('fields', reason, values)}>Salvar campos</Button></> : null}
    {canPriority ? <div className="flex flex-wrap items-end gap-3"><label className="text-xs font-semibold">Prioridade<SurfaceNativeSelect className="ml-2 rounded-lg border p-2" value={priority} disabled={busy} onChange={event => setPriority(event.target.value as typeof priority)}>{examPriorities.map(value => <option key={value}>{value}</option>)}</SurfaceNativeSelect></label><Button variant="outline" disabled={busy || priority === data.exam.priority} onClick={() => void act('priority', reason, { priority })}>Alterar prioridade</Button></div> : null}
  </section>
}
