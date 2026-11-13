export interface ContrastField {
  key: string
  label: string
  kind: 'TEXT' | 'NUMBER'
  unit: string
  required: boolean
}
export interface ContrastProtocol {
  id: string
  companyId: string
  unitId: string | null
  examTypeId: string
  modality: string
  familyId: string
  version: number
  stateVersion: number
  status: 'DRAFT' | 'ACTIVE' | 'RETIRED'
  name: string
  template: string
  fields: ContrastField[]
  notes: string
  approvalReference: string | null
  approvedByPhysicianId: string | null
}
export interface ProtocolSource {
  selectionId: string
  protocolId: string
  protocolVersion: number
  name: string
  examTypeId: string
  modality: string
  template: string
  fields: ContrastField[]
  values: Record<string, string>
  observations: string
  notes: string
  renderedText: string
}
