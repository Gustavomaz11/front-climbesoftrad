import { BadgeCheck } from 'lucide-react'
import type { PrescriptionSignature } from '../prescription.types'

export const PrescriptionSignatureBlock = ({
  signature,
  signatureText,
}: {
  signature: PrescriptionSignature
  signatureText?: string
}) => (
  <div className="mt-16 flex justify-center border-t border-border pt-8 text-center">
    <div>
      <BadgeCheck size={24} className="mx-auto text-brand-700 print:hidden" aria-hidden="true" />
      <p className="mt-2 font-bold text-foreground">{signature.name}</p>
      {signatureText ? (
        <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{signatureText}</p>
      ) : null}
      <p className="mt-1 text-sm text-muted-foreground">{signature.specialty}</p>
      <p className="mt-1 text-sm font-semibold text-muted-foreground">{signature.crm}</p>
    </div>
  </div>
)
