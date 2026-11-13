import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { PreparationChecklist } from './PreparationChecklist'
import type { ExamWorkflow } from './workflow.types'
import { ExamsTable } from '../exams/components/ExamsTable'

const workflow = (changes: Partial<ExamWorkflow['exam']> = {}): ExamWorkflow => ({
  exam: { id: 'exam', workflowState: 'TO_PREPARE', workflowVersion: 1, archivedAt: null, ...changes } as ExamWorkflow['exam'],
  checklist: { policy: { id: 'rule', version: 1, active: true, unit_id: 'unit', exam_type_id: null, required_items: ['ORDER'], reason: 'Regra' }, satisfied: false, blockers: ['Confira o pedido.'], items: [{ item: 'ORDER', confirmed: false, available: false, evidenceIds: [], exceptionReason: null, checkedAt: null, checkedByUserId: null }] },
  history: [], issues: [],
})
const render = (data = workflow(), canPrepare = true, canExcept = false) => renderToStaticMarkup(<PreparationChecklist data={data} canPrepare={canPrepare} canExcept={canExcept} busy={false} reason="Conferência" act={() => Promise.resolve(true)} />)

describe('Preparation controls', () => {
  it('shows missing evidence and keeps release disabled until requirements are satisfied', () => {
    const html = render()
    expect(html).toContain('Evidência ausente')
    expect(html).toMatch(/disabled=""[^>]*>Liberar para laudo/)
    const ready = workflow(); ready.checklist.satisfied = true
    expect(render(ready)).not.toMatch(/disabled=""[^>]*>Liberar para laudo/)
  })
  it('only offers exceptions and writes to authorized operational users', () => {
    expect(render()).not.toContain('Justificativa de exceção autorizada')
    expect(render(workflow(), true, true)).toContain('Justificativa de exceção autorizada')
    expect(render(workflow(), false)).not.toContain('Salvar conferência')
    expect(render(workflow({ workflowState: 'CANCELLED' }))).not.toContain('Salvar conferência')
    expect(render(workflow({ archivedAt: '2026-10-14T12:00:00Z' }))).not.toContain('Salvar conferência')
  })
  it('renders the persisted state independently from an editor presence', () => {
    const exam = { ...workflow({ workflowState: 'PENDING' }).exam, patientName: 'Paciente sintético', birthDate: '1990-01-01', sex: 'FEMININO', performedAt: '2026-10-14T12:00:00Z', modality: 'CT', priority: 'ROTINA', commentCount: 0, reportingUserName: 'Médica sintética' } as ExamWorkflow['exam']
    const html = renderToStaticMarkup(<ExamsTable exams={[exam]} total={1} page={1} pageSize={10} loading={false} onPageChange={() => {}} onAction={() => {}} permissions={[]} />)
    expect(html).toContain('Pendente')
    expect(html).toContain('Médica sintética')
  })
})
