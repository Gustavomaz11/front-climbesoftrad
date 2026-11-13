import { ExamPriceTables } from './components/ExamPriceTables'
import { useEffect, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { useAuthentication } from '../auth/auth-context'
import { hasPermission } from '../auth/auth.types'
import { SettingsPageLayout } from '../settings/components/SettingsPageLayout'
import { getExamCatalog } from '../exam-catalog/exam-catalog-api'
import type { ExamType } from '../exam-catalog/exam-catalog.types'
import { listPhysicians } from '../physicians/physicians-api'
import type { Physician } from '../physicians/physician.types'
import { closeExamPrice, listExamPrices, type ExamPriceRule } from './exam-pricing-api'
import { ExamPriceForm } from './components/ExamPriceForm'
export const ExamPricingSettingsPage = () => {
  const { user } = useAuthentication()
  const [items, setItems] = useState<ExamPriceRule[]>([]),
    [types, setTypes] = useState<ExamType[]>([]),
    [physicians, setPhysicians] = useState<Physician[]>([]),
    [creating, setCreating] = useState(false),
    [target, setTarget] = useState<ExamPriceRule | null>(null),
    [validTo, setEnd] = useState(''),
    [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [reload, setReload] = useState(0)
  const canView = Boolean(user && user.role !== 'DOCTOR' && hasPermission(user, 'exam.prices.view'))
  useEffect(() => {
    if (!canView) return
    let active = true
    void Promise.all([
      listExamPrices(),
      user && hasPermission(user, 'exam.catalog.view')
        ? getExamCatalog()
        : Promise.resolve({ types: [] }),
      user && hasPermission(user, 'physicians.view') ? listPhysicians() : Promise.resolve([]),
    ])
      .then(([rules, catalog, doctors]) => {
        if (active) {
          setItems(rules)
          setTypes(catalog.types)
          setPhysicians(doctors)
          setError('')
        }
      })
      .catch(() => {
        if (active) setError('Não foi possível consultar os preços.')
      })
    return () => {
      active = false
    }
  }, [canView, user, reload])
  if (!user) return null
  if (!canView) return <Navigate to="/dashboard" replace />
  const canManage = hasPermission(user, 'exam.prices.manage'),
    company = user.companies.find((item) => item.id === user.activeCompany?.id),
    units = (company?.units ?? []).filter(
      (unit) =>
        unit.active &&
        (!user.activeCompany?.selectedUnitId || unit.id === user.activeCompany.selectedUnitId),
    )
  const close = async (event: FormEvent) => {
    event.preventDefault()
    if (!target) return
    setBusy(true)
    setError('')
    try {
      await closeExamPrice(target, validTo, reason)
      setTarget(null)
      setReload((value) => value + 1)
    } catch {
      setError('Confira a data de encerramento e a versão da regra.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <SettingsPageLayout
      active="exam-prices"
      title="Preços de exames"
      description="Mantenha regras independentes de faturamento e repasse por tipo e vigência."
    >
      <div className="space-y-4">
        {canManage ? <Button onClick={() => setCreating(true)}>Nova regra de preço</Button> : null}
        {error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
        <ExamPriceTables
          items={items}
          types={types}
          units={company?.units ?? []}
          physicians={physicians}
          canManage={canManage}
          onClose={(record) => {
            setTarget(record)
            setEnd(record.validTo ?? '')
            setReason('')
          }}
        />
      </div>
      {creating ? (
        <ExamPriceForm
          types={types}
          units={units}
          physicians={physicians}
          allUnits={Boolean(user.activeCompany?.allUnits)}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            setReload((value) => value + 1)
          }}
        />
      ) : null}
      <Modal
        open={Boolean(target)}
        title="Encerrar vigência da regra"
        dismissible={!busy}
        onClose={() => setTarget(null)}
      >
        <form onSubmit={(event) => void close(event)} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            O valor histórico será preservado. Cadastre outra regra para o período seguinte.
          </p>
          <Input
            label="Último dia de vigência"
            type="date"
            required
            min={target?.validFrom}
            max={target?.validTo ?? undefined}
            value={validTo}
            onChange={(event) => setEnd(event.target.value)}
          />
          <Input
            label="Justificativa do encerramento"
            required
            minLength={3}
            maxLength={500}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          <Button type="submit" disabled={busy}>
            Confirmar encerramento
          </Button>
        </form>
      </Modal>
    </SettingsPageLayout>
  )
}
