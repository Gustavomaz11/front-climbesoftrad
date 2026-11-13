import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { getOwnSignature, saveOwnSignature, signatureError } from '../physician-signature-api'

type SignatureModalProps = {
  open: boolean; required?: boolean; onDone: () => Promise<void>; onClose: () => void
}
export const PhysicianSignatureModal = (props: SignatureModalProps) => props.open ? <SignatureForm {...props} /> : null
const SignatureForm = ({ required = true, onDone, onClose }: SignatureModalProps) => {
  const [file, setFile] = useState<File | null>(null), [preview, setPreview] = useState('')
  const [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const objectUrl = useRef('')
  useEffect(() => {
    let active = true
    void getOwnSignature().then(result => { if (active && !objectUrl.current) setPreview(result.signature?.dataUrl ?? '') }).catch(() => { if (active) setError('Não foi possível consultar sua assinatura.') })
    return () => { active = false }
  }, [])
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current) }, [])
  const submit = async () => {
    if (!file) return
    setBusy(true); setError('')
    try { await saveOwnSignature(file); await onDone() }
    catch (failure) { setError(signatureError(failure)) }
    finally { setBusy(false) }
  }
  return <Modal open title="Cadastre sua assinatura" description={required ? 'Para continuar, importe a imagem da sua assinatura. Você confirmará sua aplicação ao assinar cada laudo.' : 'A nova assinatura será usada nos próximos laudos. Os documentos já finalizados preservam a imagem anterior.'} dismissible={!required && !busy} onClose={onClose}>
    <label className="block text-sm font-semibold text-muted-foreground">Imagem da assinatura<input className="mt-2 block w-full text-sm" aria-label="Imagem da assinatura" type="file" accept="image/png,image/jpeg" disabled={busy} onChange={event => {
      const selected = event.target.files?.[0] ?? null
      if (objectUrl.current) { URL.revokeObjectURL(objectUrl.current); objectUrl.current = '' }
      if (selected && (selected.size > 2 * 1024 * 1024 || !['image/png', 'image/jpeg'].includes(selected.type))) { setError('Selecione um PNG ou JPEG de até 2 MB.'); setFile(null); setPreview(''); return }
      setError(''); setFile(selected)
      objectUrl.current = selected ? URL.createObjectURL(selected) : ''
      setPreview(objectUrl.current)
    }} /></label>
    <p className="mt-2 text-xs text-muted-foreground">Use uma imagem nítida, com fundo claro ou transparente. PNG ou JPEG, até 2 MB.</p>
    {preview && <div className="my-5 rounded-xl border border-border bg-white p-4"><img src={preview} alt="Prévia da sua assinatura" className="mx-auto h-20 w-60 object-contain" /><p className="mt-3 text-center text-xs text-muted-foreground">Confira se a assinatura está completa e legível.</p></div>}
    {error && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
    <div className="mt-6 flex justify-end gap-3">{!required && <Button variant="outline" disabled={busy} onClick={onClose}>Cancelar</Button>}<Button disabled={!file || busy} onClick={() => void submit()}>{busy ? 'Validando assinatura…' : 'Salvar assinatura e continuar'}</Button></div>
  </Modal>
}
