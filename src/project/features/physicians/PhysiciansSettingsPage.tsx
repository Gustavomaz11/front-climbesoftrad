import { MembershipPortalsModal } from '../companies/components/MembershipPortalsModal'
import { portalAccessLabel } from '../auth/portal-access'
import { Input as SearchInput } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { StatCard } from '@/portal/StatCard'
import { Table as SurfaceTable, TableHeader as SurfaceTableHeader, TableRow as SurfaceTableRow, TableHead as SurfaceTableHead, TableBody as SurfaceTableBody, TableCell as SurfaceTableCell } from '@/components/ui/table'
import { Card as SurfaceCard } from '@/components/ui/card'
import { MembershipUnitsModal } from '../companies/components/MembershipUnitsModal'
import { PhysicianQualificationsModal } from './components/PhysicianQualificationsModal'
import { Ban, LoaderCircle, Plus, RotateCcw, Stethoscope } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { ConfirmActionModal } from '../../components/ui/ConfirmActionModal'
import { useAuthentication } from '../auth/auth-context'
import { hasPermission } from '../auth/auth.types'



import { CreatePhysicianModal } from './components/CreatePhysicianModal'
import type { Physician } from './physician.types'
import { listPhysicians, reactivatePhysician, revokePhysician, resendPhysicianAccessEmail } from './physicians-api'
import { physicianEmailStatus } from './physician-access-email'

