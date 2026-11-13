import { apiRequestJson } from '../auth/auth-http-client'
import type { AccessPermission, AccessRole, AccessUser, SaveAccessRoleInput } from './access-control.types'

const authenticated = { authenticated: true } as const

export const listAccessPermissions = () =>
  apiRequestJson<AccessPermission[]>('/access-control/permissions', { method: 'GET' }, authenticated)

export const listAccessRoles = () =>
  apiRequestJson<AccessRole[]>('/access-control/roles', { method: 'GET' }, authenticated)

export const listAccessUsers = () =>
  apiRequestJson<AccessUser[]>('/access-control/users', { method: 'GET' }, authenticated)

export const createAccessRole = (input: SaveAccessRoleInput) =>
  apiRequestJson<AccessRole>('/access-control/roles', {
    method: 'POST',
    body: JSON.stringify(input),
  }, authenticated)

export const updateAccessRole = (id: string, input: SaveAccessRoleInput) =>
  apiRequestJson<AccessRole>(`/access-control/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  }, authenticated)

export const setAccessRoleActive = (id: string, active: boolean) =>
  apiRequestJson<AccessRole>(`/access-control/roles/${id}/${active ? 'reactivate' : 'revoke'}`, {
    method: 'PATCH',
  }, authenticated)

export const assignUserAccessRole = (userId: string, roleId: string) =>
  apiRequestJson(`/access-control/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ roleId }),
  }, authenticated)
