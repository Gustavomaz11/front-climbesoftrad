import { Table as SurfaceTable, TableHeader as SurfaceTableHeader, TableRow as SurfaceTableRow, TableHead as SurfaceTableHead, TableBody as SurfaceTableBody, TableCell as SurfaceTableCell } from '@/components/ui/table'
import { Input as SurfaceInput } from '@/components/ui/input'
import { Card as SurfaceCard } from '@/components/ui/card'
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
    <SurfaceCard className="overflow-hidden rounded-xl border border-border bg-card gap-0 py-0 ring-0">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5">
        <div>
          <h2 className="text-lg font-bold">Laudos recebidos</h2>
          <p className="text-sm text-muted-foreground">
            Resultados enviados pelo ClimbeSoftRad para este hospital.
          </p>
        </div>
        <SurfaceInput
          aria-label="Buscar laudo recebido"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar paciente ou exame…"
          className="rounded-lg border px-3 py-2 text-sm"
        />
      </div>
      {error && (
        <p role="alert" className="p-5 text-sm text-red-600 dark:text-red-400">
          Não foi possível atualizar os laudos. Verifique sua conexão.
        </p>
      )}
      <div className="overflow-x-auto">
        <SurfaceTable className="w-full text-left text-sm">
          <SurfaceTableHeader className="bg-muted text-xs uppercase text-muted-foreground">
            <SurfaceTableRow>
              {['Paciente', 'Exame', 'Médico', 'Recebido em', 'Ação'].map((label) => (
                <SurfaceTableHead key={label} className="px-5 py-4">
                  {label}
                </SurfaceTableHead>
              ))}
            </SurfaceTableRow>
          </SurfaceTableHeader>
          <SurfaceTableBody className="divide-y">
            {visible.map((item) => (
              <SurfaceTableRow key={item.id}>
                <SurfaceTableCell className="px-5 py-4 font-semibold">{item.exam.patientName}</SurfaceTableCell>
                <SurfaceTableCell className="px-5 py-4">
                  {item.exam.modality} · {item.exam.studyDescription}
                </SurfaceTableCell>
                <SurfaceTableCell className="px-5 py-4">
                  {item.physician.name}
                  <p className="text-xs text-muted-foreground">CRM {item.physician.crm}</p>
                </SurfaceTableCell>
                <SurfaceTableCell className="px-5 py-4">{new Date(item.sentAt!).toLocaleString('pt-BR')}</SurfaceTableCell>
                <SurfaceTableCell className="px-5 py-4">
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
                </SurfaceTableCell>
              </SurfaceTableRow>
            ))}
          </SurfaceTableBody>
        </SurfaceTable>
      </div>
      {!visible.length && (
        <p className="p-10 text-center text-sm text-muted-foreground">
          {loading ? 'Carregando laudos…' : 'Nenhum laudo recebido.'}
        </p>
      )}
      <p className="border-t px-5 py-3 text-xs text-muted-foreground">
        Atualização automática a cada 5 segundos · Até 200 resultados recentes
      </p>
    </SurfaceCard>
  )
}
