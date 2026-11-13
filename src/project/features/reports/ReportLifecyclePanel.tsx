import {useCallback,useEffect,useState} from 'react'
import {Button} from '../../components/ui/Button'
import {Modal} from '../../components/ui/Modal'
import {Card} from '@/components/ui/card'
import {Textarea} from '@/components/ui/textarea'
import {NativeSelect} from '@/components/ui/native-select'
import {listPhysicians} from '../physicians/physicians-api'
import type {Physician} from '../physicians/physician.types'
import type {CompletedReport} from './completed-report'
import {reportCompletionError} from './completed-report'
import {authorizeReportRevision,getReportHistory,requestReportReview,revalidateReport,reviseReport,type ReportHistory} from './report-lifecycle-api'
import {workflowLabels} from '../exam-workflow/workflow.types'

const eventLabels:Record<string,string>={REPORT_FINALIZED:'Laudo assinado',REPORT_RESIGNED:'Laudo reassinado',REPORT_DELIVERED:'Enviado ao hospital',REPORT_VERSION_ACCESSED:'Versão consultada',REPORT_REVIEW_REQUESTED:'Reavaliação solicitada',REPORT_REASSIGN_AUTHORIZED:'Reassinatura autorizada',REPORT_REVISION_STARTED:'Correção iniciada',REPORT_REVALIDATED:'Revalidado sem modificação',REPORT_PRINT_REQUESTED:'Impressão solicitada',REPORT_EXPORT_REQUESTED:'Exportação PDF solicitada',REPORT_SAVED:'Rascunho salvo',REPORT_FORCE_RELEASE_REQUESTED:'Encerramento forçado solicitado',REPORT_SESSION_EXPIRED:'Sessão de edição expirada',REPORT_PRESENCE_ENDED:'Edição encerrada',REPORT_PRESENCE_STARTED:'Laudário aberto'}
const date=(value:string)=>new Date(value).toLocaleString('pt-BR')

