import { useMemo, useState, type FormEvent } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Checkbox } from '../../../components/ui/Checkbox'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import type { AccessPermission, AccessRole, SaveAccessRoleInput } from '../access-control.types'

interface AccessRoleModalProps {
  open: boolean
  role: AccessRole | null
  permissions: AccessPermission[]
  saving: boolean
  error: boolean
  onClose: () => void
  onSave: (input: SaveAccessRoleInput) => void
}

export const AccessRoleModal = ({ open, role, permissions, saving, error, onClose, onSave }: AccessRoleModalProps) => {
  const [name, setName] = useState(role?.name ?? '')
  const [description, setDescription] = useState(role?.description ?? '')
  const [selected, setSelected] = useState<string[]>(role?.permissions.map((permission) => permission.code) ?? [])

  const groups = useMemo(() => {
    const result = new Map<string, AccessPermission[]>()
    for (const permission of permissions) {
      result.set(permission.group, [...(result.get(permission.group) ?? []), permission])
    }
    return result
  }, [permissions])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (name.trim().length < 2) return
    onSave({ name: name.trim(), description: description.trim() || undefined, permissionCodes: selected })
  }

  return (
    <Modal
      open={open}
      size="lg"
      title={role ? `Editar cargo — ${role.name}` : 'Criar cargo'}
      description="Defina o nome e as ações permitidas para os usuários deste cargo."
      onClose={onClose}
      dismissible={!saving}
      footer={<><Button variant="ghost" disabled={saving} onClick={onClose}>Cancelar</Button><Button loading={saving} loadingText="Salvando..." type="submit" form="access-role-form">Salvar cargo</Button></>}
    >
      <form id="access-role-form" onSubmit={submit} className="space-y-6">
        {error ? <Alert variant="error">Não foi possível salvar o cargo. Revise os dados e tente novamente.</Alert> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nome do cargo *" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required />
          <Input label="Descrição" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={300} />
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div><h3 className="font-bold text-foreground">Permissões</h3><p className="text-xs text-muted-foreground">{selected.length} selecionada(s)</p></div>
            <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => setSelected(permissions.map((permission) => permission.code))}>Selecionar todas</Button><Button size="sm" variant="ghost" onClick={() => setSelected([])}>Limpar</Button></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[...groups.entries()].map(([group, groupPermissions]) => (
              <fieldset key={group} className="rounded-xl border border-border p-4">
                <legend className="px-1 text-xs font-extrabold tracking-wide text-brand-800 uppercase">{group}</legend>
                <div className="mt-2 space-y-3">
                  {groupPermissions.map((permission) => <Checkbox key={permission.code} checked={selected.includes(permission.code)} label={permission.name} description={permission.code} onChange={(event) => setSelected((current) => event.target.checked ? [...current, permission.code] : current.filter((code) => code !== permission.code))} />)}
                </div>
              </fieldset>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}
