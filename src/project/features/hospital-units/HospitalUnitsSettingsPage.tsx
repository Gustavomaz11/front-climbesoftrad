import { Input as SearchInput } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { StatCard } from '@/portal/StatCard'
import { Table as SurfaceTable, TableHeader as SurfaceTableHeader, TableRow as SurfaceTableRow, TableHead as SurfaceTableHead, TableBody as SurfaceTableBody, TableCell as SurfaceTableCell } from '@/components/ui/table'
import { Card as SurfaceCard } from '@/components/ui/card'
import { UnitMembersModal } from '../companies/components/UnitMembersModal'
import { Ban, Building2, LoaderCircle, Plus, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { ConfirmActionModal } from '../../components/ui/ConfirmActionModal'
import { useAuthentication } from '../auth/auth-context'
import { hasPermission } from '../auth/auth.types'



import { CreateHospitalUnitModal } from './components/CreateHospitalUnitModal'
import type { HospitalUnit } from './hospital-unit.types'
import {
  listHospitalUnitsForAdministration,
  reactivateHospitalUnit,
  revokeHospitalUnit,
  downloadRouterInstaller,
} from './hospital-units-api'

export const HospitalUnitsSettingsPage = ({createOnOpen=false}: {createOnOpen?:boolean}) => {
  const { user, refreshUser } = useAuthentication()
  const navigate = useNavigate()

  const [membersUnit, setMembersUnit] = useState<HospitalUnit | null>(null)
  const [editingUnit, setEditingUnit] = useState<HospitalUnit | null>(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(createOnOpen)
  const [units, setUnits] = useState<HospitalUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [actionError, setActionError] = useState(false)
  const [actionTarget, setActionTarget] = useState<HospitalUnit | null>(null)
  const [changingStatus, setChangingStatus] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState('')

  useEffect(() => {
    let active = true
    const load = () => void listHospitalUnitsForAdministration()
      .then((items) => {
        if (active) { setUnits(items); setLoadError(false) }
      })
      .catch(() => {
        if (active) setLoadError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    load()
    const timer = window.setInterval(load, 10000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [reloadVersion])
  const download = async (unit: HospitalUnit) => {
    setDownloading(unit.id); setDownloadError('')
    try { await downloadRouterInstaller(unit) }
    catch { setDownloadError('Não foi possível preparar o Router. Confira a conexão e a configuração HTTPS da plataforma e tente novamente.') }
    finally { setDownloading(null) }
  }

  if (!user) return null
  if (!hasPermission(user, 'units.view')) return <Navigate to="/dashboard" replace />



  const handleStatusChange = async () => {
    if (!actionTarget) return
    setActionError(false)
    setChangingStatus(true)
    try {
      const updated = actionTarget.active
        ? await revokeHospitalUnit(actionTarget.id)
        : await reactivateHospitalUnit(actionTarget.id)
      setUnits((current) => current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)))
      setActionTarget(null)
      void refreshUser().catch(() => {})
    } catch {
      setActionError(true)
    } finally {
      setChangingStatus(false)
    }
  }

  return (
    <div className="contents">

      <div className="min-w-0 flex-1">

        <main className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.1em] text-brand-700 uppercase">
                Configurações
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-foreground">Unidades</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Cadastre as unidades hospitalares de origem dos pacientes e exames.
              </p>
            </div>
            {hasPermission(user, 'units.create') ? (
              <Button
                leftIcon={<Plus size={18} />}
                onClick={() => {
                  setEditingUnit(null)
                  setModalOpen(true)
                }}
              >
                Cadastrar unidade
              </Button>
            ) : null}
          </div>

          {downloadError && <Alert variant="error">{downloadError}</Alert>}
          {loadError ? <Alert variant="error">Não foi possível carregar as unidades.</Alert> : null}
          {actionError ? (
            <Alert variant="error">Não foi possível alterar o status da unidade.</Alert>
          ) : null}
          <div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Hospitais cadastrados" value={units.length} icon={Building2} loading={loading} /><StatCard label="Unidades ativas" value={units.filter(item=>item.active).length} icon={Building2} loading={loading} tone="blue" /><StatCard label="Routers online" value={units.filter(item=>item.active && item.router?.status==='ONLINE').length} icon={Building2} loading={loading} tone="violet" /></div><div className="relative mb-5 max-w-sm"><Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" /><SearchInput value={search} onChange={event=>setSearch(event.target.value)} aria-label="Buscar unidades" placeholder="Buscar hospital, identificador ou CNPJ…" className="h-10 bg-card pl-10 text-xs shadow-none" /></div>
          <SurfaceCard className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm gap-0 py-0 ring-0">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-bold text-foreground">Unidades cadastradas</h2>
                <p className="mt-1 text-xs text-muted-foreground">{units.length} unidade(s)</p>
              </div>
              {loading ? <LoaderCircle size={19} className="animate-spin text-brand-700" /> : null}
            </div>
            <div className="overflow-x-auto">
              <SurfaceTable className="w-full min-w-[640px] text-left text-sm">
                <SurfaceTableHeader className="bg-muted text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  <SurfaceTableRow>
                    <SurfaceTableHead className="px-5 py-3.5">Unidade hospitalar</SurfaceTableHead>
                    <SurfaceTableHead className="px-4 py-3.5">Status</SurfaceTableHead>
                    <SurfaceTableHead className="px-4 py-3.5">Router</SurfaceTableHead>
                    <SurfaceTableHead className="px-4 py-3.5 text-right">Ações</SurfaceTableHead>
                  </SurfaceTableRow>
                </SurfaceTableHeader>
                <SurfaceTableBody>
                  {units.filter(item => [item.name,item.internalIdentifier,item.cnpj,item.legalName].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))).map((unit) => (
                    <SurfaceTableRow key={unit.id} className="border-t border-border">
                      <SurfaceTableCell className="px-5 py-4 font-bold text-foreground">{unit.name}<p className="mt-1 text-xs font-normal text-muted-foreground">{unit.internalIdentifier ? `Identificador: ${unit.internalIdentifier}` : 'Identificador interno não informado'}</p><p className="mt-1 text-xs font-normal text-muted-foreground">{unit.cnpj ? `CNPJ: ${unit.cnpj} · ` : ''}{unit.uf ? `UF: ${unit.uf}` : 'UF não informada'}</p>{unit.legalName && <details className="mt-2 text-xs font-normal text-muted-foreground"><summary className="cursor-pointer">Dados cadastrais</summary><p className="mt-2">{unit.legalName}</p><p>{unit.address?.street}, {unit.address?.number} · {unit.address?.neighborhood}</p><p>{unit.address?.city} · CEP {unit.address?.zipCode}</p><p>{unit.contactPhone} · {unit.contactEmail}</p></details>}</SurfaceTableCell>
                      <SurfaceTableCell className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold ${unit.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${unit.active ? 'bg-emerald-500' : 'bg-red-500'}`}
                          />
                          {unit.active ? 'Ativa' : 'Revogada'}
                        </span>
                      </SurfaceTableCell>
                      <SurfaceTableCell className="px-4 py-4"><p className={`text-xs font-bold ${unit.active && unit.router?.status === 'ONLINE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>{unit.active && unit.router?.status === 'ONLINE' ? 'Online' : unit.router?.installed ? 'Offline' : 'Não instalado'}</p>{unit.router?.lastSeenAt && <p className="mt-1 text-xs text-muted-foreground">Última conexão: {new Date(unit.router.lastSeenAt).toLocaleString('pt-BR')}</p>}</SurfaceTableCell>
                      <SurfaceTableCell className="px-4 py-4 text-right">
                        {hasPermission(user, 'units.create') && <Button variant="outline" size="sm" disabled={!unit.active || downloading !== null} onClick={() => void download(unit)}>{downloading === unit.id ? 'Preparando Router…' : 'Baixar Router Instalável'}</Button>}
                        {hasPermission(user, 'units.create') ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUnit(unit)
                              setModalOpen(true)
                            }}
                          >
                            Editar
                          </Button>
                        ) : null}
                        {hasPermission(user, 'users.view') ? (
                          <Button variant="outline" size="sm" onClick={() => setMembersUnit(unit)}>
                            Usuários e médicos
                          </Button>
                        ) : null}
                        {hasPermission(user, 'units.status.manage') ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={unit.active ? <Ban size={15} /> : <RotateCcw size={15} />}
                            className={
                              unit.active
                                ? 'text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400'
                                : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400'
                            }
                            onClick={() => setActionTarget(unit)}
                          >
                            {unit.active ? 'Revogar unidade' : 'Reativar unidade'}
                          </Button>
                        ) : null}
                      </SurfaceTableCell>
                    </SurfaceTableRow>
                  ))}
                </SurfaceTableBody>
              </SurfaceTable>
            </div>
            {!loading && units.length === 0 ? (
              <div className="grid min-h-56 place-items-center text-center">
                <div>
                  <Building2 size={28} className="mx-auto text-muted-foreground" />
                  <p className="mt-3 font-bold text-muted-foreground">Nenhuma unidade cadastrada</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Cadastre uma unidade para adicioná-la aos exames.
                  </p>
                </div>
              </div>
            ) : null}
          </SurfaceCard>
        </main>
      </div>
      {membersUnit ? (
        <UnitMembersModal
          unitId={membersUnit.id}
          unitName={membersUnit.name}
          onClose={() => setMembersUnit(null)}
        />
      ) : null}
      <CreateHospitalUnitModal
        unit={editingUnit}
        open={modalOpen}
        onClose={() => {setModalOpen(false);if(createOnOpen)navigate('/settings/units/list')}}
        onCreated={() => {
          setReloadVersion((value) => value + 1)
          void refreshUser().catch(() => {})
        }}
      />
      <ConfirmActionModal
        open={Boolean(actionTarget)}
        title={actionTarget?.active ? 'Revogar unidade' : 'Reativar unidade'}
        description={
          actionTarget?.active
            ? `A unidade ${actionTarget.name} deixará de aparecer na seleção de novos exames. Os exames existentes serão preservados.`
            : `A unidade ${actionTarget?.name ?? ''} voltará a aparecer na seleção de novos exames.`
        }
        confirmLabel={actionTarget?.active ? 'Revogar unidade' : 'Reativar unidade'}
        variant={actionTarget?.active ? 'danger' : 'success'}
        loading={changingStatus}
        loadingText={actionTarget?.active ? 'Revogando...' : 'Reativando...'}
        onClose={() => setActionTarget(null)}
        onConfirm={() => void handleStatusChange()}
      />
    </div>
  )
}
