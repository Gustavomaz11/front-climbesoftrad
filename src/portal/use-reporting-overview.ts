import { useEffect, useState } from 'react'
import { listExams } from '@/project/features/exams/exams-api'
import type { Exam } from '@/project/features/exams/exam.types'

export const useReportingOverview = () => {
  const [referenceDate, setReferenceDate] = useState(() => new Date())
  const [exams, setExams] = useState<Exam[]>([]), [totals, setTotals] = useState([0, 0, 0, 0])
  const [loading, setLoading] = useState(true), [error, setError] = useState(false), [revision, setRevision] = useState(0)
  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const base = { examDate: '', patientName: '', page: 1, pageSize: 50, queue: 'ACTIVE' as const }
        const results = await Promise.all([listExams(base), ...(['READY', 'IN_PROGRESS', 'TYPED'] as const).map(workflowState => listExams({ ...base, pageSize: 1, workflowState }))])
        if (active) { setExams(results[0].items); setTotals(results.map(item => item.total)); setReferenceDate(new Date()); setError(false) }
      } catch { if (active) setError(true) }
      finally { if (active) setLoading(false) }
    }
    void load(); const timer = setInterval(() => void load(), 15000)
    return () => { active = false; clearInterval(timer) }
  }, [revision])
  return { exams, totals, loading, error, referenceDate, refresh: () => setRevision(value => value + 1) }
}
