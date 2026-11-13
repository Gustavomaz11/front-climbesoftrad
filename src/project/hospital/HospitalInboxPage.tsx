import { useState } from 'react'
import { CheckCircle2, ChevronDown, ClipboardCheck, FolderInput, RefreshCw, Search, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { PageHeading } from '@/portal/PageHeading'
import { StatCard } from '@/portal/StatCard'
import { Alert } from '../components/ui/Alert'
import { DicomImportForm } from '../features/dicom/components/DicomImportForm'
import { HospitalReviewForm } from './HospitalReviewForm'
import { HospitalIntakeTable } from './HospitalIntakeTable'
import { useHospitalInbox } from './use-hospital-inbox'

export const HospitalInboxPage = () => {
  const inbox = useHospitalInbox()
  const [importOpen, setImportOpen] = useState(false)
  const { user, rows, canView, canSubmit, selected, setSelected, loading, error, notice, setNotice, refresh, search, setSearch, tab, setTab, visible, open } = inbox
  return <main className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-7 lg:p-8">
    <PageHeading eyebrow="Portal Hospital" title="Envios de exames" description="Confira os dados e as imagens recebidas, complete o cadastro e envie para o ClimbeSoftRad." actions={<><Button variant="outline" className="h-10 gap-2 px-4 text-xs" onClick={refresh}><RefreshCw className="size-3.5" />Atualizar</Button>{canSubmit && user?.permissions.includes('dicom.import') && <Button className="h-10 gap-2 px-4 text-xs" onClick={() => setImportOpen(!importOpen)}><Upload className="size-3.5" />Importar exames</Button>}</>} />
    {!canView ? <Alert variant="warning">Seu usuário precisa de um vínculo com o perfil Hospital para acessar a recepção.</Alert> : <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Estudos recebidos" value={rows.length} icon={FolderInput} hint="Até 200 estudos recentes" loading={loading} /><StatCard label="Recebendo Exame" value={rows.filter(row => row.status === 'RECEIVING').length} icon={RefreshCw} hint="Aguarde todos os arquivos" tone="blue" loading={loading} /><StatCard label="Aguardando conferência" value={rows.filter(row => row.status === 'DRAFT').length} icon={ClipboardCheck} hint="Prontos para revisão" tone="amber" loading={loading} /><StatCard label="Enviados à central" value={rows.filter(row => row.status === 'SUBMITTED').length} icon={CheckCircle2} hint="Disponíveis no ClimbeSoftRad" tone="violet" loading={loading} /></div>
      {canSubmit && user?.permissions.includes('dicom.import') && <Collapsible open={importOpen} onOpenChange={setImportOpen}><Card className="gap-0 py-0 shadow-none"><CollapsibleTrigger asChild><button type="button" className="flex w-full items-center gap-3 p-4 text-left"><span className="grid size-8 place-items-center rounded-lg bg-primary/5 text-primary"><Upload className="size-4" /></span><span className="flex-1"><span className="block text-xs font-medium">Adicionar arquivos manualmente</span><span className="mt-0.5 block text-[10px] text-muted-foreground">Importe arquivos DICOM ou um pacote ZIP do exame</span></span><ChevronDown className={importOpen ? 'size-4 rotate-180 text-muted-foreground' : 'size-4 text-muted-foreground'} /></button></CollapsibleTrigger><CollapsibleContent><CardContent className="border-t pt-5"><DicomImportForm hospitalIntake onDone={() => { setNotice('Arquivos importados. A conferência será liberada após a validação de todo o recebimento.'); refresh() }} /></CardContent></CollapsibleContent></Card></Collapsible>}
      {error && <Alert variant="error">{error}</Alert>}{notice && <Alert variant="success" onDismiss={() => setNotice('')}>{notice}</Alert>}
      <Card className="gap-0 overflow-hidden py-0 shadow-none"><CardHeader className="gap-4 border-b px-5 py-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="text-sm font-semibold">Estudos do hospital</CardTitle><p className="mt-1 text-[11px] text-muted-foreground">Do recebimento à fila de laudos, acompanhe seus exames.</p></div><Badge variant="outline" className="gap-1.5 text-[10px] font-normal"><span className="size-1.5 rounded-full bg-emerald-500" />Atualização automática</Badge></div></CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3"><Tabs value={tab} onValueChange={value => setTab(value as 'DRAFT' | 'SUBMITTED')}><TabsList><TabsTrigger value="DRAFT" className="gap-2 text-xs">Para conferir<Badge variant="secondary" className="px-1.5 text-[10px]">{rows.filter(row => row.status !== 'SUBMITTED').length}</Badge></TabsTrigger><TabsTrigger value="SUBMITTED" className="text-xs">Enviados</TabsTrigger></TabsList></Tabs><div className="relative w-full sm:w-72"><Search className="pointer-events-none absolute top-2.5 left-3 size-3.5 text-muted-foreground" /><Input aria-label="Buscar paciente ou estudo" placeholder="Buscar paciente ou estudo…" value={search} onChange={event => setSearch(event.target.value)} className="h-9 pl-9 text-xs shadow-none" /></div></div>
        <HospitalIntakeTable rows={visible} canSubmit={canSubmit} loading={loading} submitted={tab === 'SUBMITTED'} onOpen={id => void open(id)} /><p className="border-t px-5 py-3 text-[10px] text-muted-foreground">Atualização a cada 5 segundos · Conferência liberada somente após o recebimento completo</p>
      </Card>
    </>}
    {selected && <HospitalReviewForm key={selected.id} intake={selected} canSubmit={canSubmit} onClose={() => setSelected(null)} onDone={submitted => { setSelected(null); setNotice(submitted ? 'Estudo enviado. O paciente já está na fila do ClimbeSoftRad.' : 'Rascunho salvo para continuar a conferência.'); refresh() }} />}
  </main>
}
