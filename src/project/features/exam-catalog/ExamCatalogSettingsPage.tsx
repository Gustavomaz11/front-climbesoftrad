import { NativeSelect as SurfaceNativeSelect } from '@/components/ui/native-select'
import { Card as SurfaceCard } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthentication } from '../auth/auth-context'
import { hasPermission } from '../auth/auth.types'
import { SettingsPageLayout } from '../settings/components/SettingsPageLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Alert } from '../../components/ui/Alert'
import { Checkbox } from '../../components/ui/Checkbox'
import { ModalitySelect } from '../exam-modalities/ModalitySelect'
import {
  getExamCatalog,
  saveExamType,
  saveExamAlias,
  listUnclassifiedExams,
  classifyExam,
} from './exam-catalog-api'
import type { ExamCatalog, ExamType, ExamAlias } from './exam-catalog.types'
import type { Exam } from '../exams/exam.types'
export const ExamCatalogSettingsPage = () => {
  const { user } = useAuthentication()
  const [catalog, setCatalog] = useState<ExamCatalog>({ types: [], aliases: [] }),
    [pending, setPending] = useState<Exam[]>([]),
    [reload, setReload] = useState(0),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [type, setType] = useState<ExamType | null | undefined>(),
    [alias, setAlias] = useState<ExamAlias | null | undefined>(),
    [classification, setClassification] = useState<Exam | null>(null),
    [form, setForm] = useState({
      name: '',
      modality: 'MR',
      groupName: '',
      active: true,
      examTypeId: '',
      unitId: '',
      issuer: '',
      description: '',
      reason: '',
      teachAlias: false,
    })
  const canReview = Boolean(
    user && hasPermission(user, 'exam.classification.review') && hasPermission(user, 'exams.view'),
  )
  useEffect(() => {
    let active = true
    void Promise.all([getExamCatalog(), canReview ? listUnclassifiedExams() : Promise.resolve([])])
      .then(([data, exams]) => {
        if (active) {
          setCatalog(data)
          setPending(exams)
        }
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar o catálogo.')
      })
    return () => {
      active = false
    }
  }, [reload, canReview])
  if (!user) return null
  if (!hasPermission(user, 'exam.catalog.view')) return <Navigate to="/dashboard" replace />
  const canManage = hasPermission(user, 'exam.catalog.manage')
  const company = user.companies.find((c) => c.id === user.activeCompany?.id)
  const editType = (value: ExamType | null) => {
    setForm({
      ...form,
      name: value?.name ?? '',
      modality: value?.modality ?? 'MR',
      groupName: value?.groupName ?? '',
      active: value?.active ?? true,
    })
    setType(value)
  }
  const editAlias = (value: ExamAlias | null) => {
    setForm({
      ...form,
      examTypeId: value?.examTypeId ?? '',
      unitId: value?.unitId ?? user.activeCompany?.selectedUnitId ?? '',
      issuer: value?.issuer ?? '',
      description: value?.description ?? '',
      active: value?.active ?? true,
    })
    setAlias(value)
  }
  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (type !== undefined)
        await saveExamType(
          {
            name: form.name,
            modality: form.modality,
            groupName: form.groupName,
            active: form.active,
            ...(type ? { expectedVersion: type.version } : {}),
          },
          type?.id,
        )
      else if (alias !== undefined)
        await saveExamAlias(
          {
            examTypeId: form.examTypeId,
            description: form.description,
            active: form.active,
            ...(form.unitId ? { unitId: form.unitId } : {}),
            ...(form.issuer ? { issuer: form.issuer } : {}),
            ...(alias ? { expectedVersion: alias.version } : {}),
          },
          alias?.id,
        )
      else if (classification)
        await classifyExam(classification.id, {
          examTypeId: form.examTypeId,
          expectedUpdatedAt: classification.updatedAt,
          reason: form.reason,
          teachAlias: form.teachAlias,
        })
      setType(undefined)
      setAlias(undefined)
      setClassification(null)
      setReload((n) => n + 1)
    } catch {
      setError('Não foi possível salvar. Confira modalidade, contexto e alterações concorrentes.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <SettingsPageLayout
      active="exam-catalog"
      title="Catálogo de exames"
      description="Tipos canônicos e sinônimos revisados. A descrição recebida no exame permanece preservada."
    >
      {error ? <Alert variant="error">{error}</Alert> : null}
      <div className="mb-5 flex flex-wrap gap-3">
        {canManage && user.activeCompany?.allUnits ? (
          <Button onClick={() => editType(null)}>Cadastrar tipo</Button>
        ) : null}
        {canManage ? (
          <Button variant="outline" onClick={() => editAlias(null)}>
            Cadastrar sinônimo
          </Button>
        ) : null}
      </div>
      <SurfaceCard className="space-y-3 rounded-2xl border bg-card p-5 gap-0 py-0 ring-0">
        <h2 className="font-bold">Tipos canônicos</h2>
        {catalog.types.map((t) => (
          <article key={t.id} className="flex flex-wrap items-center gap-4 rounded-xl border p-4">
            <div className="flex-1">
              <h3 className="font-bold">{t.name}</h3>
              <p className="text-xs text-muted-foreground">
                {t.modality} · {t.groupName} · {t.active ? 'Ativo' : 'Inativo'}
              </p>
            </div>
            {canManage && user.activeCompany?.allUnits ? (
              <Button size="sm" variant="outline" onClick={() => editType(t)}>
                Editar tipo
              </Button>
            ) : null}
          </article>
        ))}
        {!catalog.types.length ? (
          <p className="text-sm text-muted-foreground">
            Cadastre tipos aprovados pela equipe antes de normalizar os estudos.
          </p>
        ) : null}
      </SurfaceCard>
      <SurfaceCard className="mt-5 space-y-3 rounded-2xl border bg-card p-5 gap-0 py-0 ring-0">
        <h2 className="font-bold">Sinônimos por origem</h2>
        {catalog.aliases.map((a) => (
          <article key={a.id} className="flex flex-wrap gap-4 rounded-xl border p-4">
            <div className="flex-1">
              <strong>{a.description}</strong>
              <p className="text-xs text-muted-foreground">
                {catalog.types.find((t) => t.id === a.examTypeId)?.name} ·{' '}
                {a.issuer ?? 'Todos os emissores'} ·{' '}
                {company?.units.find((u) => u.id === a.unitId)?.name ?? 'Padrão da empresa'} ·
                Versão {a.version} · {a.active ? 'Ativo' : 'Inativo'}
              </p>
            </div>
            {canManage ? (
              <Button size="sm" variant="outline" onClick={() => editAlias(a)}>
                Editar sinônimo
              </Button>
            ) : null}
          </article>
        ))}
      </SurfaceCard>
      {canReview ? (
        <SurfaceCard className="mt-5 space-y-3 rounded-2xl border bg-card p-5 gap-0 py-0 ring-0">
          <h2 className="font-bold">Descrições para conferência</h2>
          {pending.map((exam) => (
            <article
              key={exam.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border p-4"
            >
              <div className="flex-1">
                <strong>{exam.studyDescription}</strong>
                <p className="text-xs text-muted-foreground">
                  {exam.modality} · {exam.patientName} ·{' '}
                  {exam.normalizationStatus === 'AMBIGUOUS'
                    ? 'Classificação ambígua'
                    : 'Sem classificação aprovada'}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setForm({ ...form, examTypeId: '', reason: '', teachAlias: false })
                  setClassification(exam)
                }}
              >
                Revisar classificação
              </Button>
            </article>
          ))}
        </SurfaceCard>
      ) : null}
      {type !== undefined || alias !== undefined || classification ? (
        <Modal
          open
          size="lg"
          title={
            classification
              ? 'Conferir classificação'
              : type !== undefined
                ? 'Tipo canônico'
                : 'Sinônimo revisado'
          }
          description={
            classification
              ? 'Confira a descrição original e selecione o tipo correto.'
              : 'Configure o catálogo da empresa ativa.'
          }
          onClose={() => {
            if (!busy) {
              setType(undefined)
              setAlias(undefined)
              setClassification(null)
            }
          }}
          footer={
            <Button type="submit" form="catalog-form" loading={busy}>
              Salvar revisão
            </Button>
          }
        >
          <form id="catalog-form" onSubmit={(e) => void save(e)} className="space-y-4">
            {error ? <Alert variant="error">{error}</Alert> : null}
            {type !== undefined ? (
              <>
                <Input
                  label="Descrição canônica"
                  required
                  minLength={2}
                  maxLength={180}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  label="Grupo"
                  required
                  minLength={2}
                  maxLength={120}
                  value={form.groupName}
                  onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                />
                <ModalitySelect label="Modalidade do tipo" value={form.modality} onChange={value=>setForm({...form,modality:value})} />
              </>
            ) : (
              <label className="block text-sm font-semibold">
                Tipo canônico
                <SurfaceNativeSelect
                  aria-label="Tipo canônico"
                  required
                  value={form.examTypeId}
                  onChange={(e) => setForm({ ...form, examTypeId: e.target.value })}
                  className="mt-2 h-12 w-full rounded-xl border px-3"
                >
                  <option value="">Selecione</option>
                  {catalog.types
                    .filter(
                      (t) =>
                        t.active && (!classification || t.modality === classification.modality),
                    )
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} · {t.modality}
                      </option>
                    ))}
                </SurfaceNativeSelect>
              </label>
            )}
            {alias !== undefined ? (
              <>
                <Input
                  label="Descrição recebida / sinônimo"
                  required
                  minLength={2}
                  maxLength={180}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <Input
                  label="Sistema emissor (opcional)"
                  maxLength={120}
                  value={form.issuer}
                  onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                />
                <label className="block text-sm font-semibold">
                  Origem do mapeamento
                  <SurfaceNativeSelect
                    aria-label="Unidade do sinônimo"
                    value={form.unitId}
                    required={!user.activeCompany?.allUnits}
                    onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                    className="mt-2 h-12 w-full rounded-xl border px-3"
                  >
                    <option value="" disabled={!user.activeCompany?.allUnits}>
                      Padrão da empresa
                    </option>
                    {company?.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </SurfaceNativeSelect>
                </label>
              </>
            ) : null}
            {classification ? (
              <>
                <p className="text-sm">
                  Recebido: <strong>{classification.studyDescription}</strong> ·{' '}
                  {classification.modality}
                </p>
                <Input
                  label="Justificativa da classificação"
                  required
                  minLength={3}
                  maxLength={500}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
                {canManage ? (
                  <Checkbox
                    label="Usar esta descrição como sinônimo revisado desta origem"
                    checked={form.teachAlias}
                    onChange={(e) => setForm({ ...form, teachAlias: e.target.checked })}
                  />
                ) : null}
              </>
            ) : (
              <Checkbox
                label="Ativo"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
            )}
          </form>
        </Modal>
      ) : null}
    </SettingsPageLayout>
  )
}
