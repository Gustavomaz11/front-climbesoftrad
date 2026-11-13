import {useEffect,useRef,useState} from 'react'
import type {JSONContent} from '@tiptap/core'
import {closeReportSession,touchReportPresence} from './report-api'

export const useReportSession = ({examId,clientId,enabled,onHeld,content}: {
  examId:string|undefined;clientId:string;enabled:boolean;onHeld:(held:boolean)=>void;content:()=>JSONContent
}) => {
  const [error,setError]=useState(''),[releaseReason,setReleaseReason]=useState<string|null>(null)
  const latest=useRef(content)
  useEffect(()=>{latest.current=content},[content])
  useEffect(()=>{
    if(!examId || !enabled){onHeld(false);return}
    let active=true,acquired=false,stopped=false
    const touch=async()=>{
      if(stopped)return
      try {
        const session=await touchReportPresence(examId,clientId)
        if(!active)return
        acquired=true;onHeld(true);setError('')
        if(session.releaseRequested)setReleaseReason(session.releaseReason||'Encerramento solicitado pela administração.')
      }catch{
        stopped=true
        if(active){onHeld(false);setError('A sessão de edição está bloqueada ou foi encerrada. Atualize a página antes de continuar.')}
      }
    }
    void touch()
    const timer=window.setInterval(()=>void touch(),5000)
    const release=(pageHide=false)=>{
      if(!acquired)return
      const value=latest.current()
      // keepalive has a browser size limit; large drafts are already autosaved.
      const small=new TextEncoder().encode(JSON.stringify(value)).byteLength<45000
      if(pageHide && !small)return
      void closeReportSession(examId,clientId,value,pageHide).catch(()=>undefined)
    }
    const onPageHide=()=>release(true)
    window.addEventListener('pagehide',onPageHide)
    return ()=>{active=false;window.clearInterval(timer);window.removeEventListener('pagehide',onPageHide);release()}
  },[examId,clientId,enabled,onHeld])
  return {error,releaseReason}
}
