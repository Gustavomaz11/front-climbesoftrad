import { CircleCheck, TriangleAlert } from 'lucide-react'
import { Button, type ButtonVariant } from './Button'
import { Modal } from './Modal'

interface ConfirmActionModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  loading?: boolean
  variant?: Extract<ButtonVariant, 'danger' | 'success'>
  loadingText?: string
  onClose: () => void
  onConfirm: () => void
}

export const ConfirmActionModal = ({
  open,
  title,
  description,
  confirmLabel,
  loading = false,
  variant = 'danger',
  loadingText = 'Processando...',
  onClose,
  onConfirm,
}: ConfirmActionModalProps) => (
  <Modal
    open={open}
    title={title}
    dismissible={!loading}
    onClose={onClose}
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant={variant} onClick={onConfirm} loading={loading} loadingText={loadingText}>{confirmLabel}</Button>
      </>
    }
  >
    <div className={`flex gap-3 rounded-xl border p-4 text-sm ${variant === 'danger' ? 'border-red-100 bg-red-500/10 text-red-900' : 'border-emerald-100 bg-emerald-500/10 text-emerald-900'}`}>
      {variant === 'danger'
        ? <TriangleAlert size={20} className="mt-0.5 shrink-0 text-red-600" aria-hidden="true" />
        : <CircleCheck size={20} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />}
      <p>{description}</p>
    </div>
  </Modal>
)
