import { setupSteps } from './tutorial-setup.steps'
import { intakeSteps } from './tutorial-intake.steps'
import { workSteps } from './tutorial-work.steps'
import { extraSteps } from './tutorial-extra.steps'
import type { TutorialPhase } from './tutorial.types'

export const tutorialPhases: Array<{ id: TutorialPhase; title: string; description: string }> = [
  { id: 'setup', title: 'Configuração inicial', description: 'Prepare a empresa, a equipe, o catálogo e as regras.' },
  { id: 'intake', title: 'Entrada do exame', description: 'Cadastre o paciente e reúna os dados, documentos e imagens.' },
  { id: 'work', title: 'Preparação e elaboração', description: 'Confira, libere e acompanhe o trabalho no exame.' },
  { id: 'extra', title: 'Recursos complementares', description: 'Configure protocolos, preços e identificadores legados quando necessários.' },
]

export const tutorialSteps = [...setupSteps, ...intakeSteps, ...workSteps, ...extraSteps]
