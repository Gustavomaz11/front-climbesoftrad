import type { ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
interface ModalProps { open: boolean; title: string; description?: string; children: ReactNode; footer?: ReactNode; size?: 'md' | 'lg' | 'xl'; dismissible?: boolean; onClose: () => void }
const sizes = { md: 'sm:max-w-xl', lg: 'sm:max-w-4xl', xl: 'sm:max-w-6xl' }
export const Modal = ({ open, title, description, children, footer, size = 'md', dismissible = true, onClose }: ModalProps) => (
  <Dialog open={open} onOpenChange={next => { if (!next && dismissible) onClose() }}>
    <DialogContent className={cn('flex max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-xl p-0 shadow-2xl', sizes[size])} showCloseButton={dismissible}
      onEscapeKeyDown={event => { if (!dismissible) event.preventDefault() }} onInteractOutside={event => { if (!dismissible) event.preventDefault() }}
      {...(!description ? { 'aria-describedby': undefined } : {})}>
      <DialogHeader className="shrink-0 border-b bg-muted/70 px-6 py-5 pr-12 text-left"><DialogTitle className="text-lg font-semibold tracking-tight text-foreground">{title}</DialogTitle>{description && <DialogDescription className="max-w-2xl text-xs leading-5">{description}</DialogDescription>}</DialogHeader>
      <div className="min-h-0 overflow-y-auto px-6 py-6">{children}</div>
      {footer && <DialogFooter className="shrink-0 flex-row flex-wrap items-center justify-end gap-2 border-t bg-muted/70 px-6 py-4">{footer}</DialogFooter>}
    </DialogContent>
  </Dialog>
)
