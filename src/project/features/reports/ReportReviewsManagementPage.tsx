import {useEffect,useState} from 'react'
import {PageHeading} from '@/portal/PageHeading'
import {Card} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {NativeSelect} from '@/components/ui/native-select'
import {Table,TableHeader,TableHead,TableBody,TableRow,TableCell} from '@/components/ui/table'
import {Button} from '../../components/ui/Button'
import {Modal} from '../../components/ui/Modal'
import {listExams} from '../exams/exams-api'
import type {Exam} from '../exams/exam.types'
import {workflowLabels,type WorkflowState} from '../exam-workflow/workflow.types'
import {getCompletedReport,type CompletedReport} from './completed-report'
import {ReportLifecyclePanel} from './ReportLifecyclePanel'
import {useAuthentication} from '../auth/auth-context'

export const ReportReviewsManagementPage=()=>{
  const {user}=useAuthentication()
  const [state,setState]=useState<WorkflowState>('REVIEW'),[search,setSearch]=useState(''),[items,setItems]=useState<Exam[]>([]),[page,setPage]=useState(1),[total,setTotal]=useState(0),[loading,setLoading]=useState(false),[error,setError]=useState(''),[selected,setSelected]=useState<CompletedReport|null>(null)
  const allowed=Boolean(user?.permissions.includes('reports.review.authorize'))
  useEffect(()=>{
    if(!allowed)return
    let active=true
    const load=()=>{setLoading(true);void listExams({page,pageSize:20,patientName:search,examDate:'',workflowState:state}).then(result=>{if(active){setItems(result.items);setTotal(result.total);setError('')}}).catch(()=>{if(active)setError('Não foi possível carregar os laudos.')}).finally(()=>{if(active)setLoading(false)})}
    const debounce=window.setTimeout(load,250),timer=window.setInterval(load,10000)
    return()=>{active=false;window.clearTimeout(debounce);window.clearInterval(timer)}
  },[allowed,page,state,search])
  const manage=async(exam:Exam)=>{try{const value=await getCompletedReport(exam.id);if(!value)throw Error();setSelected(value)}catch{setError('O exame ainda não possui uma versão assinada disponível.')}}
  if(!allowed)return <p className="p-6">Seu acesso não permite administrar reavaliações.</p>
  return <main className="space-y-5"><PageHeading eyebrow="Gestão" title="Reavaliação de laudos" description="Acompanhe solicitações do Hospital e autorize médicos a corrigir versões específicas."/>
    <Card className="flex flex-wrap gap-4 p-4"><label className="text-sm">Estado<NativeSelect value={state} onChange={e=>{setState(e.target.value as WorkflowState);setPage(1)}}>{(['REVIEW','SIGNED','RESIGNED','REVALIDATED','IN_PROGRESS','TYPED'] as const).map(key=><option key={key} value={key}>{workflowLabels[key]}</option>)}</NativeSelect></label><label className="min-w-48 flex-1 text-sm">Paciente<Input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Buscar pelo nome"/></label></Card>
    {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
    <Card className="overflow-hidden p-0"><Table><TableHeader><TableRow><TableHead>Paciente</TableHead><TableHead>Exame</TableHead><TableHead>Unidade</TableHead><TableHead>Responsável</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader><TableBody>{items.map(exam=><TableRow key={exam.id}><TableCell>{exam.patientName}</TableCell><TableCell>{exam.studyDescription}</TableCell><TableCell>{exam.unit}</TableCell><TableCell>{exam.reportingUserName??'Sem responsável'}</TableCell><TableCell><Button size="sm" variant="outline" disabled={!exam.reportCompletionId} onClick={()=>void manage(exam)}>Gerenciar revisão</Button></TableCell></TableRow>)}</TableBody></Table>{!items.length&&<p role="status" className="p-6 text-sm text-muted-foreground">{loading?'Carregando…':'Nenhum exame neste estado.'}</p>}<div className="flex items-center justify-between gap-3 border-t p-4 text-sm"><p>{total} exames · Página {page}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page===1||loading} onClick={()=>setPage(page-1)}>Anterior</Button><Button variant="outline" size="sm" disabled={page*20>=total||loading} onClick={()=>setPage(page+1)}>Próxima</Button></div></div></Card>
    <Modal open={Boolean(selected)} size="lg" title="Gerenciar revisão de laudo" description={selected?.exam.patientName} onClose={()=>setSelected(null)}>{selected&&<ReportLifecyclePanel document={selected}/>}</Modal>
  </main>
}
