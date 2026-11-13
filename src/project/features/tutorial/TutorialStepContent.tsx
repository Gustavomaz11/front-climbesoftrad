import { Table as SurfaceTable, TableHeader as SurfaceTableHeader, TableRow as SurfaceTableRow, TableHead as SurfaceTableHead, TableBody as SurfaceTableBody, TableCell as SurfaceTableCell } from '@/components/ui/table'
import { CheckCircle2, ExternalLink, Info, ListChecks } from 'lucide-react'
import type { AuthenticatedUser } from '../auth/auth.types'
import { workspaceDocumentUrl } from '../companies/company-request-context'
import { tutorialPhases, tutorialSteps } from './tutorial.steps'
import type { TutorialStep } from './tutorial.types'

export const TutorialStepContent = ({ step, index, user, onSelect }: {
  step: TutorialStep; index: number; user: AuthenticatedUser; onSelect: (index: number) => void
}) => (
  <article className="space-y-6">
    <header>
      <p className="text-xs font-extrabold uppercase tracking-wider text-brand-700">Etapa {index + 1} de {tutorialSteps.length} · {tutorialPhases.find(phase => phase.id === step.phase)?.title}</p>
      <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{step.title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.summary}</p>
      <p className="mt-3 text-xs font-semibold text-muted-foreground">Quem realiza: {step.owner}</p>
    </header>
    <section className="rounded-2xl border border-brand-100 bg-muted p-4 sm:p-5">
      <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-800">Onde fazer</h4>
      <p className="mt-2 text-sm font-bold leading-6 text-brand-950">{step.screen}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {step.links.filter(link => link.permissions.every(permission => user.permissions.includes(permission))).map(link => (
          <a key={link.to} href={user.activeCompany ? workspaceDocumentUrl(link.to, user.activeCompany.id, user.activeCompany.selectedUnitId ?? '') : link.to} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-brand-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
            {link.label}<ExternalLink size={14} aria-hidden="true" />
          </a>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-brand-800">As telas abrem em outra aba para manter o guia disponível. Os atalhos aparecem conforme as permissões do seu perfil.</p>
    </section>
    <section>
      <h4 className="flex items-center gap-2 font-extrabold text-foreground"><ListChecks size={19} className="text-brand-700" aria-hidden="true" /> Antes de começar</h4>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">{step.requirements.map(item => <li key={item}>{item}</li>)}</ul>
      {step.related?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">{step.related.map(id => {
          const relatedIndex = tutorialSteps.findIndex(item => item.id === id)
          const related = tutorialSteps[relatedIndex]
          return related ? <button key={id} type="button" onClick={() => onSelect(relatedIndex)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-brand-800 hover:bg-muted focus-visible:outline-2 focus-visible:outline-brand-600">Rever: {related.title}</button> : null
        })}</div>
      ) : null}
    </section>
    {step.fields?.length ? (
      <section>
        <h4 className="mb-3 font-extrabold text-foreground">O que preencher</h4>
        <div className="overflow-hidden rounded-xl border border-border">
          <SurfaceTable className="w-full table-fixed text-left text-sm">
            <SurfaceTableHeader className="bg-muted text-xs text-muted-foreground"><SurfaceTableRow><SurfaceTableHead scope="col" className="w-[35%] px-3 py-3 sm:px-4">Campo</SurfaceTableHead><SurfaceTableHead scope="col" className="px-3 py-3 sm:px-4">Como preencher</SurfaceTableHead></SurfaceTableRow></SurfaceTableHeader>
            <SurfaceTableBody className="divide-y divide-slate-200">{step.fields.map(field => <SurfaceTableRow key={field.name}><SurfaceTableHead scope="row" className="break-words px-3 py-3 align-top text-xs font-bold leading-5 text-foreground sm:px-4">{field.name}</SurfaceTableHead><SurfaceTableCell className="break-words px-3 py-3 text-xs leading-5 text-muted-foreground sm:px-4">{field.fill}</SurfaceTableCell></SurfaceTableRow>)}</SurfaceTableBody>
          </SurfaceTable>
        </div>
      </section>
    ) : null}
    <section>
      <h4 className="font-extrabold text-foreground">Passo a passo</h4>
      <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-6 text-muted-foreground">{step.instructions.map(instruction => <li key={instruction} className="pl-1">{instruction}</li>)}</ol>
    </section>
    <section className="rounded-xl border border-emerald-200 bg-emerald-500/10 p-4">
      <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-900"><CheckCircle2 size={18} aria-hidden="true" /> Resultado esperado</h4>
      <p className="mt-2 text-sm leading-6 text-emerald-900">{step.result}</p>
    </section>
    {step.troubleshooting?.length ? (
      <section className="rounded-xl border border-amber-200 bg-amber-500/10 p-4">
        <h4 className="text-sm font-bold text-amber-950">Se não conseguir avançar</h4>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-xs leading-5 text-amber-900">{step.troubleshooting.map(item => <li key={item}>{item}</li>)}</ul>
      </section>
    ) : null}
    {step.note ? <p className="flex items-start gap-2 rounded-xl bg-muted p-4 text-xs leading-5 text-muted-foreground"><Info size={17} className="mt-0.5 shrink-0 text-brand-700" aria-hidden="true" />{step.note}</p> : null}
  </article>
)
