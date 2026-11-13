import { Button } from '../../../components/ui/Button'
import type { ExamType } from '../../exam-catalog/exam-catalog.types'
import type { Physician } from '../../physicians/physician.types'
import type { ExamPriceRule } from '../exam-pricing-api'
export const ExamPriceTables = ({
  items,
  types,
  units,
  physicians,
  canManage,
  onClose,
}: {
  items: ExamPriceRule[]
  types: ExamType[]
  units: Array<{ id: string; name: string }>
  physicians: Physician[]
  canManage: boolean
  onClose: (rule: ExamPriceRule) => void
}) => (
  <>
    {(['BILLING', 'PAYOUT'] as const).map((kind) => (
      <section key={kind} className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">
          {kind === 'BILLING' ? 'Faturamento à unidade' : 'Repasse ao médico'}
        </h2>
        {items
          .filter((rule) => rule.kind === kind)
          .map((rule) => (
            <article
              key={rule.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div>
                <p className="font-bold">
                  {types.find((type) => type.id === rule.examTypeId)?.name ?? rule.examTypeId} ·{' '}
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: rule.currency,
                  }).format(Number(rule.amountCents) / 100)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {rule.unitId
                    ? (units.find((unit) => unit.id === rule.unitId)?.name ?? rule.unitId)
                    : 'Todas as unidades'}
                  {kind === 'PAYOUT'
                    ? ' · ' +
                      (rule.physicianId
                        ? (physicians.find((physician) => physician.id === rule.physicianId)
                            ?.name ?? rule.physicianId)
                        : 'Regra geral para médicos')
                    : ''}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vigência: {rule.validFrom} até {rule.validTo ?? 'sem término definido'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{rule.reason}</p>
              </div>
              {canManage ? (
                <Button variant="outline" size="sm" onClick={() => onClose(rule)}>
                  Encerrar vigência
                </Button>
              ) : null}
            </article>
          ))}
        {!items.some((rule) => rule.kind === kind) ? (
          <p className="text-sm text-muted-foreground">Nenhuma regra cadastrada.</p>
        ) : null}
      </section>
    ))}
  </>
)
