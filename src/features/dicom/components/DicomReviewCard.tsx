import { useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { ModalitySelect } from '../../exam-modalities/ModalitySelect'
import { resolveDicomReview, type DicomReview } from '../dicom-api'
export const DicomReviewCard = ({
  review,
  onDone,
}: {
  review: DicomReview
  onDone: () => void
}) => {
  const initial = review.details.received ?? {}
  const [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [correct] = useState(review.kind === 'DEMOGRAPHICS')
  const [data, setData] = useState({
    patientName: String(initial.patientName ?? ''),
    birthDate: String(initial.birthDate ?? ''),
    sex: String(initial.sex ?? ''),
    modality: String(initial.modality ?? 'CT'),
    studyDescription: String(initial.studyDescription ?? ''),
    performedAt: String(initial.performedAt ?? ''),
  })
  const update = (key: keyof typeof data, value: string) =>
    setData((current) => ({ ...current, [key]: value }))
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await resolveDicomReview(
        review,
        correct ? 'CORRECT' : 'ACKNOWLEDGE',
        reason,
        correct
          ? { ...data, unitId: review.unitId, country: 'Brasil', priority: 'ROTINA' }
          : undefined,
      )
      onDone()
    } catch {
      setError('Dados inválidos, conferência já decidida ou sem autorização. Atualize a lista.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="space-y-3 rounded-xl border bg-white p-4"
    >
      <h3 className="font-bold">
        {(
          {
            DEMOGRAPHICS: 'Dados cadastrais incompletos',
            IDENTITY_COLLISION: 'Identificador com conteúdo divergente',
            POSSIBLE_DUPLICATE: 'Possível estudo duplicado',
          } as Record<string, string>
        )[review.kind] ?? review.kind}
      </h3>
      {review.details.issues?.map((issue) => (
        <p key={issue} className="text-sm text-amber-800">
          {issue}
        </p>
      ))}
      {review.details.reason ? <p className="text-sm">{review.details.reason}</p> : null}
      {review.details.candidateExamIds ? (
        <p className="text-xs">
          {review.details.candidateExamIds.length} exames semelhantes preservados separadamente para
          conferência.
        </p>
      ) : null}
      {review.kind === 'DEMOGRAPHICS' ? (
        <label className="flex gap-2 text-sm">
          <input type="checkbox" checked={correct} disabled={busy} readOnly /> Corrigir cadastro
          após conferência
        </label>
      ) : null}
      {correct ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Nome do paciente"
            value={data.patientName}
            required
            maxLength={120}
            onChange={(event) => update('patientName', event.target.value)}
          />
          <Input
            label="Nascimento"
            type="date"
            value={data.birthDate}
            required
            onChange={(event) => update('birthDate', event.target.value)}
          />
          <label className="text-sm font-semibold">
            Sexo
            <select
              required
              value={data.sex}
              onChange={(event) => update('sex', event.target.value)}
              className="mt-1 w-full rounded border p-2"
            >
              <option value="">Conferir</option>
              <option value="FEMININO">Feminino</option>
              <option value="MASCULINO">Masculino</option>
            </select>
          </label>
          <ModalitySelect value={data.modality} onChange={value=>update('modality',value)} />
          <Input
            label="Descrição do estudo"
            required
            maxLength={180}
            value={data.studyDescription}
            onChange={(event) => update('studyDescription', event.target.value)}
          />
          <Input
            label="Data, horário e fuso (ISO 8601)"
            placeholder="2026-10-14T12:00:00-03:00"
            value={data.performedAt}
            required
            onChange={(event) => update('performedAt', event.target.value)}
          />
        </div>
      ) : null}
      <Input
        label="Justificativa da conferência"
        value={reason}
        required
        maxLength={500}
        onChange={(event) => setReason(event.target.value)}
      />
      {review.kind === 'IDENTITY_COLLISION' ? (
        <p className="text-xs text-slate-500">
          Registrar ciência conserva o arquivo em quarentena. A decisão não substitui o estudo
          existente.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={busy || !reason.trim()}>
        {correct
          ? 'Confirmar cadastro e retomar ingestão'
          : 'Registrar ciência e preservar registros'}
      </Button>
    </form>
  )
}
