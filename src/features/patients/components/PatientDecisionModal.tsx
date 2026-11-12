import { useEffect, useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { Alert } from '../../../components/ui/Alert'
import {
  getPatient,
  patientHistory,
  decidePatientReview,
  undoPatientAssociation,
} from '../patients-api'
import type { Patient, PatientDetail, PatientReview, PatientExam } from '../patient.types'
export const PatientDecisionModal = ({
  review,
  target,
  mode,
  onClose,
  onSaved,
}: {
  review: PatientReview
  target?: Patient
  mode: 'APPROVE' | 'REJECT' | 'UNDO'
  onClose: () => void
  onSaved: () => void
}) => {
  const [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [data, setData] = useState<{
      source: PatientDetail
      target: PatientDetail | null
      sourceExams: PatientExam[]
      targetExams: PatientExam[]
    } | null>(null)
  const targetId = mode === 'UNDO' ? review.decision?.targetPatientId : target?.id
  useEffect(() => {
    let active = true
    void Promise.all([
      getPatient(review.patientId),
      targetId ? getPatient(targetId) : Promise.resolve(null),
      patientHistory(review.patientId),
      targetId ? patientHistory(targetId) : Promise.resolve([]),
    ])
      .then(([source, target, sourceExams, targetExams]) => {
        if (active) setData({ source, target, sourceExams, targetExams })
      })
      .catch(() => {
        if (active)
          setError(
            'Não foi possível carregar a comparação. Confira o acesso aos cadastros e exames.',
          )
      })
    return () => {
      active = false
    }
  }, [review.patientId, targetId])
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!data) return
    setBusy(true)
    setError('')
    try {
      if (mode === 'UNDO') {
        if (!review.decision) throw Error('Associação ausente')
        await undoPatientAssociation(review.decision.id, review.decision.version, reason)
      } else
        await decidePatientReview(review.id, {
          decision: mode,
          expectedVersion: review.version,
          expectedSourceVersion: data.source.revision,
          reason,
          ...(data.target
            ? { targetPatientId: data.target.id, expectedTargetVersion: data.target.revision }
            : {}),
        })
      onSaved()
      onClose()
    } catch {
      setError(
        'A conferência mudou ou existem referências posteriores. Recarregue os dados e confira as permissões antes de decidir.',
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal
      open
      size="lg"
      title={
        mode === 'APPROVE'
          ? 'Conferir associação'
          : mode === 'UNDO'
            ? 'Desfazer associação'
            : 'Manter cadastros separados'
      }
      description={
        mode === 'APPROVE'
          ? 'Todos os identificadores e exames do cadastro de origem serão associados ao cadastro selecionado.'
          : mode === 'UNDO'
            ? 'A associação anterior será restaurada e a correção permanecerá no histórico.'
            : 'Justifique a rejeição da correspondência sugerida.'
      }
      onClose={() => {
        if (!busy) onClose()
      }}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" form="patient-decision" loading={busy} disabled={!data}>
            {mode === 'APPROVE'
              ? 'Confirmar associação'
              : mode === 'UNDO'
                ? 'Desfazer vínculo'
                : 'Rejeitar correspondência'}
          </Button>
        </>
      }
    >
      <form id="patient-decision" onSubmit={(e) => void submit(e)} className="space-y-5">
        {error ? <Alert variant="error">{error}</Alert> : null}
        {data ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Cadastro de origem', patient: data.source, exams: data.sourceExams },
              { label: 'Cadastro selecionado', patient: data.target, exams: data.targetExams },
            ]
              .filter((item) => item.patient)
              .map((item) => (
                <article key={item.label} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase text-slate-500">{item.label}</p>
                  <h3 className="mt-2 font-bold">{item.patient?.fullName}</h3>
                  <p className="mt-1 text-sm">
                    Nascimento: {item.patient?.birthDate ?? 'Não informado'}
                  </p>
                  <p className="text-sm">Sexo: {item.patient?.sex ?? 'Não informado'}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {item.exams.length} exame(s) · {item.patient?.identifiers.length}{' '}
                    identificador(es)
                  </p>
                  <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto text-xs text-slate-600">
                    {item.patient?.identifiers.map((identifier) => (
                      <li key={identifier.id}>
                        {identifier.issuer} · {identifier.unitName}: {identifier.originalValue}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Carregando comparação...</p>
        )}
        {mode === 'UNDO' && review.decision ? (
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            Serão restaurados {review.decision.examCount} exame(s) e{' '}
            {review.decision.identifierCount} identificador(es) da associação original, além dos
            exames posteriores recebidos por esses identificadores.
          </p>
        ) : null}
        <Input
          label="Justificativa da decisão"
          required
          minLength={3}
          maxLength={500}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </form>
    </Modal>
  )
}
