import { NativeSelect as SurfaceNativeSelect } from '@/components/ui/native-select'
import { Card as SurfaceCard } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Checkbox } from '../../../components/ui/Checkbox'
import { useAuthentication } from '../../auth/auth-context'
import { hasPermission } from '../../auth/auth.types'
import { getPresentationSettings, savePresentationSettings } from '../company-api'
import type { DocumentPresentation, PresentationSettings } from '../company.types'

const fields = [
  ['headerText', 'Cabeçalho dos documentos'],
  ['footerText', 'Rodapé dos documentos'],
  ['signatureText', 'Texto padrão da assinatura'],
] as const
const empty = { headerText: '', footerText: '', signatureText: '' }

export const CompanyPresentationEditor = () => {
  const { user } = useAuthentication()
  const active = user?.activeCompany
  const company = user?.companies.find((item) => item.id === active?.id)
  const units =
    company?.units.filter((unit) => active?.allUnits || active?.unitIds.includes(unit.id)) ?? []
  const [unitId, setUnitId] = useState(
    active?.selectedUnitId ?? (active?.allUnits ? '' : (units[0]?.id ?? '')),
  )
  const [settings, setSettings] = useState<PresentationSettings | null>(null)
  const [values, setValues] = useState<DocumentPresentation>(empty)
  const [overrides, setOverrides] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const editable = Boolean(user && hasPermission(user, 'company.settings.manage'))
  useEffect(() => {
    let current = true
    void getPresentationSettings(unitId || undefined)
      .then((result) => {
        if (!current) return
        const raw = unitId ? result.unit.presentation : result.company.presentation
        setSettings(result)
        setValues({ ...empty, ...raw })
        setOverrides(Object.keys(raw))
      })
      .catch(() => {
        if (current) setError('Não foi possível carregar a apresentação.')
      })
    return () => {
      current = false
    }
  }, [unitId])
  const save = async () => {
    if (!settings) return
    setSaving(true)
    setError('')
    setNotice('')
    const presentation = Object.fromEntries(
      fields
        .filter(([key]) => !unitId || overrides.includes(key))
        .map(([key]) => [key, values[key]]),
    )
    try {
      const updated = await savePresentationSettings({
        presentation,
        expectedVersion: unitId ? settings.unit.version : settings.company.version,
        ...(unitId ? { unitId } : {}),
      })
      setSettings(updated)
      setNotice('Apresentação salva para este contexto.')
    } catch {
      setError('Não foi possível salvar. Recarregue a configuração e confira seu acesso.')
    } finally {
      setSaving(false)
    }
  }
  return (
    <SurfaceCard className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm gap-0 py-0 ring-0">
      <h2 className="font-bold text-foreground">Apresentação dos documentos</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A unidade pode personalizar o padrão da empresa. A assinatura pessoal tem prioridade.
      </p>
      <label className="mt-4 block text-sm font-semibold text-muted-foreground">
        Configuração de
        <SurfaceNativeSelect
          aria-label="Contexto da apresentação"
          value={unitId}
          disabled={saving}
          onChange={(event) => {
            setSettings(null)
            setError('')
            setNotice('')
            setUnitId(event.target.value)
          }}
          className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-3"
        >
          <option value="" disabled={!active?.allUnits}>
            Padrão da empresa
          </option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </SurfaceNativeSelect>
      </label>
      {error ? (
        <Alert variant="error" className="mt-4">
          {error}
        </Alert>
      ) : null}
      {notice ? (
        <Alert variant="success" className="mt-4">
          {notice}
        </Alert>
      ) : null}
      <div className="mt-5 grid gap-5">
        {fields.map(([key, label]) => (
          <div key={key} className="space-y-2">
            {unitId ? (
              <Checkbox
                label={'Personalizar ' + label.toLowerCase()}
                checked={overrides.includes(key)}
                disabled={!editable || saving}
                onChange={(event) =>
                  setOverrides(
                    event.target.checked
                      ? [...overrides, key]
                      : overrides.filter((item) => item !== key),
                  )
                }
              />
            ) : null}
            <Input
              label={label}
              value={values[key]}
              maxLength={500}
              placeholder={unitId ? (settings?.company.presentation[key] ?? '') : ''}
              disabled={
                !settings || !editable || saving || Boolean(unitId && !overrides.includes(key))
              }
              onChange={(event) => setValues({ ...values, [key]: event.target.value })}
            />
          </div>
        ))}
      </div>
      {editable ? (
        <Button className="mt-5" loading={saving} disabled={!settings} onClick={() => void save()}>
          Salvar apresentação
        </Button>
      ) : null}
      {settings ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Revisão {unitId ? settings.unit.version : settings.company.version}
        </p>
      ) : null}
    </SurfaceCard>
  )
}
