import { useState } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { MembershipUnitsFields } from '../../companies/components/MembershipUnitsFields'
import { useAuthentication } from '../../auth/auth-context'
import { createPhysician } from '../physicians-api'
import type { Physician } from '../physician.types'
import type { RegistryLookupResult } from '../physician-registry.types'
import { PhysicianRegistryFields } from './PhysicianRegistryFields'
import { useMedicalSpecialties } from '../useMedicalSpecialties'
import { PhysicianAccessEmailNotice } from './PhysicianAccessEmailNotice'

export const CreatePhysicianModal = ({open,onClose,onCreated}: {open: boolean; onClose:()=>void; onCreated:()=>void}) => {
  const {user} = useAuthentication()
  const [allUnits,setAllUnits] = useState(user?.activeCompany?.allUnits ?? false), [unitIds,setUnitIds] = useState<string[]>([])
  const [profile,setProfile] = useState<RegistryLookupResult | null>(null), [phone,setPhone] = useState('')
  const [email,setEmail] = useState('')
  const [created,setCreated] = useState<Physician | null>(null), [busy,setBusy] = useState(false), [error,setError] = useState('')
  const {specialties} = useMedicalSpecialties()
  const submit = async () => {
    if(!profile) return
    if(!allUnits && !unitIds.length) { setError('Selecione ao menos uma unidade autorizada.');return }
    setBusy(true);setError('')
    const first=profile.registrations[0]
    const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    const specialty=specialties.find(item=>profile.specialties.some(name=>normalize(name)===normalize(item.name)))
    try {
      const result=await createPhysician({ name:profile.name,crm:`${first.crm}/${first.uf}`,registryLookupId:profile.lookupId,
        email:email.trim().toLowerCase(),contactPhone:phone.trim(),...(specialty ? {specialtyId:specialty.id} : {}),allUnits,unitIds })
      setCreated(result);onCreated()
    } catch { setError('Não foi possível cadastrar. Verifique se o médico já está vinculado ou se a consulta expirou.') }
    finally { setBusy(false) }
  }
  return <Modal open={open} title="Cadastrar médico" description="Consulte o CRM e selecione os hospitais em que o médico atenderá pela SouRad." onClose={()=>{if(!busy)onClose()}}
    footer={created ? <Button onClick={onClose}>Concluir</Button> : <><Button variant="ghost" onClick={onClose} disabled={busy}>Cancelar</Button><Button type="submit" form="create-physician-form" disabled={!profile || busy}>{busy ? 'Cadastrando…' : 'Cadastrar médico'}</Button></>}>
    {created ? <div className="space-y-3 text-sm text-slate-700">
      <p>Usuário: <strong>{created.username ?? created.crm}</strong></p>
      <PhysicianAccessEmailNotice physician={created} />
      {created.existingIdentity ? <p>O profissional usará sua senha atual.</p> : <><p>Senha inicial (CRM + UF): <code className="break-all rounded bg-slate-100 p-1">{created.initialPassword}</code></p><p>A troca de senha é obrigatória no primeiro acesso, antes de usar o sistema.</p></>}
    </div> : <form id="create-physician-form" className="space-y-4" onSubmit={event=>{event.preventDefault();void submit()}}>
      {error && <Alert variant="error">{error}</Alert>}
      <PhysicianRegistryFields value={profile} onChange={setProfile} disabled={busy} />
      <Input label="E-mail do médico *" type="email" required maxLength={254} autoComplete="email" value={email} disabled={busy} onChange={event=>setEmail(event.target.value)} helperText="O médico receberá as instruções e o botão de acesso neste e-mail." />
      <Input label="Telefone de contato (opcional)" type="tel" maxLength={30} value={phone} disabled={busy} onChange={event=>setPhone(event.target.value)} />
      <MembershipUnitsFields allUnits={allUnits} unitIds={unitIds} disabled={busy} onChange={(all,ids)=>{setAllUnits(all);setUnitIds(ids)}} />
      <p className="text-sm text-slate-600">O usuário e a senha inicial serão o número do CRM seguido da UF em maiúsculas, sem separador (ex.: 7626SE). O médico deverá trocar a senha no primeiro acesso.</p>
    </form>}
  </Modal>
}
