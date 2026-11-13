import { Table as SurfaceTable, TableHeader as SurfaceTableHeader, TableRow as SurfaceTableRow, TableHead as SurfaceTableHead, TableBody as SurfaceTableBody, TableCell as SurfaceTableCell } from '@/components/ui/table'
import { Card as SurfaceCard } from '@/components/ui/card'
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
    <SurfaceCard className="overflow-visible rounded-2xl border border-border bg-card shadow-sm gap-0 py-0 ring-0">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="font-bold text-foreground">Exames realizados</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
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
        <SurfaceTable className="w-full min-w-[920px] border-collapse text-left">
          <SurfaceTableHeader>
            <SurfaceTableRow className="border-b border-border bg-muted/80 text-[0.68rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
              <SurfaceTableHead className="px-5 py-3.5">Paciente</SurfaceTableHead>
              <SurfaceTableHead className="px-4 py-3.5">Estudo</SurfaceTableHead>
              <SurfaceTableHead className="px-4 py-3.5">Modalidade</SurfaceTableHead>
              <SurfaceTableHead className="px-4 py-3.5">Data do exame</SurfaceTableHead>
              <SurfaceTableHead className="px-4 py-3.5">Unidade</SurfaceTableHead>
              <SurfaceTableHead className="px-4 py-3.5">Prioridade</SurfaceTableHead>
              <SurfaceTableHead className="px-4 py-3.5">Status</SurfaceTableHead>
              <SurfaceTableHead className="px-5 py-3.5 text-right">Ações</SurfaceTableHead>
            </SurfaceTableRow>
          </SurfaceTableHeader>
          <SurfaceTableBody className={loading ? 'opacity-50' : ''}>
            {exams.map((exam) => (
              <SurfaceTableRow
                key={exam.id}
                className="border-b border-border text-sm last:border-0 hover:bg-muted/70"
              >
                <SurfaceTableCell className="px-5 py-4">
                  <p className="font-bold text-foreground">{exam.patientName}</p>
                  {exam.socialName && <p className="mt-1 text-xs text-muted-foreground">Nome social: {exam.socialName}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {calculateAge(exam.birthDate)} anos •{' '}
                    {exam.sex === 'FEMININO' ? 'Feminino' : 'Masculino'}
                  </p>
                  {exam.patientIdentityStatus !== 'IDENTIFIED' ? (
                    <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Identificação em conferência
                    </p>
                  ) : null}
                </SurfaceTableCell>
                <SurfaceTableCell className="max-w-64 px-4 py-4">
                  <p className="truncate font-medium text-foreground" title={exam.studyDescription}>
                    {exam.studyDescription}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {exam.accessionNumber || exam.orderCode || 'Sem código informado'}
                  </p>
                  {exam.normalizationStatus !== 'APPROVED' ? (
                    <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Tipo de exame em conferência
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">{exam.imageStatus==='RECEIVED'?'Imagens recebidas':exam.imageStatus==='RECEIVING'?'Recebendo imagens':'Sem imagens'} · {exam.imageSeriesCount??0} séries / {exam.imageInstanceCount??0} instâncias</p>
                </SurfaceTableCell>
                <SurfaceTableCell className="px-4 py-4">
                  <span className="inline-flex rounded-lg bg-muted px-2.5 py-1 text-xs font-extrabold text-brand-700">
                    {exam.modality}
                  </span>
                </SurfaceTableCell>
                <SurfaceTableCell className="whitespace-nowrap px-4 py-4 font-medium text-muted-foreground">
                  {formatDateTime(exam.performedAt)}
                </SurfaceTableCell>
                <SurfaceTableCell className="px-4 py-4 text-muted-foreground">{exam.unit}</SurfaceTableCell>
                <SurfaceTableCell className="px-4 py-4">
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                    {priorityLabels[exam.priority]}
                  </span>
                </SurfaceTableCell>
                <SurfaceTableCell className="px-4 py-4">
                  <p className="mb-1 text-xs font-bold text-foreground">{exam.workflowState==='RECALLED' ? exam.recallPurpose==='COMPLEMENT'?'Reconvocar para Complementar':'Reconvocar para Corrigir' : workflowLabels[exam.workflowState] ?? 'A preparar'}{exam.archivedAt ? ' · Arquivado' : ''}</p>
                  {exam.reportCompletionId && ['SIGNED','RESIGNED','REVALIDATED'].includes(exam.workflowState) ? <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{exam.reportSentAt ? 'Disponível no Hospital' : exam.reportHasOrigin ? 'Pronto para envio' : 'Sem hospital de origem vinculado'}</span> : exam.reportingUserName ? (
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold text-brand-700">
                      <span className="size-1.5 rounded-full bg-muted0" />
                      Responsável: {exam.reportingUserName}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {exam.preparedAt ? 'Preparação completa' : 'Preparação opcional'}
                    </span>
                  )}
                </SurfaceTableCell>
                <SurfaceTableCell className="px-5 py-4">
                  <ExamActionsMenu
                    patientName={exam.patientName}
                    commentCount={exam.commentCount}
                    permissions={permissions}
                    isAdmin={isAdmin}
                    canSendReport={Boolean(exam.reportCompletionId && !exam.reportSentAt && exam.reportHasOrigin && !exam.archivedAt && ['SIGNED','RESIGNED','REVALIDATED'].includes(exam.workflowState))}
                    onAction={(action) => onAction(action, exam)}
                  />
                </SurfaceTableCell>
              </SurfaceTableRow>
            ))}
          </SurfaceTableBody>
        </SurfaceTable>
      </div>

      {!loading && exams.length === 0 ? (
        <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-background text-muted-foreground">
              <ClipboardList size={22} />
            </span>
            <p className="mt-4 font-bold text-foreground">Nenhum exame encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ajuste os filtros ou adicione o primeiro exame.
            </p>
          </div>
        </div>
      ) : null}

      <footer className="flex items-center justify-between border-t border-border px-5 py-4 text-xs text-muted-foreground">
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
    </SurfaceCard>
  )
}
