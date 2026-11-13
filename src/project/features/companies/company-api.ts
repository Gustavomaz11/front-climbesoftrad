import { apiRequestJson } from '../auth/auth-http-client'
import type { Company, CompanyMembership, PresentationSettings } from './company.types'

export const listCompanies = () =>
  apiRequestJson<Company[]>('/companies', {}, { authenticated: true })
export const createCompany = (name: string) =>
  apiRequestJson<Company>(
    '/companies',
    {
      method: 'POST',
      body: JSON.stringify({ name }),
    },
    { authenticated: true },
  )
export const updateCompany = (id: string, name: string) =>
  apiRequestJson<Company>(
    `/companies/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify({ name }),
    },
    { authenticated: true },
  )
export const setCompanyActive = (id: string, active: boolean) =>
  apiRequestJson<Company>(
    `/companies/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    },
    { authenticated: true },
  )
export const listCompanyMemberships = () =>
  apiRequestJson<CompanyMembership[]>('/company-memberships', {}, { authenticated: true })
export const ownCompanyMembership = () =>
  apiRequestJson<CompanyMembership>('/company-memberships/me', {}, { authenticated: true })
export const provisionCompanyUser = (input: {
  email: string
  fullName: string
  roleId: string
  allUnits: boolean
  unitIds: string[]
}) =>
  apiRequestJson<{ initialPassword: string | null; existingIdentity: boolean }>(
    '/company-memberships',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    { authenticated: true },
  )
export const setMembershipActive = (id: string, active: boolean, reason: string) =>
  apiRequestJson<CompanyMembership>(
    `/company-memberships/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ active, reason }),
    },
    { authenticated: true },
  )
export const saveMembershipUnits = (id: string, allUnits: boolean, unitIds: string[]) =>
  apiRequestJson<CompanyMembership>(
    `/company-memberships/${id}/units`,
    {
      method: 'PUT',
      body: JSON.stringify({ allUnits, unitIds }),
    },
    { authenticated: true },
  )
export const saveMembershipPreferences = (
  id: string,
  expectedVersion: number,
  signatureText: string | null,
) =>
  apiRequestJson<{ signatureText: string | null; preferencesVersion: number }>(
    `/company-memberships/${id}/preferences`,
    {
      method: 'PUT',
      body: JSON.stringify({ expectedVersion, signatureText }),
    },
    { authenticated: true },
  )
export const getPresentationSettings = (unitId?: string) =>
  apiRequestJson<PresentationSettings>(
    '/company-settings' + (unitId ? '?' + new URLSearchParams({ unitId }) : ''),
    {},
    { authenticated: true },
  )
export const savePresentationSettings = (input: {
  expectedVersion: number
  presentation: { headerText?: string; footerText?: string; signatureText?: string }
  unitId?: string
}) =>
  apiRequestJson<PresentationSettings>(
    '/company-settings',
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
    { authenticated: true },
  )
