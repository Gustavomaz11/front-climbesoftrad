import { ClipboardPenLine, Eye, FilePenLine, MessageSquareText, MoreHorizontal, Paperclip, Send } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../../../components/ui/Button'

interface ExamActionsMenuProps {
  patientName: string
  commentCount: number
  onAction: (action: string) => void
  permissions: string[]
  isAdmin?: boolean
  canSendReport?: boolean
}

interface MenuPosition {
  top: number
  left: number
}

const actions = [
  { label: 'Enviar laudo ao hospital', icon: Send, permission: 'reports.deliver' },
  { label: 'Preparação e andamento', icon: ClipboardPenLine, permission: 'exams.view' },
  { label: 'Abrir no visualizador padrão', icon: Eye, permission: 'exams.viewer.open' },
  { label: 'Abrir laudário', icon: FilePenLine, permission: 'reports.view' },
  { label: 'Prescrição Médica', icon: ClipboardPenLine, permission: 'prescriptions.view' },
  { label: 'Inserir comentário', icon: MessageSquareText, permission: 'comments.create' },
  { label: 'Anexar arquivos', icon: Paperclip, permission: 'attachments.upload' },
  { label: 'Documentos do exame', icon: Paperclip, permission: 'attachments.view' },
] as const

const menuWidth = 256
const viewportPadding = 12
const triggerGap = 8

export const ExamActionsMenu = ({ patientName, commentCount, onAction, permissions, isAdmin = false, canSendReport = false }: ExamActionsMenuProps) => {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<MenuPosition | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const triggerRect = trigger.getBoundingClientRect()
    const menuHeight = menuRef.current?.offsetHeight ?? 196
    const spaceBelow = window.innerHeight - triggerRect.bottom - triggerGap - viewportPadding
    const openAbove = spaceBelow < menuHeight && triggerRect.top > spaceBelow
    const desiredTop = openAbove
      ? triggerRect.top - menuHeight - triggerGap
      : triggerRect.bottom + triggerGap

    setPosition({
      top: Math.max(
        viewportPadding,
        Math.min(desiredTop, window.innerHeight - menuHeight - viewportPadding),
      ),
      left: Math.max(
        viewportPadding,
        Math.min(triggerRect.right - menuWidth, window.innerWidth - menuWidth - viewportPadding),
      ),
    })
  }, [])

  useLayoutEffect(() => {
    if (open) updatePosition()
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return

    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    const closeOnScroll = () => setOpen(false)

    document.addEventListener('mousedown', closeOnOutsideClick)
    window.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', closeOnScroll, true)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      window.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', closeOnScroll, true)
    }
  }, [open, updatePosition])

  return (
    <div className="relative flex justify-end">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        aria-label={`Ações do exame de ${patientName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setPosition(null)
          setOpen((current) => !current)
        }}
      >
        <MoreHorizontal size={20} />
      </Button>
      {commentCount > 0 ? (
        <span className="pointer-events-none absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-brand-700 px-1 text-[0.65rem] font-extrabold leading-5 text-white shadow-sm">
          {commentCount > 99 ? '99+' : commentCount}
        </span>
      ) : null}
      {open
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={{ top: position?.top ?? 0, left: position?.left ?? 0 }}
              className={`fixed z-[100] w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl ${position ? 'visible' : 'invisible'}`}
            >
              {actions.filter((action) => (isAdmin || permissions.includes(action.permission)) && (action.label !== 'Enviar laudo ao hospital' || canSendReport)).map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-900 focus-visible:bg-brand-50 focus-visible:outline-none"
                  onClick={() => {
                    setOpen(false)
                    onAction(label)
                  }}
                >
                  <Icon size={17} className="text-brand-700" aria-hidden="true" />
                  <span className="flex-1">{label}</span>
                  {label === 'Inserir comentário' && commentCount > 0 ? (
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-extrabold text-brand-800">{commentCount}</span>
                  ) : null}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
