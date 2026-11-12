import { LayoutGrid } from 'lucide-react'
import { tutorialPhases, tutorialSteps } from './tutorial.steps'

interface TutorialNavigationProps {
  selected: number | null
  onSelect: (index: number | null) => void
}

export const TutorialNavigation = ({ selected, onSelect }: TutorialNavigationProps) => (
  <>
    <div className="border-b border-slate-200 bg-slate-50 p-4 md:hidden">
      <label htmlFor="tutorial-step" className="mb-2 block text-xs font-bold text-slate-600">Ir para uma etapa</label>
      <select
        id="tutorial-step" value={selected ?? ''} onChange={event => onSelect(event.target.value === '' ? null : Number(event.target.value))}
        className="w-full min-w-0 rounded-xl border border-slate-300 bg-white p-3 text-sm"
      >
        <option value="">Visão do fluxo completo</option>
        {tutorialPhases.map(phase => (
          <optgroup key={phase.id} label={phase.title}>
            {tutorialSteps.map((step, index) => step.phase === phase.id ? (
              <option key={step.id} value={index}>{index + 1}. {step.title}</option>
            ) : null)}
          </optgroup>
        ))}
      </select>
    </div>
    <nav aria-label="Etapas do tutorial" className="hidden min-h-0 overflow-y-auto border-r border-slate-200 bg-slate-50 p-4 md:block">
      <button
        type="button" onClick={() => onSelect(null)} aria-current={selected === null ? 'page' : undefined}
        className={`mb-5 flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-bold focus-visible:outline-2 focus-visible:outline-brand-600 ${selected === null ? 'bg-brand-800 text-white' : 'text-slate-600 hover:bg-white'}`}
      >
        <LayoutGrid size={17} aria-hidden="true" /> Visão do fluxo
      </button>
      {tutorialPhases.map(phase => (
        <div key={phase.id} className="mb-5">
          <p className="mb-2 px-3 text-[0.65rem] font-extrabold uppercase tracking-wider text-slate-500">{phase.title}</p>
          <ol className="space-y-1">
            {tutorialSteps.map((step, index) => step.phase === phase.id ? (
              <li key={step.id}>
                <button
                  type="button" onClick={() => onSelect(index)} aria-current={selected === index ? 'step' : undefined}
                  className={`flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold focus-visible:outline-2 focus-visible:outline-brand-600 ${selected === index ? 'bg-brand-100 text-brand-900' : 'text-slate-600 hover:bg-white'}`}
                >
                  <span className="mt-px shrink-0 font-extrabold text-brand-700">{String(index + 1).padStart(2, '0')}</span>
                  {step.title}
                </button>
              </li>
            ) : null)}
          </ol>
        </div>
      ))}
    </nav>
  </>
)
