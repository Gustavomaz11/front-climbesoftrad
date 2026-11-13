import { Link } from 'react-router-dom'
import { ArrowRight, Files } from 'lucide-react'
import { Area, AreaChart } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChartContainer } from '@/components/ui/chart'
import ReportingWelcomeCard from '@/pages/dashboard/eCommerce/welcome-banner-card'
import { StripePattern } from '@/pages/dashboard/eCommerce/stripe-pattern'
import { useAuthentication } from '@/project/features/auth/auth-context'
import { Alert } from '@/project/components/ui/Alert'
import { workflowLabels } from '@/project/features/exam-workflow/workflow.types'
import { ReportingActivityChart, ReportingModalitiesChart, ReportingUnitsCard } from './ReportingCharts'
import { useReportingOverview } from './use-reporting-overview'

export const ReportingOverview=()=>{
  const {user}=useAuthentication()
  const {exams,totals,loading,error,referenceDate,refresh}=useReportingOverview()
  const days=Array.from({length:7},(_,index)=>{const date=new Date(referenceDate);date.setDate(date.getDate()-6+index);return {value:exams.filter(exam=>new Date(exam.createdAt).toLocaleDateString()===date.toLocaleDateString()).length}})
  return <div className="dashboard-analytics">
    {error&&<div className="mb-6"><Alert variant="error">Não foi possível atualizar os indicadores. Os dados anteriores podem estar desatualizados.</Alert></div>}
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 xl:col-span-6"><ReportingWelcomeCard name={user?.fullName.split(' ')[0]||''} total={totals[0]} ready={totals[1]} inProgress={totals[2]} sample={exams.length} completed={exams.filter(exam=>exam.reportCompletionId).length} loading={loading} error={error} onRefresh={refresh} /></div>
      <div className="col-span-12 md:col-span-6 xl:col-span-3"><Card className="h-full gap-3 overflow-hidden"><CardHeader><div className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-lg bg-emerald-500/15 text-emerald-500"><Files className="size-4.5" /></span><CardDescription className="text-base">Exames ativos</CardDescription></div><CardTitle className="text-2xl font-semibold tabular-nums">{loading||error?'—':totals[0]} <span className="text-xs font-normal text-muted-foreground">na central</span></CardTitle></CardHeader><CardContent className="mt-auto p-0"><ChartContainer config={{value:{label:'Exames',color:'#10b981'}}} className="h-32 w-full"><AreaChart data={days}><defs><StripePattern id="recent-active-pattern" color="#10b981" /></defs><Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#recent-active-pattern)" /></AreaChart></ChartContainer></CardContent></Card></div>
      <div className="col-span-12 md:col-span-6 xl:col-span-3"><ReportingModalitiesChart exams={exams} /></div>
      <div className="col-span-12 xl:col-span-8"><ReportingActivityChart exams={exams} referenceDate={referenceDate} /></div><div className="col-span-12 xl:col-span-4"><ReportingUnitsCard exams={exams} /></div>
      <div className="col-span-12"><Card className="gap-0 overflow-hidden"><CardHeader className="flex flex-row items-center justify-between border-b pb-4"><div><CardTitle className="text-lg font-semibold">Exames na fila</CardTitle><CardDescription>Estudos recentes dos hospitais autorizados</CardDescription></div><Button variant="ghost" asChild className="text-xs"><Link to="/dashboard">Ver todos<ArrowRight className="size-3.5" /></Link></Button></CardHeader><Table><TableHeader><TableRow>{['Paciente','Exame','Unidade','Etapa'].map(label=><TableHead key={label} className="px-5">{label}</TableHead>)}</TableRow></TableHeader><TableBody>{exams.slice(0,6).map(exam=><TableRow key={exam.id}><TableCell className="px-5 py-4 font-medium">{exam.patientName}</TableCell><TableCell className="px-5"><Badge variant="secondary" className="mr-2 text-[10px]">{exam.modality}</Badge>{exam.studyDescription}</TableCell><TableCell className="px-5 text-xs text-muted-foreground">{exam.unit}</TableCell><TableCell className="px-5"><Badge variant="outline" className="text-xs font-normal">{exam.reportSentAt?'Enviado ao Hospital':exam.reportCompletionId?'Finalizado':workflowLabels[exam.workflowState]}</Badge></TableCell></TableRow>)}</TableBody></Table>{!loading&&!exams.length&&<p className="p-12 text-center text-sm text-muted-foreground">Nenhum exame disponível na fila.</p>}</Card></div>
    </div>
  </div>
}
