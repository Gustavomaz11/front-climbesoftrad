import type { Editor } from '@tiptap/react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Save,
  Strikethrough,
  Underline,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import type { ReactNode } from 'react'

interface ToolbarButtonProps {
  label: string
  active?: boolean
  disabled?: boolean
  children: ReactNode
  onClick: () => void
}

interface ReportToolbarProps {
  editor: Editor
  saving: boolean
  uploadingImage: boolean
  zoom: number
  onSave: () => void
  onInsertImage: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  editable?: boolean
  canUploadImage?: boolean
}

const ToolbarButton = ({ label, active = false, disabled = false, children, onClick }: ToolbarButtonProps) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={active || undefined}
    disabled={disabled}
    onClick={onClick}
    className={`grid size-9 place-items-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'bg-muted text-brand-900' : 'text-muted-foreground hover:bg-background hover:text-foreground'}`}
  >
    {children}
  </button>
)

export const ReportToolbar = ({ editor, saving, uploadingImage, zoom, onSave, onInsertImage, onZoomIn, onZoomOut, onResetZoom, editable = true, canUploadImage = true }: ReportToolbarProps) => (
  <div className="flex flex-wrap items-center gap-1 border-b border-border bg-card px-4 py-2 shadow-sm">
    {editable ? <>
    <ToolbarButton label="Salvar (Ctrl+S)" disabled={saving} onClick={onSave}><Save size={17} /></ToolbarButton>
    <span className="mx-1 h-6 w-px bg-muted" />
    <ToolbarButton label="Desfazer" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 size={17} /></ToolbarButton>
    <ToolbarButton label="Refazer" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 size={17} /></ToolbarButton>
    <span className="mx-1 h-6 w-px bg-muted" />
    <ToolbarButton label="Negrito" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={17} /></ToolbarButton>
    <ToolbarButton label="Itálico" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={17} /></ToolbarButton>
    <ToolbarButton label="Sublinhado" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><Underline size={17} /></ToolbarButton>
    <ToolbarButton label="Tachado" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={17} /></ToolbarButton>
    <label className="ml-1 grid size-9 cursor-pointer place-items-center rounded-lg text-muted-foreground hover:bg-background" title="Cor do texto">
      <span className="size-4 rounded-full border border-input bg-gradient-to-br from-red-500 via-blue-500 to-emerald-500" />
      <input type="color" className="sr-only" onChange={(event) => editor.chain().focus().setColor(event.target.value).run()} />
    </label>
    <span className="mx-1 h-6 w-px bg-muted" />
    <ToolbarButton label="Título 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 size={18} /></ToolbarButton>
    <ToolbarButton label="Título 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={18} /></ToolbarButton>
    <ToolbarButton label="Lista" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={18} /></ToolbarButton>
    <ToolbarButton label="Lista numerada" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={18} /></ToolbarButton>
    <span className="mx-1 h-6 w-px bg-muted" />
    <ToolbarButton label="Alinhar à esquerda" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft size={17} /></ToolbarButton>
    <ToolbarButton label="Centralizar" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter size={17} /></ToolbarButton>
    <ToolbarButton label="Alinhar à direita" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight size={17} /></ToolbarButton>
    <ToolbarButton label="Justificar" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}><AlignJustify size={17} /></ToolbarButton>
    <span className="mx-1 h-6 w-px bg-muted" />
    {canUploadImage ? <ToolbarButton label="Inserir imagem" disabled={uploadingImage} onClick={onInsertImage}><ImagePlus size={18} /></ToolbarButton> : null}
    <span className="mx-1 h-6 w-px bg-muted" />
    </> : null}
    <ToolbarButton label="Diminuir zoom" disabled={zoom <= 0.75} onClick={onZoomOut}><ZoomOut size={18} /></ToolbarButton>
    <button type="button" className="min-w-12 rounded-lg px-1 py-2 text-xs font-bold text-muted-foreground hover:bg-background" onClick={onResetZoom} title="Restaurar zoom">{Math.round(zoom * 100)}%</button>
    <ToolbarButton label="Aumentar zoom com lupa" disabled={zoom >= 2} onClick={onZoomIn}><ZoomIn size={18} /></ToolbarButton>
  </div>
)
