export type TutorialPhase = 'setup' | 'intake' | 'work' | 'extra'

export interface TutorialLink {
  label: string
  to: string
  permissions: string[]
}

export interface TutorialStep {
  id: string
  phase: TutorialPhase
  title: string
  summary: string
  owner: string
  screen: string
  requirements: string[]
  fields?: Array<{ name: string; fill: string }>
  instructions: string[]
  result: string
  troubleshooting?: string[]
  note?: string
  links: TutorialLink[]
  related?: string[]
}
