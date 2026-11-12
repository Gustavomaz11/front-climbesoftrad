import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { ArrowLeft, ArrowRight, BookOpen, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { useAuthentication } from '../auth/auth-context'
import { TutorialNavigation } from './TutorialNavigation'
import { TutorialOverview } from './TutorialOverview'
import { TutorialStepContent } from './TutorialStepContent'
import { tutorialSteps } from './tutorial.steps'

export const TutorialDialog = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuthentication()
  const [selected, setSelected] = useState<number | null>(null)
  const content = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const step = selected === null ? undefined : tutorialSteps[selected]
  useEffect(() => { content.current?.scrollTo({ top: 0 }) }, [selected])
  if (!user) return null
  const isLast = selected === tutorialSteps.length - 1
  return (
    <Dialog open onClose={onClose} initialFocus={closeButton} className="relative z-[150]">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-[2px]" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center sm:p-4 lg:p-7">
        <DialogPanel className="flex h-[100dvh] max-h-[100dvh] w-full max-w-7xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[92dvh] sm:max-h-[960px] sm:rounded-2xl">
          <header className="flex shrink-0 items-start justify-between gap-4 bg-brand-950 px-5 py-5 text-white sm:px-7">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200"><BookOpen size={22} aria-hidden="true" /></span>
              <div><DialogTitle className="text-xl font-extrabold">Tutorial do processo</DialogTitle><Description className="mt-1 text-xs leading-5 text-cyan-100/75">Configurações, cadastros e pré-requisitos para trabalhar com os exames.</Description></div>
            </div>
            <Button ref={closeButton} variant="ghost" size="icon" onClick={onClose} aria-label="Fechar tutorial" className="text-white hover:bg-white/10 hover:text-white"><X size={21} aria-hidden="true" /></Button>
          </header>
          <div className="flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[260px_minmax(0,1fr)]">
            <TutorialNavigation selected={selected} onSelect={setSelected} />
            <div ref={content} className="min-h-0 min-w-0 flex-1 overflow-y-auto p-5 sm:p-7">
              {step && selected !== null ? <TutorialStepContent step={step} index={selected} user={user} onSelect={setSelected} /> : <TutorialOverview onSelect={setSelected} />}
            </div>
          </div>
          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-7">
            <Button variant="outline" size="sm" disabled={selected === null} onClick={() => setSelected(selected === 0 ? null : (selected ?? 0) - 1)} leftIcon={<ArrowLeft size={15} aria-hidden="true" />}>Anterior</Button>
            <p role="status" className="text-center text-xs font-semibold text-slate-500">{selected === null ? `${tutorialSteps.length} etapas` : `${selected + 1} de ${tutorialSteps.length}`}</p>
            <Button size="sm" onClick={() => isLast ? onClose() : setSelected(selected === null ? 0 : selected + 1)} rightIcon={<ArrowRight size={15} aria-hidden="true" />}>{selected === null ? 'Começar' : isLast ? 'Concluir' : 'Próxima'}</Button>
          </footer>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
