import { Button } from '../../../components/ui/Button'
import type { ExamType } from '../../exam-catalog/exam-catalog.types'
import type { ContrastProtocol } from '../contrast-protocol.types'
export const ContrastProtocolList = ({
  items,
  types,
  units,
  canManage,
  canActivate,
  onVersion,
  onLifecycle,
}: {
  items: ContrastProtocol[]
  types: ExamType[]
  units: Array<{ id: string; name: string }>
  canManage: boolean
  canActivate: boolean
  onVersion: (record: ContrastProtocol) => void
  onLifecycle: (record: ContrastProtocol) => void
}) => (
  <>
    {items.map((record) => (
      <article
        key={record.id}
        className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
      >
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900">
              {record.name} · Versão {record.version}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {types.find((type) => type.id === record.examTypeId)?.name ?? record.examTypeId} ·{' '}
              {record.modality} ·{' '}
              {record.unitId
                ? (units.find((unit) => unit.id === record.unitId)?.name ?? record.unitId)
                : 'Todas as unidades'}{' '}
              ·{' '}
              {record.status === 'ACTIVE'
                ? 'Ativo'
                : record.status === 'DRAFT'
                  ? 'Rascunho'
                  : 'Desativado'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canManage ? (
              <Button size="sm" variant="outline" onClick={() => onVersion(record)}>
                Nova versão
              </Button>
            ) : null}
            {canActivate && record.status !== 'RETIRED' ? (
              <Button size="sm" variant="outline" onClick={() => onLifecycle(record)}>
                {record.status === 'DRAFT' ? 'Registrar aprovação e ativar' : 'Desativar'}
              </Button>
            ) : null}
          </div>
        </div>
        <pre className="whitespace-pre-wrap break-words text-sm text-slate-700">
          {record.template}
        </pre>
        {record.notes ? <p className="text-sm text-slate-500">{record.notes}</p> : null}
        {record.approvalReference ? (
          <p className="text-xs text-slate-500">Revisão clínica: {record.approvalReference}</p>
        ) : null}
      </article>
    ))}
  </>
)
