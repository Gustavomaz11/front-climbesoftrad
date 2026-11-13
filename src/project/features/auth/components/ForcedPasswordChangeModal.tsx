import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'

interface ForcedPasswordChangeModalProps {
  open: boolean
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const schema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha inicial.'),
  newPassword: z.string().min(12, 'A nova senha deve possuir pelo menos 12 caracteres.'),
  confirmation: z.string(),
}).refine((values) => values.newPassword === values.confirmation, {
  path: ['confirmation'],
  message: 'As senhas não coincidem.',
})

type FormValues = z.infer<typeof schema>

export const ForcedPasswordChangeModal = ({ open, onChangePassword }: ForcedPasswordChangeModalProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmation: '' },
  })

  const submit = async (values: FormValues) => {
    setSubmitError(null)
    try {
      await onChangePassword(values.currentPassword, values.newPassword)
    } catch {
      setSubmitError('Não foi possível alterar a senha. Confira a senha inicial e tente novamente.')
    }
  }

  return (
    <Modal
      open={open}
      title="Defina uma nova senha"
      description="Por segurança, altere a senha inicial vinculada ao seu CRM antes de continuar."
      dismissible={false}
      onClose={() => undefined}
      footer={<Button type="submit" form="forced-password-form" loading={isSubmitting} loadingText="Alterando..." leftIcon={<KeyRound size={17} />}>Alterar senha e continuar</Button>}
    >
      <form id="forced-password-form" onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        {submitError ? <Alert variant="error">{submitError}</Alert> : null}
        <Input {...register('currentPassword')} type="password" autoComplete="current-password" label="Senha inicial" error={errors.currentPassword?.message} />
        <Input {...register('newPassword')} type="password" autoComplete="new-password" label="Nova senha" helperText="Utilize pelo menos 12 caracteres." error={errors.newPassword?.message} />
        <Input {...register('confirmation')} type="password" autoComplete="new-password" label="Confirme a nova senha" error={errors.confirmation?.message} />
      </form>
    </Modal>
  )
}
