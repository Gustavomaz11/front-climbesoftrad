export interface AccessPermission {
  code: string
  group: string
  name: string
}

export interface AccessRole {
  id: string
  code: string
  name: string
  description: string | null
  active: boolean
  immutable: boolean
  userCount: number
  permissions: AccessPermission[]
}

export interface AccessUser {
  id: string
  fullName: string
  email: string
  username: string | null
  role: 'USER' | 'ADMIN' | 'DOCTOR'
  status: 'ACTIVE' | 'DISABLED'
  accessRole: Pick<AccessRole, 'id' | 'code' | 'name' | 'active'>
}

export interface SaveAccessRoleInput {
  name: string
  description?: string
  permissionCodes: string[]
}
