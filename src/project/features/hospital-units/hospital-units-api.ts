import { apiRequest, apiRequestJson, HttpResponseError } from '../auth/auth-http-client'
import type { CnpjCompany, CreateHospitalUnitPayload, HospitalUnit } from './hospital-unit.types'

export const lookupUnitCnpj = (cnpj: string) => apiRequestJson<CnpjCompany>('/hospital-units/cnpj-lookup', { method: 'POST', body: JSON.stringify({ cnpj }) }, { authenticated: true })
export const downloadRouterInstaller = async (unit: HospitalUnit) => {
  const response = await apiRequest(`/hospital-units/${unit.id}/router-installer`, { method: 'POST' }, { authenticated: true })
  if (!response.ok) throw new HttpResponseError(response.status)
  const url = URL.createObjectURL(await response.blob()), anchor = document.createElement('a')
  anchor.href = url; anchor.download = `Router-${unit.id}.msi`; anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 60000)
}

export const listHospitalUnits = () =>
  apiRequestJson<HospitalUnit[]>('/hospital-units', { method: 'GET' }, { authenticated: true })

export const listHospitalUnitsForAdministration = () =>
  apiRequestJson<HospitalUnit[]>(
    '/hospital-units/admin',
    { method: 'GET' },
    { authenticated: true },
  )

export const createHospitalUnit = (payload: CreateHospitalUnitPayload) =>
  apiRequestJson<HospitalUnit>(
    '/hospital-units',
    { method: 'POST', body: JSON.stringify(payload) },
    { authenticated: true },
  )

export const revokeHospitalUnit = (id: string) =>
  apiRequestJson<HospitalUnit>(
    `/hospital-units/${id}/revoke`,
    { method: 'PATCH' },
    { authenticated: true },
  )

export const reactivateHospitalUnit = (id: string) =>
  apiRequestJson<HospitalUnit>(
    `/hospital-units/${id}/reactivate`,
    { method: 'PATCH' },
    { authenticated: true },
  )

export const updateHospitalUnit = (id: string, payload: CreateHospitalUnitPayload) =>
  apiRequestJson<HospitalUnit>(
    `/hospital-units/${id}`,
    { method: 'PUT', body: JSON.stringify(payload) },
    { authenticated: true },
  )
