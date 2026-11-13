import { createSHA256 } from 'hash-wasm'
import { companyRequestContext } from '../companies/company-request-context'
import { completeUpload, createUpload, getPartUrl, getUpload,putUploadPart } from './upload-api'
import type { UploadInput } from './upload.types'
import { HttpResponseError } from '../auth/auth-http-client'
const chunkSize = 8 * 1024 * 1024
export const hashFile = async (file: File, signal: AbortSignal) => {
  const hash = await createSHA256()
  hash.init()
  for (let offset = 0; offset < file.size; offset += chunkSize) {
    signal.throwIfAborted()
    hash.update(new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer()))
  }
  return hash.digest('hex')
}
const putPart = (
  url: string,
  part: Blob,
  signal: AbortSignal,
  progress: (loaded: number) => void,
) =>
  new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const abort = () => xhr.abort()
    signal.throwIfAborted()
    signal.addEventListener('abort', abort, { once: true })
    const done = () => signal.removeEventListener('abort', abort)
    xhr.open('PUT', url)
    xhr.timeout = 120000
    xhr.upload.onprogress = (event) => progress(event.loaded)
    xhr.onload = () => {
      done()
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error('Não foi possível enviar a parte.'))
    }
    xhr.onerror = xhr.ontimeout = () => {
      done()
      reject(new Error('Rede indisponível. O envio pode ser retomado.'))
    }
    xhr.onabort = () => {
      done()
      reject(new DOMException('Envio pausado.', 'AbortError'))
    }
    xhr.send(part)
  })
export const sendResumableFile = async (
  file: File,
  input: Omit<UploadInput, 'name' | 'contentType' | 'sizeBytes' | 'sha256'>,
  options: {
    signal: AbortSignal
    onSession: (id: string) => void
    onProgress: (progress: number) => void
  },
) => {
  const stamp = companyRequestContext.capture(),
    controller = new AbortController()
  const untrack = companyRequestContext.track(controller),
    signal = AbortSignal.any([controller.signal, options.signal])
  try {
    const sha256 = await hashFile(file, signal)
    companyRequestContext.assertCurrent(stamp)
    const key =
      'sourad.upload:' +
      JSON.stringify([
        stamp.selection.companyId,
        input.unitId,
        input.examId,
        input.kind,
        input.hospitalIntake === true,
        sha256,
        input.replacesId,
        input.category,
        ...(input.deliveryId ? [input.deliveryId, input.deliveryFileId] : []),
      ])
    let previous: string | null = null
    try {
      previous = localStorage.getItem(key)
    } catch {
      /* Resume remains available while the current form is open. */
    }
    let session = previous
      ? await getUpload(previous).catch((error) => {
          if (error instanceof HttpResponseError && error.status === 404) return null
          throw error
        })
      : null
    companyRequestContext.assertCurrent(stamp)
    if (
      !session ||
      ['CANCELLED', 'EXPIRED'].includes(session.status) ||
      (new Date(session.expiresAt).getTime() < Date.now() && session.status === 'UPLOADING')
    ) {
      session = await createUpload({
        ...input,
        name: file.name,
        contentType: input.kind === 'DICOM' ? 'application/dicom' : file.type,
        sizeBytes: file.size,
        sha256,
      })
      try {
        localStorage.setItem(key, session.id)
      } catch {
        /* No file contents or names are stored in browser persistence. */
      }
    }
    if (session.sha256 !== sha256 || session.sizeBytes !== file.size)
      throw new Error('Selecione o arquivo original para retomar.')
    options.onSession(session.id)
    if (session.status !== 'UPLOADING') return session
    let confirmed = session.parts.reduce((sum, part) => sum + part.size, 0)
    options.onProgress((confirmed / file.size) * 100)
    for (let number = 1; number <= Math.ceil(file.size / session.partSize); number++) {
      signal.throwIfAborted()
      companyRequestContext.assertCurrent(stamp)
      if (session.parts.some((part) => part.number === number)) continue
      const offset = (number - 1) * session.partSize,
        part = file.slice(offset, offset + session.partSize)
      const signed = await getPartUrl(session.id, number)
      companyRequestContext.assertCurrent(stamp)
      if (signed.sizeBytes !== part.size) throw new Error('Tamanho de parte divergente.')
      if(signed.transport==='API')await putUploadPart(session.id,number,part,signal)
      else await putPart(signed.url, part, signal, (loaded) => options.onProgress(((confirmed + loaded) / file.size) * 100))
      confirmed += part.size
      options.onProgress((confirmed / file.size) * 100)
    }
    signal.throwIfAborted()
    companyRequestContext.assertCurrent(stamp)
    return await completeUpload(session.id)
  } finally {
    untrack()
  }
}
