import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react'
import { Input as SurfaceInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export type InputStatus = 'default' | 'success' | 'warning' | 'error'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode
  helperText?: ReactNode
  error?: string
  status?: InputStatus
  leftIcon?: ReactNode
  rightElement?: ReactNode
  reserveFeedbackSpace?: boolean
  containerClassName?: string
  ref?: Ref<HTMLInputElement>
}

const statusClasses: Record<InputStatus, string> = {
  default:
    'border-input hover:border-slate-400 focus:border-brand-600 focus:ring-cyan-100',
  success:
    'border-emerald-500 hover:border-emerald-600 focus:border-emerald-600 focus:ring-emerald-100',
  warning:
    'border-amber-500 hover:border-amber-600 focus:border-amber-600 focus:ring-amber-100',
  error: 'border-red-400 ring-red-50 hover:border-red-500 focus:border-red-600 focus:ring-red-100',
}

const feedbackClasses: Record<InputStatus, string> = {
  default: 'text-muted-foreground',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  error: 'font-medium text-red-600',
}

export const Input = ({
  id,
  label,
  helperText,
  error,
  status = 'default',
  leftIcon,
  rightElement,
  reserveFeedbackSpace = false,
  containerClassName = '',
  className = '',
  ref,
  'aria-describedby': ariaDescribedBy,
  ...inputProps
}: InputProps) => {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const feedbackId = `${inputId}-feedback`
  const resolvedStatus = error ? 'error' : status
  const feedback = error ?? helperText
  const describedBy = [ariaDescribedBy, feedback ? feedbackId : undefined]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClassName}>
      {label ? (
        <Label htmlFor={inputId} className="mb-2 block text-xs font-medium text-muted-foreground">
          {label}
        </Label>
      ) : null}
      <div className="relative">
        {leftIcon ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 flex -translate-y-1/2 text-muted-foreground"
          >
            {leftIcon}
          </span>
        ) : null}
        <SurfaceInput
          {...inputProps}
          ref={ref}
          id={inputId}
          aria-invalid={resolvedStatus === 'error' || undefined}
          aria-describedby={describedBy || undefined}
          className={cn('h-9 rounded-lg bg-foreground/5 text-sm shadow-none', resolvedStatus !== 'default' && statusClasses[resolvedStatus], leftIcon ? 'pl-11' : 'pl-3', rightElement ? 'pr-12' : 'pr-3', className)}
        />
        {rightElement ? (
          <span className="absolute top-1/2 right-1.5 flex -translate-y-1/2">
            {rightElement}
          </span>
        ) : null}
      </div>
      {feedback || reserveFeedbackSpace ? (
        <p
          id={feedbackId}
          className={`mt-1.5 min-h-5 text-xs ${feedbackClasses[resolvedStatus]}`}
        >
          {feedback ?? ''}
        </p>
      ) : null}
    </div>
  )
}
