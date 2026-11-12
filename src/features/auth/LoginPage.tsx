import { AuthBranding } from './components/AuthBranding'
import { AuthFooter } from './components/AuthFooter'
import { AuthLogo } from './components/AuthLogo'
import { LoginForm } from './components/LoginForm'
import { brand } from '../../config/brand'

export const LoginPage = () => (
  <main className="grid min-h-screen min-h-[100svh] bg-slate-50 lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,0.95fr)]">
    <AuthBranding />

    <section
      aria-labelledby="login-title"
      className="relative flex min-h-screen min-h-[100svh] items-center justify-center overflow-hidden px-4 py-8 sm:px-8 sm:py-12 lg:px-10 xl:px-16"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(8,145,178,0.08),transparent_68%)] lg:hidden"
      />

      <div className="animate-page-enter relative w-full max-w-[29rem]">
        <div className="mb-10 lg:hidden">
          <AuthLogo />
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_18px_60px_-38px_rgba(15,45,65,0.35)] sm:p-8 xl:p-9">
          <div className="mb-1 inline-flex rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[0.68rem] font-bold tracking-[0.1em] text-brand-700 uppercase">
            {brand.name}
          </div>
          <h2
            id="login-title"
            className="mt-4 text-[1.75rem] leading-tight font-bold tracking-[-0.035em] text-slate-900 sm:text-[2rem]"
          >
            Bem-vindo novamente
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {brand.loginDescription}
          </p>

          <LoginForm />
          <AuthFooter />
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          Acesso provisionado pela sua instituição.
        </p>
      </div>
    </section>
  </main>
)
