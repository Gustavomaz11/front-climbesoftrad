import { beforeEach, describe, expect, it, vi } from 'vitest'
import { selectRequestWorkspace } from '../features/companies/company-request-context'
import { hospitalDelivery } from './hospital-delivery'

describe('Hospital delivery manifest', () => {
  const saved = new Map<string, string>()
  beforeEach(() => {
    saved.clear()
    vi.stubGlobal('localStorage', { getItem: (key: string) => saved.get(key) ?? null, setItem: (key: string, value: string) => saved.set(key, value) })
    selectRequestWorkspace({ companyId: 'hospital', unitId: 'unit' })
  })
  it('preserves file IDs for the full selection across retries without storing filenames', async () => {
    const files = [new File(['one'], 'patient-one.dcm', { lastModified: 10 }), new File(['two'], 'patient-two.dcm', { lastModified: 20 })]
    const first = await hospitalDelivery('unit', 'user', files)
    expect(first.items).toHaveLength(2)
    expect(first.items[0]).not.toBe(first.items[1])
    expect(await hospitalDelivery('unit', 'user', files)).toEqual(first)
    expect(JSON.stringify([...saved])).not.toContain('patient')
    expect((await hospitalDelivery('another-unit', 'user', files)).id).not.toBe(first.id)
    expect((await hospitalDelivery('unit', 'another-user', files)).id).not.toBe(first.id)
  })
})
