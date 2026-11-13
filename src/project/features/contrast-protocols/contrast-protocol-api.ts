import { apiRequestJson } from '../auth/auth-http-client'
import type { JSONContent } from '@tiptap/core'
import type { ContrastProtocol, ProtocolSource } from './contrast-protocol.types'
export const listContrastProtocols = () =>
  apiRequestJson<ContrastProtocol[]>('/contrast-protocols', {}, { authenticated: true })
export const createContrastProtocol = (data: unknown) =>
  apiRequestJson<ContrastProtocol>(
    '/contrast-protocols',
    { method: 'POST', body: JSON.stringify(data) },
    { authenticated: true },
  )
export const activateContrastProtocol = (
  record: ContrastProtocol,
  approvedByPhysicianId: string,
  approvalReference: string,
) =>
  apiRequestJson(
    `/contrast-protocols/${record.id}/activate`,
    {
      method: 'POST',
      body: JSON.stringify({
        expectedStateVersion: record.stateVersion,
        approvedByPhysicianId,
        approvalReference,
      }),
    },
    { authenticated: true },
  )
export const retireContrastProtocol = (record: ContrastProtocol, reason: string) =>
  apiRequestJson(
    `/contrast-protocols/${record.id}/retire`,
    {
      method: 'POST',
      body: JSON.stringify({
        expectedStateVersion: record.stateVersion,
        reason,
      }),
    },
    { authenticated: true },
  )
export const examContrastProtocols = (id: string) =>
  apiRequestJson<{ items: ContrastProtocol[]; reason: string | null }>(
    `/exams/${id}/contrast-protocols`,
    {},
    { authenticated: true },
  )
export const selectPrescriptionProtocol = (
  id: string,
  protocolId: string,
  values: Record<string, string>,
  observations: string,
) =>
  apiRequestJson<{
    selectionId: string
    snapshot: Omit<ProtocolSource, 'selectionId'>
    content: JSONContent
  }>(
    `/exams/${id}/prescription/protocol`,
    {
      method: 'POST',
      body: JSON.stringify({ protocolId, values, observations }),
    },
    { authenticated: true },
  )
