import { X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg' | 'xl'
  dismissible?: boolean
  onClose: () => void
}

const sizeClasses = {
  md: 'max-w-xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
} as const

export const Modal = ({
  open,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissible = true,
  onClose,
}: ModalProps) => {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (dismissible && event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [dismissible, open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`animate-page-enter flex max-h-[96svh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[92svh] sm:rounded-2xl ${sizeClasses[size]}`}
      >
        <header className="flex items-start justify-between gap-6 border-b border-white/10 bg-brand-950 px-5 py-4 text-white sm:px-7 sm:py-5">
          <div>
            <h2 id={titleId} className="text-xl font-bold tracking-[-0.02em]">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm text-cyan-100/70">
                {description}
              </p>
            ) : null}
          </div>
          {dismissible ? <Button
            variant="ghost"
            size="icon"
            className="-mr-2 text-white hover:bg-white/10 hover:text-white"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={20} aria-hidden="true" />
          </Button> : null}
        </header>

        <div className="overflow-y-auto px-5 py-6 sm:px-7">{children}</div>
        {footer ? (
          <footer className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  )
}
