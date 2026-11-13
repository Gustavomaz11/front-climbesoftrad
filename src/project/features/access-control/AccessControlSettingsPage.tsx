import { Table as SurfaceTable, TableHeader as SurfaceTableHeader, TableRow as SurfaceTableRow, TableHead as SurfaceTableHead, TableBody as SurfaceTableBody, TableCell as SurfaceTableCell } from '@/components/ui/table'
import { NativeSelect as SurfaceNativeSelect } from '@/components/ui/native-select'
import { Card as SurfaceCard } from '@/components/ui/card'
import {
  Ban,
  KeyRound,
  LoaderCircle,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { useAuthentication } from '../auth/auth-context'
import { hasAnyPermission, hasPermission } from '../auth/auth.types'



import {
  assignUserAccessRole,
  createAccessRole,
  listAccessPermissions,
  listAccessRoles,
  listAccessUsers,
  setAccessRoleActive,
  updateAccessRole,
} from './access-control-api'
import type {
  AccessPermission,
  AccessRole,
  AccessUser,
  SaveAccessRoleInput,
} from './access-control.types'
import { AccessRoleModal } from './components/AccessRoleModal'

export const AccessControlSettingsPage = () => {
  const { user } = useAuthentication()

  const [roles, setRoles] = useState<AccessRole[]>([])
  const [permissions, setPermissions] = useState<AccessPermission[]>([])
  const [users, setUsers] = useState<AccessUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<AccessRole | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const canViewRoles = Boolean(user && hasPermission(user, 'roles.view'))
  const canViewUsers = Boolean(user && hasPermission(user, 'users.view'))

  useEffect(() => {
    let active = true
    Promise.all([
      canViewRoles ? listAccessRoles() : Promise.resolve([]),
      canViewRoles ? listAccessPermissions() : Promise.resolve([]),
      canViewUsers ? listAccessUsers() : Promise.resolve([]),
    ])
      .then(([nextRoles, nextPermissions, nextUsers]) => {
        if (!active) return
        setRoles(nextRoles)
        setPermissions(nextPermissions)
        setUsers(nextUsers)
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [canViewRoles, canViewUsers])

  if (!user) return null
  if (!hasAnyPermission(user, ['roles.view', 'users.view']))
    return <Navigate to="/dashboard" replace />

  const saveRole = async (input: SaveAccessRoleInput) => {
    setSaving(true)
    setSaveError(false)
    try {
      const saved = editingRole
        ? await updateAccessRole(editingRole.id, input)
        : await createAccessRole(input)
      setRoles((current) =>
        editingRole
          ? current.map((role) => (role.id === saved.id ? saved : role))
          : [...current, saved].sort((a, b) => a.name.localeCompare(b.name)),
      )
      setModalOpen(false)
      setEditingRole(null)
    } catch {
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  const changeRoleStatus = async (role: AccessRole) => {
    setBusyId(role.id)
    try {
      const updated = await setAccessRoleActive(role.id, !role.active)
      setRoles((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    } catch {
      setError(true)
    } finally {
      setBusyId(null)
    }
  }

  const assignRole = async (accessUser: AccessUser, roleId: string) => {
    setBusyId(accessUser.id)
    try {
      await assignUserAccessRole(accessUser.id, roleId)
      const role = roles.find((item) => item.id === roleId)
      if (role)
        setUsers((current) =>
          current.map((item) => (item.id === accessUser.id ? { ...item, accessRole: role } : item)),
        )
    } catch {
      setError(true)
    } finally {
      setBusyId(null)
    }
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
              <h1 className="mt-2 text-3xl font-extrabold text-foreground">Cargos e permissões</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Controle o que cada equipe pode visualizar e alterar.
              </p>
            </div>
            {hasPermission(user, 'roles.create') &&
            hasPermission(user, 'roles.permissions.manage') ? (
              <Button
                leftIcon={<Plus size={18} />}
                onClick={() => {
                  setEditingRole(null)
                  setSaveError(false)
                  setModalOpen(true)
                }}
              >
                Criar cargo
              </Button>
            ) : null}
          </div>

          {error ? (
            <Alert variant="error">
              Uma operação não pôde ser concluída. Atualize a página e tente novamente.
            </Alert>
          ) : null}
          {loading ? (
            <div className="grid min-h-72 place-items-center">
              <LoaderCircle className="animate-spin text-brand-700" />
            </div>
          ) : (
            <div className="space-y-6">
              {hasPermission(user, 'roles.view') ? (
                <SurfaceCard className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm gap-0 py-0 ring-0">
                  <header className="flex items-center gap-3 border-b border-border px-5 py-4">
                    <ShieldCheck className="text-brand-700" size={21} />
                    <div>
                      <h2 className="font-bold text-foreground">Cargos cadastrados</h2>
                      <p className="text-xs text-muted-foreground">
                        O cargo Administrador é permanente e possui acesso total.
                      </p>
                    </div>
                  </header>
                  <div className="divide-y divide-slate-100">
                    {roles.map((role) => (
                      <article
                        key={role.id}
                        className="flex flex-wrap items-center gap-4 px-5 py-4"
                      >
                        <div className="min-w-56 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-foreground">{role.name}</h3>
                            {role.immutable ? (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-bold text-brand-800">
                                Permanente
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {role.description || 'Sem descrição'} · {role.permissions.length}{' '}
                            permissões · {role.userCount} usuários
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold ${role.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                        >
                          {role.active ? 'Ativo' : 'Revogado'}
                        </span>
                        {!role.immutable &&
                        hasPermission(user, 'roles.edit') &&
                        hasPermission(user, 'roles.permissions.manage') ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Pencil size={15} />}
                            onClick={() => {
                              setEditingRole(role)
                              setSaveError(false)
                              setModalOpen(true)
                            }}
                          >
                            Editar
                          </Button>
                        ) : null}
                        {!role.immutable && hasPermission(user, 'roles.status.manage') ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={busyId === role.id}
                            leftIcon={role.active ? <Ban size={15} /> : <RotateCcw size={15} />}
                            className={role.active ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}
                            onClick={() => void changeRoleStatus(role)}
                          >
                            {role.active ? 'Revogar' : 'Reativar'}
                          </Button>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </SurfaceCard>
              ) : null}

              {hasPermission(user, 'users.view') ? (
                <SurfaceCard className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm gap-0 py-0 ring-0">
                  <header className="flex items-center gap-3 border-b border-border px-5 py-4">
                    <Users className="text-brand-700" size={21} />
                    <div>
                      <h2 className="font-bold text-foreground">Usuários e cargos</h2>
                      <p className="text-xs text-muted-foreground">
                        A troca de cargo altera imediatamente o acesso nesta empresa e preserva as
                        outras.
                      </p>
                    </div>
                  </header>
                  <div className="overflow-x-auto">
                    <SurfaceTable className="w-full min-w-[760px] text-left text-sm">
                      <SurfaceTableHeader className="bg-muted text-xs font-bold tracking-wide text-muted-foreground uppercase">
                        <SurfaceTableRow>
                          <SurfaceTableHead className="px-5 py-3.5">Usuário</SurfaceTableHead>
                          <SurfaceTableHead className="px-4 py-3.5">Login</SurfaceTableHead>
                          <SurfaceTableHead className="px-4 py-3.5">Status</SurfaceTableHead>
                          <SurfaceTableHead className="px-5 py-3.5">Cargo</SurfaceTableHead>
                        </SurfaceTableRow>
                      </SurfaceTableHeader>
                      <SurfaceTableBody>
                        {users.map((accessUser) => (
                          <SurfaceTableRow key={accessUser.id} className="border-t border-border">
                            <SurfaceTableCell className="px-5 py-4 font-bold text-foreground">
                              {accessUser.fullName}
                            </SurfaceTableCell>
                            <SurfaceTableCell className="px-4 py-4 text-muted-foreground">
                              {accessUser.username || accessUser.email}
                            </SurfaceTableCell>
                            <SurfaceTableCell className="px-4 py-4">
                              <span
                                className={
                                  accessUser.status === 'ACTIVE'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-red-600 dark:text-red-400'
                                }
                              >
                                {accessUser.status === 'ACTIVE' ? 'Ativo' : 'Revogado'}
                              </span>
                            </SurfaceTableCell>
                            <SurfaceTableCell className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <KeyRound size={15} className="text-muted-foreground" />
                                <SurfaceNativeSelect
                                  aria-label={`Cargo de ${accessUser.fullName}`}
                                  className="h-10 min-w-52 rounded-xl border border-input bg-card px-3 font-semibold text-muted-foreground"
                                  value={accessUser.accessRole.id}
                                  disabled={
                                    !hasPermission(user, 'users.roles.assign') ||
                                    accessUser.role === 'ADMIN' ||
                                    busyId === accessUser.id
                                  }
                                  onChange={(event) =>
                                    void assignRole(accessUser, event.target.value)
                                  }
                                >
                                  {roles
                                    .filter(
                                      (role) => role.active || role.id === accessUser.accessRole.id,
                                    )
                                    .map((role) => (
                                      <option key={role.id} value={role.id}>
                                        {role.name}
                                        {role.active ? '' : ' (revogado)'}
                                      </option>
                                    ))}
                                </SurfaceNativeSelect>
                              </div>
                            </SurfaceTableCell>
                          </SurfaceTableRow>
                        ))}
                      </SurfaceTableBody>
                    </SurfaceTable>
                  </div>
                </SurfaceCard>
              ) : null}
            </div>
          )}
        </main>
      </div>
      {modalOpen ? (
        <AccessRoleModal
          open
          role={editingRole}
          permissions={permissions}
          saving={saving}
          error={saveError}
          onClose={() => {
            if (!saving) setModalOpen(false)
          }}
          onSave={(input) => void saveRole(input)}
        />
      ) : null}
    </div>
  )
}
