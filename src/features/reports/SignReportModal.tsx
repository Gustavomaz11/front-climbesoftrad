import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { getOwnSignature, type PhysicianSignatureImage } from '../physicians/physician-signature-api'

type SignReportProps = {
  open: boolean; busy: boolean; error: string; patientName?: string; onClose: () => void; onSign: (signatureId: string) => void
}
export const SignReportModal = (props: SignReportProps) => props.open ? <SignReportConfirmation {...props} /> : null
const SignReportConfirmation = ({ busy, error, patientName, onClose, onSign }: SignReportProps) => {
  const [signature, setSignature] = useState<PhysicianSignatureImage | null>(null)
  const [confirmed, setConfirmed] = useState(false), [imageReady, setImageReady] = useState(false), [loadError, setLoadError] = useState('')
  useEffect(() => {
    let active = true
    void getOwnSignature().then(result => {
      if (!active) return
      setSignature(result.signature)
      if (!result.signature) setLoadError('Cadastre sua assinatura antes de finalizar o laudo.')
    }).catch(() => { if (active) setLoadError('Não foi possível carregar sua assinatura. Feche e tente novamente.') })
    return () => { active = false }
  }, [])
  return <Modal open title="Assinar e finalizar laudo" description="Confira o texto e confirme a aplicação da sua assinatura. A versão finalizada ficará pronta para envio ao hospital." onClose={onClose} dismissible={!busy}>
    <p className="mt-4 text-sm text-slate-600">Paciente: {patientName}. A imagem da sua assinatura e o CRM serão incluídos abaixo do texto do laudo.</p>
    {signature ? <div className="my-5 rounded-xl border border-slate-200 bg-white p-4"><img src={signature.dataUrl} alt="Assinatura que será aplicada ao laudo" className="mx-auto h-20 w-60 object-contain" onLoad={() => setImageReady(true)} onError={() => { setImageReady(false); setLoadError('Não foi possível exibir a assinatura.') }} /></div> : !loadError && <p role="status" className="my-5 text-sm">Carregando assinatura…</p>}
    <label className="mt-4 flex items-start gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" className="mt-1" checked={confirmed} disabled={busy || !imageReady} onChange={event => setConfirmed(event.target.checked)} />Confirmo a aplicação da minha assinatura e a finalização deste laudo.</label>
    <p className="mt-3 text-xs text-slate-500">Assinatura em imagem, registrada com seu usuário. Esta ação não aplica assinatura digital por certificado.</p>
    {(loadError || error) && <p role="alert" className="mt-4 text-sm text-red-700">{loadError || error}</p>}
    <div className="mt-6 flex justify-end gap-3"><Button variant="outline" disabled={busy} onClick={onClose}>Continuar editando</Button><Button disabled={busy || !confirmed || !imageReady || !signature} onClick={() => { if (signature) onSign(signature.id) }}>{busy ? 'Assinando…' : 'Assinar e finalizar'}</Button></div>
  </Modal>
}
