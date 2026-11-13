import { useEffect, useState } from 'react'
import { SearchableSelect } from '../../components/ui/SearchableSelect'
import { listExamModalities, type ExamModalityRecord } from './exam-modalities-api'
import { standardModalities } from './standard-modalities'

export const ModalitySelect = ({value,onChange,label='Modalidade',error}: {
  value: string; onChange: (value: string)=>void; label?: string; error?: string
}) => {
  const [items,setItems] = useState<ExamModalityRecord[]>(()=>standardModalities.map(item=>({...item,active:true,standard:true})))
  const [failed,setFailed] = useState(false)
  useEffect(()=>{
    let live=true
    void listExamModalities().then(data=>{if(live)setItems(data)}).catch(()=>{if(live)setFailed(true)})
    return()=>{live=false}
  },[])
  return <SearchableSelect label={label} value={value} onChange={onChange}
    options={items.filter(item=>item.active || item.code===value).map(item=>({id:item.code,label:`${item.code} · ${item.name}`}))}
    placeholder="Digite o nome ou a sigla" error={error ?? (failed ? 'Catálogo indisponível. Exibindo modalidades padrão; atualize para carregar as personalizadas.' : undefined)} />
}
