import { useEffect, useState } from 'react'
import { useAuthentication } from '../auth/auth-context'
import { hasPermission } from '../auth/auth.types'
import { HttpResponseError } from '../auth/auth-http-client'
import { examPatientHistory } from '../patients/patients-api'
import type { PatientExam } from '../patients/patient.types'
import {
  completeExamImages,
  getExamImages,
  getStudyDownload,
  getStudyViewer,
  retryExamArchive,
  type ExamImages,
} from './dicom-api'
export const useStudyImages = (examId: string | undefined) => {
  const { user } = useAuthentication(),
    [images, setImages] = useState<ExamImages | null>(null),
    [history, setHistory] = useState<PatientExam[]>([])
  const [previous, setPrevious] = useState(
      new URLSearchParams(window.location.search).get('previousExamId') ?? '',
    ),
    [viewer, setViewer] = useState<{ url: string; expiresAt: string } | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [reload, setReload] = useState(0),
    [notice, setNotice] = useState('')
  useEffect(() => {
    if (!examId) return
    let active = true
    void getExamImages(examId)
      .then((value) => {
        if (active) setImages(value)
      })
      .catch(() => {
        if (active) setError('Imagens indisponíveis ou sem autorização neste contexto.')
      })
    if (user && hasPermission(user, 'patients.view'))
      void examPatientHistory(examId)
        .then((value) => {
          if (active)
            setHistory(
              value.items.filter(
                (x) =>
                  x.id !== examId && new Date(x.performedAt) <= new Date(value.current.performedAt),
              ),
            )
        })
        .catch(() => {})
    return () => {
      active = false
    }
  }, [examId, user, reload])
  useEffect(() => {
    if (!viewer) return
    const timer = setTimeout(
      () => {
        setViewer(null)
        setNotice('Acesso temporário expirou. Clique em abrir visualizador para renovar.')
      },
      Math.max(0, new Date(viewer.expiresAt).getTime() - Date.now()),
    )
    return () => clearTimeout(timer)
  }, [viewer])
  const open = async () => {
    if (!examId) return
    setBusy(true)
    setError('')
    try {
      setViewer(await getStudyViewer(examId, previous || undefined))
      setNotice('')
    } catch (error) {
      setError(
        error instanceof HttpResponseError && error.status === 409
          ? 'Imagens ainda aguardam preparação do visualizador.'
          : 'Visualizador indisponível, estudo anterior sem imagens ou sessão sem autorização.',
      )
    } finally {
      setBusy(false)
    }
  }
  const download = async () => {
    if (!examId) return
    setBusy(true)
    setError('')
    try {
      const ticket = await getStudyDownload(examId)
      const link = document.createElement('a')
      link.href = ticket.url
      link.referrerPolicy = 'no-referrer'
      link.click()
      setNotice(
        'Download solicitado. Acompanhe o progresso nos downloads do navegador. Extraia o ZIP e importe a pasta no visualizador externo autorizado.',
      )
    } catch {
      setError('Download indisponível neste contexto.')
    } finally {
      setBusy(false)
    }
  }
  const finish = async () => {
    if (!examId) return
    setBusy(true)
    try {
      await completeExamImages(examId, 'Término operacional confirmado pelo usuário')
      setReload((x) => x + 1)
    } catch {
      setError('Não foi possível registrar o término.')
    } finally {
      setBusy(false)
    }
  }
  const retryArchive = async () => {
    if (!examId) return
    setBusy(true)
    setError('')
    try {
      await retryExamArchive(examId)
      setReload((x) => x + 1)
    } catch {
      setError('Não foi possível retomar a preparação do visualizador.')
    } finally {
      setBusy(false)
    }
  }
  return {
    user,
    images,
    history,
    previous,
    setPrevious,
    viewer,
    error,
    busy,
    notice,
    open,
    download,
    finish,
    refresh: () => setReload((x) => x + 1),
    retryArchive,
  }
}
