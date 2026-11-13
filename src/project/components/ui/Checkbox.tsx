import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react'
import { Label } from '@/components/ui/label'

export type CheckboxTone = 'primary' | 'success' | 'danger' | 'warning'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  description?: ReactNode
  error?: string
  tone?: CheckboxTone
  ref?: Ref<HTMLInputElement>
}

const toneClasses: Record<CheckboxTone, string> = {
  primary: 'accent-brand-700 focus-visible:outline-brand-600',
  success: 'accent-emerald-600 focus-visible:outline-emerald-600',
  danger: 'accent-red-600 focus-visible:outline-red-600',
  warning: 'accent-amber-500 focus-visible:outline-amber-500',
}

export const Checkbox = ({
  id,
  label,
  description,
  error,
  tone = 'primary',
  className = '',
  ref,
  'aria-describedby': ariaDescribedBy,
  ...inputProps
}: CheckboxProps) => {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = `${inputId}-description`
  const errorId = `${inputId}-error`
  const describedBy = [
    ariaDescribedBy,
    description ? descriptionId : undefined,
    error ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div>
      <Label htmlFor={inputId} className="group flex cursor-pointer items-start gap-2.5 font-normal">
        <input
          {...inputProps}
          ref={ref}
          id={inputId}
          type="checkbox"
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy || undefined}
          className={`mt-0.5 size-4 shrink-0 rounded border-input focus-visible:outline-2 focus-visible:outline-offset-2 ${toneClasses[tone]} ${className}`}
        />
        <span>
          <span className="block text-sm text-muted-foreground group-hover:text-foreground">{label}</span>
          {description ? (
            <span id={descriptionId} className="mt-1 block text-xs leading-5 text-muted-foreground">
              {description}
            </span>
          ) : null}
        </span>
      </Label>
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}
