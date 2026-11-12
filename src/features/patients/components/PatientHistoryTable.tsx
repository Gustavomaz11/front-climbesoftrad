import { useState } from 'react'
import { ExamAttachmentsModal } from '../../attachments/components/ExamAttachmentsModal'
import { useAuthentication } from '../../auth/auth-context'
import { hasPermission } from '../../auth/auth.types'
import { workspaceDocumentUrl } from '../../companies/company-request-context'
import { Button } from '../../../components/ui/Button'
import { examAvailability } from '../patients-api'
import type { PatientExam, ExamAvailability } from '../patient.types'
const availabilityLabels: Record<string, string> = {
  AVAILABLE: 'Arquivos disponíveis',
  NOT_AUTHORIZED: 'Sem autorização',
  RECOVERY_REQUIRED: 'Arquivo inválido; requer recuperação',
  DRAFT_AVAILABLE: 'Documento em edição disponível',
  SIGNED_VISUAL_AVAILABLE: 'Prescrição com identificação do médico disponível',
  UNAVAILABLE: 'Arquivo indisponível',
  NOT_INDEXED: 'Imagens ainda indisponíveis no histórico',
  NOT_IMPLEMENTED: 'Publicação final ainda indisponível',
}
export const PatientHistoryTable = ({
  items,
  onLink,
  currentExamId,
  currentUnitId,
}: {
  items: PatientExam[]
  onLink?: (exam: PatientExam) => void
  currentExamId?: string
  currentUnitId?: string
}) => {
  const { user } = useAuthentication()
  const [documentExam, setDocumentExam] = useState<PatientExam | null>(null)
  const [availability, setAvailability] = useState<Record<string, ExamAvailability>>({}),
    [error, setError] = useState('')
  const verify = async (exam: PatientExam) => {
    setError('')
    try {
      const result = await examAvailability(exam.patientId, exam.id)
      setAvailability((values) => ({ ...values, [exam.id]: result }))
    } catch {
      setError('Não foi possível conferir os arquivos disponíveis.')
    }
  }
  const open = (exam: PatientExam, kind: 'reports' | 'prescriptions') => {
    if (user?.activeCompany)
      window.open(
        workspaceDocumentUrl('/' + kind + '/' + exam.id, user.activeCompany.id, exam.unitId),
        '_blank',
        'noopener,noreferrer',
      )
  }
  return (
    <div className="space-y-3">
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {items.map((exam) => (
        <article key={exam.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">
                {exam.studyDescription}
                {exam.id === currentExamId ? (
                  <span className="ml-2 text-xs font-normal text-brand-700">Exame atual</span>
                ) : null}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {new Date(exam.performedAt).toLocaleString('pt-BR')} · {exam.modality} · {exam.unit}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Paciente recebido: {exam.patientName} · Identificação:{' '}
                {exam.patientIdentityStatus === 'IDENTIFIED'
                  ? 'por cadastro/origem'
                  : 'aguarda conferência'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {user&&hasPermission(user,'exams.viewer.open')?<Button variant="outline" size="sm" onClick={()=>window.open(workspaceDocumentUrl('/images/'+(currentExamId??exam.id),user.activeCompany!.id,currentUnitId??exam.unitId)+(currentExamId?'&previousExamId='+exam.id:''),'_blank','noopener,noreferrer')}>{currentExamId?'Comparar imagens':'Imagens do exame'}</Button>:null}
              {user && hasPermission(user, 'attachments.view') ? <Button variant="outline" size="sm" onClick={() => setDocumentExam(exam)}>Documentos do exame</Button> : null}
              {user && hasPermission(user, 'reports.view') ? (
                <Button variant="outline" size="sm" onClick={() => open(exam, 'reports')}>
                  Abrir laudário
                </Button>
              ) : null}
              {user && hasPermission(user, 'prescriptions.view') ? (
                <Button variant="outline" size="sm" onClick={() => open(exam, 'prescriptions')}>
                  Prescrição
                </Button>
              ) : null}
              <Button variant="ghost" size="sm" onClick={() => void verify(exam)}>
                Verificar arquivos
              </Button>
              {onLink && exam.id !== currentExamId ? (
                <Button size="sm" onClick={() => onLink(exam)}>
                  Usar como comparativo
                </Button>
              ) : null}
            </div>
          </div>
          {availability[exam.id] ? (
            <ul className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
              <li>Laudo: {availabilityLabels[availability[exam.id].report]}</li>
              <li>Prescrição: {availabilityLabels[availability[exam.id].prescription]}</li>
              <li>{availabilityLabels[availability[exam.id].images]}</li>
              <li>{availabilityLabels[availability[exam.id].publishedReport]}</li>
              <li>Anexos: {availabilityLabels[availability[exam.id].attachments]} ({availability[exam.id].attachmentCount})</li>
            </ul>
          ) : null}
        </article>
      ))}
      {!items.length ? (
        <p className="p-4 text-sm text-slate-500">Nenhum exame autorizado neste histórico.</p>
      ) : null}
      <ExamAttachmentsModal key={documentExam?.id ?? 'closed'} exam={documentExam} readOnly onClose={() => setDocumentExam(null)} />
    </div>
  )
}
