import { Alert } from '../../../components/ui/Alert'
import type { Physician } from '../physician.types'
import { physicianEmailStatus } from '../physician-access-email'

export const PhysicianAccessEmailNotice = ({ physician }: { physician: Physician }) =>
  <Alert variant={physician.accessEmail?.status === 'SENT' ? 'success' : 'warning'}>
    {physicianEmailStatus(physician.accessEmail)}{physician.email ? `: ${physician.email}.` : '.'}
    {physician.accessEmail && !physician.accessEmail.configured && physician.accessEmail.status !== 'SENT'
      ? ' O cadastro foi concluído. O convite será enviado automaticamente após a configuração do serviço de e-mail.' : ''}
  </Alert>
