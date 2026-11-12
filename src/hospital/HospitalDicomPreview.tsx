import { useEffect, useRef, useState } from 'react'
import { ExternalLink, ScanLine } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { HttpResponseError } from '../features/auth/auth-http-client'
import { getHospitalDicomViewer } from './hospital-api'

export const HospitalDicomPreview = ({ intakeId }: { intakeId: string }) => {
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const [viewer, setViewer] = useState<{ url: string; instanceCount: number } | null>(null)
  const [blocked, setBlocked] = useState(false)
  const controller = useRef<AbortController | null>(null), pendingWindow = useRef<Window | null>(null)
  useEffect(() => () => { controller.current?.abort(); pendingWindow.current?.close() }, [])
  const open = async () => {
    if (busy) return
    // Open synchronously from the click so the browser can preserve the user gesture.
    const popup = window.open('about:blank', '_blank')
    if (popup) {
      popup.opener = null
      popup.document.title = 'Preparando visualizador DICOM'
      popup.document.body.textContent = 'Preparando as imagens para conferência. Aguarde…'
    }
    pendingWindow.current = popup
    controller.current = new AbortController()
    setBusy(true)
    setError('')
    setBlocked(!popup)
    try {
      const result = await getHospitalDicomViewer(intakeId, controller.current.signal)
      setViewer(result)
      if (popup && !popup.closed) popup.location.replace(result.url)
      else setBlocked(true)
      pendingWindow.current = null
    } catch (failure) {
      popup?.close()
      pendingWindow.current = null
      if (controller.current.signal.aborted) return
      setError(failure instanceof HttpResponseError && failure.status === 403
        ? 'Seu acesso não permite abrir as imagens deste recebimento.'
        : failure instanceof HttpResponseError && failure.status === 409
          ? 'As imagens exigem conferência da origem. Verifique possíveis arquivos divergentes.'
          : 'Não foi possível preparar o visualizador. Confira a conexão e tente novamente.')
    } finally { setBusy(false) }
  }
  return <section className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50/60 p-4" aria-label="Conferência das imagens DICOM">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h3 className="font-bold text-slate-900">Conferência das imagens</h3>
        <p className="mt-1 text-sm text-slate-600">Abra o DICOM para conferir as imagens e a identificação do paciente antes de enviar.</p></div>
      <Button type="button" variant="outline" onClick={() => void open()} disabled={busy} leftIcon={<ScanLine size={18} />}>
        {busy ? 'Preparando imagens…' : 'Abrir DICOM'}
      </Button>
    </div>
    <p className="mt-2 text-xs text-slate-500">O visualizador abre em outra aba. O preenchimento deste formulário permanece disponível.</p>
    {busy && <p role="status" className="mt-3 text-sm text-cyan-800">Preparando os arquivos validados. A primeira abertura pode levar alguns instantes.</p>}
    {viewer && <div className="mt-3 text-sm text-cyan-900">
      <p>{blocked ? 'Use o link abaixo se a nova aba não abriu.' : `Visualizador preparado para ${viewer.instanceCount} arquivo(s).`}</p>
      <a href={viewer.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-2 font-semibold underline"><ExternalLink size={15} />Abrir visualizador preparado</a>
    </div>}
    {error && <p role="alert" className="mt-3 text-sm text-red-800">{error}</p>}
  </section>
}
