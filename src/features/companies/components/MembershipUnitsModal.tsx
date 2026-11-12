import { useState } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { saveMembershipUnits } from '../company-api'
import { MembershipUnitsFields } from './MembershipUnitsFields'

export const MembershipUnitsModal = ({
  membershipId,
  name,
  allUnits: initialAll,
  unitIds: initialIds,
  onClose,
  onSaved,
}: {
  membershipId: string
  name: string
  allUnits: boolean
  unitIds: string[]
  onClose: () => void
  onSaved: () => void
}) => {
  const [allUnits, setAllUnits] = useState(initialAll)
  const [unitIds, setUnitIds] = useState(initialIds)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  const save = async () => {
    setSaving(true)
    setError(false)
    try {
      await saveMembershipUnits(membershipId, allUnits, unitIds)
      onSaved()
      onClose()
    } catch {
      setError(true)
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal
      open
      title={'Unidades de ' + name}
      description="A alteração vale apenas para a empresa ativa."
      onClose={() => {
        if (!saving) onClose()
      }}
      footer={
        <>
          <Button variant="ghost" disabled={saving} onClick={onClose}>
            Cancelar
          </Button>
          <Button loading={saving} onClick={() => void save()}>
            Salvar vínculos
          </Button>
        </>
      }
    >
      {error ? (
        <Alert variant="error">
          Não foi possível salvar. Confira as unidades que você pode administrar.
        </Alert>
      ) : null}
      <MembershipUnitsFields
        allUnits={allUnits}
        unitIds={unitIds}
        disabled={saving}
        onChange={(all, ids) => {
          setAllUnits(all)
          setUnitIds(ids)
        }}
      />
    </Modal>
  )
}
