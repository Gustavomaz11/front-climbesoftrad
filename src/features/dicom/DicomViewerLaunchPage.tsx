import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAuthentication } from '../auth/auth-context'
import { HttpResponseError } from '../auth/auth-http-client'
import { getStudyViewer } from './dicom-api'

const failureMessage = (error: unknown) => {
  if (error instanceof HttpResponseError) {
    if (error.status === 404) return 'Este exame ainda não tem imagens DICOM disponíveis para visualização.'
    if (error.status === 409) return 'As imagens deste exame ainda estão sendo preparadas. Aguarde e tente novamente.'
    if (error.status === 403) return 'Seu usuário não tem permissão para visualizar este exame.'
  }
  return 'Não foi possível abrir o visualizador DICOM. Tente novamente.'
}

export const DicomViewerLaunchPage = () => {
  const { examId = '' } = useParams()
  const { user } = useAuthentication()
  const previous = new URLSearchParams(window.location.search).get('previousExamId') || undefined
  const allowed = !!user?.permissions.includes('exams.viewer.open')
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)
  const request = useRef<{ key: string; promise: ReturnType<typeof getStudyViewer> } | null>(null)

  useEffect(() => {
    if (!allowed || !examId) return
    let active = true
    const key = `${examId}:${previous ?? ''}:${retry}`
    // Reuse the grant request when React checks effect cleanup in development.
    if (request.current?.key !== key)
      request.current = { key, promise: getStudyViewer(examId, previous) }
    void request.current.promise
      .then(ticket => { if (active) window.location.replace(ticket.url) })
      .catch(failure => { if (active) setError(failureMessage(failure)) })
    return () => { active = false }
  }, [allowed, examId, previous, retry])

  return <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
    <section className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <h1 className="text-xl font-bold">Visualizador DICOM</h1>
      {!allowed ? <p role="alert">Seu usuário não tem permissão para abrir o visualizador.</p>
        : error ? <>
          <p role="alert" className="text-sm text-red-800">{error}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={() => { setError(null); setRetry(value => value + 1) }}>Tentar novamente</Button>
            <Link to={`/images/${examId}`} className="text-sm text-brand-800">Ver situação das imagens</Link>
          </div>
        </> : <p role="status" className="flex items-center gap-3 text-sm text-slate-600">
          <LoaderCircle size={20} className="animate-spin" aria-hidden="true" />Abrindo o visualizador DICOM…
        </p>}
      <Link to="/dashboard" className="inline-block text-sm text-brand-800">Voltar aos exames</Link>
    </section>
  </main>
}
