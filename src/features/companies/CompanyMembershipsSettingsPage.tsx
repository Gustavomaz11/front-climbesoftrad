import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { useAuthentication } from '../auth/auth-context'
import { hasAnyPermission, hasPermission } from '../auth/auth.types'
import { SettingsPageLayout } from '../settings/components/SettingsPageLayout'
import {
  listCompanyMemberships,
  saveMembershipPreferences,
  setMembershipActive,
} from './company-api'
import type { CompanyMembership } from './company.types'
import { MembershipUnitsModal } from './components/MembershipUnitsModal'
import { ProvisionUserModal } from './components/ProvisionUserModal'

export const CompanyMembershipsSettingsPage = () => {
  const { user, refreshUser } = useAuthentication()
  const [memberships, setMemberships] = useState<CompanyMembership[]>([])
  const [reload, setReload] = useState(0)
  const [creating, setCreating] = useState(false)
  const [editingUnits, setEditingUnits] = useState<CompanyMembership | null>(null)
  const [editingSignature, setEditingSignature] = useState<CompanyMembership | null>(null)
  const [signatureText, setSignatureText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const canView = Boolean(user && hasPermission(user, 'users.view'))
  useEffect(() => {
    if (!canView) return
    let active = true
    void listCompanyMemberships()
      .then((items) => {
        if (active) setMemberships(items)
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os vínculos.')
      })
    return () => {
      active = false
    }
  }, [reload, canView])
  if (!user) return null
  if (!hasAnyPermission(user, ['users.view', 'users.create', 'memberships.manage']))
    return <Navigate to="/dashboard" replace />
  const updated = () => {
    setReload((value) => value + 1)
    void refreshUser().catch(() => {})
  }
  const toggle = async (membership: CompanyMembership) => {
    setBusy(true)
    setError('')
    try {
      await setMembershipActive(
        membership.id,
        !membership.active,
        'Alteração de acesso pelo gestor da empresa',
      )
      updated()
    } catch {
      setError('Não foi possível alterar o vínculo neste contexto.')
    } finally {
      setBusy(false)
    }
  }
  const saveSignature = async () => {
    if (!editingSignature) return
    setBusy(true)
    setError('')
    try {
      await saveMembershipPreferences(
        editingSignature.id,
        editingSignature.preferencesVersion,
        signatureText || null,
      )
      setEditingSignature(null)
      updated()
    } catch {
      setError('Não foi possível salvar a assinatura. Recarregue o vínculo.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <SettingsPageLayout
      active="memberships"
      title="Usuários e vínculos"
      description="O acesso e as preferências abaixo valem apenas para a empresa ativa."
    >
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {hasPermission(user, 'users.create') && hasPermission(user, 'roles.view') ? (
        <Button className="mb-4" onClick={() => setCreating(true)}>
          Adicionar usuário
        </Button>
      ) : null}
      <div className="space-y-3">
        {memberships.map((membership) => (
          <article
            key={membership.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="min-w-60 flex-1">
              <h2 className="font-bold text-slate-900">{membership.fullName}</h2>
              <p className="mt-1 text-xs text-slate-500">
                {membership.username || membership.email} · {membership.accessRole.name}
              </p>
              <p className="mt-2 text-xs text-slate-600">
                {membership.allUnits
                  ? 'Todas as unidades da empresa'
                  : membership.units
                      .filter((unit) => unit.active)
                      .map((unit) => unit.name)
                      .join(', ') || 'Sem unidades ativas'}
              </p>
            </div>
            <span
              className={
                'text-xs font-bold ' + (membership.active ? 'text-emerald-700' : 'text-red-700')
              }
            >
              {membership.active ? 'Ativo' : 'Revogado'}
            </span>
            {hasPermission(user, 'memberships.manage') && membership.canManage ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setEditingUnits(membership)}>
                  Unidades
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSignatureText(membership.signatureText ?? '')
                    setEditingSignature(membership)
                  }}
                >
                  Assinatura visual
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => void toggle(membership)}
                >
                  {membership.active ? 'Revogar vínculo' : 'Reativar vínculo'}
                </Button>
              </>
            ) : null}
          </article>
        ))}
      </div>
      {canView && !memberships.length ? (
        <p className="rounded-xl bg-white p-5 text-sm text-slate-500">
          Nenhum vínculo encontrado neste contexto.
        </p>
      ) : null}
      {creating ? (
        <ProvisionUserModal onClose={() => setCreating(false)} onCreated={updated} />
      ) : null}
      {editingUnits ? (
        <MembershipUnitsModal
          key={editingUnits.id}
          membershipId={editingUnits.id}
          name={editingUnits.fullName}
          allUnits={editingUnits.allUnits}
          unitIds={editingUnits.unitIds}
          onClose={() => setEditingUnits(null)}
          onSaved={updated}
        />
      ) : null}
      {editingSignature ? (
        <Modal
          open
          title={'Assinatura visual de ' + editingSignature.fullName}
          description="A apresentação de outras empresas será preservada."
          onClose={() => {
            if (!busy) setEditingSignature(null)
          }}
          footer={
            <Button loading={busy} onClick={() => void saveSignature()}>
              Salvar assinatura visual
            </Button>
          }
        >
          <Input
            label="Texto adicional da assinatura"
            value={signatureText}
            maxLength={500}
            onChange={(event) => setSignatureText(event.target.value)}
          />
        </Modal>
      ) : null}
    </SettingsPageLayout>
  )
}
