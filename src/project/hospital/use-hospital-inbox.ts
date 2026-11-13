import { useCallback, useEffect, useState } from 'react'
import { useAuthentication } from '../features/auth/auth-context'
import { getHospitalIntake, listHospitalIntakes, type HospitalIntake } from './hospital-api'

export const useHospitalInbox = () => {
  const { user } = useAuthentication()
  const [rows, setRows] = useState<HospitalIntake[]>([])
  const [selected, setSelected] = useState<HospitalIntake | null>(null)
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [search, setSearch] = useState('')
  const [tab, setTab] = useState<'DRAFT' | 'SUBMITTED'>('DRAFT'), [revision, setRevision] = useState(0)
  const [loading, setLoading] = useState(true)
  const canView = user?.permissions.includes('hospital.intake.view') ?? false
  const canSubmit = user?.permissions.includes('hospital.intake.submit') ?? false
  useEffect(() => {
    if (!canView) return
    let active = true, version = 0
    const load = async () => {
      const request = ++version
      try {
        const result = await listHospitalIntakes()
        if (active && request === version) {
          setRows(result); setError('')
          setSelected(current => current && result.find(row => row.id === current.id)?.status === 'RECEIVING' ? null : current)
        }
      } catch { if (active && request === version) setError('Não foi possível atualizar os estudos. Verifique sua conexão.') }
      finally { if (active && request === version) setLoading(false) }
    }
    void load()
    const timer = window.setInterval(() => void load(), 5000)
    return () => { active = false; window.clearInterval(timer) }
  }, [canView, revision])
  const refresh = useCallback(() => setRevision(value => value + 1), [])
  const open = async (id: string) => {
    if (rows.find(row => row.id === id)?.status === 'RECEIVING') return
    try { setSelected(await getHospitalIntake(id)) }
    catch { setError('Não foi possível abrir a conferência. Aguarde o recebimento completo e atualize a lista.') }
  }
  const visible = rows.filter(row => (tab === 'SUBMITTED' ? row.status === 'SUBMITTED' : row.status !== 'SUBMITTED') && `${row.fields.patientName ?? ''} ${row.fields.accessionNumber ?? ''} ${row.studyUid}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))
  return { user, rows, selected, setSelected, error, notice, setNotice, search, setSearch, tab, setTab, loading, canView, canSubmit, refresh, open, visible }
}
