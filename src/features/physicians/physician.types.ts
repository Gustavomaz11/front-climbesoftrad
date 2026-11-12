import type { RegistryProfile } from './physician-registry.types'
export interface Physician {
  contactPhone?: string | null
  registryProfile?: RegistryProfile | null
  enabledStates?: string[]
  id: string
  userId: string
  name: string
  specialty: string
  specialtyId: string
  crm: string
  active: boolean
  mustChangePassword: boolean
  membershipId: string
  allUnits: boolean
  unitIds: string[]
  units: Array<{ id: string; name: string; active: boolean }>
  canManage: boolean
  initialPassword?: string | null
  existingIdentity?: boolean
  createdAt: string
}

export interface CreatePhysicianPayload {
  registryLookupId?: string
  contactPhone?: string
  allUnits: boolean
  unitIds: string[]
  name: string
  specialtyId?: string
  crm: string
}

export interface MedicalSpecialty {
  id: string
  name: string
}
