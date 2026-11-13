import { Textarea as SurfaceTextarea } from '@/components/ui/textarea'
import { NativeSelect as SurfaceNativeSelect } from '@/components/ui/native-select'
import { Card as SurfaceCard } from '@/components/ui/card'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { useAuthentication } from '../auth/auth-context'
import { ResearchFrameCard } from './ResearchFrameCard'
import * as api from './research-api'
import { useResearchWorkbench } from './use-research-workbench'
import { statuses, errors } from './research-status'
export const ResearchAiPage = () => {
  const { examId = '' } = useParams(),
    { user } = useAuthentication()
  const allowed = !!user?.permissions.includes('research.ai.use')
  const {
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
  } = useResearchWorkbench(examId, allowed)
  if (!allowed)
    return (
      <main className="p-8">
        <h1 className="text-xl font-bold">Pesquisa indisponível para seu perfil</h1>
      </main>
    )
  const allReviewed =
    !!job &&
    !Object.values(dirty).some(Boolean) &&
    job.frames.length > 0 &&
    job.frames.length === job.framesExpected &&
    job.frames.every((f) => f.reviewed)
  return (
    <main className="min-h-screen bg-background pb-12">
      <header className="border-b bg-card px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <Link to={`/viewer/${examId}`} className="text-sm text-brand-800">
            ← Voltar ao DICOM
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-widest text-brand-700">
            ClimbeSoftRad · Ambiente de pesquisa
          </p>
          <h1 className="mt-2 text-3xl font-bold">Análise de IA</h1>
          <p className="mt-3 max-w-4xl text-sm text-muted-foreground">
            Protótipo de pesquisa sem uso clínico. As sugestões exigem revisão humana e não integram
            o laudo nem orientam atendimento.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-7xl space-y-6 px-6 pt-6">
        {error ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-500/10 p-4 text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
        <SurfaceCard className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border bg-card p-5 gap-0 py-0 ring-0">
          <div>
            <h2 className="font-bold">Imagens e privacidade</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Preparamos cópias PNG sem metadados DICOM, ocultamos textos localmente e pedimos sua
              conferência antes de qualquer envio ao Gemini.
            </p>
          </div>
          <Button
            disabled={
              busy ||
              !listing?.enabled ||
              (!!job && ['PREPARING', 'REVIEW', 'QUEUED', 'RUNNING'].includes(job.status))
            }
            onClick={() => {
              setAnonymous(false)
              setResearch(false)
              void action(() => api.prepare(examId))
            }}
          >
            Preparar todas as imagens
          </Button>
          {listing && !listing.enabled ? (
            <p className="w-full text-sm text-amber-600 dark:text-amber-400">
              A integração de pesquisa está desabilitada neste ambiente.
            </p>
          ) : null}
        </SurfaceCard>
        {listing && listing.items.length > 1 ? (
          <label className="block text-sm">
            Histórico da pesquisa{' '}
            <SurfaceNativeSelect
              value={job?.id ?? ''}
              className="ml-3 rounded-lg border bg-card p-2"
              disabled={busy}
              onChange={(e) => void action(() => api.getCase(e.target.value))}
            >
              {listing.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {new Date(item.createdAt).toLocaleString('pt-BR')} · {statuses[item.status]}
                </option>
              ))}
            </SurfaceNativeSelect>
          </label>
        ) : null}
        {job ? (
          <>
            <SurfaceCard
              className="rounded-2xl border border-border bg-card p-5 gap-0 py-0 ring-0"
              aria-live="polite"
            >
              <h2 className="font-bold">{statuses[job.status]}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {job.framesPrepared} de {job.framesExpected || '…'} imagens preparadas ·{' '}
                {job.frames.filter((f) => f.reviewed).length} conferidas · {job.batchesCompleted}{' '}
                grupos analisados
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {job.model} · Prompt {job.promptVersion} · Anonimização {job.anonymizationVersion}
              </p>
              {job.errorCode ? (
                <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                  {errors[job.errorCode] ??
                    'Pesquisa interrompida. Nenhum resultado completo foi disponibilizado. Prepare uma nova pesquisa para tentar novamente.'}
                </p>
              ) : null}
              {job.status==='FAILED'&&job.canRetry?<Button className="mt-3" disabled={busy} onClick={()=>void action(()=>api.retry(job.id))}>Retomar análise</Button>:null}
            </SurfaceCard>
            {job.result ? (
              <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-500/10 p-5">
                <h2 className="font-bold">Observações exploratórias</h2>
                <p className="whitespace-pre-line text-sm">{job.result.summary}</p>
                <ul className="list-inside list-disc text-sm text-muted-foreground">
                  {job.result.limitations.map((text, i) => (
                    <li key={i}>{text}</li>
                  ))}
                </ul>
                <p className="text-sm font-medium">
                  Clique nas regiões marcadas para ler a descrição. A ausência de marcações não
                  indica exame normal.
                </p>
              </section>
            ) : null}
            <div className="grid items-start gap-5 md:grid-cols-2">
              {job.frames.map((frame) => (
                <ResearchFrameCard
                  key={`${frame.id}:${frame.revision}:${job.status === 'REVIEW'}`}
                  job={job}
                  frame={frame}
                  busy={busy}
                  onChange={setJob}
                  onError={showError}
                  onDirty={onDirty}
                />
              ))}
            </div>
            {job.status === 'REVIEW' ? (
              <SurfaceCard className="space-y-4 rounded-2xl border border-border bg-card p-5 gap-0 py-0 ring-0">
                <h2 className="font-bold">Envio ao Gemini para pesquisa</h2>
                <label className="flex gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                  />
                  Conferi todas as imagens e confirmei a remoção dos identificadores visíveis.
                </label>
                <label className="flex gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={research}
                    onChange={(e) => setResearch(e.target.checked)}
                  />
                  Confirmo o uso exclusivo em pesquisa, separado da operação clínica, com revisão
                  humana.
                </label>
                <Button
                  disabled={busy || !allReviewed || !anonymous || !research}
                  onClick={() => void action(() => api.run(job.id))}
                >
                  Enviar {job.framesExpected} imagens anonimizadas
                </Button>
                {!allReviewed ? (
                  <p className="text-sm text-muted-foreground">
                    Conclua a conferência individual de todas as imagens para liberar o envio.
                  </p>
                ) : null}
              </SurfaceCard>
            ) : null}
            {job.status === 'COMPLETED' ? (
              <SurfaceCard className="space-y-3 rounded-2xl border border-border bg-card p-5 gap-0 py-0 ring-0">
                <h2 className="font-bold">Esta análise foi útil para a pesquisa?</h2>
                <SurfaceTextarea
                  aria-label="Comentário sobre a análise"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Comentário opcional, sem dados do paciente"
                  className="w-full rounded-xl border p-3 text-sm"
                />
                <div className="flex gap-3">
                  <Button
                    variant={job.feedback?.useful === true ? 'success' : 'outline'}
                    disabled={busy}
                    onClick={() => void action(() => api.feedback(job.id, true, comment))}
                  >
                    Foi útil
                  </Button>
                  <Button
                    variant={job.feedback?.useful === false ? 'secondary' : 'outline'}
                    disabled={busy}
                    onClick={() => void action(() => api.feedback(job.id, false, comment))}
                  >
                    Não foi útil
                  </Button>
                </div>
                <p role="status" className="text-xs text-muted-foreground">
                  {job.feedback ? 'Avaliação salva. ' : ''}O feedback é registrado por versão para
                  orientar revisões da pesquisa. Não retreina o Gemini automaticamente.
                </p>
              </SurfaceCard>
            ) : null}
          </>
        ) : !error ? (
          <p role="status" className="py-8 text-center text-sm text-muted-foreground">
            {listing ? 'Prepare as imagens para iniciar a pesquisa.' : 'Consultando pesquisas…'}
          </p>
        ) : null}
      </div>
    </main>
  )
}
