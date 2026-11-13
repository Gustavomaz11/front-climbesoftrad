import { zodResolver } from '@hookform/resolvers/zod'
import { Check, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Checkbox } from '../../../components/ui/Checkbox'
import { Input } from '../../../components/ui/Input'
import { useAuthentication } from '../auth-context'
import { AuthenticationError } from '../auth.types'
import { PasswordInput } from './PasswordInput'

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Informe seu e-mail ou CRM.'),
  password: z.string().min(1, 'Informe sua senha.'),
  rememberAccess: z.boolean(),
})

type LoginFormValues = z.infer<typeof loginSchema>
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

const errorMessages = {
  'rate-limited': 'Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente.',
  'invalid-credentials': 'Usuário ou senha incorretos.',
  'access-revoked': 'Seu acesso foi revogado. Entre em contato com o administrador.',
  connection: 'Não foi possível conectar ao servidor.',
  server: 'Não foi possível realizar o login. Tente novamente.',
} as const

export const LoginForm = () => {
  const { login } = useAuthentication()
  const navigate = useNavigate()
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [generalError, setGeneralError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberAccess: false,
    },
  })

  const isLoading = submitStatus === 'loading'

  const onSubmit = async ({ email, password, rememberAccess }: LoginFormValues) => {
    if (isLoading) {
      return
    }

    setGeneralError(null)
    setSubmitStatus('loading')

    try {
      await login({ email, password, remember: rememberAccess })
      setSubmitStatus('success')
      navigate('/dashboard', { replace: true })
    } catch (error: unknown) {
      const message =
        error instanceof AuthenticationError
          ? errorMessages[error.kind]
          : errorMessages.server

      setGeneralError(message)
      setSubmitStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input
        {...register('email')}
        id="email"
        type="text"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        label="E-mail ou CRM"
        placeholder="nome@instituicao.com.br ou 7626SE"
        leftIcon={<UserRound size={18} />}
        error={errors.email?.message}
      />

      <PasswordInput registration={register('password')} error={errors.password?.message} />

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Checkbox {...register('rememberAccess')} label="Manter conectado" />
        <span className="text-xs text-muted-foreground" title="Solicite a recuperação do acesso à administração da central.">Precisa de ajuda? Contate a Gestão.</span>
      </div>

      <div className="min-h-11" aria-live="polite" aria-atomic="true">
        {generalError ? (
          <Alert variant="error" className="py-2.5">
            {generalError}
          </Alert>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={isLoading}
        loadingText="Entrando..."
        disabled={submitStatus === 'success'}
        leftIcon={submitStatus === 'success' ? <Check size={18} aria-hidden="true" /> : undefined}
        className="mt-2"
      >
        {submitStatus === 'success' ? 'Acesso confirmado' : 'Entrar'}
      </Button>
    </form>
  )
}
