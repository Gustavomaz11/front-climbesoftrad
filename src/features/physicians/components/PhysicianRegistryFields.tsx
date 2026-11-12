import { useEffect, useRef, useState } from 'react'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { Alert } from '../../../components/ui/Alert'
import { lookupPhysicianRegistry } from '../physicians-api'
import { brazilStates, type RegistryLookupResult } from '../physician-registry.types'
import { HttpResponseError } from '../../auth/auth-http-client'

export const PhysicianRegistryFields = ({value,onChange,disabled}: {
  value: RegistryLookupResult | null; onChange: (value: RegistryLookupResult | null) => void; disabled: boolean
}) => {
  const [crm,setCrm] = useState(''), [uf,setUf] = useState(''), [busy,setBusy] = useState(false), [error,setError] = useState('')
  const pending = useRef<AbortController | null>(null)
  useEffect(()=>()=>pending.current?.abort(),[])
  const invalidate = () => { pending.current?.abort(); pending.current=null;setBusy(false);setError('');onChange(null) }
  const lookup = async () => {
    const request = new AbortController(); pending.current?.abort();pending.current=request
    setBusy(true);setError('');onChange(null)
    try { const result=await lookupPhysicianRegistry(crm,uf,request.signal);if(!request.signal.aborted)onChange(result) }
    catch(failure) {
      if(!request.signal.aborted)setError(failure instanceof HttpResponseError && failure.status===400
        ? 'Não foi encontrado um médico único para este CRM e UF. Confira os dados.' : 'Não foi possível consultar o CRM. Tente novamente em instantes.')
    } finally { if(!request.signal.aborted)setBusy(false) }
  }
  return <section className="space-y-4 rounded-xl border border-cyan-200 bg-cyan-50/50 p-4">
    <h3 className="font-bold text-brand-900">Consultar cadastro médico</h3>
    <div className="grid grid-cols-[1fr_100px] items-end gap-3">
      <Input label="CRM" inputMode="numeric" maxLength={10} value={crm} disabled={disabled} onChange={event=>{invalidate();setCrm(event.target.value.replace(/\D/g,''))}} placeholder="Somente números" />
      <label className="text-sm font-semibold text-slate-700">UF<select aria-label="UF do CRM" className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-3" value={uf} disabled={disabled} onChange={event=>{invalidate();setUf(event.target.value)}}><option value="">UF</option>{brazilStates.map(state=><option key={state}>{state}</option>)}</select></label>
    </div>
    <Button type="button" variant="outline" disabled={disabled || busy || !crm || !uf} onClick={()=>void lookup()}>{busy ? 'Consultando CRM…' : 'Buscar médico pelo CRM'}</Button>
    {error && <Alert variant="error">{error}</Alert>}
    {value && <div className="space-y-3 text-sm text-slate-700">
      <Input label="Nome do médico" value={value.name} readOnly />
      <div><p className="font-bold">Inscrições e estados de atendimento</p><ul className="mt-2 space-y-1">{value.registrations.map(registration=><li key={registration.crm+'/'+registration.uf} className={registration.enabled ? 'text-emerald-800' : 'text-amber-800'}><strong>{registration.crm}/{registration.uf}</strong> · {registration.status} · {registration.enabled ? 'Habilitado neste estado' : 'Sem habilitação neste estado'}</li>)}</ul></div>
      <div><p className="font-bold">Especialidades registradas</p><ul className="mt-1 list-inside list-disc">{(value.specialties.length ? value.specialties : ['Nenhuma especialidade informada pela consulta.']).map((specialty,index)=><li key={index}>{specialty}</li>)}</ul></div>
      {value.institution && <p>{value.institution}{value.graduationYear ? ` · Formação em ${value.graduationYear}` : ''}</p>}
      {!value.enabledStates.length && <Alert variant="warning">Nenhuma inscrição regular foi retornada. O cadastro ficará sem estado habilitado para atendimento.</Alert>}
    </div>}
  </section>
}
