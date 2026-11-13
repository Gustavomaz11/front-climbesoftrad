import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'

interface PasswordInputProps {
  error?: string
  registration: UseFormRegisterReturn<'password'>
}

export const PasswordInput = ({ error, registration }: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <Input
      {...registration}
      id="password"
      type={isVisible ? 'text' : 'password'}
      autoComplete="current-password"
      label="Senha"
      placeholder="Digite sua senha"
      leftIcon={<LockKeyhole size={18} />}
      error={error}
      rightElement={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible((currentValue) => !currentValue)}
          aria-label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={isVisible}
          className="size-9 rounded-lg"
        >
          {isVisible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </Button>
      }
    />
  )
}
