import type { Physician } from './physician.types'

export const physicianEmailStatus = (invitation: Physician['accessEmail']) => {
  if (!invitation) return 'Sem convite registrado'
  if (invitation.status === 'SENT') return 'E-mail de acesso enviado'
  if (invitation.status === 'CANCELLED') return 'Envio cancelado'
  if (!invitation.configured) return 'E-mail pendente: serviço de envio não configurado'
  if (invitation.status === 'FAILED') return 'Falha no envio do e-mail'
  return 'E-mail de acesso aguardando envio'
}
