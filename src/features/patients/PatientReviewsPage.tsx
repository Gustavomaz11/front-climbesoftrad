import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthentication } from '../auth/auth-context'
import { hasPermission } from '../auth/auth.types'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { PatientPageLayout } from './components/PatientPageLayout'
import { PatientReviewCard } from './components/PatientReviewCard'
import { listPatientReviews } from './patients-api'
import type { PatientReview } from './patient.types'
export const PatientReviewsPage = () => {
  const { user } = useAuthentication()
  const [status, setStatus] = useState('OPEN'),
    [items, setItems] = useState<PatientReview[]>([]),
    [error, setError] = useState(''),
    [reload, setReload] = useState(0)
  useEffect(() => {
    let active = true
    void listPatientReviews(status)
      .then((rows) => {
        if (active) {
          setItems(rows)
          setError('')
        }
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar a conferência.')
      })
    return () => {
      active = false
    }
  }, [status, reload])
  if (!user) return null
  if (!hasPermission(user, 'patients.reconcile') || !hasPermission(user, 'patients.view'))
    return <Navigate to="/patients" replace />
  return (
    <PatientPageLayout
      title="Conferência de vínculos"
      description="Compare os registros e justifique as decisões. Sugestões não associam pacientes automaticamente."
    >
      <div className="flex flex-wrap gap-3">
        {[
          ['OPEN', 'Pendentes'],
          ['APPROVED', 'Aprovadas'],
          ['REJECTED', 'Rejeitadas'],
        ].map(([value, label]) => (
          <Button
            key={value}
            variant={status === value ? 'primary' : 'outline'}
            onClick={() => setStatus(value)}
          >
            {label}
          </Button>
        ))}
      </div>
      {error ? <Alert variant="error">{error}</Alert> : null}
      {items.map((review) => (
        <PatientReviewCard
          key={review.id + ':' + review.version}
          review={review}
          onUpdated={() => setReload((n) => n + 1)}
        />
      ))}
      {!items.length ? (
        <p className="rounded-xl bg-white p-8 text-sm text-slate-500">
          Nenhuma conferência neste filtro e contexto.
        </p>
      ) : null}
    </PatientPageLayout>
  )
}
