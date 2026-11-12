import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { listPatients } from '../patients-api'
import type { Patient, PatientReview } from '../patient.types'
import { PatientDecisionModal } from './PatientDecisionModal'
const kindLabels: Record<string, string> = {
  LEGACY: 'Origem legada sem identificador verificado',
  CONFLICT: 'Conflito de identificação',
  SUGGESTION: 'Possível correspondência',
  UNIDENTIFIED: 'Identificador de origem ausente',
}
export const PatientReviewCard = ({
  review,
  onUpdated,
}: {
  review: PatientReview
  onUpdated: () => void
}) => {
  const [search, setSearch] = useState(''),
    [patients, setPatients] = useState<Patient[]>([]),
    [selected, setSelected] = useState<Patient | undefined>(),
    [mode, setMode] = useState<'APPROVE' | 'REJECT' | 'UNDO' | null>(null)
  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      void listPatients(search)
        .then((items) => {
          if (active) setPatients(items.filter((p) => p.id !== review.patientId))
        })
        .catch(() => {})
    }, 250)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [search, review.patientId])
  return (
    <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
            {kindLabels[review.kind] ?? review.kind}
          </p>
          <Link
            to={'/patients/' + review.patientId}
            className="mt-2 block font-bold text-brand-900"
          >
            {review.patient.fullName}
          </Link>
          <p className="mt-1 text-sm text-slate-500">
            {review.patient.birthDate ?? 'Nascimento não informado'} ·{' '}
            {review.patient.sex ?? 'Sexo não informado'}
          </p>
          {review.differences.length ? (
            <p className="mt-2 text-xs text-amber-700">
              Divergências:{' '}
              {review.differences
                .map(
                  (field) =>
                    ({
                      fullName: 'nome',
                      birthDate: 'nascimento',
                      sex: 'sexo',
                      encounterPatient: 'paciente do atendimento',
                    })[field] ?? field,
                )
                .join(', ')}
            </p>
          ) : null}
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {review.status === 'OPEN'
            ? 'Pendente'
            : review.status === 'APPROVED'
              ? 'Associação aprovada'
              : review.status === 'REJECTED'
                ? 'Correspondência rejeitada'
                : 'Associação desfeita'}
        </span>
      </div>
      {review.status === 'OPEN' ? (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {review.candidates.map((candidate) => (
              <button
                type="button"
                key={candidate.patientId}
                onClick={() =>
                  setSelected(
                    patients.find((p) => p.id === candidate.patientId) ?? {
                      ...review.patient,
                      id: candidate.patientId,
                      fullName: candidate.fullName,
                      birthDate: candidate.birthDate,
                      sex: candidate.sex as Patient['sex'],
                      revision: candidate.revision,
                    },
                  )
                }
                className={
                  'rounded-xl border p-4 text-left ' +
                  (selected?.id === candidate.patientId
                    ? 'border-brand-600 bg-cyan-50'
                    : 'border-slate-200')
                }
              >
                <strong className="block text-sm">{candidate.fullName}</strong>
                <span className="text-xs text-slate-500">
                  {candidate.birthDate ?? 'Nascimento não informado'} ·{' '}
                  {candidate.confidence === 'HIGH'
                    ? 'Evidência demográfica forte'
                    : candidate.confidence === 'CONFLICT'
                      ? 'Dados divergentes'
                      : 'Conferência necessária'}
                </span>
                <p className="mt-2 text-xs text-slate-600">{candidate.reasons.join(' · ')}</p>
              </button>
            ))}
          </div>
          {!review.candidates.length ? (
            <p className="text-sm text-slate-500">
              Sem candidato semelhante. Pesquise outro cadastro ou mantenha os registros separados.
            </p>
          ) : null}
          <Input
            label="Buscar cadastro para conferência"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <label className="block text-sm font-semibold">
            Cadastro selecionado
            <select
              aria-label={'Paciente correspondente a ' + review.patient.fullName}
              value={selected?.id ?? ''}
              onChange={(e) => setSelected(patients.find((p) => p.id === e.target.value))}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3"
            >
              <option value="">Selecione após comparar os dados</option>
              {selected && !patients.some((p) => p.id === selected.id) ? (
                <option value={selected.id}>{selected.fullName}</option>
              ) : null}
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} · {p.birthDate ?? 'Sem nascimento'}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-3">
            <Button disabled={!review.canManage || !selected} onClick={() => setMode('APPROVE')}>
              Comparar e associar
            </Button>
            <Button
              variant="outline"
              disabled={!review.canManage}
              onClick={() => setMode('REJECT')}
            >
              Manter separados
            </Button>
          </div>
        </>
      ) : review.decision?.status === 'APPLIED' ? (
        <Button variant="outline" disabled={!review.canManage} onClick={() => setMode('UNDO')}>
          Desfazer associação
        </Button>
      ) : null}
      {review.reason ? (
        <p className="text-sm text-slate-600">Justificativa: {review.reason}</p>
      ) : null}
      {mode ? (
        <PatientDecisionModal
          review={review}
          target={selected}
          mode={mode}
          onClose={() => setMode(null)}
          onSaved={onUpdated}
        />
      ) : null}
    </article>
  )
}
