import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Search } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import type { HospitalUnit } from '../hospital-unit.types'
import { createHospitalUnit, lookupUnitCnpj, updateHospitalUnit } from '../hospital-units-api'
import { brazilStates } from '../../physicians/physician-registry.types'

const normalize = (value: string) => value.replace(/[.\-/\s]/g, '').toUpperCase()
const schema = z.object({
  cnpj: z.string().refine(value => /^[A-Z0-9]{12}\d{2}$/.test(normalize(value)), 'Informe o CNPJ completo.'),
  legalName: z.string().trim().min(2, 'Informe a razão social.').max(160), tradeName: z.string().trim().max(160),
  internalIdentifier: z.string().trim().min(1, 'Informe o identificador interno.').max(120), uf: z.string().length(2, 'Selecione a UF.'),
  address: z.object({ zipCode: z.string().regex(/^\d{8}$/, 'Informe os 8 dígitos do CEP.'), street: z.string().trim().min(1, 'Informe o logradouro.').max(160),
    number: z.string().trim().min(1, 'Informe o número.').max(30), neighborhood: z.string().trim().min(1, 'Informe o bairro.').max(120), city: z.string().trim().min(1, 'Informe a cidade.').max(120) }),
  contactPhone: z.string().trim().min(8, 'Informe o telefone.').max(30), contactEmail: z.string().trim().email('Informe um e-mail válido.').max(254),
})
type FormValues = z.infer<typeof schema>
interface Props { unit?: HospitalUnit | null; open: boolean; onClose: () => void; onCreated: () => void }

