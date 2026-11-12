import { ExternalLink, ScanSearch, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../../../components/ui/Button'
import type { ExamCommentAttachment } from '../../comments/comment.types'
import { MagnifiableImage } from './MagnifiableImage'

interface AttachmentViewerProps {
  attachment: ExamCommentAttachment | null
  onClose: () => void
}

const minZoom = 0.75
const maxZoom = 2
const zoomStep = 0.25

export const AttachmentViewer = ({ attachment, onClose }: AttachmentViewerProps) => {
  const [zoom, setZoom] = useState(1)
  const [magnifierActive, setMagnifierActive] = useState(false)

  useEffect(() => {
    if (!attachment) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape, true)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape, true)
    }
  }, [attachment, onClose])

  if (!attachment) return null

  const isImage = attachment.contentType.startsWith('image/')
  const isPdf = attachment.contentType === 'application/pdf'
  const canZoom = isImage || isPdf
  const pdfUrl = `${attachment.url}#zoom=${Math.round(zoom * 100)}`

  return createPortal(
    <section className="fixed inset-0 z-[150] flex flex-col bg-slate-950/95 text-white" role="dialog" aria-modal="true" aria-label={`Visualizar ${attachment.name}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{attachment.name}</p>
          <p className="mt-0.5 text-xs text-slate-400">Visualizador de anexos</p>
        </div>
        <div className="flex items-center gap-1">
          {canZoom ? (
            <>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" disabled={zoom <= minZoom} onClick={() => setZoom((value) => Math.max(minZoom, value - zoomStep))} aria-label="Diminuir zoom"><ZoomOut size={18} /></Button>
              <button type="button" className="min-w-14 rounded-lg px-2 py-2 text-xs font-bold text-slate-200 hover:bg-white/10" onClick={() => setZoom(1)} title="Restaurar zoom">{Math.round(zoom * 100)}%</button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" disabled={zoom >= maxZoom} onClick={() => setZoom((value) => Math.min(maxZoom, value + zoomStep))} aria-label="Aumentar zoom"><ZoomIn size={18} /></Button>
            </>
          ) : null}
          {isImage ? (
            <Button variant="ghost" size="icon" className={magnifierActive ? 'bg-cyan-500 text-white hover:bg-cyan-400 hover:text-white' : 'text-white hover:bg-white/10 hover:text-white'} onClick={() => setMagnifierActive((value) => !value)} aria-label={magnifierActive ? 'Desativar lupa' : 'Ativar lupa'} aria-pressed={magnifierActive}><ScanSearch size={19} /></Button>
          ) : null}
          <a href={attachment.url} target="_blank" rel="noreferrer" className="grid size-9 place-items-center rounded-lg text-white transition hover:bg-white/10" aria-label="Abrir anexo em nova aba"><ExternalLink size={18} /></a>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" onClick={onClose} aria-label="Fechar visualizador"><X size={20} /></Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto bg-slate-900">
        {isImage ? <MagnifiableImage src={attachment.url} alt={attachment.name} zoom={zoom} magnifierActive={magnifierActive} /> : isPdf ? (
          <iframe key={pdfUrl} src={pdfUrl} title={`PDF: ${attachment.name}`} className="h-full min-h-[700px] w-full border-0 bg-white" />
        ) : (
          <div className="grid min-h-full place-items-center p-8 text-center">
            <div className="max-w-md">
              <ExternalLink size={38} className="mx-auto text-cyan-400" />
              <p className="mt-4 font-bold">Este formato utiliza o aplicativo do seu dispositivo.</p>
              <p className="mt-2 text-sm text-slate-400">Abra o arquivo em uma nova aba para visualizar ou baixar.</p>
              <a href={attachment.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950">Abrir anexo</a>
            </div>
          </div>
        )}
      </div>
    </section>,
    document.body,
  )
}
