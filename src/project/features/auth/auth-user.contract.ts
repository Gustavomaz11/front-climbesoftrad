import { z } from 'zod'
import type { AuthenticatedUser } from './auth.types'

const unit = z.object({ id: z.string().uuid(), name: z.string(), active: z.boolean() })
const accessRole = z.object({ id: z.string(), code: z.string(), name: z.string() })
const authenticatedUser = z.object({
  centralCompanyId: z.string().uuid().optional(),
  id: z.string().uuid(),
  email: z.string(),
  username: z.string().nullable(),
  fullName: z.string(),
  role: z.enum(['USER', 'ADMIN', 'DOCTOR']),
  mustChangePassword: z.boolean(),
  mustUploadSignature: z.boolean().optional(),
  isPlatformAdmin: z.boolean(),
  accessRole,
  permissions: z.array(z.string()),
  allowedPortals: z.array(z.enum(['sourad', 'hospital', 'configuracoes'])),
  companies: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      membershipId: z.string().nullable(),
      allUnits: z.boolean(),
      allowedPortals: z.array(z.enum(['sourad', 'hospital', 'configuracoes'])),
      accessRole,
      units: z.array(unit),
    }),
  ),
  activeCompany: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      membershipId: z.string().nullable(),
      allUnits: z.boolean(),
      unitIds: z.array(z.string().uuid()),
      selectedUnitId: z.string().uuid().nullable(),
    })
    .nullable(),
})

export const isAuthenticatedUser = (value: unknown): value is AuthenticatedUser =>
  authenticatedUser.safeParse(value).success
