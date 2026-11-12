import { useCallback, useEffect, useState } from 'react'
import * as api from './research-api'
import type { ResearchCase, ResearchHistory } from './research-api'
export const useResearchWorkbench = (examId: string, allowed: boolean) => {
  const [listing, setListing] = useState<ResearchHistory | null>(null),
    [job, setJob] = useState<ResearchCase | null>(null)
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [anonymous, setAnonymous] = useState(false),
    [research, setResearch] = useState(false),
    [comment, setComment] = useState('')
  const showError = useCallback((message: string) => setError(message), [])
  const [dirty, setDirty] = useState<Record<string, boolean>>({})
  const onDirty = useCallback(
    (id: string, value: boolean) =>
      setDirty((previous) => (previous[id] === value ? previous : { ...previous, [id]: value })),
    [],
  )
  const action = async (operation: () => Promise<ResearchCase>) => {
    setBusy(true)
    setError('')
    try {
      const next = await operation()
      setJob(next)
      setComment(next.feedback?.comment ?? '')
      setListing(await api.history(examId))
    } catch {
      setError('Não foi possível concluir a ação. Confira seu acesso e atualize a página.')
    } finally {
      setBusy(false)
    }
  }
  useEffect(() => {
    if (!allowed) return
    let active = true
    void api
      .history(examId)
      .then(async (list) => {
        if (!active) return
        setListing(list)
        if (list.items[0]) {
          const first = await api.getCase(list.items[0].id)
          if (active) {
            setJob(first)
            setComment(first.feedback?.comment ?? '')
          }
        }
      })
      .catch(() => {
        if (active) setError('Não foi possível consultar as pesquisas deste exame.')
      })
    return () => {
      active = false
    }
  }, [examId, allowed])
  const jobId = job?.id,
    jobStatus = job?.status
  useEffect(() => {
    if (!jobId || !jobStatus || !['PREPARING', 'QUEUED', 'RUNNING'].includes(jobStatus)) return
    const timer = setInterval(
      () =>
        void api
          .getCase(jobId)
          .then(setJob)
          .catch(() => setError('A atualização foi interrompida. Recarregue a página.')),
      5000,
    )
    return () => clearInterval(timer)
  }, [jobId, jobStatus])
  return {
    listing,
    job,
    setJob,
    busy,
    error,
    anonymous,
    setAnonymous,
    research,
    setResearch,
    comment,
    setComment,
    showError,
    dirty,
    onDirty,
    action,
  }
}
