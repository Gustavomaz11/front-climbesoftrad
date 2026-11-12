import { useEffect, useState, type FormEvent } from 'react'
import type { JSONContent } from '@tiptap/core'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { examContrastProtocols, selectPrescriptionProtocol } from '../contrast-protocol-api'
import type { ContrastProtocol, ProtocolSource } from '../contrast-protocol.types'
export const PrescriptionProtocolPanel = ({
  examId,
  source,
  disabled,
  onApply,
}: {
  examId: string
  source: ProtocolSource | null
  disabled: boolean
  onApply: (content: JSONContent, source: ProtocolSource) => void
}) => {
  const [open, setOpen] = useState(false),
    [items, setItems] = useState<ContrastProtocol[]>([]),
    [reason, setReason] = useState(''),
    [protocolId, setProtocol] = useState(''),
    [values, setValues] = useState<Record<string, string>>({}),
    [observations, setObservations] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [preview, setPreview] = useState<Awaited<ReturnType<typeof selectPrescriptionProtocol>> | null>(
      null,
    )
  useEffect(() => {
    if (!open) return
    let active = true
    void examContrastProtocols(examId)
      .then((result) => {
        if (active) {
          setItems(result.items)
          setReason(result.reason ?? '')
          setError('')
        }
      })
      .catch(() => {
        if (active) setError('Não foi possível consultar os protocolos.')
      })
    return () => {
      active = false
    }
  }, [open, examId])
  const selected = items.find((item) => item.id === protocolId)
  const generate = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      setPreview(await selectPrescriptionProtocol(examId, protocolId, values, observations))
    } catch {
      setError('Confira os campos e se o protocolo continua ativo para este exame.')
    } finally {
      setBusy(false)
    }
  }
  const invalidate = () => setPreview(null)
  return (
    <section className="report-editor-chrome border-b border-slate-200 bg-white p-4 print:hidden">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" disabled={disabled} onClick={() => setOpen(true)}>
          Preencher por protocolo
        </Button>
        {source ? (
          <p className="text-sm text-slate-600">
            Protocolo aplicado: {source.name} · Versão {source.protocolVersion}
          </p>
        ) : null}
      </div>
      <Modal
        open={open}
        title="Prescrição por protocolo"
        size="lg"
        dismissible={!busy}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={(event) => void generate(event)} className="space-y-4">
          {reason ? (
            <p className="text-sm text-amber-700">
              {reason === 'CLASSIFICATION_REQUIRED'
                ? 'Confira o tipo do exame antes de escolher um protocolo.'
                : 'Nenhum protocolo ativo disponível para este exame.'}
            </p>
          ) : null}
          <label className="block text-sm font-semibold">
            Protocolo
            <select
              aria-label="Protocolo da prescrição"
              value={protocolId}
              onChange={(event) => {
                setProtocol(event.target.value)
                setValues({})
                invalidate()
              }}
              required
              className="mt-1 w-full rounded-lg border p-2"
            >
              <option value="">Selecione</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · Versão {item.version}
                </option>
              ))}
            </select>
          </label>
          {selected?.notes ? (
            <p className="whitespace-pre-wrap text-sm text-slate-600">{selected.notes}</p>
          ) : null}
          {selected?.fields.map((field) => (
            <Input
              key={field.key}
              label={field.label + (field.unit ? ' (' + field.unit + ')' : '')}
              value={values[field.key] ?? ''}
              onChange={(event) => {
                setValues((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
                invalidate()
              }}
              required={field.required}
              inputMode={field.kind === 'NUMBER' ? 'decimal' : 'text'}
              maxLength={500}
            />
          ))}
          <label className="block text-sm font-semibold">
            Observações
            <textarea
              aria-label="Observações da prescrição"
              value={observations}
              onChange={(event) => {
                setObservations(event.target.value)
                invalidate()
              }}
              maxLength={2000}
              rows={3}
              className="mt-1 w-full rounded-lg border p-3"
            />
          </label>
          {error ? (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={busy || !selected || disabled}>
            {busy ? 'Gerando...' : 'Gerar prévia'}
          </Button>
          {preview ? (
            <div className="space-y-3 rounded-xl border bg-slate-50 p-4">
              <h3 className="font-bold">Prévia do documento</h3>
              <pre className="whitespace-pre-wrap break-words text-sm">
                {preview.snapshot.renderedText}
              </pre>
              <p className="text-sm text-slate-600">
                Aplicar substitui o texto atual da prescrição. Confira a prévia antes de confirmar.
              </p>
              <Button
                disabled={disabled}
                onClick={() => {
                  onApply(preview.content, {
                    selectionId: preview.selectionId,
                    ...preview.snapshot,
                  })
                  setOpen(false)
                }}
              >
                Aplicar à prescrição
              </Button>
            </div>
          ) : null}
        </form>
      </Modal>
    </section>
  )
}
