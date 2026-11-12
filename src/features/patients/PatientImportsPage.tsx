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
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={template}>
            Baixar modelo CSV
          </Button>
          <Link to="/patients" className="text-sm font-bold text-brand-800 underline">
            Consultar IDs dos cadastros
          </Link>
        </div>
        <p className="text-sm text-slate-600">
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
      </section>
      <label className="block text-sm font-semibold">
        Retomar importação
        <select
          aria-label="Importação existente"
          value={report?.batch.id ?? ''}
          disabled={busy}
          onChange={(e) => {
            if (e.target.value) void act(() => getPatientImport(e.target.value))
          }}
          className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3"
        >
          <option value="">Selecione um lote</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} · {new Date(b.createdAt).toLocaleString('pt-BR')}
            </option>
          ))}
        </select>
      </label>
      {report ? (
        <section className="space-y-4">
          <div className="rounded-xl bg-white p-4">
            <h2 className="font-bold">{report.batch.name}</h2>
            <p className="mt-1 text-sm text-slate-500">
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
          <div className="overflow-x-auto rounded-2xl border bg-white">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3">Linha</th>
                  <th className="p-3">Origem e ID</th>
                  <th className="p-3">Cadastro interno</th>
                  <th className="p-3">Resultado</th>
                  <th className="p-3">Revisão</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="p-3">{row.line}</td>
                    <td className="p-3">
                      <p className="font-bold">
                        {row.data.issuer}: {row.data.externalId}
                      </p>
                      {row.data.legacyIssuer ? (
                        <p className="text-xs text-slate-500">
                          Legado: {row.data.legacyIssuer}: {row.data.legacyExternalId}
                        </p>
                      ) : null}
                    </td>
                    <td className="max-w-56 break-all p-3 text-xs">
                      <Link
                        to={'/patients/' + row.data.patientId}
                        className="text-brand-800 underline"
                      >
                        {row.data.patientId}
                      </Link>
                    </td>
                    <td className="max-w-64 p-3">
                      <p className="font-bold">
                        {labels[row.status]}
                        {row.included && row.status === 'READY' ? ' · Aprovada' : ''}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{row.message}</p>
                    </td>
                    <td className="p-3">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
