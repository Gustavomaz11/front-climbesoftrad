import { ChevronLeft, ChevronRight, ClipboardList, LoaderCircle } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import type { Exam, ExamPriority } from '../exam.types'
import { ExamActionsMenu } from './ExamActionsMenu'
import { workflowLabels } from '../../exam-workflow/workflow.types'

interface ExamsTableProps {
  exams: Exam[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  onPageChange: (page: number) => void
  onAction: (action: string, exam: Exam) => void
  permissions: string[]
  isAdmin?: boolean
}

const priorityLabels: Record<ExamPriority, string> = {
  IMEDIATA: 'Imediata',
  PRIORITARIA: 'Prioritária',
  EMERGENCIA: 'Emergência',
  URGENTE: 'Urgente',
  ALTA: 'Alta',
  ROTINA: 'Rotina',
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  )

const calculateAge = (birthDate: string) => {
  const birth = new Date(`${birthDate}T12:00:00`)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1
  return age
}

export const ExamsTable = ({
  exams,
  total,
  page,
  pageSize,
  loading,
  onPageChange,
  onAction,
  permissions,
  isAdmin,
}: ExamsTableProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="font-bold text-slate-900">Exames realizados</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {total} {total === 1 ? 'registro encontrado' : 'registros encontrados'}
          </p>
        </div>
        {loading ? (
          <LoaderCircle
            className="animate-spin text-brand-700"
            size={20}
            aria-label="Carregando exames"
          />
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[0.68rem] font-bold tracking-[0.08em] text-slate-500 uppercase">
              <th className="px-5 py-3.5">Paciente</th>
              <th className="px-4 py-3.5">Estudo</th>
              <th className="px-4 py-3.5">Modalidade</th>
              <th className="px-4 py-3.5">Data do exame</th>
              <th className="px-4 py-3.5">Unidade</th>
              <th className="px-4 py-3.5">Prioridade</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {exams.map((exam) => (
              <tr
                key={exam.id}
                className="border-b border-slate-100 text-sm last:border-0 hover:bg-slate-50/70"
              >
                <td className="px-5 py-4">
                  <p className="font-bold text-slate-900">{exam.patientName}</p>
                  {exam.socialName && <p className="mt-1 text-xs text-slate-500">Nome social: {exam.socialName}</p>}
                  <p className="mt-1 text-xs text-slate-500">
                    {calculateAge(exam.birthDate)} anos •{' '}
                    {exam.sex === 'FEMININO' ? 'Feminino' : 'Masculino'}
                  </p>
                  {exam.patientIdentityStatus !== 'IDENTIFIED' ? (
                    <p className="mt-1 text-xs font-semibold text-amber-700">
                      Identificação em conferência
                    </p>
                  ) : null}
                </td>
                <td className="max-w-64 px-4 py-4">
                  <p className="truncate font-medium text-slate-800" title={exam.studyDescription}>
                    {exam.studyDescription}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {exam.accessionNumber || exam.orderCode || 'Sem código informado'}
                  </p>
                  {exam.normalizationStatus !== 'APPROVED' ? (
                    <p className="mt-1 text-xs font-semibold text-amber-700">
                      Tipo de exame em conferência
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-slate-500">{exam.imageStatus==='RECEIVED'?'Imagens recebidas':exam.imageStatus==='RECEIVING'?'Recebendo imagens':'Sem imagens'} · {exam.imageSeriesCount??0} séries / {exam.imageInstanceCount??0} instâncias</p>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-extrabold text-brand-700">
                    {exam.modality}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-700">
                  {formatDateTime(exam.performedAt)}
                </td>
                <td className="px-4 py-4 text-slate-600">{exam.unit}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                    {priorityLabels[exam.priority]}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <p className="mb-1 text-xs font-bold text-slate-800">{exam.reportSentAt ? 'Laudo enviado ao hospital' : exam.reportCompletionId ? 'Laudo finalizado · Aguardando envio' : workflowLabels[exam.workflowState] ?? 'A preparar'}{exam.archivedAt ? ' · Arquivado' : ''}</p>
                  {exam.reportCompletionId ? <span className="text-xs font-semibold text-emerald-700">{exam.reportSentAt ? 'Disponível no Hospital' : exam.reportHasOrigin ? 'Pronto para envio' : 'Sem hospital de origem vinculado'}</span> : exam.reportingUserName ? (
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold text-brand-700">
                      <span className="size-1.5 rounded-full bg-cyan-500" />
                      Sendo laudando por {exam.reportingUserName}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {exam.preparedAt ? 'Preparação completa' : 'Preparação opcional'}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <ExamActionsMenu
                    patientName={exam.patientName}
                    commentCount={exam.commentCount}
                    permissions={permissions}
                    isAdmin={isAdmin}
                    canSendReport={Boolean(exam.reportCompletionId && !exam.reportSentAt && exam.reportHasOrigin && !exam.archivedAt && exam.workflowState === 'TYPED')}
                    onAction={(action) => onAction(action, exam)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && exams.length === 0 ? (
        <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-500">
              <ClipboardList size={22} />
            </span>
            <p className="mt-4 font-bold text-slate-800">Nenhum exame encontrado</p>
            <p className="mt-1 text-sm text-slate-500">
              Ajuste os filtros ou adicione o primeiro exame.
            </p>
          </div>
        </div>
      ) : null}

      <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-xs text-slate-500">
        <span>
          Página {page} de {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
            leftIcon={<ChevronLeft size={16} />}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
            rightIcon={<ChevronRight size={16} />}
          >
            Próxima
          </Button>
        </div>
      </footer>
    </section>
  )
}
