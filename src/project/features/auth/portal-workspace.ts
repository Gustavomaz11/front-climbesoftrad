import type { AuthenticatedUser } from './auth.types'
import type { WorkspaceSelection } from '../companies/company.types'

// Hospital units belong to the SouRad central workspace. Legacy company
// selections from older tabs must not turn a hospital into another company.
export const portalWorkspace = (user: AuthenticatedUser, portal: string): WorkspaceSelection | null => {
  const centralId=user.centralCompanyId
  if (!centralId || !user.companies.some(company=>company.id===centralId)) return null
  const same=user.activeCompany?.id===centralId
  return { companyId:centralId,unitId:portal==='configuracoes' || !same ? null : user.activeCompany?.selectedUnitId ?? null }
}
