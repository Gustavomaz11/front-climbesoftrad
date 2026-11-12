import { useEffect, useRef, useState, type FormEvent } from 'react'
import { parseDicom } from 'dicom-parser'
import { Button } from '../../../components/ui/Button'
import { useAuthentication } from '../../auth/auth-context'
import { sendResumableFile } from '../../uploads/resumable-upload'
import { getUploadLimits } from '../../uploads/upload-limits'
import { cancelUpload } from '../../uploads/upload-api'
import { hospitalDelivery } from '../../../hospital/hospital-delivery'
export const DicomImportForm = ({ onDone, hospitalIntake = false }: { onDone: () => void; hospitalIntake?: boolean }) => {
  const { user } = useAuthentication()
  const units =
    user?.companies
      .find((x) => x.id === user.activeCompany?.id)
      ?.units.filter((x) => x.active && user.activeCompany?.unitIds.includes(x.id)) ?? []
  const [unitId, setUnitId] = useState(user?.activeCompany?.selectedUnitId ?? units[0]?.id ?? ''),
    [files, setFiles] = useState<File[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const [preview, setPreview] = useState<Array<{ name: string; patient: string; study: string }>>(
      [],
    ),
    [progress, setProgress] = useState(0),
    [limit, setLimit] = useState<number | null>(null)
  const controller = useRef<AbortController | null>(null),
    session = useRef<string | null>(null)
  const delivery = useRef<Awaited<ReturnType<typeof hospitalDelivery>> | null>(null)
  useEffect(() => {
    let active = true
    void getUploadLimits()
      .then((value) => {
        if (active) setLimit(value.dicomMaxBytes)
      })
      .catch(() => {
        if (active) setError('Limites indisponíveis.')
      })
    return () => {
      active = false
      controller.current?.abort()
    }
  }, [])
  const choose = async (selected: File[]) => {
    delivery.current = null
    setFiles(selected)
    setError('')
    setPreview([])
    try {
      const rows = []
      for (const file of selected.slice(0, 20)) {
        const parsed = parseDicom(
          new Uint8Array(await file.slice(0, 16 * 1024 * 1024).arrayBuffer()),
          { untilTag: 'x7fe00010',inflater:()=>{throw new Error('Dataset deflate não suportado na prévia.')} },
        )
        rows.push({
          name: file.name,
          patient: parsed.string('x00100010') ?? 'Nome ausente',
          study: parsed.string('x0020000d') ?? 'UID ausente',
        })
      }
      setPreview(rows)
    } catch {
      setError(
        'Um arquivo não possui cabeçalho DICOM compatível. A validação final será feita no servidor.',
      )
    }
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!limit || !unitId || !files.length) return
    if (hospitalIntake && files.length > 10000) { setError('Selecione até 10.000 arquivos por envio.'); return }
    if (files.some((file) => !file.size || file.size > limit)) {
      setError('Um arquivo está vazio ou excede o limite por instância.')
      return
    }
    setBusy(true)
    setError('')
    controller.current = new AbortController()
    try {
      if (hospitalIntake && !delivery.current) delivery.current = await hospitalDelivery(unitId, user?.id ?? '', files)
      for (let index = 0; index < files.length; index++) {
        await sendResumableFile(
          files[index]!,
          { kind: 'DICOM', unitId, hospitalIntake, ...(hospitalIntake && delivery.current ? { deliveryId: delivery.current.id, deliveryFileId: delivery.current.items[index], deliveryTotal: files.length } : {}) },
          {
            signal: controller.current.signal,
            onSession: (id) => {
              session.current = id
            },
            onProgress: (value) => setProgress(((index + value / 100) / files.length) * 100),
          },
        )
      }
      setFiles([])
      delivery.current = null
      setPreview([])
      onDone()
    } catch {
      setError(
        'Envio pausado ou interrompido. Selecione os mesmos arquivos para retomar as partes confirmadas.',
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="space-y-3 rounded-xl border bg-white p-4"
    >
      <h2 className="font-bold">Importar estudo DICOM</h2>
      <p className="text-sm text-slate-600">
        {hospitalIntake ? 'Adicione os arquivos à preparação. Confira o cadastro e confirme o envio para o ClimbeSoftRad na lista abaixo.' : 'Selecione arquivos DICOM individuais. O exame será associado pelos metadados; dados incompletos ou conflitos exigem conferência.'}
      </p>
      <label className="block text-sm font-semibold">
        Unidade de destino
        <select
          value={unitId}
          disabled={busy}
          required
          onChange={(event) => setUnitId(event.target.value)}
          className="mt-1 w-full rounded-lg border p-2"
        >
          <option value="">Selecione</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold">
        Arquivos{limit ? ` (até ${(limit / 1024 / 1024).toFixed(0)} MB por arquivo)` : ''}
        <input
          type="file"
          multiple
          accept=".dcm,application/dicom"
          disabled={busy}
          onChange={(event) => void choose(Array.from(event.target.files ?? []))}
          className="mt-2 block w-full text-sm"
        />
      </label>
      {preview.map((item) => (
        <div key={item.name + item.study} className="rounded border p-2 text-xs">
          <p>
            {item.name} · {item.patient.replace(/\^/g, ' ')}
          </p>
          <p className="break-all">Estudo: {item.study}</p>
        </div>
      ))}
      {files.length > 20 ? (
        <p className="text-xs">Prévia dos primeiros 20 arquivos; todos serão validados.</p>
      ) : null}
      {busy || progress > 0 ? (
        <progress
          max={100}
          value={progress}
          className="w-full"
          aria-label="Progresso da importação DICOM"
        />
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-amber-800">
          {error}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={busy || !files.length || !unitId || !limit}>
          {busy ? 'Importando…' : hospitalIntake ? 'Adicionar à preparação' : 'Confirmar importação'}
        </Button>
        {busy ? (
          <>
            <Button variant="outline" onClick={() => controller.current?.abort()}>
              Pausar
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                controller.current?.abort()
                if (session.current)
                  void cancelUpload(session.current).catch(() =>
                    setError('O arquivo já foi recebido ou o cancelamento está indisponível.'),
                  )
              }}
            >
              Cancelar envio atual
            </Button>
          </>
        ) : null}
      </div>
    </form>
  )
}
