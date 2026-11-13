import { apiRequestJson, HttpResponseError } from '../auth/auth-http-client'

export interface PhysicianSignatureImage { id: string; dataUrl: string; sha256: string; registeredAt: string }
export const getOwnSignature = () => apiRequestJson<{ signature: PhysicianSignatureImage | null }>('/physicians/me/signature', {}, { authenticated: true })
export const saveOwnSignature = (file: File) => {
  const body = new FormData()
  body.set('signature', file)
  return apiRequestJson<{ signature: PhysicianSignatureImage }>('/physicians/me/signature', { method: 'POST', body }, { authenticated: true })
}
export const signatureError = (error: unknown) => error instanceof HttpResponseError && [400, 413].includes(error.status)
  ? 'Importe uma imagem nítida da assinatura em PNG ou JPEG, sem animação, com até 2 MB.'
  : 'Não foi possível validar ou salvar a assinatura. Verifique a conexão e tente novamente.'
