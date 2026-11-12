import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { useAuthentication } from '../../auth/auth-context'
import { hasPermission } from '../../auth/auth.types'
import { PatientHistoryTable } from './PatientHistoryTable'
import {
  examPatientHistory,
  listComparatives,
  linkComparative,
  removeComparative,
} from '../patients-api'
import type { Comparative } from '../patient.types'
export const PatientHistoryPanel = ({ examId }: { examId: string }) => {
  const { user } = useAuthentication()
  const [open, setOpen] = useState(false),
    [history, setHistory] = useState<Awaited<ReturnType<typeof examPatientHistory>> | null>(null),
    [links, setLinks] = useState<Comparative[]>([]),
    [error, setError] = useState(''),
    [reload, setReload] = useState(0),
    [busy, setBusy] = useState(false)
  const visible = Boolean(
    user && hasPermission(user, 'patients.view') && hasPermission(user, 'exams.view'),
  )
  useEffect(() => {
    if (!open || !visible) return
    let active = true
    void Promise.all([examPatientHistory(examId), listComparatives(examId)])
      .then(([records, comparatives]) => {
        if (active) {
          setHistory(records)
          setLinks(comparatives)
          setError('')
        }
      })
      .catch(() => {
        if (active) setError('Histórico indisponível neste contexto.')
      })
    return () => {
      active = false
    }
  }, [open, visible, examId, reload])
  if (!visible) return null
  const link = async (id: string) => {
    setBusy(true)
    try {
      await linkComparative(examId, id)
      setReload((n) => n + 1)
    } catch {
      setError('Selecione um exame anterior do mesmo paciente, autorizado neste contexto.')
    } finally {
      setBusy(false)
    }
  }
  const remove = async (id: string) => {
    setBusy(true)
    try {
      await removeComparative(examId, id)
      setReload((n) => n + 1)
    } catch {
      setError('Não foi possível remover o comparativo.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="report-editor-chrome border-b border-slate-200 bg-white p-4 print:hidden">
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
        {open ? 'Ocultar histórico' : 'Histórico e comparativos'}
      </Button>
      {open ? (
        <div className="mx-auto mt-4 max-w-5xl space-y-4">
          {error ? (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {history ? (
            <>
              <p className="text-sm text-slate-600">
                Cadastro atual: <strong>{history.patient.fullName}</strong> · Nascimento:{' '}
                {history.patient.birthDate ?? 'Não informado'}
              </p>
              <h2 className="font-bold text-slate-900">Comparativos vinculados</h2>
              {links.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm"
                >
                  <span>
                    {item.status === 'ASSOCIATION_CHANGED'
                      ? 'A associação do paciente mudou. Reavalie este comparativo.'
                      : item.exam?.studyDescription}
                  </span>
                  {user && hasPermission(user, 'comparatives.manage') ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => void remove(item.id)}
                    >
                      Remover vínculo
                    </Button>
                  ) : null}
                </div>
              ))}
              {links.some((item) => item.exam) ? (
                <PatientHistoryTable
                  items={links.flatMap((item) => (item.exam ? [item.exam] : []))}
                />
              ) : null}
              {!links.length ? (
                <p className="text-sm text-slate-500">Nenhum comparativo vinculado.</p>
              ) : null}
              <h2 className="font-bold text-slate-900">Exames anteriores autorizados</h2>
              <PatientHistoryTable
                items={history.items.filter(
                  (item) => new Date(item.performedAt) < new Date(history.current.performedAt),
                )}
                currentExamId={examId}
                currentUnitId={history.current.unitId}
                onLink={
                  user && hasPermission(user, 'comparatives.manage') && !busy
                    ? (item) => void link(item.id)
                    : undefined
                }
              />
            </>
          ) : (
            <p className="text-sm text-slate-500">Consultando histórico...</p>
          )}
        </div>
      ) : null}
    </section>
  )
}
