import { PageHeading } from '@/portal/PageHeading'
import { StatCard } from '@/portal/StatCard'
import { Clock3, Send } from 'lucide-react'

import { workspaceDocumentUrl } from '../companies/company-request-context'
import { ExamWorkflowModal } from '../exam-workflow/ExamWorkflowModal'
import { WorkflowNotifications } from '../exam-workflow/WorkflowNotifications'
import { getExamWorkflow } from '../exam-workflow/workflow-api'
import { FileCheck2, FilePlus2, Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { hasPermission, type AuthenticatedUser } from '../auth/auth.types'
import { ExamCommentsModal } from '../comments/components/ExamCommentsModal'
import { ExamAttachmentsModal } from '../attachments/components/ExamAttachmentsModal'
import { listExams } from './exams-api'
import type { Exam, ExamFiltersValue } from './exam.types'

import { CreateExamModal } from './components/CreateExamModal'

import { ExamFilters } from './components/ExamFilters'
import { ExamsTable } from './components/ExamsTable'
import { SendReportModal } from '../reports/SendReportModal'

interface ExamsDashboardProps {
  user: AuthenticatedUser
  onLogout: () => void
}

const pageSize = 10
const initialFilters: ExamFiltersValue = { examDate: '', patientName: '' }

export const ExamsDashboard = ({ user }: ExamsDashboardProps) => {

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [filters, setFilters] = useState<ExamFiltersValue>(initialFilters)
  const [exams, setExams] = useState<Exam[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [notification, setNotification] = useState<string | null>(null)
  const [commentExam, setCommentExam] = useState<Exam | null>(null)
  const [attachmentExam, setAttachmentExam] = useState<Exam | null>(null)
  const [workflowExam, setWorkflowExam] = useState<Exam | null>(null)
  const [deliveryExam, setDeliveryExam] = useState<Exam | null>(null)
  const { examDate, patientName, periodDays, workflowState, queue } = filters

  useEffect(() => {
    let active = true
    let requestVersion = 0
    const load = (showLoading: boolean) => {
      const currentRequest = ++requestVersion
      if (showLoading) {
        setLoading(true)
        setLoadError(false)
      }

      void listExams({ examDate, patientName, periodDays, workflowState, queue, page, pageSize })
        .then((result) => {
          if (!active || currentRequest !== requestVersion) return
          setExams(result.items)
          setTotal(result.total)
          setLoadError(false)
        })
        .catch(() => {
          if (active && currentRequest === requestVersion) setLoadError(true)
        })
        .finally(() => {
          if (active && currentRequest === requestVersion) setLoading(false)
        })
    }

    const timeout = window.setTimeout(
      () => {
        load(true)
      },
      patientName ? 320 : 0,
    )
    const presencePolling = window.setInterval(() => load(false), 5_000)
    const refreshOnReturn = () => {
      if (document.visibilityState === 'visible') load(false)
    }
    window.addEventListener('focus', refreshOnReturn)
    document.addEventListener('visibilitychange', refreshOnReturn)

    return () => {
      active = false
      window.clearTimeout(timeout)
      window.clearInterval(presencePolling)
      window.removeEventListener('focus', refreshOnReturn)
      document.removeEventListener('visibilitychange', refreshOnReturn)
    }
  }, [examDate, patientName, periodDays, workflowState, queue, page, reloadVersion])

  useEffect(() => {
    if (!notification) return
    const timeout = window.setTimeout(() => setNotification(null), 3500)
    return () => window.clearTimeout(timeout)
  }, [notification])

  const changeFilters = (nextFilters: ExamFiltersValue) => {
    setPage(1)
    setFilters(nextFilters)
  }

  const handleExamAction = (action: string, exam: Exam) => {
    if (action === 'Preparação e andamento') { setWorkflowExam(exam); return }
    if(action==='Abrir no visualizador padrão') {
      window.open(workspaceDocumentUrl(`/viewer/${exam.id}`,user.activeCompany!.id,exam.unitId),'_blank','noopener,noreferrer')
      return
    }
    if (action === 'Anexar arquivos' || action === 'Documentos do exame') {
      setAttachmentExam(exam)
      return
    }
    if (action === 'Enviar laudo ao hospital') { setDeliveryExam(exam); return }
    if (action === 'Abrir laudário') {
      window.open(
        workspaceDocumentUrl(`/reports/${exam.id}`, user.activeCompany!.id, exam.unitId),
        '_blank',
        'noopener,noreferrer',
      )
      return
    }

    if (action === 'Prescrição Médica') {
      window.open(
        workspaceDocumentUrl(`/prescriptions/${exam.id}`, user.activeCompany!.id, exam.unitId),
        '_blank',
        'noopener,noreferrer',
      )
      return
    }

    if (action === 'Inserir comentário') {
      setCommentExam(exam)
      return
    }

    setNotification(`${action}: ${exam.patientName} selecionado.`)
  }

  const updateCommentCount = useCallback((examId: string, commentCount: number) => {
    setExams((current) =>
      current.map((exam) => (exam.id === examId ? { ...exam, commentCount } : exam)),
    )
  }, [])

  return (
    <div className="contents">

      <div className="min-w-0 flex-1">


        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <PageHeading eyebrow="Central de laudos" title="Fila de exames" description="Consulte os estudos recebidos, elabore os laudos e encaminhe os resultados aos hospitais." actions={hasPermission(user,'exams.create') ? <Button onClick={() => setCreateModalOpen(true)} leftIcon={<Plus size={16} />}>Adicionar exame</Button> : undefined} />
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Exames encontrados" value={total} icon={FilePlus2} loading={loading} hint="Conforme os filtros selecionados" />
            <StatCard label="Em elaboração" value={exams.filter(exam => exam.workflowState === 'IN_PROGRESS').length} icon={Clock3} tone="blue" loading={loading} hint="Exames desta página" />
            <StatCard label="Laudos finalizados" value={exams.filter(exam => exam.reportCompletionId).length} icon={FileCheck2} tone="violet" loading={loading} hint="Exames desta página" />
            <StatCard label="Aguardando envio" value={exams.filter(exam => exam.reportCompletionId && !exam.reportSentAt && exam.reportHasOrigin && !exam.archivedAt && exam.workflowState === 'TYPED').length} icon={Send} tone="amber" loading={loading} hint="Exames desta página" />
          </div>

          <div className="space-y-4">
            <WorkflowNotifications refreshVersion={reloadVersion} onOpen={id => { void getExamWorkflow(id).then(data => setWorkflowExam(data.exam)).catch(() => setNotification('Não foi possível abrir a preparação.')) }} />
            <ExamFilters value={filters} onChange={changeFilters} />
            {loadError ? (
              <Alert variant="error" className="items-center">
                <span className="flex-1">Não foi possível carregar os exames.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReloadVersion((value) => value + 1)}
                  leftIcon={<RefreshCw size={15} />}
                >
                  Tentar novamente
                </Button>
              </Alert>
            ) : null}
            <ExamsTable
              exams={exams}
              total={total}
              page={page}
              pageSize={pageSize}
              loading={loading}
              permissions={user.permissions}
              isAdmin={user.role === 'ADMIN'}
              onPageChange={setPage}
              onAction={handleExamAction}
            />
          </div>
        </main>
      </div>

      {deliveryExam && <SendReportModal exam={deliveryExam} onClose={() => setDeliveryExam(null)} onDone={() => { setDeliveryExam(null); setNotification('Laudo enviado ao hospital de origem.'); setReloadVersion(value => value + 1) }} />}
      <CreateExamModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => {
          setPage(1)
          setFilters(initialFilters)
          setReloadVersion((value) => value + 1)
          setNotification('Exame cadastrado com sucesso.')
        }}
      />

      <ExamCommentsModal
        key={commentExam?.id ?? 'comments-closed'}
        exam={commentExam}
        onClose={() => setCommentExam(null)}
        onCountChange={updateCommentCount}
      />

      <ExamAttachmentsModal key={attachmentExam?.id ?? 'attachments-closed'} exam={attachmentExam} onClose={() => setAttachmentExam(null)} />
      {workflowExam ? <ExamWorkflowModal key={workflowExam.id} exam={workflowExam} onClose={() => { setWorkflowExam(null); setReloadVersion(n => n + 1) }} onDocuments={() => { setAttachmentExam(workflowExam); setWorkflowExam(null); setReloadVersion(n => n + 1) }} /> : null}

      {notification ? (
        <div
          role="status"
          className="fixed right-4 bottom-4 z-[60] max-w-sm rounded-xl bg-popover px-4 py-3 text-sm font-semibold text-white shadow-xl"
        >
          {notification}
        </div>
      ) : null}
    </div>
  )
}
