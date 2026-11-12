import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { useAuthentication } from '../../auth/auth-context'
import { hasPermission } from '../../auth/auth.types'
import { listUploads, reprocessUpload } from '../upload-api'
import type { UploadSession } from '../upload.types'
const uploadStatusLabels: Record<string, string> = {
  UPLOADING: 'Envio incompleto',
  RECEIVED: 'Recebido para validação',
  VALIDATING: 'Em validação',
  APPROVED: 'Validado, aguardando ingestão',
  QUARANTINED: 'Em quarentena',
  REJECTED: 'Rejeitado',
  PUBLISHED: 'Disponível',
  CANCELLED: 'Cancelado',
  EXPIRED: 'Expirado',
}
export const UploadSessionsList = ({
  examId,
  reload = 0,
}: {
  examId?: string
  reload?: number
}) => {
  const { user } = useAuthentication(),
    [items, setItems] = useState<UploadSession[]>([]),
    [error, setError] = useState('')
  const canRetry = Boolean(user && hasPermission(user, 'documents.validation.manage'))
  useEffect(() => {
    let active = true
    const load = () =>
      void listUploads(examId)
        .then((records) => {
          if (active) {
            setItems(records)
            setError('')
          }
        })
        .catch(() => {
          if (active) setError('Não foi possível consultar os envios.')
        })
    load()
    const timer = setInterval(load, 5000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [examId, reload])
  return (
    <section className="space-y-2">
      <h3 className="font-bold">Envios e validação</h3>
      {error ? <p role="alert">{error}</p> : null}
      {items.slice(0, 15).map((item) => (
        <article key={item.id} className="rounded-lg border border-slate-200 p-3 text-sm">
          <p className="break-all font-semibold">{item.name}</p>
          <p>{uploadStatusLabels[item.status] ?? item.status}</p>
          {item.validationReason ? (
            <p className="mt-1 text-amber-800">{item.validationReason}</p>
          ) : null}
          {item.status === 'UPLOADING' ? (
            <p className="text-slate-500">
              Selecione novamente o mesmo arquivo para retomar o envio.
            </p>
          ) : null}
          {canRetry && item.status === 'QUARANTINED' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void reprocessUpload(item.id).catch(() => setError('Não foi possível reprocessar.'))
              }
            >
              Reprocessar
            </Button>
          ) : null}
        </article>
      ))}
      {!items.length ? (
        <p className="text-sm text-slate-500">Nenhum envio retomável neste contexto.</p>
      ) : null}
    </section>
  )
}
