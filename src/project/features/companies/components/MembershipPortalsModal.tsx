import { useState } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { useAuthentication } from '../../auth/auth-context'
import type { PortalKind } from '../../auth/portal-access'
import { saveMembershipPortals } from '../company-api'
import { PortalAccessFields } from './PortalAccessFields'

export const MembershipPortalsModal = ({ membershipId, name, allowedPortals, onClose, onSaved }: {
  membershipId: string; name: string; allowedPortals: PortalKind[]; onClose: () => void; onSaved: () => void
}) => {
  const { refreshUser } = useAuthentication()
  const [value, setValue] = useState<PortalKind[]>(allowedPortals)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const submit = async () => {
    if (!value.length) { setError('Selecione ao menos um portal.'); return }
    setSaving(true); setError('')
    try {
      await saveMembershipPortals(membershipId, value)
      onSaved(); onClose()
      await refreshUser()
    } catch { setError('Não foi possível alterar os portais. Recarregue e confira sua permissão de gestão.') }
    finally { setSaving(false) }
  }
  return <Modal open title="Portais autorizados" description={`Acesso de ${name}`} onClose={() => { if (!saving) onClose() }}
    footer={<><Button variant="ghost" disabled={saving} onClick={onClose}>Cancelar</Button><Button loading={saving} onClick={() => void submit()}>Salvar portais</Button></>}>
    {error && <Alert variant="error">{error}</Alert>}
    <PortalAccessFields value={value} onChange={setValue} disabled={saving} />
  </Modal>
}
