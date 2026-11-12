import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { CompletedReportView } from '../features/reports/CompletedReportView'
import { getHospitalResult, type CompletedReport } from '../features/reports/completed-report'

export default function HospitalResultPage() {
  const { id } = useParams(),
    navigate = useNavigate()
  const [document, setDocument] = useState<CompletedReport | null>(null),
    [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    void getHospitalResult(id!)
      .then((result) => {
        if (active) setDocument(result)
      })
      .catch(() => {
        if (active) setError(true)
      })
    return () => {
      active = false
    }
  }, [id])
  if (error)
    return (
      <main className="p-8">
        <p role="alert">Laudo indisponível para este hospital ou ainda não enviado.</p>
        <Button className="mt-4" onClick={() => navigate('/dashboard')}>
          Voltar ao Hospital
        </Button>
      </main>
    )
  return document ? (
    <CompletedReportView document={document} onBack={() => navigate('/dashboard')} />
  ) : (
    <p role="status" className="p-8">
      Carregando laudo…
    </p>
  )
}
