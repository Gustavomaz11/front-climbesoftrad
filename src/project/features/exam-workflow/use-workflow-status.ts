import { useCallback, useEffect, useState } from 'react'
import { apiRequestJson } from '../auth/auth-http-client'
import type { WorkflowState } from './workflow.types'

export interface WorkflowStatus { workflowState: WorkflowState; workflowVersion: number; archivedAt: string | null; reportingUserId?: string | null; reportingStartedAt?: string | null }
export const useWorkflowStatus = (id: string | undefined) => {
  const [value, setValue] = useState<WorkflowStatus | null>(null), [reload, setReload] = useState(0)
  useEffect(() => {
    if (!id) return
    let active = true, sequence = 0
    const load = () => {
      const request = ++sequence
      void apiRequestJson<WorkflowStatus>(`/exams/${id}/workflow-status`, {}, { authenticated: true }).then(result => { if (active && request === sequence) setValue(result) }).catch(() => { if (active && request === sequence) setValue(null) })
    }
    load()
    const timer = window.setInterval(load, 10000)
    window.addEventListener('focus', load)
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('focus', load) }
  }, [id, reload])
  const refresh = useCallback(() => setReload(n => n + 1), [])
  const mutable = Boolean(value && !value.archivedAt && !['CANCELLED', 'SIGNED'].includes(value.workflowState))
  return { value, mutable, refresh }
}
