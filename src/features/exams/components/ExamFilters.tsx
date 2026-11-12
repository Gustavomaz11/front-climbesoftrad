import { CalendarDays, Search, X } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import type { ExamFiltersValue, ExamPeriod } from '../exam.types'
import { workflowLabels, type WorkflowState } from '../../exam-workflow/workflow.types'

interface ExamFiltersProps {
  value: ExamFiltersValue
  onChange: (value: ExamFiltersValue) => void
}

const periods: ExamPeriod[] = [7, 15, 30]

export const ExamFilters = ({ value, onChange }: ExamFiltersProps) => {
  const hasFilters = Boolean(value.periodDays || value.examDate || value.patientName || value.workflowState || value.queue)

  return (
    <section aria-label="Filtros de exames" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
        <label className="text-xs font-bold text-slate-600">Fila<select className="mt-2 block h-11 rounded-xl border p-2 text-sm" value={value.queue ?? 'ACTIVE'} onChange={event => onChange({ ...value, queue: event.target.value as ExamFiltersValue['queue'] })}><option value="ACTIVE">Exames ativos</option><option value="PREPARATION">Preparação / pendências</option><option value="HISTORY">Histórico / cancelados</option><option value="ARCHIVED">Arquivados</option><option value="ALL">Todos</option></select></label>
        <label className="text-xs font-bold text-slate-600">Estado<select className="mt-2 block h-11 rounded-xl border p-2 text-sm" value={value.workflowState ?? ''} onChange={event => onChange({ ...value, workflowState: event.target.value ? event.target.value as WorkflowState : undefined })}><option value="">Todos os estados</option>{Object.entries(workflowLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <div className="min-w-0 flex-1">
          <label htmlFor="patient-search" className="mb-2 block text-xs font-bold text-slate-600">Nome do paciente</label>
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
            <input
              id="patient-search"
              value={value.patientName}
              onChange={(event) => onChange({ ...value, patientName: event.target.value })}
              placeholder="Buscar paciente..."
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pr-4 pl-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-3 focus:ring-cyan-100"
            />
          </div>
        </div>
        <div className="sm:w-52">
          <label htmlFor="exam-date" className="mb-2 block text-xs font-bold text-slate-600">Data exata do exame</label>
          <div className="relative">
            <CalendarDays size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
            <input
              id="exam-date"
              type="date"
              value={value.examDate}
              onChange={(event) => onChange({ ...value, examDate: event.target.value, periodDays: undefined })}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pr-3 pl-10 text-sm outline-none focus:border-brand-600 focus:ring-3 focus:ring-cyan-100"
            />
          </div>
        </div>
        <div>
          <span className="mb-2 block text-xs font-bold text-slate-600">Período</span>
          <div className="flex gap-2">
            {periods.map((period) => (
              <button
                key={period}
                type="button"
                aria-pressed={value.periodDays === period}
                onClick={() => onChange({ ...value, periodDays: value.periodDays === period ? undefined : period, examDate: '' })}
                className={`h-11 rounded-xl border px-3 text-xs font-bold transition ${value.periodDays === period ? 'border-brand-800 bg-brand-800 text-white' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-brand-200 hover:bg-brand-50'}`}
              >
                {period} dias
              </button>
            ))}
          </div>
        </div>
        {hasFilters ? (
          <Button variant="ghost" size="md" onClick={() => onChange({ examDate: '', patientName: '' })} leftIcon={<X size={16} />}>
            Limpar
          </Button>
        ) : null}
      </div>
    </section>
  )
}
