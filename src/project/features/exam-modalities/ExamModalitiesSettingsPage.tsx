import { Table as SurfaceTable, TableHeader as SurfaceTableHeader, TableRow as SurfaceTableRow, TableHead as SurfaceTableHead, TableBody as SurfaceTableBody, TableCell as SurfaceTableCell } from '@/components/ui/table'
import { Card as SurfaceCard } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { SettingsPageLayout } from '../settings/components/SettingsPageLayout'
import { useAuthentication } from '../auth/auth-context'
import { hasPermission } from '../auth/auth.types'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Alert } from '../../components/ui/Alert'
import { listExamModalities, saveExamModality, type ExamModalityRecord } from './exam-modalities-api'

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
export const ExamModalitiesSettingsPage = () => {
  const { user } = useAuthentication()
  const [items, setItems] = useState<ExamModalityRecord[]>([]), [query,setQuery] = useState(''), [error,setError] = useState('')
  const [loading,setLoading] = useState(true), [busy,setBusy] = useState(false), [reload,setReload] = useState(0)
  const [editing,setEditing] = useState<ExamModalityRecord | null | undefined>(), [form,setForm] = useState({code:'',name:'',active:true})
  const canView = Boolean(user && hasPermission(user,'exam.catalog.view')), canManage = Boolean(user && hasPermission(user,'exam.catalog.manage'))
  useEffect(() => {
    if (!canView) return
    let live = true
    void listExamModalities().then(data => { if(live) setItems(data) }).catch(() => { if(live) setError('Não foi possível carregar as modalidades.') }).finally(() => { if(live) setLoading(false) })
    return () => { live = false }
  },[reload,canView])
  const open = (record: ExamModalityRecord | null) => { setEditing(record); setForm(record ?? {code:'',name:'',active:true}); setError('') }
  const save = async () => {
    setBusy(true); setError('')
    try { await saveExamModality(form, Boolean(editing)); setEditing(undefined); setReload(value => value+1) }
    catch { setError('Não foi possível salvar. Confira os dados e se o código já está cadastrado.') }
    finally { setBusy(false) }
  }
  const visible = items.filter(item => normalize(item.code+' '+item.name).includes(normalize(query)))
  return <SettingsPageLayout active="modalities" title="Modalidades de exames" description="Catálogo DICOM pré-preenchido. Pesquise pelo nome ou pela sigla e personalize as modalidades desta empresa.">
    {!canView ? <Alert variant="error">Seu acesso não permite consultar este cadastro.</Alert> : <>
      <div className="mb-5 flex flex-wrap items-end gap-4"><div className="min-w-64 flex-1"><Input label="Buscar modalidade" placeholder="Digite: tomografia, mamografia, CT…" value={query} onChange={event => setQuery(event.target.value)} /></div>{canManage && <Button onClick={()=>open(null)}>Cadastrar modalidade</Button>}</div>
      {error && editing === undefined && <Alert variant="error">{error}</Alert>}
      {loading ? <p role="status">Carregando modalidades…</p> : <SurfaceCard className="overflow-hidden rounded-2xl border border-border bg-card gap-0 py-0 ring-0">
        <p className="border-b border-border px-5 py-4 text-sm text-muted-foreground">{visible.length} de {items.length} modalidades</p>
        <div className="overflow-x-auto"><SurfaceTable className="w-full text-left text-sm"><SurfaceTableHeader className="bg-muted text-muted-foreground"><SurfaceTableRow><SurfaceTableHead className="p-4">Sigla</SurfaceTableHead><SurfaceTableHead>Modalidade</SurfaceTableHead><SurfaceTableHead>Situação</SurfaceTableHead><SurfaceTableHead className="p-4 text-right">Ação</SurfaceTableHead></SurfaceTableRow></SurfaceTableHeader><SurfaceTableBody>{visible.map(item=><SurfaceTableRow key={item.code} className="border-t border-border"><SurfaceTableCell className="p-4 font-bold text-brand-900">{item.code}</SurfaceTableCell><SurfaceTableCell>{item.name}<span className="ml-2 text-xs text-muted-foreground">{item.standard ? 'DICOM' : 'Personalizada'}</span></SurfaceTableCell><SurfaceTableCell>{item.active ? 'Ativa' : 'Inativa'}</SurfaceTableCell><SurfaceTableCell className="p-4 text-right">{canManage && <Button variant="ghost" size="sm" onClick={()=>open(item)}>Editar</Button>}</SurfaceTableCell></SurfaceTableRow>)}</SurfaceTableBody></SurfaceTable></div>
        {!visible.length && <p className="p-8 text-center text-muted-foreground">Nenhuma modalidade encontrada.</p>}
      </SurfaceCard>}
    </>}
    <Modal open={editing !== undefined} title={editing ? 'Editar modalidade' : 'Cadastrar modalidade'} onClose={()=>{if(!busy)setEditing(undefined)}}>
      <form className="space-y-4" onSubmit={event=>{event.preventDefault();void save()}}>
        {error && <Alert variant="error">{error}</Alert>}
        <Input label="Sigla" required pattern="[A-Z][A-Z0-9_]{0,15}" maxLength={16} value={form.code} disabled={Boolean(editing) || busy} onChange={event=>setForm({...form,code:event.target.value.toUpperCase()})} />
        <Input label="Nome da modalidade" required minLength={2} maxLength={180} value={form.name} disabled={busy} onChange={event=>setForm({...form,name:event.target.value})} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} disabled={busy} onChange={event=>setForm({...form,active:event.target.checked})} />Modalidade ativa</label>
        <Button type="submit" disabled={busy}>{busy ? 'Salvando…' : 'Salvar modalidade'}</Button>
      </form>
    </Modal>
  </SettingsPageLayout>
}
