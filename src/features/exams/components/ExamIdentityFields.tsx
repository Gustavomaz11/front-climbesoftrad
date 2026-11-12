import { useEffect, useState } from 'react'
import type { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { useAuthentication } from '../../auth/auth-context'
import { hasPermission } from '../../auth/auth.types'
import { patientCandidates } from '../../patients/patients-api'
import type { PatientCandidate } from '../../patients/patient.types'
import { getExamCatalog, previewExamClassification } from '../../exam-catalog/exam-catalog-api'
import type { ExamCatalog, ExamClassification } from '../../exam-catalog/exam-catalog.types'
import type { ExamFormValues } from './exam-form'
export const ExamIdentityFields = ({
  register,
  watch,
  setValue,
}: {
  register: UseFormRegister<ExamFormValues>
  watch: UseFormWatch<ExamFormValues>
  setValue: UseFormSetValue<ExamFormValues>
}) => {
  const { user } = useAuthentication()
  const [candidates, setCandidates] = useState<{ key: string; rows: PatientCandidate[] }>({
      key: '',
      rows: [],
    }),
    [catalog, setCatalog] = useState<ExamCatalog>({ types: [], aliases: [] }),
    [classification, setClassification] = useState<{
      key: string
      value: ExamClassification
    } | null>(null)
  const name = watch('patientName'),
    birth = watch('birthDate'),
    sex = watch('sex'),
    modality = watch('modality'),
    description = watch('studyDescription'),
    unitId = watch('unitId'),
    issuer = watch('originIssuer'),
    patientId = watch('patientId')
  const canView = Boolean(user && hasPermission(user, 'patients.view')),
    canCatalog = Boolean(user && hasPermission(user, 'exam.catalog.view'))
  const key = JSON.stringify([description, modality, unitId, issuer])
  const candidateKey = JSON.stringify([name, birth, sex])
  const visibleCandidates = candidates.key === candidateKey ? candidates.rows : []
  useEffect(() => {
    if (!canCatalog) return
    let active = true
    void getExamCatalog()
      .then((result) => {
        if (active) setCatalog(result)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [canCatalog])
  useEffect(() => {
    let active = true
    if (!canView || name.trim().length < 3) return
    const timer = setTimeout(() => {
      void patientCandidates(name, birth || undefined, sex)
        .then((rows) => {
          if (active) setCandidates({ key: candidateKey, rows })
        })
        .catch(() => {})
    }, 300)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [name, birth, sex, canView, candidateKey])
  useEffect(() => {
    let active = true
    if (!canCatalog || description.length < 2 || !unitId) return
    const timer = setTimeout(() => {
      void previewExamClassification({
        description,
        modality,
        unitId,
        ...(issuer ? { issuer } : {}),
      })
        .then((value) => {
          if (active) setClassification({ key, value })
        })
        .catch(() => {})
    }, 300)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [key, description, modality, unitId, issuer, canCatalog])
  return (
    <fieldset className="space-y-4 rounded-xl border border-cyan-200 bg-cyan-50/50 p-4">
      <legend className="text-sm font-bold text-brand-900">Origem e identificação</legend>
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Sistema emissor"
          placeholder="Ex.: sistema hospitalar"
          maxLength={120}
          {...register('originIssuer')}
        />
        <Input
          label="ID do paciente na origem"
          maxLength={120}
          {...register('externalPatientId')}
        />
        <Input
          label="ID do atendimento na origem"
          maxLength={120}
          {...register('externalEncounterId')}
        />
      </div>
      {patientId ? (
        <div className="flex items-center gap-3 text-sm">
          <span>Cadastro selecionado explicitamente.</span>
          <Button variant="ghost" size="sm" onClick={() => setValue('patientId', '')}>
            Limpar seleção
          </Button>
        </div>
      ) : canView && visibleCandidates.length ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-600">
            Possíveis cadastros. Confira os dados antes de selecionar.
          </p>
          {visibleCandidates.map((c) => (
            <div
              key={c.patientId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-3 text-sm"
            >
              <span>
                <strong>{c.fullName}</strong> · {c.birthDate ?? 'Sem nascimento'}
                <small className="block text-slate-500">{c.reasons.join(' · ')}</small>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setValue('patientId', c.patientId)
                  setValue('patientName', c.fullName)
                  if (c.birthDate) setValue('birthDate', c.birthDate)
                  if (c.sex) setValue('sex', c.sex as ExamFormValues['sex'])
                }}
              >
                Usar este cadastro
              </Button>
            </div>
          ))}
        </div>
      ) : null}
      {canCatalog ? (
        <label className="block text-sm font-semibold">
          Tipo de exame canônico
          <select
            aria-label="Tipo canônico do exame"
            {...register('examTypeId')}
            className="mt-2 h-12 w-full rounded-xl border bg-white px-3"
          >
            <option value="">Conferir pela descrição recebida</option>
            {catalog.types
              .filter((t) => t.active && t.modality === modality)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
        </label>
      ) : null}
      {classification?.key === key ? (
        <p className="text-xs text-slate-600">
          {classification.value.status === 'APPROVED'
            ? 'Descrição reconhecida: ' +
              (catalog.types.find((t) => t.id === classification.value.examTypeId)?.name ??
                'Tipo cadastrado')
            : classification.value.status === 'AMBIGUOUS'
              ? 'Descrição ambígua. Será encaminhada para conferência.'
              : 'Descrição sem correspondência. Será encaminhada para conferência.'}
        </p>
      ) : null}
    </fieldset>
  )
}
