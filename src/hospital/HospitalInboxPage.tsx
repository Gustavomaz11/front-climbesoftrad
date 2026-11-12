import { useCallback, useEffect, useState } from 'react'
import { Building2, CheckCircle2, ClipboardCheck, FolderInput, LogOut, RefreshCw } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuthentication } from '../features/auth/auth-context'
import { DicomImportForm } from '../features/dicom/components/DicomImportForm'
import { getHospitalIntake, listHospitalIntakes, type HospitalIntake } from './hospital-api'
import { HospitalReviewForm } from './HospitalReviewForm'
import { HospitalResults } from './HospitalResults'
import { hospitalBirthDateLabel } from './hospital-patient-summary'

export const HospitalInboxPage = () => {
  const { user, logout } = useAuthentication()
  const [rows, setRows] = useState<HospitalIntake[]>([]), [selected, setSelected] = useState<HospitalIntake | null>(null)
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [search, setSearch] = useState('')
  const [tab, setTab] = useState<'DRAFT' | 'SUBMITTED'>('DRAFT'), [revision, setRevision] = useState(0)
  const [area, setArea] = useState<'uploads' | 'results'>('uploads')
  const [loading, setLoading] = useState(true)
  const canView = user?.permissions.includes('hospital.intake.view') ?? false
  const canSubmit = user?.permissions.includes('hospital.intake.submit') ?? false
  useEffect(() => {
    if (!canView) return
    let active = true, version = 0
    const load = async () => {
      const request = ++version
      try {
        const result = await listHospitalIntakes()
        if (active && request === version) {
          setRows(result)
          setSelected(current => current && result.find(row => row.id === current.id)?.status === 'RECEIVING' ? null : current)
          setError('')
        }
      } catch { if (active && request === version) setError('Não foi possível atualizar os estudos. Verifique sua conexão.') }
      finally { if (active && request === version) setLoading(false) }
    }
    void load()
    const timer = window.setInterval(() => void load(), 5000)
    return () => { active = false; window.clearInterval(timer) }
  }, [canView, revision])
  const refresh = useCallback(() => setRevision(value => value + 1), [])
  const open = async (id: string) => {
    if (rows.find(row => row.id === id)?.status === 'RECEIVING') return
    try { setSelected(await getHospitalIntake(id)) }
    catch { setError('Não foi possível abrir a conferência. Aguarde o recebimento completo e atualize a lista.') }
  }
  const visible = rows.filter(row => (tab === 'SUBMITTED' ? row.status === 'SUBMITTED' : row.status !== 'SUBMITTED') && `${row.fields.patientName ?? ''} ${row.fields.accessionNumber ?? ''} ${row.studyUid}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))
  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-9">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3"><span className="rounded-xl bg-cyan-50 p-3 text-cyan-700"><Building2 size={24} /></span>
          <div><p className="text-lg font-bold">Hospital</p><p className="text-xs text-slate-500">Preparação e envio de exames</p></div></div>
        <div className="flex items-center gap-4"><span className="hidden text-sm text-slate-600 sm:inline">{user?.fullName}</span>
          <Button variant="ghost" onClick={() => void logout()} leftIcon={<LogOut size={16} />}>Sair</Button></div>
      </div>
    </header>
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-7 sm:px-9 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4"><div>
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-700">Recepção de estudos</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Envios para o ClimbeSoftRad</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Confira os dados extraídos dos arquivos DICOM, complete o cadastro e envie o estudo para a equipe de laudos.</p>
      </div><Button variant="outline" onClick={refresh} leftIcon={<RefreshCw size={16} />}>Atualizar</Button></div>
      {!canView ? <p role="alert" className="rounded-xl border bg-white p-6">Seu usuário precisa de um vínculo com o perfil Hospital para acessar a recepção.</p> : <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
          { label: 'Estudos recebidos', value: rows.length, icon: FolderInput },
          { label: 'Recebendo Exame', value: rows.filter(row => row.status === 'RECEIVING').length, icon: RefreshCw },
          { label: 'Aguardando conferência', value: rows.filter(row => row.status === 'DRAFT').length, icon: ClipboardCheck },
          { label: 'Enviados para o ClimbeSoftRad', value: rows.filter(row => row.status === 'SUBMITTED').length, icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => <div key={label} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5"><Icon className="text-cyan-700" size={24} /><div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-slate-500">{label}</p></div></div>)}</div>
        {canSubmit && user?.permissions.includes('dicom.import') && <details className="rounded-xl border border-slate-200 bg-white p-4"><summary className="cursor-pointer text-sm font-semibold">Adicionar arquivos manualmente</summary><div className="mt-4"><DicomImportForm hospitalIntake onDone={() => { setNotice('Arquivos importados. Eles aparecerão para conferência após a validação.'); refresh() }} /></div></details>}
        {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
        {user?.permissions.includes('hospital.results.view') && <nav aria-label="Exames e resultados" className="flex gap-2"><Button variant={area === 'uploads' ? 'primary' : 'outline'} onClick={() => setArea('uploads')}>Envios de exames</Button><Button variant={area === 'results' ? 'primary' : 'outline'} onClick={() => setArea('results')}>Laudos recebidos</Button></nav>}
        {area === 'results' ? <HospitalResults /> : <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4 sm:px-5">
            <div className="flex gap-2" aria-label="Situação dos envios">{(['DRAFT', 'SUBMITTED'] as const).map(value => <button key={value} type="button" aria-pressed={tab === value} onClick={() => setTab(value)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === value ? 'bg-cyan-50 text-cyan-800' : 'text-slate-500 hover:bg-slate-50'}`}>{value === 'DRAFT' ? 'Para conferir' : 'Enviados'}</button>)}</div>
            <input aria-label="Buscar paciente ou estudo" placeholder="Buscar paciente ou estudo…" value={search} onChange={event => setSearch(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:w-72" />
          </div>
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Paciente', 'Exame', 'Unidade', 'Arquivos', 'Situação', 'Ação'].map(label => <th key={label} className="px-5 py-4 font-semibold">{label}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{visible.map(row => <tr key={row.id} className="hover:bg-slate-50/70">
              <td className="px-5 py-4"><p className="font-semibold">{row.fields.patientName || 'Nome não informado'}</p><p className="mt-1 text-xs text-slate-500">{hospitalBirthDateLabel(row.fields.birthDate)}</p></td>
              <td className="px-5 py-4"><p>{row.fields.studyDescription || 'Descrição pendente'}</p><p className="mt-1 text-xs text-slate-500">{row.fields.modality || 'Modalidade pendente'}</p></td>
              <td className="px-5 py-4">{typeof row.fields.institutionName === 'string' && row.fields.institutionName.trim() || 'Instituição não informada'}</td>
              <td className="px-5 py-4">{row.fileCount}{row.status === 'RECEIVING' && row.receipt?.expected && <p className="mt-1 whitespace-nowrap text-xs text-slate-500">{row.receipt.validated}/{row.receipt.expected} arquivos do lote validados</p>}{!!row.receipt?.failed && <p className="mt-1 text-xs text-amber-800">Arquivos pendentes de reenvio</p>}</td>
              <td className="px-5 py-4"><span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${row.status === 'RECEIVING' ? 'bg-sky-50 text-sky-800' : row.status === 'DRAFT' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>{row.status === 'RECEIVING' ? 'Recebendo Exame' : row.status === 'DRAFT' ? 'Aguardando conferência' : 'Enviado para o ClimbeSoftRad'}</span></td>
              <td className="px-5 py-4"><Button variant="outline" size="sm" disabled={row.status === 'RECEIVING'} onClick={() => void open(row.id)}>{row.status === 'RECEIVING' ? 'Aguarde o recebimento' : row.status === 'DRAFT' && canSubmit ? 'Conferir e enviar' : 'Ver envio'}</Button></td>
            </tr>)}</tbody>
          </table></div>
          {!visible.length && <div className="px-5 py-14 text-center"><FolderInput className="mx-auto mb-3 text-slate-300" size={36} /><p className="font-semibold">{loading ? 'Carregando estudos…' : search ? 'Nenhum estudo encontrado' : tab === 'DRAFT' ? 'Nenhum estudo aguardando conferência' : 'Nenhum estudo enviado'}</p><p className="mt-2 text-sm text-slate-500">Novos arquivos aparecem automaticamente quando o agente da unidade estiver conectado.</p></div>}
          <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">Atualização automática a cada 5 segundos · Até 200 estudos recentes</p>
        </section>}
      </>}
    </div>
    {selected && <HospitalReviewForm key={selected.id} intake={selected} canSubmit={canSubmit} onClose={() => setSelected(null)} onDone={submitted => { setSelected(null); setNotice(submitted ? 'Estudo enviado. O paciente já está na fila do ClimbeSoftRad.' : 'Rascunho salvo para continuar a conferência.'); refresh() }} />}
  </main>
}
