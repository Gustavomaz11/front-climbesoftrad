import { z } from 'zod'
import type { WorkspaceSelection } from './company.types'

export interface ContextStamp {
  generation: number
  selection: WorkspaceSelection
}

export class CompanyRequestContext {
  private generation = 0
  private selection: WorkspaceSelection
  private controllers = new Set<AbortController>()

  constructor(selection: WorkspaceSelection) {
    this.selection = { ...selection }
  }

  capture(): ContextStamp {
    return { generation: this.generation, selection: { ...this.selection } }
  }

  track(controller: AbortController) {
    this.controllers.add(controller)
    return () => this.controllers.delete(controller)
  }

  assertCurrent(stamp: ContextStamp) {
    if (stamp.generation !== this.generation)
      throw new DOMException('Contexto alterado.', 'AbortError')
  }

  invalidate() {
    this.generation += 1
    this.controllers.forEach((controller) => controller.abort())
    this.controllers.clear()
  }

  select(selection: WorkspaceSelection) {
    if (
      this.selection.companyId === selection.companyId &&
      this.selection.unitId === selection.unitId
    )
      return
    this.invalidate()
    this.selection = { ...selection }
  }
}

const identifier = (value: unknown): string | null =>
  z.string().uuid().safeParse(value).success ? (value as string) : null
const readSelection = (): WorkspaceSelection => {
  if (typeof window === 'undefined') return { companyId: null, unitId: null }
  const query = new URLSearchParams(window.location.search)
  const company = identifier(query.get('company'))
  if (company) return { companyId: company, unitId: identifier(query.get('unit')) }
  try {
    const saved = JSON.parse(window.sessionStorage.getItem('sourad.workspace') ?? '{}') as Record<
      string,
      unknown
    >
    return { companyId: identifier(saved.companyId), unitId: identifier(saved.unitId) }
  } catch {
    return { companyId: null, unitId: null }
  }
}

export const companyRequestContext = new CompanyRequestContext(readSelection())

export const selectRequestWorkspace = (selection: WorkspaceSelection) => {
  companyRequestContext.select(selection)
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (url.searchParams.has('company') || url.searchParams.has('unit')) {
    if (selection.companyId) url.searchParams.set('company', selection.companyId)
    else url.searchParams.delete('company')
    if (selection.unitId) url.searchParams.set('unit', selection.unitId)
    else url.searchParams.delete('unit')
    window.history.replaceState(window.history.state, '', url)
  }
  try {
    window.sessionStorage.setItem('sourad.workspace', JSON.stringify(selection))
  } catch {
    /* Context still works in memory. */
  }
}

export const workspaceDocumentUrl = (path: string, companyId: string, unitId: string) =>
  path + '?' + new URLSearchParams({ company: companyId, unit: unitId }).toString()
