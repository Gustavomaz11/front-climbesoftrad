import { LockKeyhole } from 'lucide-react'
import { brand } from '../../../config/brand'

export const AuthFooter = () => (
  <footer className="mt-8 border-t border-slate-200 pt-6 text-center">
    <p className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600">
      <LockKeyhole size={14} aria-hidden="true" className="text-brand-700" />
      Acesso restrito a usuários autorizados.
    </p>
    <p className="mx-auto mt-4 max-w-md text-[0.69rem] leading-5 text-slate-500">
      Ao acessar a plataforma, você declara estar autorizado a utilizar os dados
      disponíveis de acordo com as políticas de segurança e privacidade da instituição.
    </p>
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[0.7rem] text-slate-500">
      <span>© {new Date().getFullYear()} {brand.name}</span>
      <span className="text-slate-300" aria-hidden="true">•</span>
      <a
        href="/privacy"
        className="rounded hover:text-brand-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-600"
      >
        Política de Privacidade
      </a>
      <span className="text-slate-300" aria-hidden="true">•</span>
      <a
        href="/terms"
        className="rounded hover:text-brand-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-600"
      >
        Termos de Uso
      </a>
    </div>
  </footer>
)
