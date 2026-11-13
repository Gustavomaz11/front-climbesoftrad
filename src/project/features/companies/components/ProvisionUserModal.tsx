import { NativeSelect as SurfaceNativeSelect } from '@/components/ui/native-select'
import { useEffect, useState } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { listAccessRoles } from '../../access-control/access-control-api'
import type { AccessRole } from '../../access-control/access-control.types'
import { provisionCompanyUser } from '../company-api'
import { MembershipUnitsFields } from './MembershipUnitsFields'

export const ProvisionUserModal = ({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) => {
  const [roles, setRoles] = useState<AccessRole[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState('')
  const [allUnits, setAllUnits] = useState(false)
  const [unitIds, setUnitIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{
    initialPassword: string | null
    existingIdentity: boolean
  } | null>(null)
  useEffect(() => {
    let active = true
    void listAccessRoles()
      .then((items) => {
        if (active) setRoles(items.filter((role) => role.active))
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os cargos.')
      })
    return () => {
      active = false
    }
  }, [])
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const created = await provisionCompanyUser({
        fullName: name.trim(),
        email: email.trim(),
        roleId,
        allUnits,
        unitIds,
      })
      setResult(created)
      onCreated()
    } catch {
      setError(
        'Não foi possível criar o vínculo. Confira o cargo, as unidades e se o usuário já está vinculado.',
      )
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal
      open
      title={result ? 'Acesso preparado' : 'Adicionar usuário'}
      description="Cadastre ou vincule uma pessoa à empresa ativa."
      onClose={() => {
        if (!saving) onClose()
      }}
      footer={
        result ? (
          <Button onClick={onClose}>Concluir</Button>
        ) : (
          <>
            <Button variant="ghost" disabled={saving} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" form="provision-user-form" loading={saving}>
              Adicionar usuário
            </Button>
          </>
        )
      }
    >
      {error ? <Alert variant="error">{error}</Alert> : null}
      {result ? (
        <div className="space-y-3 text-sm text-muted-foreground">
          {result.existingIdentity ? (
            <p>
              A pessoa já possui cadastro e usará a senha atual. Foi criado apenas o vínculo nesta
              empresa.
            </p>
          ) : (
            <>
              <p>
                Login: <strong>{email}</strong>
              </p>
              <p>
                Senha temporária:{' '}
                <code className="break-all rounded bg-background px-2 py-1">
                  {result.initialPassword}
                </code>
              </p>
              <p>
                Guarde a senha temporária antes de fechar. A troca será exigida no primeiro acesso.
              </p>
            </>
          )}
        </div>
      ) : (
        <form
          id="provision-user-form"
          onSubmit={(event) => void submit(event)}
          className="space-y-4"
        >
          <Input
            label="Nome completo"
            value={name}
            required
            minLength={2}
            maxLength={120}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            label="E-mail"
            type="email"
            value={email}
            required
            maxLength={255}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label className="block text-sm font-semibold text-muted-foreground">
            Cargo
            <SurfaceNativeSelect
              aria-label="Cargo do novo usuário"
              value={roleId}
              required
              onChange={(event) => setRoleId(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-input bg-card px-3"
            >
              <option value="">Selecione um cargo</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </SurfaceNativeSelect>
          </label>
          <MembershipUnitsFields
            allUnits={allUnits}
            unitIds={unitIds}
            disabled={saving}
            onChange={(all, ids) => {
              setAllUnits(all)
              setUnitIds(ids)
            }}
          />
        </form>
      )}
    </Modal>
  )
}
