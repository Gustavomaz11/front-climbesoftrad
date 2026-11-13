import { NativeSelect as SurfaceNativeSelect } from '@/components/ui/native-select'
import { useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { hasPermission } from '../auth/auth.types'
import { useStudyImages } from './use-study-images'
export const StudyImagesPage = () => {
  const { examId } = useParams()
  const {
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
    refresh,
    retryArchive,
  } = useStudyImages(examId)
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="space-y-3 border-b bg-card p-4">
        <h1 className="text-xl font-bold">Imagens e comparação</h1>
        <p className="text-sm">
          {images
            ? (
                {
                  NO_IMAGES: 'Sem imagens',
                  RECEIVING: 'Recebendo imagens',
                  RECEIVED: 'Recebimento encerrado',
                } as Record<string, string>
              )[images.status]
            : 'Consultando…'}
          . A contagem não confirma completude clínica.
        </p>
        {images?.items.map((item) => (
          <p key={item.id} className="break-all text-xs">
            Estudo {item.studyUid} · {item.series} séries · {item.instances} instâncias ·{' '}
            {item.archived} disponíveis no visualizador · Última entrada:{' '}
            {new Date(item.lastReceivedAt).toLocaleString('pt-BR')}
          </p>
        ))}
        <div className="flex flex-wrap gap-2">
          {user && hasPermission(user, 'exams.viewer.open') ? (
            <>
              <label className="text-sm">
                Comparativo
                <SurfaceNativeSelect
                  value={previous}
                  onChange={(event) => setPrevious(event.target.value)}
                  className="ml-2 rounded border p-2"
                >
                  <option value="">Apenas estudo atual</option>
                  {history.map((item) => (
                    <option key={item.id} value={item.id}>
                      {new Date(item.performedAt).toLocaleDateString('pt-BR')} ·{' '}
                      {item.studyDescription} · {item.unit}
                    </option>
                  ))}
                </SurfaceNativeSelect>
              </label>
              <Button disabled={busy} onClick={() => void open()}>
                Abrir visualizador
              </Button>
            </>
          ) : null}
          {user && hasPermission(user, 'attachments.view') ? (
            <Button disabled={busy} variant="outline" onClick={() => void download()}>
              Baixar estudo / visualizador externo
            </Button>
          ) : null}
          {user && hasPermission(user, 'dicom.import') ? (
            <>
              <Button disabled={busy} variant="ghost" onClick={() => void finish()}>
                Confirmar término do recebimento
              </Button>
              <Button disabled={busy} variant="ghost" onClick={() => void retryArchive()}>
                Retomar envio ao visualizador
              </Button>
            </>
          ) : null}
          <Button variant="ghost" onClick={refresh}>
            Atualizar
          </Button>
        </div>
        {error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="text-sm text-muted-foreground">
            {notice}
          </p>
        ) : null}
      </header>
      {viewer ? (
        <iframe
          title="Visualizador de imagens DICOM"
          src={viewer.url}
          referrerPolicy="no-referrer"
          className="min-h-[75vh] flex-1 border-0"
          allow="fullscreen"
        />
      ) : (
        <div className="p-8 text-sm text-muted-foreground">
          Abra o visualizador para consultar os estudos autorizados. O laudário permanece na aba
          original.
        </div>
      )}
    </main>
  )
}
