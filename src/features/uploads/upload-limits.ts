import { apiRequestJson } from '../auth/auth-http-client'
export const getUploadLimits = () =>
  apiRequestJson<{ documentMaxBytes: number; dicomMaxBytes: number }>(
    '/uploads/limits',
    {},
    { authenticated: true },
  )
