import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'outline'
  | 'ghost'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  loadingText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  ref?: Ref<HTMLButtonElement>
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-800 text-white shadow-[0_8px_20px_-10px_rgba(3,105,139,0.8)] hover:bg-brand-900 hover:shadow-[0_10px_24px_-10px_rgba(3,105,139,0.9)] focus-visible:outline-brand-600',
  secondary:
    'bg-slate-700 text-white shadow-sm hover:bg-slate-800 focus-visible:outline-slate-600',
  success:
    'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-emerald-600',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:outline-red-600',
  warning:
    'bg-amber-400 text-amber-950 shadow-sm hover:bg-amber-500 focus-visible:outline-amber-500',
  outline:
    'border border-brand-700 bg-white text-brand-800 hover:bg-brand-50 focus-visible:outline-brand-600',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-brand-600',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-sm',
  icon: 'size-9 p-0',
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  children,
  type = 'button',
  ref,
  ...buttonProps
}: ButtonProps) => (
  <button
    {...buttonProps}
    ref={ref}
    type={type}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-bold transition focus-visible:outline-2 focus-visible:outline-offset-3 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none disabled:active:translate-y-0 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
  >
    {loading ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : leftIcon}
    {loading && loadingText ? loadingText : children}
    {loading ? null : rightIcon}
  </button>
)
