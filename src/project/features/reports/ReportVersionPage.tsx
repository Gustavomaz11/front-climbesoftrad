import {useEffect,useState} from 'react'
import {useNavigate,useParams} from 'react-router-dom'
import {getReportVersion} from './report-lifecycle-api'
import type {CompletedReport} from './completed-report'
import {CompletedReportView} from './CompletedReportView'

export const ReportVersionPage=()=>{
  const {versionId}=useParams(),navigate=useNavigate()
  const [value,setValue]=useState<CompletedReport|null>(null),[error,setError]=useState(false)
  useEffect(()=>{let active=true;void getReportVersion(versionId!).then(result=>{if(active)setValue(result)}).catch(()=>{if(active)setError(true)});return()=>{active=false}},[versionId])
  if(error)return <p role="alert" className="p-6">Versão indisponível para seu acesso.</p>
  return value?<CompletedReportView document={value} onBack={()=>navigate(-1)} />:<p role="status" className="p-6">Carregando versão preservada…</p>
}
