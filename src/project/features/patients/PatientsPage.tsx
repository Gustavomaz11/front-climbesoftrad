import { Table as SurfaceTable, TableHeader as SurfaceTableHeader, TableRow as SurfaceTableRow, TableHead as SurfaceTableHead, TableBody as SurfaceTableBody, TableCell as SurfaceTableCell } from '@/components/ui/table'
import { Card as SurfaceCard } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuthentication } from '../auth/auth-context'
import { hasPermission } from '../auth/auth.types'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { PatientPageLayout } from './components/PatientPageLayout'
import { PatientFormModal } from './components/PatientFormModal'
import { listPatients } from './patients-api'
import type { Patient } from './patient.types'
export const PatientsPage = () => {
  const { user } = useAuthentication()
  const navigate = useNavigate()
  const [search, setSearch] = useState(''),
    [patients, setPatients] = useState<Patient[]>([]),
    [error, setError] = useState(''),
    [creating, setCreating] = useState(false)
  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      void listPatients(search)
        .then((items) => {
          if (active) {
            setPatients(items)
            setError('')
          }
        })
        .catch(() => {
          if (active) setError('Não foi possível consultar os pacientes.')
        })
    }, 250)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [search])
  if (!user) return null
  if (!hasPermission(user, 'patients.view')) return <Navigate to="/dashboard" replace />
  return (
    <PatientPageLayout
      title="Pacientes"
      description="Consulte o cadastro interno, os identificadores de origem e o histórico autorizado."
    >
      <div className="flex flex-wrap gap-3">
        {hasPermission(user, 'patients.manage') ? (
          <Button onClick={() => setCreating(true)}>Cadastrar paciente</Button>
        ) : null}
        {hasPermission(user, 'patients.reconcile') ? (
          <Button variant="outline" onClick={() => navigate('/patients/review')}>
            Conferência de vínculos
          </Button>
        ) : null}
        {hasPermission(user, 'patients.import') ? (
          <Button variant="outline" onClick={() => navigate('/patients/imports')}>
            Importar identificadores
          </Button>
        ) : null}
      </div>
      <Input
        label="Buscar paciente"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Nome do paciente"
      />
      {error ? <Alert variant="error">{error}</Alert> : null}
      <SurfaceCard className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm gap-0 py-0 ring-0">
        <SurfaceTable className="w-full text-left text-sm">
          <SurfaceTableHeader className="bg-muted text-muted-foreground">
            <SurfaceTableRow>
              <SurfaceTableHead className="p-4">Paciente</SurfaceTableHead>
              <SurfaceTableHead className="p-4">Nascimento</SurfaceTableHead>
              <SurfaceTableHead className="p-4">Sexo</SurfaceTableHead>
              <SurfaceTableHead className="p-4">Cadastro</SurfaceTableHead>
            </SurfaceTableRow>
          </SurfaceTableHeader>
          <SurfaceTableBody>
            {patients.map((p) => (
              <SurfaceTableRow key={p.id} className="border-t border-border">
                <SurfaceTableCell className="p-4 font-bold">
                  <Link className="text-brand-800 hover:underline" to={'/patients/' + p.id}>
                    {p.fullName}
                  </Link>
                  {p.socialName ? (
                    <p className="mt-1 text-xs font-normal text-muted-foreground">{p.socialName}</p>
                  ) : null}
                </SurfaceTableCell>
                <SurfaceTableCell className="p-4">{p.birthDate ?? 'Não informado'}</SurfaceTableCell>
                <SurfaceTableCell className="p-4">{p.sex ?? 'Não informado'}</SurfaceTableCell>
                <SurfaceTableCell className="p-4">
                  {p.canManage ? 'Administrável neste contexto' : 'Acesso parcial'}
                </SurfaceTableCell>
              </SurfaceTableRow>
            ))}
          </SurfaceTableBody>
        </SurfaceTable>
        {!patients.length ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Nenhum paciente encontrado.</p>
        ) : null}
        <p className="border-t p-4 text-xs text-muted-foreground">
          Até 100 cadastros por consulta. Use o nome para refinar a busca.
        </p>
      </SurfaceCard>
      {creating ? (
        <PatientFormModal
          onClose={() => setCreating(false)}
          onSaved={(patient) => navigate('/patients/' + patient.id)}
        />
      ) : null}
    </PatientPageLayout>
  )
}
