import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listHospitalResults, type HospitalResult } from '../features/reports/completed-report'
import { workspaceDocumentUrl } from '../features/companies/company-request-context'
import { useAuthentication } from '../features/auth/auth-context'

export const HospitalResults = () => {
  const { user } = useAuthentication()
  const [items, setItems] = useState<HospitalResult[]>([]),
    [error, setError] = useState(false),
    [loading, setLoading] = useState(true),
    [search, setSearch] = useState('')
  useEffect(() => {
    let active = true,
      sequence = 0
    const load = async () => {
      const request = ++sequence
      try {
        const result = await listHospitalResults()
        if (active && request === sequence) {
          setItems(result)
          setError(false)
        }
      } catch {
        if (active && request === sequence) setError(true)
      } finally {
        if (active && request === sequence) setLoading(false)
      }
    }
    void load()
    const timer = window.setInterval(() => void load(), 5000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])
  const visible = items.filter((item) =>
    `${item.exam.patientName} ${item.exam.studyDescription}`
      .toLocaleLowerCase('pt-BR')
      .includes(search.toLocaleLowerCase('pt-BR')),
  )
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5">
        <div>
          <h2 className="text-lg font-bold">Laudos recebidos</h2>
          <p className="text-sm text-slate-500">
            Resultados enviados pelo ClimbeSoftRad para este hospital.
          </p>
        </div>
        <input
          aria-label="Buscar laudo recebido"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar paciente ou exame…"
          className="rounded-lg border px-3 py-2 text-sm"
        />
      </div>
      {error && (
        <p role="alert" className="p-5 text-sm text-red-700">
          Não foi possível atualizar os laudos. Verifique sua conexão.
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {['Paciente', 'Exame', 'Médico', 'Recebido em', 'Ação'].map((label) => (
                <th key={label} className="px-5 py-4">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {visible.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-4 font-semibold">{item.exam.patientName}</td>
                <td className="px-5 py-4">
                  {item.exam.modality} · {item.exam.studyDescription}
                </td>
                <td className="px-5 py-4">
                  {item.physician.name}
                  <p className="text-xs text-slate-500">CRM {item.physician.crm}</p>
                </td>
                <td className="px-5 py-4">{new Date(item.sentAt!).toLocaleString('pt-BR')}</td>
                <td className="px-5 py-4">
                  <Link
                    className="font-semibold text-brand-700 underline"
                    to={workspaceDocumentUrl(
                      `/results/${item.id}`,
                      user!.activeCompany!.id,
                      item.originUnitId,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir laudo
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!visible.length && (
        <p className="p-10 text-center text-sm text-slate-500">
          {loading ? 'Carregando laudos…' : 'Nenhum laudo recebido.'}
        </p>
      )}
      <p className="border-t px-5 py-3 text-xs text-slate-400">
        Atualização automática a cada 5 segundos · Até 200 resultados recentes
      </p>
    </section>
  )
}
