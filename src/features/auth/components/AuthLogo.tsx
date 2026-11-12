import { HeartPulse } from 'lucide-react'
import { brand } from '../../../config/brand'

interface AuthLogoProps {
  inverted?: boolean
}

export const AuthLogo = ({ inverted = false }: AuthLogoProps) => (
  <a
    href="/login"
    aria-label={`${brand.name} — página de login`}
    className="group inline-flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
  >
    <span
      className={`grid size-11 shrink-0 place-items-center rounded-xl border shadow-sm transition-transform group-hover:-translate-y-0.5 ${
        inverted
          ? 'border-white/15 bg-white/10 text-cyan-200'
          : 'border-brand-100 bg-brand-50 text-brand-700'
      }`}
      aria-hidden="true"
    >
      <HeartPulse size={23} strokeWidth={2} />
    </span>
    <span className="leading-none">
      <span
        className={`block text-[1.08rem] font-bold tracking-[-0.02em] ${inverted ? 'text-white' : 'text-slate-900'}`}
      >
        {brand.name}
      </span>
      <span
        className={`mt-1.5 block text-[0.64rem] font-semibold tracking-[0.16em] uppercase ${inverted ? 'text-cyan-100/65' : 'text-slate-500'}`}
      >
        {brand.productLabel}
      </span>
    </span>
  </a>
)
