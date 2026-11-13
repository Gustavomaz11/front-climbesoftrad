import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'
import { Alert as SurfaceAlert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'neutral'
interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> { variant?: AlertVariant; title?: ReactNode; icon?: ReactNode | null; onDismiss?: () => void; dismissLabel?: string }
const colors = { info:'border-sky-100 bg-sky-500/10 text-sky-600 dark:text-sky-400',success:'border-emerald-100 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',warning:'border-amber-100 bg-amber-500/10 text-amber-900',error:'border-red-100 bg-red-500/10 text-red-600 dark:text-red-400',neutral:'border-border bg-muted text-muted-foreground' }
const icons = { info:Info,success:CheckCircle2,warning:AlertTriangle,error:AlertCircle,neutral:Info }
export const Alert = ({ variant='info',title,icon,onDismiss,dismissLabel='Fechar aviso',children,className,role,...props }: AlertProps) => {
  const Icon=icons[variant]
  return <SurfaceAlert {...props} role={role || (variant==='error'?'alert':'status')} className={cn('relative grid-cols-[16px_1fr] text-xs',colors[variant],className)}>{icon === undefined ? <Icon className="size-4" /> : icon}{title && <AlertTitle className="pr-6 text-xs">{title}</AlertTitle>}<AlertDescription className="block pr-6 text-xs leading-5 text-inherit">{children}</AlertDescription>{onDismiss && <Button variant="ghost" size="icon" className="absolute top-1.5 right-1.5 size-7" aria-label={dismissLabel} onClick={onDismiss}><X className="size-3.5" /></Button>}</SurfaceAlert>
}
