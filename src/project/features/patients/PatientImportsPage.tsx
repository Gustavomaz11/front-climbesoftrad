import { Table as SurfaceTable, TableHeader as SurfaceTableHeader, TableRow as SurfaceTableRow, TableHead as SurfaceTableHead, TableBody as SurfaceTableBody, TableCell as SurfaceTableCell } from '@/components/ui/table'
import { NativeSelect as SurfaceNativeSelect } from '@/components/ui/native-select'
import { Card as SurfaceCard } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuthentication } from '../auth/auth-context'
import { hasPermission } from '../auth/auth.types'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { PatientPageLayout } from './components/PatientPageLayout'
import { ImportRowUndoModal } from './components/ImportRowUndoModal'
import { ImportRowEditModal } from './components/ImportRowEditModal'
import {
  listPatientImports,
  getPatientImport,
  previewPatientImport,
  approveReadyImportRows,
  commitPatientImport,
  reviewImportRow,
} from './patients-api'
import type { ImportReport, ImportRow } from './patient.types'
const labels: Record<string, string> = {
  READY: 'Pronta para revisão',
  ALREADY_LINKED: 'Já associada',
  CONFLICT: 'Conflito',
  INVALID: 'Dados inválidos',
  REJECTED: 'Rejeitada',
  APPLIED: 'Importada',
}
export const PatientImportsPage = () => {
  const { user } = useAuthentication()
  const [batches, setBatches] = useState<ImportReport['batch'][]>([]),
    [report, setReport] = useState<ImportReport | null>(null),
    [file, setFile] = useState<File | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [editing, setEditing] = useState<ImportRow | null>(null),
    [undoing, setUndoing] = useState<ImportRow | null>(null),
    [reload, setReload] = useState(0)
  useEffect(() => {
    let active = true
    void listPatientImports()
      .then((items) => {
        if (active) setBatches(items)
      })
      .catch(() => {
        if (active) setError('Não foi possível consultar as importações.')
      })
    return () => {
      active = false
    }
  }, [reload])
  if (!user) return null
  if (!hasPermission(user, 'patients.import')) return <Navigate to="/patients" replace />
  const act = async (operation: () => Promise<ImportReport>) => {
    setBusy(true)
    setError('')
    try {
      setReport(await operation())
      setReload((n) => n + 1)
    } catch {
      setError(
        'Não foi possível executar. Confira o CSV, as unidades autorizadas e se o lote foi alterado.',
      )
    } finally {
      setBusy(false)
    }
  }
  const template = () => {
    const url = URL.createObjectURL(
      new Blob(['\ufeffunitId;issuer;externalId;patientId;legacyIssuer;legacyExternalId\n'], {
        type: 'text/csv;charset=utf-8',
      }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = 'identificadores-pacientes.csv'
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <PatientPageLayout
      title="Importar identificadores"
      description="Mapeie sistemas antigos e atuais com prévia de colisões e aprovação antes de aplicar vínculos."
    >
      {error ? <Alert variant="error">{error}</Alert> : null}
      <SurfaceCard className="space-y-4 rounded-2xl border border-border bg-card p-5 gap-0 py-0 ring-0">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={template}>
            Baixar modelo CSV
          </Button>
          <Link to="/patients" className="text-sm font-bold text-brand-800 underline">
            Consultar IDs dos cadastros
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          CSV UTF-8, separado por ponto e vírgula, com até 1000 linhas e 2 MB. A unidade e o
          cadastro interno precisam estar autorizados. Preserve os IDs exatamente como recebidos.
        </p>
        <label className="block text-sm font-semibold">
          Arquivo CSV
          <input
            aria-label="Arquivo de mapeamento CSV"
            type="file"
            accept=".csv,text/csv"
            disabled={busy}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-2 block w-full text-sm"
          />
        </label>
        <Button
          disabled={!file || busy}
          loading={busy}
          onClick={() => {
            if (file) void act(() => previewPatientImport(file))
          }}
        >
          Analisar prévia
        </Button>
      </SurfaceCard>
      <label className="block text-sm font-semibold">
        Retomar importação
        <SurfaceNativeSelect
          aria-label="Importação existente"
          value={report?.batch.id ?? ''}
          disabled={busy}
          onChange={(e) => {
            if (e.target.value) void act(() => getPatientImport(e.target.value))
          }}
          className="mt-2 h-12 w-full rounded-xl border border-input bg-card px-3"
        >
          <option value="">Selecione um lote</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} · {new Date(b.createdAt).toLocaleString('pt-BR')}
            </option>
          ))}
        </SurfaceNativeSelect>
      </label>
      {report ? (
        <section className="space-y-4">
          <div className="rounded-xl bg-card p-4">
            <h2 className="font-bold">{report.batch.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {report.rows.length} linha(s) · {report.counts.APPLIED ?? 0} importada(s) ·{' '}
              {report.rows.filter((r) => r.included && r.status === 'READY').length} aprovada(s)
              pendente(s)
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="outline"
                disabled={busy || !report.rows.some((r) => r.status === 'READY' && !r.included)}
                onClick={() => void act(() => approveReadyImportRows(report.batch.id))}
              >
                Aprovar linhas válidas
              </Button>
              <Button
                disabled={busy || !report.rows.some((r) => r.included && r.status === 'READY')}
                onClick={() => void act(() => commitPatientImport(report.batch.id))}
              >
                Importar próximas 50 linhas
              </Button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => void act(() => getPatientImport(report.batch.id))}
              >
                Atualizar relatório
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl border bg-card">
            <SurfaceTable className="w-full min-w-[850px] text-left text-sm">
              <SurfaceTableHeader className="bg-muted">
                <SurfaceTableRow>
                  <SurfaceTableHead className="p-3">Linha</SurfaceTableHead>
                  <SurfaceTableHead className="p-3">Origem e ID</SurfaceTableHead>
                  <SurfaceTableHead className="p-3">Cadastro interno</SurfaceTableHead>
                  <SurfaceTableHead className="p-3">Resultado</SurfaceTableHead>
                  <SurfaceTableHead className="p-3">Revisão</SurfaceTableHead>
                </SurfaceTableRow>
              </SurfaceTableHeader>
              <SurfaceTableBody>
                {report.rows.map((row) => (
                  <SurfaceTableRow key={row.id} className="border-t border-border">
                    <SurfaceTableCell className="p-3">{row.line}</SurfaceTableCell>
                    <SurfaceTableCell className="p-3">
                      <p className="font-bold">
                        {row.data.issuer}: {row.data.externalId}
                      </p>
                      {row.data.legacyIssuer ? (
                        <p className="text-xs text-muted-foreground">
                          Legado: {row.data.legacyIssuer}: {row.data.legacyExternalId}
                        </p>
                      ) : null}
                    </SurfaceTableCell>
                    <SurfaceTableCell className="max-w-56 break-all p-3 text-xs">
                      <Link
                        to={'/patients/' + row.data.patientId}
                        className="text-brand-800 underline"
                      >
                        {row.data.patientId}
                      </Link>
                    </SurfaceTableCell>
                    <SurfaceTableCell className="max-w-64 p-3">
                      <p className="font-bold">
                        {labels[row.status]}
                        {row.included && row.status === 'READY' ? ' · Aprovada' : ''}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{row.message}</p>
                    </SurfaceTableCell>
                    <SurfaceTableCell className="p-3">
                      {row.status === 'APPLIED' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() => setUndoing(row)}
                        >
                          Desfazer linha
                        </Button>
                      ) : null}
                      {!['APPLIED', 'ALREADY_LINKED'].includes(row.status) ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => setEditing(row)}
                          >
                            Revisar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() =>
                              void act(() =>
                                reviewImportRow(
                                  report.batch.id,
                                  row,
                                  false,
                                  'Linha rejeitada na conferência',
                                ),
                              )
                            }
                          >
                            Rejeitar
                          </Button>
                        </>
                      ) : null}
                    </SurfaceTableCell>
                  </SurfaceTableRow>
                ))}
              </SurfaceTableBody>
            </SurfaceTable>
          </div>
        </section>
      ) : null}
      {undoing && report ? (
        <ImportRowUndoModal
          batchId={report.batch.id}
          row={undoing}
          onClose={() => setUndoing(null)}
          onSaved={setReport}
        />
      ) : null}
      {editing && report ? (
        <ImportRowEditModal
          batchId={report.batch.id}
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={setReport}
        />
      ) : null}
    </PatientPageLayout>
  )
}
