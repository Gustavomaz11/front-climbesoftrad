import {useCallback,useEffect,useState} from 'react'
import {recordReportActivity} from './report-lifecycle-api'

export const useAuditedReportPrint=(versionId:string,ready:boolean)=>{
  const [busy,setBusy]=useState(false),[error,setError]=useState('')
  const print=useCallback(async(activity:'PRINT_REQUESTED'|'EXPORT_REQUESTED'='PRINT_REQUESTED')=>{
    if(!ready||busy)return
    setBusy(true);setError('')
    try{
      await recordReportActivity(versionId,activity)
      document.documentElement.dataset.reportPrintAuthorized='true'
      window.print()
    }catch{setError('Não foi possível registrar a impressão/exportação. Confira a conexão e tente novamente.')}
    finally{delete document.documentElement.dataset.reportPrintAuthorized;setBusy(false)}
  },[versionId,ready,busy])
  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='p'){event.preventDefault();void print()}}
    window.addEventListener('keydown',key)
    return()=>{window.removeEventListener('keydown',key);delete document.documentElement.dataset.reportPrintAuthorized}
  },[print])
  return {print,busy,error}
}
