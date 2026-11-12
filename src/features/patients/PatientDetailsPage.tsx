import { useEffect, useState } from 'react'
import { Link, Navigate, useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { useAuthentication } from '../auth/auth-context'
import { hasPermission } from '../auth/auth.types'
import { PatientPageLayout } from './components/PatientPageLayout'
import { PatientReviewRequestModal } from './components/PatientReviewRequestModal'
import { PatientFormModal } from './components/PatientFormModal'
import { PatientIdentifierModal } from './components/PatientIdentifierModal'
import { PatientHistoryTable } from './components/PatientHistoryTable'
import { getPatient, patientHistory } from './patients-api'
import type { PatientDetail, PatientExam } from './patient.types'
export const PatientDetailsPage = () => {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthentication()
  const [patient, setPatient] = useState<PatientDetail | null>(null),
    [history, setHistory] = useState<PatientExam[]>([]),
    [error, setError] = useState(''),
    [editing, setEditing] = useState(false),
    [identifier, setIdentifier] = useState(false),
    [reviewing, setReviewing] = useState(false),
    [reload, setReload] = useState(0)
  useEffect(() => {
    if (!patientId || !user) return
    let active = true
    void Promise.all([
      getPatient(patientId),
      hasPermission(user, 'exams.view') ? patientHistory(patientId) : Promise.resolve([]),
    ])
      .then(([record, exams]) => {
        if (active) {
          setPatient(record)
          setHistory(exams)
          setError('')
        }
      })
      .catch(() => {
        if (active) setError('Paciente indisponível ou sem autorização neste contexto.')
      })
    return () => {
      active = false
    }
  }, [patientId, reload, user])
  if (!user) return null
  if (!hasPermission(user, 'patients.view')) return <Navigate to="/dashboard" replace />
  return (
    <PatientPageLayout
      title={patient?.fullName ?? 'Cadastro de paciente'}
      description="Dados do cadastro e evidências de correção. Os exames mantêm a demografia recebida."
    >
      {error ? <Alert variant="error">{error}</Alert> : null}
      {patient ? (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap gap-3">
              {patient.canManage &&
              !patient.mergedIntoId &&
              hasPermission(user, 'patients.manage') ? (
                <Button onClick={() => setEditing(true)}>Corrigir cadastro</Button>
              ) : null}
              {patient.canManage &&
              !patient.mergedIntoId &&
              hasPermission(user, 'patients.identifiers.manage') ? (
                <Button variant="outline" onClick={() => setIdentifier(true)}>
                  Adicionar identificador
                </Button>
              ) : null}
              {hasPermission(user, 'patients.reconcile') ? (
                <Button variant="outline" onClick={() => navigate('/patients/review')}>
                  Conferência de vínculos
                </Button>
              ) : null}
            </div>
            {patient.canManage &&
            !patient.mergedIntoId &&
            hasPermission(user, 'patients.reconcile') &&
            hasPermission(user, 'exams.view') ? (
              <Button className="mt-3" variant="outline" onClick={() => setReviewing(true)}>
                Revisar associação deste paciente
              </Button>
            ) : null}
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-slate-500">Nascimento</dt>
                <dd className="font-bold">{patient.birthDate ?? 'Não informado'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Sexo</dt>
                <dd className="font-bold">{patient.sex ?? 'Não informado'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">País</dt>
                <dd className="font-bold">{patient.country}</dd>
              </div>
              <div className="sm:col-span-3">
                <dt className="text-slate-500">ID do cadastro para mapeamento de origem</dt>
                <dd className="break-all font-mono text-xs">{patient.id}</dd>
              </div>
            </dl>
            {!patient.canManage ? (
              <p className="mt-4 text-sm text-slate-600">
                Este cadastro possui vínculos em outras unidades. A correção exige um gestor com
                acesso completo.
              </p>
            ) : null}
            {patient.mergedIntoId ? (
              <p className="mt-4 text-sm text-brand-800">
                Cadastro associado.{' '}
                <Link to={'/patients/' + patient.mergedIntoId} className="font-bold underline">
                  Abrir cadastro atual
                </Link>
              </p>
            ) : null}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold">Identificadores de origem</h2>
            <div className="mt-4 space-y-3">
              {patient.identifiers.map((i) => (
                <div key={i.id} className="flex flex-wrap gap-3 rounded-xl border p-3 text-sm">
                  <span className="font-bold">
                    {i.issuer} · {i.unitName}
                  </span>
                  <span className="break-all font-mono">{i.originalValue}</span>
                  <span className="text-xs text-slate-500">
                    {i.source === 'IMPORT'
                      ? 'Importado'
                      : i.source === 'EXAM'
                        ? 'Recebido com exame'
                        : 'Conferido no cadastro'}
                  </span>
                </div>
              ))}
              {!patient.identifiers.length ? (
                <p className="text-sm text-slate-500">
                  Nenhum identificador com emissor confirmado.
                </p>
              ) : null}
            </div>
          </section>
          {hasPermission(user, 'exams.view') ? (
            <section>
              <h2 className="mb-4 font-bold">Histórico autorizado</h2>
              <PatientHistoryTable items={history} />
            </section>
          ) : null}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold">Histórico do cadastro</h2>
            <div className="mt-4 space-y-4">
              {patient.revisions.map((r) => (
                <article key={r.id} className="border-l-2 border-brand-300 pl-4">
                  <p className="text-sm font-bold">
                    Versão {r.version} · {r.demographics.fullName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {r.demographics.birthDate ?? 'Nascimento não informado'} ·{' '}
                    {new Date(r.createdAt).toLocaleString('pt-BR')}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{r.reason}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
      {reviewing && patient ? (
        <PatientReviewRequestModal
          patient={patient}
          onClose={() => setReviewing(false)}
          onSaved={() => navigate('/patients/review')}
        />
      ) : null}
      {editing && patient ? (
        <PatientFormModal
          patient={patient}
          onClose={() => setEditing(false)}
          onSaved={() => setReload((n) => n + 1)}
        />
      ) : null}
      {identifier && patient ? (
        <PatientIdentifierModal
          patientId={patient.id}
          onClose={() => setIdentifier(false)}
          onSaved={() => setReload((n) => n + 1)}
        />
      ) : null}
    </PatientPageLayout>
  )
}
