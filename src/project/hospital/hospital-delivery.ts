import { companyRequestContext } from '../features/companies/company-request-context'

interface DeliveryPlan { id: string; items: string[] }
// Persist only opaque IDs and a digest; filenames and patient metadata stay out
// of browser persistence. The same selection can resume an interrupted batch.
export const hospitalDelivery = async (unitId: string, userId: string, files: File[]) => {
  const stamp = companyRequestContext.capture()
  const selection = JSON.stringify([stamp.selection.companyId, unitId, userId, files.map(f => [f.name, f.size, f.lastModified])])
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(selection))
  companyRequestContext.assertCurrent(stamp)
  const key = 'sourad.hospital-delivery:' + Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('')
  let plan: DeliveryPlan | undefined
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null') as DeliveryPlan | null
    if (saved?.id && saved.items?.length === files.length) plan = saved
  } catch { /* The current selection still works without persistence. */ }
  if (!plan) {
    plan = { id: crypto.randomUUID(), items: files.map(() => crypto.randomUUID()) }
    try { localStorage.setItem(key, JSON.stringify(plan)) } catch { /* Retain in the current form. */ }
  }
  return plan
}
