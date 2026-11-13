import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ExamsTable } from './ExamsTable'
import type { Exam } from '../exam.types'

const renderPatientCell = (socialName: string | null) => {
  const exam = {
    id: 'synthetic-exam', patientName: 'Nome Completo de Teste', socialName,
    birthDate: '1980-01-01', sex: 'FEMININO', studyDescription: 'Estudo de teste',
    modality: 'CT', unit: 'Hospital de teste', priority: 'ROTINA',
    performedAt: '2026-11-11T12:00:00Z', workflowState: 'TO_PREPARE', commentCount: 0,
  } as Exam
  const html = renderToStaticMarkup(<ExamsTable exams={[exam]} total={1} page={1} pageSize={10} loading={false} onPageChange={() => {}} onAction={() => {}} permissions={[]} />)
  const cell = html.match(/<tbody[^>]*>[\s\S]*?<tr[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/)?.[1] ?? ''
  return { primary: cell.match(/<p[^>]*>(.*?)<\/p>/)?.[1], text: cell.replace(/<[^>]+>/g, '') }
}

describe('Patient identification in the ClimbeSoftRad queue', () => {
  it('keeps the full name primary and labels the social name separately', () => {
    const cell = renderPatientCell('Nome Social de Teste')
    expect(cell.primary).toBe('Nome Completo de Teste')
    expect(cell.text).toContain('Nome social: Nome Social de Teste')
  })
  it('keeps the full name when no social name is supplied', () => {
    const cell = renderPatientCell(null)
    expect(cell.primary).toBe('Nome Completo de Teste')
    expect(cell.text).not.toContain('Nome social:')
  })
})