export const CreateHospitalUnitModal = ({ unit, open, onClose, onCreated }: Props) => {
  const [error, setError] = useState(''), [lookupError, setLookupError] = useState(''), [looking, setLooking] = useState(false)
  const lookupVersion = useRef(0), lastCnpj = useRef('')
  const invalidateLookup = useCallback(() => { lookupVersion.current++ }, [])
  const { register, handleSubmit, reset, getValues, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })
  useEffect(() => {
    if (!open) return
    lookupVersion.current++; lastCnpj.current = unit?.cnpj ?? ''
    reset({ cnpj: unit?.cnpj ?? '', legalName: unit?.legalName ?? unit?.name ?? '', tradeName: unit?.tradeName ?? '', internalIdentifier: unit?.internalIdentifier ?? '',
      uf: unit?.uf ?? '', address: unit?.address ?? { zipCode: '', street: '', number: '', neighborhood: '', city: '' }, contactPhone: unit?.contactPhone ?? '', contactEmail: unit?.contactEmail ?? '' })
    return () => invalidateLookup()
  }, [open, unit, reset, invalidateLookup])
  const lookup = async (force = false) => {
    const cnpj = normalize(getValues('cnpj') || '')
    if (!/^[A-Z0-9]{12}\d{2}$/.test(cnpj) || (!force && cnpj === lastCnpj.current)) return
    const version = ++lookupVersion.current
    setLooking(true); setLookupError('')
    try {
      const result = await lookupUnitCnpj(cnpj)
      if (version !== lookupVersion.current || normalize(getValues('cnpj')) !== cnpj) return
      setValue('legalName', result.legalName, { shouldValidate: true }); setValue('tradeName', result.tradeName, { shouldValidate: true })
      setValue('uf', result.uf, { shouldValidate: true }); setValue('address', result.address, { shouldValidate: true })
      setValue('contactPhone', result.contactPhone, { shouldValidate: true }); setValue('contactEmail', result.contactEmail, { shouldValidate: true })
      lastCnpj.current = cnpj
    } catch { if (version === lookupVersion.current) setLookupError('Não foi possível consultar o CNPJ. Confira o número ou preencha os dados para conferência.') }
    finally { if (version === lookupVersion.current) setLooking(false) }
  }
  const close = () => { if (!isSubmitting) { lookupVersion.current++; setLooking(false); setError(''); setLookupError(''); onClose() } }
  const changeCnpj = (value: string) => {
    if (normalize(value) !== normalize(getValues('cnpj') || '')) {
      lookupVersion.current++; lastCnpj.current = ''; setLooking(false); setLookupError('')
      setValue('legalName', ''); setValue('tradeName', ''); setValue('uf', '')
      setValue('address', { zipCode: '', street: '', number: '', neighborhood: '', city: '' })
      setValue('contactPhone', ''); setValue('contactEmail', '')
    }
    setValue('cnpj', value.toUpperCase(), { shouldDirty: true })
  }
  const submit = async (values: FormValues) => {
    setError('')
    const payload = { ...values, cnpj: normalize(values.cnpj), name: (values.tradeName || values.legalName).slice(0, 120) }
    try { if (unit) await updateHospitalUnit(unit.id, payload); else await createHospitalUnit(payload); onCreated(); invalidateLookup(); onClose() }
    catch { setError('Não foi possível salvar. Confira o CNPJ, os campos obrigatórios e se a unidade já está cadastrada.') }
  }
  const text = (key: 'legalName' | 'tradeName' | 'internalIdentifier' | 'contactPhone' | 'contactEmail', label: string, required = true) =>
    <Input {...register(key)} label={label + (required ? ' *' : '')} error={errors[key]?.message} disabled={looking && key !== 'internalIdentifier'} />
  const address = (key: keyof FormValues['address'], label: string) => <Input {...register(`address.${key}`)} label={label + ' *'} error={errors.address?.[key]?.message} disabled={looking} />
  return <Modal open={open} title={unit ? 'Editar unidade' : 'Cadastrar unidade'} description="Consulte o CNPJ, confira os dados e defina o identificador que aparecerá na fila do ClimbeSoftRad." size="lg" onClose={() => close()} footer={<><Button variant="ghost" onClick={() => close()} disabled={isSubmitting}>Cancelar</Button><Button type="submit" form="create-hospital-unit-form" loading={isSubmitting} disabled={looking} leftIcon={<Building2 size={17} />}>{unit ? 'Salvar unidade' : 'Cadastrar unidade'}</Button></>}>
    <form id="create-hospital-unit-form" onSubmit={event => void handleSubmit(submit)(event)} className="space-y-6" noValidate>
      {error && <Alert variant="error">{error}</Alert>}
      <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4"><legend className="px-2 text-sm font-bold">Dados da empresa</legend>
        <div className="flex items-start gap-3"><div className="flex-1"><Input {...register('cnpj')} label="CNPJ *" placeholder="00.000.000/0000-00" maxLength={18} autoCapitalize="characters" error={errors.cnpj?.message} onChange={event => changeCnpj(event.target.value)} onBlur={() => void lookup()} /></div><Button type="button" variant="outline" className="mt-7" loading={looking} onClick={() => void lookup(true)} leftIcon={<Search size={16} />}>Consultar CNPJ</Button></div>
        {lookupError && <Alert variant="warning">{lookupError}</Alert>}
        {text('legalName', 'Razão social')}{text('tradeName', 'Nome fantasia', false)}{text('internalIdentifier', 'Identificador Interno da Empresa')}
        <p className="text-xs text-slate-500">O identificador é livre e será exibido na coluna Unidade da fila do ClimbeSoftRad.</p>
      </fieldset>
      <fieldset className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2"><legend className="px-2 text-sm font-bold">Endereço</legend>
        {address('zipCode', 'CEP (somente números)')}{address('street', 'Logradouro')}{address('number', 'Número')}{address('neighborhood', 'Bairro')}{address('city', 'Cidade')}
        <label className="block text-sm font-semibold text-slate-700">UF *<select {...register('uf')} aria-label="UF da unidade" disabled={looking} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"><option value="">Selecione</option>{brazilStates.map(uf => <option key={uf}>{uf}</option>)}</select>{errors.uf && <span className="text-sm text-red-700">{errors.uf.message}</span>}</label>
      </fieldset>
      <fieldset className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2"><legend className="px-2 text-sm font-bold">Contato</legend>{text('contactPhone', 'Telefone')}{text('contactEmail', 'E-mail')}</fieldset>
    </form>
  </Modal>
}
