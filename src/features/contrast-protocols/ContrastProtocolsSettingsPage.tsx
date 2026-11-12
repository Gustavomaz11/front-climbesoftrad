import { ContrastProtocolList } from './components/ContrastProtocolList'
import { useEffect, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { useAuthentication } from '../auth/auth-context'
import { hasPermission } from '../auth/auth.types'
import { SettingsPageLayout } from '../settings/components/SettingsPageLayout'
import { getExamCatalog } from '../exam-catalog/exam-catalog-api'
import type { ExamType } from '../exam-catalog/exam-catalog.types'
import { listPhysicians } from '../physicians/physicians-api'
import type { Physician } from '../physicians/physician.types'
import {
  activateContrastProtocol,
  listContrastProtocols,
  retireContrastProtocol,
} from './contrast-protocol-api'
import type { ContrastProtocol } from './contrast-protocol.types'
import { ContrastProtocolForm } from './components/ContrastProtocolForm'
export const ContrastProtocolsSettingsPage = () => {
  const { user } = useAuthentication()
  const [items, setItems] = useState<ContrastProtocol[]>([]),
    [types, setTypes] = useState<ExamType[]>([]),
    [physicians, setPhysicians] = useState<Physician[]>([]),
    [form, setForm] = useState<ContrastProtocol | null | undefined>(),
    [target, setTarget] = useState<ContrastProtocol | null>(null),
    [physicianId, setPhysician] = useState(''),
    [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [reload, setReload] = useState(0)
  const canView = Boolean(user && hasPermission(user, 'contrast.protocols.view')),
    canActivate = Boolean(user && hasPermission(user, 'contrast.protocols.activate'))
  useEffect(() => {
    if (!canView) return
    let active = true
    void Promise.all([
      listContrastProtocols(),
      user && hasPermission(user, 'exam.catalog.view')
        ? getExamCatalog()
        : Promise.resolve({ types: [] }),
      canActivate && user && hasPermission(user, 'physicians.view')
        ? listPhysicians()
        : Promise.resolve([]),
    ])
      .then(([protocols, catalog, doctors]) => {
        if (active) {
          setItems(protocols)
          setTypes(catalog.types)
          setPhysicians(doctors)
          setError('')
        }
      })
      .catch(() => {
        if (active) setError('Não foi possível consultar os protocolos.')
      })
    return () => {
      active = false
    }
  }, [canView, canActivate, user, reload])
  if (!user) return null
  if (!canView) return <Navigate to="/dashboard" replace />
  const company = user.companies.find((item) => item.id === user.activeCompany?.id),
    units = (company?.units ?? []).filter(
      (unit) =>
        unit.active &&
        (!user.activeCompany?.selectedUnitId || unit.id === user.activeCompany.selectedUnitId),
    )
  const change = async (event: FormEvent) => {
    event.preventDefault()
    if (!target) return
    setBusy(true)
    setError('')
    try {
      if (target.status === 'DRAFT') await activateContrastProtocol(target, physicianId, reason)
      else await retireContrastProtocol(target, reason)
      setTarget(null)
      setReload((value) => value + 1)
    } catch {
      setError('Confira a revisão clínica, o vínculo do médico, o escopo e a versão do protocolo.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <SettingsPageLayout
      active="contrast-protocols"
      title="Protocolos de contraste"
      description="Cadastre versões e registre a revisão dos responsáveis clínicos."
    >
      <div className="space-y-4">
        {hasPermission(user, 'contrast.protocols.manage') ? (
          <Button onClick={() => setForm(null)}>Novo protocolo</Button>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <ContrastProtocolList
          items={items}
          types={types}
          units={company?.units ?? []}
          canManage={hasPermission(user, 'contrast.protocols.manage')}
          canActivate={canActivate}
          onVersion={setForm}
          onLifecycle={(record) => {
            setTarget(record)
            setReason('')
            setPhysician('')
          }}
        />
        {!items.length ? (
          <p className="text-sm text-slate-500">Nenhum protocolo cadastrado.</p>
        ) : null}
      </div>
      {form !== undefined ? (
        <ContrastProtocolForm
          previous={form}
          types={types}
          units={units}
          allUnits={Boolean(user.activeCompany?.allUnits)}
          onClose={() => setForm(undefined)}
          onSaved={() => {
            setForm(undefined)
            setReload((value) => value + 1)
          }}
        />
      ) : null}
      <Modal
        open={Boolean(target)}
        title={target?.status === 'DRAFT' ? 'Registrar revisão clínica' : 'Desativar protocolo'}
        dismissible={!busy}
        onClose={() => setTarget(null)}
      >
        <form onSubmit={(event) => void change(event)} className="space-y-4">
          {target?.status === 'DRAFT' ? (
            <>
              <p className="text-sm text-slate-600">
                Registre a referência de uma revisão já realizada pelo responsável clínico.
              </p>
              <label className="block text-sm font-semibold">
                Responsável clínico
                <select
                  aria-label="Responsável clínico"
                  value={physicianId}
                  onChange={(event) => setPhysician(event.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border p-2"
                >
                  <option value="">Selecione</option>
                  {physicians
                    .filter((physician) => physician.active)
                    .map((physician) => (
                      <option key={physician.id} value={physician.id}>
                        {physician.name} · {physician.crm}
                      </option>
                    ))}
                </select>
              </label>
            </>
          ) : null}
          <Input
            label={
              target?.status === 'DRAFT'
                ? 'Referência da revisão clínica'
                : 'Justificativa da desativação'
            }
            required
            minLength={3}
            maxLength={500}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          <Button type="submit" disabled={busy}>
            {busy ? 'Salvando...' : 'Confirmar'}
          </Button>
        </form>
      </Modal>
    </SettingsPageLayout>
  )
}
