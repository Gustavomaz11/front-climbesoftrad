import { NativeSelect as SurfaceNativeSelect } from '@/components/ui/native-select'
import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import { HttpResponseError } from '../../auth/auth-http-client'
import { getExamCatalog } from '../../exam-catalog/exam-catalog-api'
import type { ExamType } from '../../exam-catalog/exam-catalog.types'
import { changePhysicianQualification, createPhysicianQualification, listPhysicianQualifications, type PhysicianQualification } from '../physician-qualifications-api'
import type { Physician } from '../physician.types'
import { useAuthentication } from '../../auth/auth-context'

export const PhysicianQualificationsModal = ({ physician, canManage, onClose }: {
  physician: Physician; canManage: boolean; onClose: () => void
}) => {
  const { user } = useAuthentication()
  const [records, setRecords] = useState<PhysicianQualification[]>([])
  const [types, setTypes] = useState<ExamType[]>([])
  const [unitId, setUnitId] = useState('')
  const [examTypeId, setExamTypeId] = useState('')
  const [reason, setReason] = useState('')
  const [target, setTarget] = useState<PhysicianQualification | null>(null)
  const [changeReason, setChangeReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const company = user?.companies.find((item) => item.id === user.activeCompany?.id)
  const units = (physician.allUnits ? company?.units ?? [] : physician.units).filter((unit) => unit.active &&
    (!user?.activeCompany?.selectedUnitId || unit.id === user.activeCompany.selectedUnitId))
  useEffect(() => {
    let active = true
    void Promise.all([listPhysicianQualifications(physician.id), getExamCatalog()]).then(([items, catalog]) => {
      if (active) { setRecords(items); setTypes(catalog.types); setError('') }
    }).catch(() => { if (active) setError('Não foi possível carregar as habilitações e o catálogo.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [physician.id, reload])
  const fail = (error: unknown) => setError(error instanceof HttpResponseError && error.status === 409
    ? 'Habilitação já cadastrada ou alterada por outra pessoa. Atualize a lista.'
    : 'Confira o vínculo do médico, a unidade, o tipo de exame e sua permissão.')
  const create = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      await createPhysicianQualification(physician.id, { unitId, examTypeId, reason })
      setExamTypeId(''); setReason(''); setLoading(true); setReload((value) => value + 1)
    } catch (error) { fail(error) } finally { setBusy(false) }
  }
  const change = async (event: FormEvent) => {
    event.preventDefault()
    if (!target) return
    setBusy(true); setError('')
    try { await changePhysicianQualification(physician.id, target, changeReason); setTarget(null); setLoading(true); setReload((value) => value + 1) }
    catch (error) { fail(error) } finally { setBusy(false) }
  }
  return <Modal open title="Habilitações médicas" description={physician.name} size="lg" dismissible={!busy} onClose={onClose}>
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Defina os tipos de exame que o médico pode atender em cada unidade. A especialidade não concede habilitações automaticamente.</p>
      {error ? <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      {canManage && physician.active ? <form onSubmit={(event) => void create(event)} className="space-y-3 rounded-xl border border-border bg-muted p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-muted-foreground">Unidade<SurfaceNativeSelect aria-label="Unidade da habilitação" value={unitId} onChange={(event) => setUnitId(event.target.value)} required disabled={busy || loading} className="mt-1 block w-full rounded-lg border border-input bg-card p-2"><option value="">Selecione</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</SurfaceNativeSelect></label>
          <label className="text-sm font-semibold text-muted-foreground">Tipo de exame<SurfaceNativeSelect aria-label="Tipo de exame da habilitação" value={examTypeId} onChange={(event) => setExamTypeId(event.target.value)} required disabled={busy || loading} className="mt-1 block w-full rounded-lg border border-input bg-card p-2"><option value="">Selecione</option>{types.filter((type) => type.active).map((type) => <option key={type.id} value={type.id}>{type.name} · {type.modality}</option>)}</SurfaceNativeSelect></label>
        </div>
        <Input label="Justificativa da habilitação" value={reason} onChange={(event) => setReason(event.target.value)} required minLength={3} maxLength={500} disabled={busy} />
        <Button type="submit" disabled={busy || loading || !unitId || !examTypeId || reason.trim().length < 3}>Adicionar habilitação</Button>
      </form> : null}
      {target ? <form onSubmit={(event) => void change(event)} className="space-y-3 rounded-xl border border-brand-200 p-4">
        <p className="font-bold text-foreground">{target.active ? 'Desativar' : 'Reativar'}: {target.examTypeName} · {target.unitName}</p>
        <Input label="Justificativa da alteração" value={changeReason} onChange={(event) => setChangeReason(event.target.value)} required minLength={3} maxLength={500} disabled={busy} />
        <div className="flex gap-2"><Button type="submit" disabled={busy || changeReason.trim().length < 3}>Confirmar alteração</Button><Button variant="ghost" disabled={busy} onClick={() => setTarget(null)}>Cancelar</Button></div>
      </form> : null}
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold text-foreground">Habilitações cadastradas</h2><Button size="sm" variant="outline" disabled={busy || loading} onClick={() => { setLoading(true); setReload((value) => value + 1) }}>Atualizar</Button></div>
      {loading ? <p className="text-sm text-muted-foreground">Consultando habilitações...</p> : null}
      {!loading && !records.length ? <p className="text-sm text-muted-foreground">Nenhuma habilitação cadastrada.</p> : null}
      {records.map((record) => <article key={record.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
        <div className="min-w-0"><p className="font-bold text-foreground">{record.examTypeName} · {record.modality}</p><p className="mt-1 text-sm text-muted-foreground">{record.unitName} · {record.active ? 'Ativa' : 'Desativada'}</p>{!record.typeActive || !record.unitActive ? <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Unidade ou tipo inativo; médico indisponível para este exame.</p> : null}<p className="mt-1 text-xs text-muted-foreground">{record.reason}</p></div>
        {canManage ? <Button variant="outline" size="sm" disabled={busy} onClick={() => { setTarget(record); setChangeReason('') }}>{record.active ? 'Desativar' : 'Reativar'}</Button> : null}
      </article>)}
    </div>
  </Modal>
}
