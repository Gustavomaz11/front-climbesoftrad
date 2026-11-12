import { BadgeCheck } from 'lucide-react'
import type { PrescriptionSignature } from '../prescription.types'

export const PrescriptionSignatureBlock = ({
  signature,
  signatureText,
}: {
  signature: PrescriptionSignature
  signatureText?: string
}) => (
  <div className="mt-16 flex justify-center border-t border-slate-200 pt-8 text-center">
    <div>
      <BadgeCheck size={24} className="mx-auto text-brand-700 print:hidden" aria-hidden="true" />
      <p className="mt-2 font-bold text-slate-900">{signature.name}</p>
      {signatureText ? (
        <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{signatureText}</p>
      ) : null}
      <p className="mt-1 text-sm text-slate-600">{signature.specialty}</p>
      <p className="mt-1 text-sm font-semibold text-slate-700">{signature.crm}</p>
    </div>
  </div>
)
