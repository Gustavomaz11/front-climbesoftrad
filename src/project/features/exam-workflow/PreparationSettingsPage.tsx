import { NativeSelect as SurfaceNativeSelect } from '@/components/ui/native-select'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { useAuthentication } from '../auth/auth-context'
import { hasPermission } from '../auth/auth.types'
import { SettingsPageLayout } from '../settings/components/SettingsPageLayout'
import { getExamCatalog } from '../exam-catalog/exam-catalog-api'
import type { ExamType } from '../exam-catalog/exam-catalog.types'
import { listPreparationPolicies } from './workflow-api'
import { preparationLabels, type PreparationPolicy } from './workflow.types'
import { PreparationPolicyForm } from './PreparationPolicyForm'

export const PreparationSettingsPage = () => {
  const { user } = useAuthentication(), [unitId, setUnit] = useState(''), [typeId, setType] = useState(''), [types, setTypes] = useState<ExamType[]>([]), [policies, setPolicies] = useState<PreparationPolicy[] | null>(null), [error, setError] = useState(''), [reload, setReload] = useState(0)
  const allowed = Boolean(user && hasPermission(user, 'exams.preparation.manage'))
  const company = user?.companies.find(company => company.id === user.activeCompany?.id)
  const units = company?.units.filter(unit => unit.active && (!user?.activeCompany?.selectedUnitId || unit.id === user.activeCompany.selectedUnitId)) ?? []
  const effectiveUnit = unitId || units[0]?.id || ''
  useEffect(() => {
    if (!allowed || !effectiveUnit) return
    let active = true
    void Promise.all([listPreparationPolicies(effectiveUnit), getExamCatalog()]).then(([rules, catalog]) => { if (active) { setPolicies(rules); setTypes(catalog.types); setError('') } }).catch(() => { if (active) setError('Não foi possível carregar os requisitos.') })
    return () => { active = false }
  }, [allowed, effectiveUnit, reload])
  if (!user) return null
  if (!allowed) return <Navigate to="/dashboard" replace />
  const policy = policies?.find(policy => policy.active && policy.exam_type_id === (typeId || null))
  return <SettingsPageLayout active="preparation" title="Requisitos de preparação" description="Defina as conferências obrigatórias por unidade e tipo de exame. A liberação registra responsável, evidências e instante de preparação completa.">
    <div className="mb-5 flex flex-wrap items-end gap-3"><label className="text-sm font-semibold">Unidade<SurfaceNativeSelect className="ml-2 rounded-lg border bg-card p-3" value={effectiveUnit} onChange={event => { setPolicies(null); setUnit(event.target.value); setType('') }}>{units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</SurfaceNativeSelect></label>
      <label className="text-sm font-semibold">Aplicação<SurfaceNativeSelect className="ml-2 rounded-lg border bg-card p-3" value={typeId} onChange={event => setType(event.target.value)}><option value="">Padrão da unidade</option>{types.filter(type => type.active).map(type => <option key={type.id} value={type.id}>{type.name} · {type.modality}</option>)}</SurfaceNativeSelect></label><Button variant="outline" onClick={() => { setPolicies(null); setReload(n => n + 1) }}>Atualizar</Button></div>
    {error ? <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    {!effectiveUnit ? <p>Cadastre uma unidade ativa para configurar a preparação.</p> : policies ? <PreparationPolicyForm key={`${effectiveUnit}-${typeId}-${policy?.id ?? 'new'}`} unitId={effectiveUnit} examTypeId={typeId} policy={policy} onSaved={() => { setPolicies(null); setReload(n => n + 1) }} /> : <p>Carregando requisitos…</p>}
    <section className="mt-5 space-y-3"><h2 className="font-bold">Histórico de regras desta unidade</h2>{policies?.map(rule => <article key={rule.id} className="rounded-xl border bg-card p-4 text-sm"><p className="font-bold">{types.find(type => type.id === rule.exam_type_id)?.name ?? 'Padrão da unidade'} · versão {rule.version} · {rule.active ? 'Atual' : 'Substituída'}</p><p className="mt-1">{rule.required_items.map(item => preparationLabels[item]).join(', ') || 'Sem requisitos documentais'}.</p><p className="mt-1 text-muted-foreground">{rule.reason}</p></article>)}</section>
  </SettingsPageLayout>
}
