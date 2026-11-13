import { beforeEach, describe, expect, it, vi } from 'vitest'
import { companyRequestContext, selectRequestWorkspace } from '../companies/company-request-context'
import { hashFile, sendResumableFile } from './resumable-upload'
import { createUpload, getUpload, getPartUrl, completeUpload,putUploadPart } from './upload-api'
vi.mock('./upload-api', () => ({
  createUpload: vi.fn(),
  getUpload: vi.fn(),
  getPartUrl: vi.fn(),
  completeUpload: vi.fn(),
  putUploadPart:vi.fn(),
}))
describe('Resumable file transport', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    selectRequestWorkspace({
      companyId: '11111111-1111-4111-8111-111111111111',
      unitId: '22222222-2222-4222-8222-222222222222',
    })
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn() })
  })
  it('hashes bytes incrementally and cancels before uploading on context changes', async () => {
    const file = new File(['abc'], 'test.dcm')
    expect(await hashFile(file, new AbortController().signal)).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
    const stamp = companyRequestContext.capture()
    selectRequestWorkspace({ companyId: '33333333-3333-4333-8333-333333333333', unitId: null })
    expect(() => companyRequestContext.assertCurrent(stamp)).toThrow()
  })
  it('does not resend confirmed parts and finalizes an already complete multipart session', async () => {
    const file = new File(['abc'], 'test.dcm'),
      sha256 = await hashFile(file, new AbortController().signal)
    vi.stubGlobal('localStorage', { getItem: () => 'resume-id', setItem: vi.fn() })
    const session = {
      id: 'resume-id',
      kind: 'DICOM' as const,
      name: 'test.dcm',
      status: 'UPLOADING',
      sizeBytes: 3,
      sha256,
      partSize: 8 * 1024 * 1024,
      parts: [{ number: 1, size: 3, etag: 'confirmed' }],
      expiresAt: new Date(Date.now() + 60000).toISOString(),
      resultId: null,
      examId: null,
      validationReason: null,
      metadata: null,
    }
    vi.mocked(getUpload).mockResolvedValue(session)
    vi.mocked(completeUpload).mockResolvedValue({ ...session, status: 'RECEIVED' })
    const result = await sendResumableFile(
      file,
      { kind: 'DICOM', unitId: 'unit' },
      { signal: new AbortController().signal, onSession: vi.fn(), onProgress: vi.fn() },
    )
    expect(result.status).toBe('RECEIVED')
    expect(getPartUrl).not.toHaveBeenCalled()
    expect(createUpload).not.toHaveBeenCalled()
    expect(completeUpload).toHaveBeenCalledWith('resume-id')
  })
  it('sends browser parts through the authenticated API when direct CORS is unavailable',async()=>{
    const file=new File(['abc'],'test.dcm'),sha256=await hashFile(file,new AbortController().signal)
    const session={id:'api-session',kind:'DICOM' as const,name:'test.dcm',status:'UPLOADING',sizeBytes:3,sha256,partSize:8*1024*1024,parts:[],expiresAt:new Date(Date.now()+60000).toISOString(),resultId:null,examId:null,validationReason:null,metadata:null}
    vi.mocked(createUpload).mockResolvedValue(session)
    vi.mocked(getPartUrl).mockResolvedValue({url:'unused',sizeBytes:3,transport:'API'})
    vi.mocked(putUploadPart).mockResolvedValue(undefined)
    vi.mocked(completeUpload).mockResolvedValue({...session,status:'RECEIVED'})
    const progress=vi.fn()
    await sendResumableFile(file,{kind:'DICOM',unitId:'unit'},{signal:new AbortController().signal,onSession:vi.fn(),onProgress:progress})
    expect(putUploadPart).toHaveBeenCalledWith('api-session',1,expect.any(Blob),expect.any(AbortSignal))
    expect(progress).toHaveBeenLastCalledWith(100)
  })
})
