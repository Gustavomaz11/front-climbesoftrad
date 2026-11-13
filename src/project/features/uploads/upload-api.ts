import { apiRequest,apiRequestJson,HttpResponseError } from '../auth/auth-http-client'
import type { UploadInput, UploadSession } from './upload.types'
const json = (method: string, body?: unknown): RequestInit => ({
  method,
  ...(body ? { body: JSON.stringify(body) } : {}),
})
export const createUpload = (input: UploadInput) =>
  apiRequestJson<UploadSession>('/uploads', json('POST', input), { authenticated: true })
export const getUpload = (id: string) =>
  apiRequestJson<UploadSession>(`/uploads/${id}`, {}, { authenticated: true })
export const getPartUrl = (id: string, number: number) =>
  apiRequestJson<{ url: string; sizeBytes: number; transport?:'API'|'DIRECT' }>(
    `/uploads/${id}/parts/${number}`,
    json('POST'),
    { authenticated: true },
  )
export const completeUpload = (id: string) =>
  apiRequestJson<UploadSession>(`/uploads/${id}/complete`, json('POST'), { authenticated: true })
export const putUploadPart=async(id:string,number:number,part:Blob,signal:AbortSignal)=>{
  const response=await apiRequest(`/uploads/${id}/parts/${number}`,{method:'PUT',body:part,signal,headers:{'Content-Type':'application/octet-stream'}},{authenticated:true})
  if(!response.ok)throw new HttpResponseError(response.status)
}
export const cancelUpload = (id: string) =>
  apiRequestJson<{ status: string }>(`/uploads/${id}/cancel`, json('POST'), { authenticated: true })
export const reprocessUpload = (id: string) =>
  apiRequestJson(`/uploads/${id}/reprocess`, json('POST'), { authenticated: true })
export const listUploads = (examId?: string) =>
  apiRequestJson<UploadSession[]>(
    '/uploads' + (examId ? '?examId=' + encodeURIComponent(examId) : ''),
    {},
    { authenticated: true },
  )
