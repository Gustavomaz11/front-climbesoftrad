import { useEffect, useState } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { useAuthentication } from '../../auth/auth-context'
import { hasPermission } from '../../auth/auth.types'
import { listCompanyMemberships } from '../company-api'
import type { CompanyMembership } from '../company.types'
import { MembershipUnitsModal } from './MembershipUnitsModal'

export const UnitMembersModal = ({
  unitId,
  unitName,
  onClose,
}: {
  unitId: string
  unitName: string
  onClose: () => void
}) => {
  const { user } = useAuthentication()
  const [members, setMembers] = useState<CompanyMembership[]>([])
  const [editing, setEditing] = useState<CompanyMembership | null>(null)
  const [reload, setReload] = useState(0)
  const [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    void listCompanyMemberships()
      .then((items) => {
        if (active)
          setMembers(items.filter((item) => item.allUnits || item.unitIds.includes(unitId)))
      })
      .catch(() => {
        if (active) setError(true)
      })
    return () => {
      active = false
    }
  }, [unitId, reload])
  return (
    <>
      <Modal
        open
        title={'Usuários de ' + unitName}
        description="Consulte profissionais e equipes vinculados a esta unidade."
        onClose={onClose}
        size="lg"
      >
        {error ? <Alert variant="error">Não foi possível consultar os vínculos.</Alert> : null}
        <div className="space-y-3">
          {members.map((member) => (
            <article
              key={member.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">{member.fullName}</p>
                <p className="text-xs text-slate-500">
                  {member.accessRole.name} · {member.active ? 'Ativo' : 'Revogado'}
                </p>
              </div>
              {user && hasPermission(user, 'memberships.manage') && member.canManage ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(member)}>
                  Editar unidades
                </Button>
              ) : null}
            </article>
          ))}
        </div>
        {!members.length && !error ? (
          <p className="py-4 text-sm text-slate-500">Nenhum vínculo encontrado.</p>
        ) : null}
      </Modal>
      {editing ? (
        <MembershipUnitsModal
          key={editing.id}
          membershipId={editing.id}
          name={editing.fullName}
          allUnits={editing.allUnits}
          unitIds={editing.unitIds}
          onClose={() => setEditing(null)}
          onSaved={() => setReload((value) => value + 1)}
        />
      ) : null}
    </>
  )
}
