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
import { AppSidebar } from '../exams/components/AppSidebar'
import { DashboardHeader } from '../exams/components/DashboardHeader'
import { SettingsNavigation } from '../settings/components/SettingsNavigation'
import { CreatePhysicianModal } from './components/CreatePhysicianModal'
import type { Physician } from './physician.types'
import { listPhysicians, reactivatePhysician, revokePhysician } from './physicians-api'

const physicianStatus = (physician: Physician) => {
  if (!physician.active) return { label: 'Revogado', color: 'text-red-700', dot: 'bg-red-500' }
  if (physician.mustChangePassword) {
    return { label: 'Aguardando primeiro acesso', color: 'text-amber-700', dot: 'bg-amber-500' }
  }
  return { label: 'Ativo', color: 'text-emerald-700', dot: 'bg-emerald-500' }
}

export const PhysiciansSettingsPage = ({createOnOpen=false}: {createOnOpen?:boolean}) => {
  const { user, logout } = useAuthentication()
  const navigate = useNavigate()
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [editingUnits, setEditingUnits] = useState<Physician | null>(null)
  const [qualificationTarget, setQualificationTarget] = useState<Physician | null>(null)
  const [modalOpen, setModalOpen] = useState(createOnOpen)
  const [physicians, setPhysicians] = useState<Physician[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [actionError, setActionError] = useState(false)
  const [actionTarget, setActionTarget] = useState<Physician | null>(null)
  const [changingStatus, setChangingStatus] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)

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

  if (!user) return null
  if (!hasPermission(user, 'physicians.view')) return <Navigate to="/dashboard" replace />

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

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

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AppSidebar
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        userRole={user.role}
        userPermissions={user.permissions}
        activeItem="physicians"
      />
      <div className="min-w-0 flex-1">
        <DashboardHeader
          userName={user.fullName}
          userRole={user.role}
          onOpenNavigation={() => setNavigationOpen(true)}
          onLogout={() => void handleLogout()}
        />
        <main className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.1em] text-brand-700 uppercase">
                Gestão
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-950">Médicos</h1>
              <p className="mt-1 text-sm text-slate-500">
                Cadastre os médicos da SouRad e os hospitais em que poderão atender.
              </p>
            </div>
            {hasPermission(user, 'physicians.create') ? (
              <Button leftIcon={<Plus size={18} />} onClick={() => setModalOpen(true)}>
                Cadastrar médico
              </Button>
            ) : null}
          </div>
          <SettingsNavigation active="physicians" />
          {loadError ? <Alert variant="error">Não foi possível carregar os médicos.</Alert> : null}
          {actionError ? (
            <Alert variant="error">Não foi possível alterar o acesso do médico.</Alert>
          ) : null}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-900">Profissionais cadastrados</h2>
                <p className="mt-1 text-xs text-slate-500">{physicians.length} médico(s)</p>
              </div>
              {loading ? <LoaderCircle size={19} className="animate-spin text-brand-700" /> : null}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3.5">Médico</th>
                    <th className="px-4 py-3.5">Especialidade</th>
                    <th className="px-4 py-3.5">CRM / usuário</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {physicians.map((physician) => {
                    const status = physicianStatus(physician)
                    return (
                      <tr key={physician.id} className="border-t border-slate-100">
                        <td className="px-5 py-4 font-bold text-slate-900">{physician.name}</td>
                        <td className="px-4 py-4 text-slate-600">
                          {physician.registryProfile?.specialties.join(' · ') || physician.specialty}
                          {physician.registryProfile && <p className="mt-1 text-xs text-emerald-800">Estados habilitados: {physician.enabledStates?.join(', ') || 'Nenhum'}</p>}
                          <p className="mt-1 text-xs text-slate-500">
                            {physician.allUnits
                              ? 'Todos os hospitais da SouRad'
                              : physician.units
                                  .filter((unit) => unit.active)
                                  .map((unit) => unit.name)
                                  .join(', ') || 'Sem unidades ativas'}
                          </p>
                        </td>
                        <td className="px-4 py-4 font-semibold text-brand-800">{physician.crm}{physician.registryProfile?.registrations.map(item=><p key={item.crm+'/'+item.uf} className="mt-1 text-xs font-normal text-slate-600">{item.crm}/{item.uf} · {item.status}</p>)}{physician.contactPhone && <p className="mt-1 text-xs font-normal">{physician.contactPhone}</p>}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold ${status.color}`}
                          >
                            <span className={`size-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
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
                                  ? 'text-red-700 hover:bg-red-50 hover:text-red-800'
                                  : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
                              }
                              onClick={() => setActionTarget(physician)}
                            >
                              {physician.active ? 'Revogar acesso' : 'Reativar acesso'}
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {!loading && physicians.length === 0 ? (
              <div className="grid min-h-56 place-items-center text-center">
                <div>
                  <Stethoscope size={28} className="mx-auto text-slate-400" />
                  <p className="mt-3 font-bold text-slate-700">Nenhum médico cadastrado</p>
                </div>
              </div>
            ) : null}
          </section>
        </main>
      </div>
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
