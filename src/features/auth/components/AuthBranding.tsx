import { FileCheck2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { AuthLogo } from './AuthLogo'

const trustIndicators = [
  {
    title: 'Segurança',
    description: 'Acesso protegido',
    icon: ShieldCheck,
  },
  {
    title: 'Privacidade',
    description: 'Dados confidenciais',
    icon: LockKeyhole,
  },
  {
    title: 'Rastreabilidade',
    description: 'Atividades auditáveis',
    icon: FileCheck2,
  },
] as const

export const AuthBranding = () => (
  <aside className="relative hidden min-h-screen overflow-hidden bg-brand-950 px-10 py-9 text-white lg:flex lg:min-h-[100svh] lg:flex-col xl:px-16 xl:py-12 2xl:px-24">
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(14,116,144,0.2),transparent_35%)]"
    />
    <div
      aria-hidden="true"
      className="absolute -right-24 top-1/2 size-96 -translate-y-1/2 rounded-full border border-white/[0.06]"
    />
    <div
      aria-hidden="true"
      className="absolute -right-8 top-1/2 size-64 -translate-y-1/2 rounded-full border border-white/[0.05]"
    />

    <div className="relative z-10">
      <AuthLogo inverted />
    </div>

    <div className="relative z-10 my-auto max-w-2xl py-16">
      <div className="mb-7 flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-cyan-200 uppercase">
        <span className="h-px w-8 bg-cyan-300/70" aria-hidden="true" />
        Cuidado conectado
      </div>
      <h1 className="max-w-xl text-4xl leading-[1.15] font-semibold tracking-[-0.035em] text-balance xl:text-5xl 2xl:text-[3.35rem]">
        Gestão segura de informações clínicas.
      </h1>
      <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 xl:text-lg xl:leading-8">
        Centralize pacientes, exames e documentos em uma plataforma criada para
        simplificar a rotina da sua instituição.
      </p>

      <div className="mt-12 grid max-w-2xl gap-3 xl:grid-cols-3">
        {trustIndicators.map(({ title, description, icon: Icon }) => (
          <div
            key={title}
            className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.045] p-3.5"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-cyan-300/10 text-cyan-200">
              <Icon size={18} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-white">{title}</span>
              <span className="mt-0.5 block text-xs text-slate-400">{description}</span>
            </span>
          </div>
        ))}
      </div>
    </div>

    <p className="relative z-10 text-xs leading-5 text-slate-400">
      Tecnologia para uma rotina assistencial mais organizada e confiável.
    </p>
  </aside>
)