const physicianStatus = (physician: Physician) => {
  if (!physician.active) return { label: 'Revogado', color: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' }
  if (physician.mustChangePassword) {
    return { label: 'Aguardando primeiro acesso', color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' }
  }
  return { label: 'Ativo', color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' }
}

export const PhysiciansSettingsPage = ({createOnOpen=false}: {createOnOpen?:boolean}) => {
  const { user } = useAuthentication()
  const navigate = useNavigate()

  const [editingPortals, setEditingPortals] = useState<Physician | null>(null)
  const [editingUnits, setEditingUnits] = useState<Physician | null>(null)
  const [qualificationTarget, setQualificationTarget] = useState<Physician | null>(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(createOnOpen)
  const [physicians, setPhysicians] = useState<Physician[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [actionError, setActionError] = useState(false)
  const [actionTarget, setActionTarget] = useState<Physician | null>(null)
  const [changingStatus, setChangingStatus] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [sendingInvitation, setSendingInvitation] = useState<string | null>(null)
  const [invitationMessage, setInvitationMessage] = useState('')

  useEffect(() => {
    let active = true
    void listPhysicians()
      .then((items) => {
        if (active) setPhysicians(items)
      })
      .catch(() => {
        if (active) setLoadError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [reloadVersion])

  useEffect(() => {
    if (!physicians.some(item => item.accessEmail?.configured && ['PENDING', 'PROCESSING'].includes(item.accessEmail.status))) return
    const timer = window.setInterval(() => setReloadVersion(value => value + 1), 15000)
    return () => window.clearInterval(timer)
  }, [physicians])

  if (!user) return null
  if (!hasPermission(user, 'physicians.view')) return <Navigate to="/dashboard" replace />



  const handleStatusChange = async () => {
    if (!actionTarget) return
    setActionError(false)
    setChangingStatus(true)
    try {
      const updated = actionTarget.active
        ? await revokePhysician(actionTarget.id)
        : await reactivatePhysician(actionTarget.id)
      setPhysicians((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setActionTarget(null)
    } catch {
      setActionError(true)
    } finally {
      setChangingStatus(false)
    }
  }

  const resendInvitation = async (physician: Physician) => {
    setSendingInvitation(physician.id); setInvitationMessage('')
    try {
      const accessEmail = await resendPhysicianAccessEmail(physician.id)
      setPhysicians(items => items.map(item => item.id === physician.id ? { ...item, accessEmail } : item))
      setInvitationMessage(accessEmail.configured ? 'Reenvio do convite solicitado.' : 'O convite aguarda a configuração do serviço de e-mail.')
    } catch { setInvitationMessage('Não foi possível reenviar agora. Aguarde um minuto se o convite acabou de ser enviado.') }
    finally { setSendingInvitation(null) }
  }

  return (
    <div className="contents">

      <div className="min-w-0 flex-1">

        <main className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.1em] text-brand-700 uppercase">
                Gestão
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-foreground">Médicos</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Cadastre os médicos da ClimbeSoftRad e os hospitais em que poderão atender.
              </p>
            </div>
            {hasPermission(user, 'physicians.create') ? (
              <Button leftIcon={<Plus size={18} />} onClick={() => setModalOpen(true)}>
                Cadastrar médico
              </Button>
            ) : null}
          </div>

          {loadError ? <Alert variant="error">Não foi possível carregar os médicos.</Alert> : null}
          {invitationMessage ? <Alert variant="info">{invitationMessage}</Alert> : null}
          {actionError ? (
            <Alert variant="error">Não foi possível alterar o acesso do médico.</Alert>
          ) : null}
          <div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Médicos cadastrados" value={physicians.length} icon={Stethoscope} loading={loading} /><StatCard label="Acessos ativos" value={physicians.filter(item=>item.active).length} icon={Stethoscope} loading={loading} tone="blue" /><StatCard label="Primeiro acesso pendente" value={physicians.filter(item=>item.active && item.mustChangePassword).length} icon={Stethoscope} loading={loading} tone="amber" /></div><div className="relative mb-5 max-w-sm"><Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" /><SearchInput value={search} onChange={event=>setSearch(event.target.value)} aria-label="Buscar médicos" placeholder="Buscar nome, CRM ou e-mail…" className="h-10 bg-card pl-10 text-xs shadow-none" /></div>
          <SurfaceCard className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm gap-0 py-0 ring-0">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-bold text-foreground">Profissionais cadastrados</h2>
                <p className="mt-1 text-xs text-muted-foreground">{physicians.length} médico(s)</p>
              </div>
              {loading ? <LoaderCircle size={19} className="animate-spin text-brand-700" /> : null}
            </div>
            <div className="overflow-x-auto">
              <SurfaceTable className="w-full min-w-[820px] text-left text-sm">
                <SurfaceTableHeader className="bg-muted text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  <SurfaceTableRow>
                    <SurfaceTableHead className="px-5 py-3.5">Médico</SurfaceTableHead>
                    <SurfaceTableHead className="px-4 py-3.5">Especialidade</SurfaceTableHead>
                    <SurfaceTableHead className="px-4 py-3.5">CRM / usuário</SurfaceTableHead>
                    <SurfaceTableHead className="px-4 py-3.5">Status</SurfaceTableHead>
                    <SurfaceTableHead className="px-4 py-3.5 text-right">Ações</SurfaceTableHead>
                  </SurfaceTableRow>
                </SurfaceTableHeader>
                <SurfaceTableBody>
                  {physicians.filter(item => [item.name,item.crm,item.email,item.username].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))).map((physician) => {
                    const status = physicianStatus(physician)
                    return (
                      <SurfaceTableRow key={physician.id} className="border-t border-border">
                        <SurfaceTableCell className="px-5 py-4 text-foreground"><p className="font-bold">{physician.name}</p><p className="mt-1 text-xs text-muted-foreground">{physician.email ?? 'E-mail não informado'}</p><p className="mt-1 text-xs text-muted-foreground">{physicianEmailStatus(physician.accessEmail)}</p></SurfaceTableCell>
                        <SurfaceTableCell className="px-4 py-4 text-muted-foreground">
                          <p className="mb-2 text-xs text-muted-foreground">Portais: {portalAccessLabel(physician.allowedPortals)}</p>
                          {physician.registryProfile?.specialties.join(' · ') || physician.specialty}
                          {physician.registryProfile && <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Estados habilitados: {physician.enabledStates?.join(', ') || 'Nenhum'}</p>}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {physician.allUnits
                              ? 'Todos os hospitais da central'
                              : physician.units
                                  .filter((unit) => unit.active)
                                  .map((unit) => unit.name)
                                  .join(', ') || 'Sem unidades ativas'}
                          </p>
                        </SurfaceTableCell>
                        <SurfaceTableCell className="px-4 py-4 font-semibold text-brand-800">{physician.crm}<p className="mt-1 text-xs font-normal">Usuário: {physician.username ?? physician.crm}</p>{physician.registryProfile?.registrations.map(item=><p key={item.crm+'/'+item.uf} className="mt-1 text-xs font-normal text-muted-foreground">{item.crm}/{item.uf} · {item.status}</p>)}{physician.contactPhone && <p className="mt-1 text-xs font-normal">{physician.contactPhone}</p>}</SurfaceTableCell>
                        <SurfaceTableCell className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold ${status.color}`}
                          >
                            <span className={`size-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </SurfaceTableCell>
                        <SurfaceTableCell className="px-4 py-4 text-right">
                          {hasPermission(user, 'physicians.create') && physician.canManage && physician.active && physician.accessEmail ? <Button variant="outline" size="sm" disabled={sendingInvitation === physician.id || physician.accessEmail.status === 'PROCESSING'} onClick={() => void resendInvitation(physician)} aria-label={`Reenviar e-mail de acesso para ${physician.name}`}>Reenviar e-mail</Button> : null}
                          {hasPermission(user, 'memberships.manage') && physician.canManage ? <Button variant="outline" size="sm" onClick={() => setEditingPortals(physician)}>Portais</Button> : null}
                          {hasPermission(user, 'exam.catalog.view') ? <Button variant="outline" size="sm" onClick={() => setQualificationTarget(physician)}>Habilitações</Button> : null}
                          {hasPermission(user, 'memberships.manage') && physician.canManage ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingUnits(physician)}
                            >
                              Unidades
                            </Button>
                          ) : null}
                          {hasPermission(user, 'physicians.status.manage') &&
                          physician.canManage ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={
                                physician.active ? <Ban size={15} /> : <RotateCcw size={15} />
                              }
                              className={
                                physician.active
                                  ? 'text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400'
                                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400'
                              }
                              onClick={() => setActionTarget(physician)}
                            >
                              {physician.active ? 'Revogar acesso' : 'Reativar acesso'}
                            </Button>
                          ) : null}
                        </SurfaceTableCell>
                      </SurfaceTableRow>
                    )
                  })}
                </SurfaceTableBody>
              </SurfaceTable>
            </div>
            {!loading && physicians.length === 0 ? (
              <div className="grid min-h-56 place-items-center text-center">
                <div>
                  <Stethoscope size={28} className="mx-auto text-muted-foreground" />
                  <p className="mt-3 font-bold text-muted-foreground">Nenhum médico cadastrado</p>
                </div>
              </div>
            ) : null}
          </SurfaceCard>
        </main>
      </div>
      {editingPortals && <MembershipPortalsModal key={editingPortals.membershipId} membershipId={editingPortals.membershipId} name={editingPortals.name} allowedPortals={editingPortals.allowedPortals} onClose={() => setEditingPortals(null)} onSaved={() => setReloadVersion(v => v + 1)} />}
      {editingUnits ? (
        <MembershipUnitsModal
          key={editingUnits.membershipId}
          membershipId={editingUnits.membershipId}
          name={editingUnits.name}
          allUnits={editingUnits.allUnits}
          unitIds={editingUnits.unitIds}
          onClose={() => setEditingUnits(null)}
          onSaved={() => setReloadVersion((value) => value + 1)}
        />
      ) : null}
      {qualificationTarget ? <PhysicianQualificationsModal key={qualificationTarget.id} physician={qualificationTarget} canManage={hasPermission(user, 'physicians.qualifications.manage')} onClose={() => setQualificationTarget(null)} /> : null}
      {modalOpen && <CreatePhysicianModal
        open={modalOpen}
        onClose={() => {setModalOpen(false);if(createOnOpen)navigate('/settings/physicians/list')}}
        onCreated={() => setReloadVersion((value) => value + 1)}
      />}
      <ConfirmActionModal
        open={Boolean(actionTarget)}
        title={actionTarget?.active ? 'Revogar acesso do médico' : 'Reativar acesso do médico'}
        description={
          actionTarget?.active
            ? `O vínculo de ${actionTarget.name} será revogado nesta empresa. O acesso em outras empresas será preservado.`
            : `O médico ${actionTarget?.name ?? ''} voltará a acessar esta empresa com seu CRM e senha atual.`
        }
        confirmLabel={actionTarget?.active ? 'Revogar acesso' : 'Reativar acesso'}
        variant={actionTarget?.active ? 'danger' : 'success'}
        loading={changingStatus}
        loadingText={actionTarget?.active ? 'Revogando...' : 'Reativando...'}
        onClose={() => setActionTarget(null)}
        onConfirm={() => void handleStatusChange()}
      />
    </div>
  )
}
