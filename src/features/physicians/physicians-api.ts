import { apiRequestJson } from '../auth/auth-http-client'
import type { CreatePhysicianPayload, MedicalSpecialty, Physician } from './physician.types'
import type { RegistryLookupResult } from './physician-registry.types'
export const lookupPhysicianRegistry = (crm: string, uf: string, signal?: AbortSignal) =>
  apiRequestJson<RegistryLookupResult>('/physicians/registry-lookup', { method: 'POST', body: JSON.stringify({crm,uf}), signal }, { authenticated: true })

export const listMedicalSpecialties = () =>
  apiRequestJson<MedicalSpecialty[]>(
    '/physicians/specialties',
    { method: 'GET' },
    { authenticated: true },
  )

export const listPhysicians = () =>
  apiRequestJson<Physician[]>('/physicians', { method: 'GET' }, { authenticated: true })

export const createPhysician = (payload: CreatePhysicianPayload) =>
  apiRequestJson<Physician>(
    '/physicians',
    { method: 'POST', body: JSON.stringify(payload) },
    { authenticated: true },
  )

export const revokePhysician = (id: string) =>
  apiRequestJson<Physician>(
    `/physicians/${id}/revoke`,
    { method: 'PATCH' },
    { authenticated: true },
  )

export const resendPhysicianAccessEmail = (id: string) =>
  apiRequestJson<NonNullable<Physician['accessEmail']>>(`/physicians/${id}/access-email`, { method: 'POST' }, { authenticated: true })

export const reactivatePhysician = (id: string) =>
  apiRequestJson<Physician>(
    `/physicians/${id}/reactivate`,
    { method: 'PATCH' },
    { authenticated: true },
  )
