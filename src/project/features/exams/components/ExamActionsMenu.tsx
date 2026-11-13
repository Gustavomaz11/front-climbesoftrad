import { ClipboardPenLine, Eye, FilePenLine, MessageSquareText, MoreHorizontal, Paperclip, Send } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
interface ExamActionsMenuProps { patientName: string; commentCount: number; onAction: (action: string) => void; permissions: string[]; isAdmin?: boolean; canSendReport?: boolean }
const actions = [
  { label: 'Enviar laudo ao hospital', icon: Send, permission: 'reports.deliver' },
  { label: 'Preparação e andamento', icon: ClipboardPenLine, permission: 'exams.view' },
  { label: 'Abrir no visualizador padrão', icon: Eye, permission: 'exams.viewer.open' },
  { label: 'Abrir laudário', icon: FilePenLine, permission: 'reports.view' },
  { label: 'Prescrição Médica', icon: ClipboardPenLine, permission: 'prescriptions.view' },
  { label: 'Inserir comentário', icon: MessageSquareText, permission: 'comments.create' },
  { label: 'Anexar arquivos', icon: Paperclip, permission: 'attachments.upload' },
  { label: 'Documentos do exame', icon: Paperclip, permission: 'attachments.view' },
]
export const ExamActionsMenu = ({ patientName, commentCount, onAction, permissions, isAdmin = false, canSendReport = false }: ExamActionsMenuProps) => <div className="relative flex justify-end"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={'Ações do exame de ' + patientName} className="size-8 text-muted-foreground"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="z-[100] w-64 p-1.5">{actions.filter(action => (isAdmin || permissions.includes(action.permission)) && (action.label !== 'Enviar laudo ao hospital' || canSendReport)).map(({ label, icon: Icon }) => <DropdownMenuItem key={label} onSelect={() => onAction(label)} className="gap-3 rounded-md px-3 py-2.5 text-xs"><Icon className="size-4 text-primary" /><span className="flex-1">{label}</span>{label === 'Inserir comentário' && commentCount > 0 && <Badge variant="secondary" className="text-[10px]">{commentCount}</Badge>}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>{commentCount > 0 && <span className="pointer-events-none absolute -top-1 -right-1 rounded-full bg-primary px-1 text-[9px] leading-4 text-white">{commentCount > 99 ? '99+' : commentCount}</span>}</div>
