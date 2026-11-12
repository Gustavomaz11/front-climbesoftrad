import { apiRequestJson } from '../auth/auth-http-client'
export interface PhysicianQualification {
  id: string; unitId: string; unitName: string; examTypeId: string; examTypeName: string;
  modality: string; active: boolean; unitActive: boolean; typeActive: boolean; version: number; reason: string
}
export const listPhysicianQualifications = (physicianId: string) =>
  apiRequestJson<PhysicianQualification[]>(`/physicians/${physicianId}/qualifications`, {}, { authenticated: true })
export const createPhysicianQualification = (physicianId: string, data: { unitId: string; examTypeId: string; reason: string }) =>
  apiRequestJson(`/physicians/${physicianId}/qualifications`, { method: 'POST', body: JSON.stringify(data) }, { authenticated: true })
export const changePhysicianQualification = (physicianId: string, record: PhysicianQualification, reason: string) =>
  apiRequestJson(`/physicians/${physicianId}/qualifications/${record.id}`, { method: 'PUT', body: JSON.stringify({ active: !record.active, expectedVersion: record.version, reason }) }, { authenticated: true })
export const eligibleExamPhysicians = (examId: string) =>
  apiRequestJson<{ items: Array<{ physicianId: string; name: string; modality: string }>; reason: string | null }>(`/exams/${examId}/eligible-physicians`, {}, { authenticated: true })
