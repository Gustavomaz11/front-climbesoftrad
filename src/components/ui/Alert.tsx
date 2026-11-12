import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'neutral'

interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant
  title?: ReactNode
  icon?: ReactNode | null
  onDismiss?: () => void
  dismissLabel?: string
}

const variantClasses: Record<AlertVariant, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-red-200 bg-red-50 text-red-700',
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
}

const defaultIcons: Record<AlertVariant, ReactNode> = {
  info: <Info size={18} aria-hidden="true" />,
  success: <CheckCircle2 size={18} aria-hidden="true" />,
  warning: <AlertTriangle size={18} aria-hidden="true" />,
  error: <AlertCircle size={18} aria-hidden="true" />,
  neutral: <Info size={18} aria-hidden="true" />,
}

export const Alert = ({
  variant = 'info',
  title,
  icon,
  onDismiss,
  dismissLabel = 'Fechar aviso',
  children,
  className = '',
  role,
  ...alertProps
}: AlertProps) => (
  <div
    {...alertProps}
    role={role ?? (variant === 'error' ? 'alert' : 'status')}
    className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm ${variantClasses[variant]} ${className}`}
  >
    <span className="mt-0.5 shrink-0" aria-hidden="true">
      {icon === undefined ? defaultIcons[variant] : icon}
    </span>
    <div className="min-w-0 flex-1">
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? 'mt-1 leading-5' : 'leading-5'}>{children}</div>
    </div>
    {onDismiss ? (
      <button
        type="button"
        onClick={onDismiss}
        aria-label={dismissLabel}
        className="-m-1 grid size-8 shrink-0 place-items-center rounded-lg opacity-70 transition hover:bg-black/5 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current"
      >
        <X size={16} aria-hidden="true" />
      </button>
    ) : null}
  </div>
)