export const ReportLifecyclePanel=({document,onRevisionStarted,onUpdated,onHistory}:{document:CompletedReport;onRevisionStarted?:()=>void;onUpdated?:()=>void;onHistory?:(value:ReportHistory)=>void})=>{
  const [history,setHistory]=useState<ReportHistory|null>(null),[error,setError]=useState(''),[mode,setMode]=useState(''),[reason,setReason]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('')
  const [doctors,setDoctors]=useState<Physician[]>([]),[physicianId,setPhysicianId]=useState(''),[expanded,setExpanded]=useState(false)
  const [modalOpen,setModalOpen]=useState(false)
  const refresh=useCallback(()=>{void getReportHistory(document.id).then(value=>{setHistory(value);onHistory?.(value)}).catch(()=>setError('Não foi possível consultar o histórico do laudo.'))},[document.id,onHistory])
  useEffect(()=>{refresh();const timer=window.setInterval(refresh,10000);return()=>window.clearInterval(timer)},[refresh])
  useEffect(()=>{if(mode==='AUTHORIZE')void listPhysicians().then(items=>setDoctors(items.filter(p=>p.active && (p.allUnits || p.unitIds.includes(document.exam.unitId))))).catch(()=>setError('Não foi possível carregar os médicos autorizados para a unidade.'))},[mode,document.exam.unitId])
  const open=(value:string)=>{setMode(value);setModalOpen(true);setReason('');setError('');setNotice('');setPhysicianId('')}
  const submit=async()=>{
    if(!history)return
    setBusy(true);setError('')
    try{
      if(mode==='REVIEW')await requestReportReview(document.id,reason)
      if(mode==='AUTHORIZE')await authorizeReportRevision(document.examId,document.id,physicianId,reason)
      if(mode==='REVISE')await reviseReport(document.examId,document.id,history.workflowVersion,reason)
      if(mode==='REVALIDATE')await revalidateReport(document.examId,document.id,history.workflowVersion,reason)
      if(mode==='REVISE'){onRevisionStarted?.();return}
      setNotice(mode==='AUTHORIZE'?'Médico autorizado para corrigir esta versão do laudo.':mode==='REVIEW'?'Reavaliação solicitada.':'Laudo revalidado sem modificação.');setModalOpen(false);refresh();onUpdated?.()
    }catch(failure){setError(reportCompletionError(failure))}finally{setBusy(false)}
  }
  return <section className="report-editor-chrome mx-auto max-w-[1100px] px-4 py-5">
    <Card className="gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Assinatura, versões e reavaliação</h2><p className="text-sm text-muted-foreground">{history?workflowLabels[history.workflowState]:'Carregando histórico…'} · Versão {document.version}{history&&!history.isLatest?' · Versão anterior preservada':''}</p></div><Button size="sm" variant="outline" onClick={refresh}>Atualizar histórico</Button></div>
      {error&&!modalOpen&&<p role="alert" className="text-sm text-destructive">{error}</p>}{notice&&<p role="status" className="text-sm">{notice}</p>}
      <div className="flex flex-wrap gap-2">
        {history?.canRequestReview&&<Button variant="outline" onClick={()=>open('REVIEW')}>Solicitar reavaliação</Button>}
        {history?.canRevise&&onRevisionStarted&&<Button onClick={()=>open('REVISE')}>Corrigir e reassinar</Button>}
        {history?.canRevalidate&&<Button variant="outline" onClick={()=>open('REVALIDATE')}>Revalidar sem modificação</Button>}
        {history?.canAuthorize&&<Button variant="outline" onClick={()=>open('AUTHORIZE')}>Autorizar outro médico</Button>}
      </div>
      <details><summary className="cursor-pointer text-sm font-semibold">Versões preservadas ({history?.versions.length??0})</summary><ol className="mt-3 space-y-3">{history?.versions.map(version=><li key={version.id} className="flex flex-wrap justify-between gap-3 rounded-lg border p-3 text-sm"><div><p className="font-semibold">Versão {version.version} · {version.physician.name} · CRM {version.physician.crm}</p><p>{date(version.finalizedAt)} · {version.sentAt?'Enviada ao hospital':'Ainda não enviada'}</p>{version.reason&&<p className="mt-1">Justificativa: {version.reason}</p>}</div><Button size="sm" variant="outline" onClick={()=>window.open(`/report-history/${version.id}`,'_blank','noopener,noreferrer')}>Ver versão {version.version}</Button></li>)}</ol></details>
      {Boolean(history?.reviews.length)&&<details open><summary className="cursor-pointer text-sm font-semibold">Solicitações de reavaliação</summary><ol className="mt-3 space-y-3">{history?.reviews.map(review=><li key={review.id} className="rounded-lg border p-3 text-sm"><p className="font-semibold">{review.resolvedAt?'Resolvida':'Em acompanhamento'} · {review.requestedByName} · {date(review.requestedAt)}</p><p>{review.reason}</p>{review.resolutionReason&&<p className="mt-1">Resultado: {review.status==='REVALIDATED'?'Revalidado sem modificação':'Laudo reassinado'} · {review.resolutionReason}</p>}</li>)}</ol></details>}
      {Boolean(history?.events.length)&&<details><summary className="cursor-pointer text-sm font-semibold">Histórico de auditoria</summary><ol className="mt-3 space-y-2">{history?.events.slice(0,expanded?300:15).map(event=><li key={event.id} className="border-l-2 pl-3 text-sm"><p>{eventLabels[event.action]??'Ação registrada'} · {event.actorName} · {date(event.occurredAt)}</p>{event.reason&&<p className="text-muted-foreground">{event.reason}</p>}</li>)}</ol>{(history?.events.length??0)>15&&<Button variant="ghost" size="sm" onClick={()=>setExpanded(!expanded)}>{expanded?'Mostrar menos':'Mostrar mais eventos'}</Button>}</details>}
    </Card>
    <Modal open={modalOpen} title={mode==='REVIEW'?'Solicitar reavaliação':mode==='REVISE'?'Iniciar correção do laudo':mode==='AUTHORIZE'?'Autorizar reassinatura':'Revalidar sem modificação'} description={`Laudo versão ${document.version}. As versões anteriores e suas assinaturas serão preservadas.`} dismissible={!busy} onClose={()=>{if(!busy)setModalOpen(false)}}>
      <div className="space-y-4">{mode==='AUTHORIZE'&&<label className="block text-sm font-medium">Médico autorizado<NativeSelect className="mt-2 w-full" value={physicianId} onChange={e=>setPhysicianId(e.target.value)}><option value="">Selecione o médico</option>{doctors.map(p=><option key={p.userId} value={p.userId}>{p.name} · CRM {p.crm}</option>)}</NativeSelect></label>}
        <label className="block text-sm font-medium">Justificativa obrigatória<Textarea className="mt-2" value={reason} onChange={e=>setReason(e.target.value)} minLength={10} maxLength={500} rows={4} placeholder="Descreva o motivo (mínimo de 10 caracteres)"/></label>
        {mode==='AUTHORIZE'&&<p className="text-sm text-muted-foreground">Esta autorização é exclusiva desta versão. O médico deverá usar a própria assinatura.</p>}
        {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-3"><Button variant="outline" disabled={busy} onClick={()=>setModalOpen(false)}>Cancelar</Button><Button disabled={busy||reason.trim().length<10||(mode==='AUTHORIZE'&&!physicianId)} onClick={()=>void submit()}>{busy?'Registrando…':'Confirmar'}</Button></div>
      </div>
    </Modal>
  </section>
}
