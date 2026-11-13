export interface WorkspaceSelection {
  companyId: string | null
  unitId: string | null
}
export interface AccessibleCompany {
  id: string
  name: string
  membershipId: string | null
  allUnits: boolean
  accessRole: { id: string; code: string; name: string }
  units: Array<{ id: string; name: string; active: boolean }>
}
export interface ActiveCompany {
  id: string
  name: string
  membershipId: string | null
  allUnits: boolean
  unitIds: string[]
  selectedUnitId: string | null
}
export interface Company {
  id: string
  name: string
  active: boolean
}
export interface DocumentPresentation {
  headerText: string
  footerText: string
  signatureText: string
}
export interface PresentationSettings {
  company: { version: number; presentation: Partial<DocumentPresentation> }
  unit: { version: number; presentation: Partial<DocumentPresentation> }
  effective: DocumentPresentation
}
export interface CompanyMembership {
  id: string
  userId: string
  companyId: string
  fullName: string
  email: string
  username: string | null
  role: 'USER' | 'ADMIN' | 'DOCTOR'
  active: boolean
  status: 'ACTIVE' | 'DISABLED'
  allUnits: boolean
  unitIds: string[]
  canManage: boolean
  units: Array<{ id: string; name: string; active: boolean }>
  signatureText: string | null
  preferencesVersion: number
  accessRole: { id: string; code: string; name: string; active: boolean }
}
