import { Card as SurfaceCard } from '@/components/ui/card'
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react'
import { tutorialPhases, tutorialSteps } from './tutorial.steps'

export const TutorialOverview = ({ onSelect }: { onSelect: (index: number) => void }) => (
  <div className="space-y-7">
    <div>
      <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-brand-800"><CheckCircle2 size={15} aria-hidden="true" /> Guia do trabalho</span>
      <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Do primeiro cadastro à elaboração do exame</h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Siga a ordem do processo ou escolha a etapa em que precisa de ajuda. Cada etapa mostra a tela, os pré-requisitos, o que preencher e como resolver os bloqueios mais comuns.</p>
    </div>
    <div className="grid gap-4 xl:grid-cols-2">
      {tutorialPhases.map((phase, phaseIndex) => (
        <SurfaceCard key={phase.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm gap-0 py-0 ring-0">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-800 text-sm font-extrabold text-white">{phaseIndex + 1}</span>
            <div><h4 className="font-extrabold text-foreground">{phase.title}</h4><p className="mt-1 text-xs leading-5 text-muted-foreground">{phase.description}</p></div>
          </div>
          <ol className="mt-4 space-y-1">
            {tutorialSteps.map((step, index) => step.phase === phase.id ? (
              <li key={step.id}>
                <button
                  type="button" onClick={() => onSelect(index)}
                  className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-brand-600"
                >
                  <span className="w-5 shrink-0 text-xs font-bold leading-5 text-brand-700">{String(index + 1).padStart(2, '0')}</span>
                  <span className="flex-1">{step.title}</span><ChevronRight size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                </button>
              </li>
            ) : null)}
          </ol>
        </SurfaceCard>
      ))}
    </div>
    <section className="rounded-2xl bg-card p-5 text-white">
      <h4 className="font-bold">O caminho do exame</h4>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold">
        <span className="rounded-lg bg-card/10 px-3 py-2">A preparar</span><ArrowRight size={17} aria-hidden="true" />
        <span className="rounded-lg bg-card/10 px-3 py-2">Pronto</span><ArrowRight size={17} aria-hidden="true" />
        <span className="rounded-lg bg-cyan-300/15 px-3 py-2 text-cyan-100">Em elaboração</span>
      </div>
      <p className="mt-4 text-xs leading-5 text-cyan-100/80">A liberação exige identidade sem conflito, classificação aprovada e checklist conferido. Pendências e reconvocações retornam à preparação para nova liberação.</p>
    </section>
    <p className="rounded-xl border border-border bg-muted p-4 text-xs leading-5 text-muted-foreground">Este fluxo chega à elaboração e ao salvamento dos rascunhos. Conclusão clínica, assinatura digital, bloqueio exclusivo do laudário, SLA e distribuição automática ainda estão pendentes. Protocolos, preços e importação são recursos complementares, utilizados conforme a operação.</p>
  </div>
)
