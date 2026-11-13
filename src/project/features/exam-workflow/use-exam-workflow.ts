import { useCallback, useEffect, useRef, useState } from 'react'
import { HttpResponseError } from '../auth/auth-http-client'
import { getExamWorkflow, workflowAction } from './workflow-api'
import type { ExamWorkflow } from './workflow.types'

export const useExamWorkflow = (id: string) => {
  const [data, setData] = useState<ExamWorkflow | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [reload, setReload] = useState(0)
  const generation = useRef(0)
  useEffect(() => {
    let active = true
    const current = ++generation.current
    void getExamWorkflow(id).then(value => { if (active && generation.current === current) setData(value) }).catch(() => { if (active && generation.current === current) setError('Não foi possível consultar a preparação.') })
    return () => { active = false }
  }, [id, reload])
  const refresh = useCallback(() => setReload(n => n + 1), [])
  const act = async (action: string, reason: string, body: Record<string, unknown> = {}) => {
    if (!data || busy) return false
    if (reason.trim().length < 3) { setError('Informe uma justificativa com ao menos três caracteres.'); return false }
    setBusy(true); setError('')
    const current = ++generation.current
    try {
      await workflowAction(id, action, data.exam.workflowVersion, reason.trim(), body)
      const updated = await getExamWorkflow(id)
      if (generation.current === current) setData(updated)
      return true
    } catch (cause) {
      setError(cause instanceof HttpResponseError && cause.status === 409
        ? 'A ação foi recusada por alteração do exame, requisitos ou estado atual. Atualize e confira as pendências abaixo.'
        : cause instanceof HttpResponseError && cause.status === 403 ? 'Seu perfil não permite esta ação.' : 'Ação não concluída. Confira os campos e as evidências selecionadas.')
      refresh()
      return false
    } finally { setBusy(false) }
  }
  return { data, error, busy, act, refresh }
}
