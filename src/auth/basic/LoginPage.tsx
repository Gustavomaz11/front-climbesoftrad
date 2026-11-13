import { Activity, Building2, ScanLine, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { LoginForm } from '@/project/features/auth/components/LoginForm'
import { brand } from '@/project/config/brand'
import { portalKind, portalLinks } from '@/portal/portal-navigation'

export const LoginPage = () => <div className="portal-login relative isolate flex min-h-screen w-full flex-col bg-background/0 text-foreground">
  <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute top-0 left-1/2 h-[460px] w-[680px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-muted-foreground/10 blur-3xl" /><div className="absolute right-[12%] bottom-0 h-[320px] w-[320px] translate-y-1/3 rounded-full bg-muted-foreground/10 blur-3xl" />
    <svg className="absolute inset-0 h-full w-full opacity-[0.1] dark:opacity-[0.05]"><filter id="auth4-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#auth4-grain)" /></svg>
    <div className="absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:40px_40px]" />
  </div>
  <header className="flex flex-col items-center justify-between gap-4 px-8 py-6 md:flex-row"><div className="flex items-center gap-2"><div className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background"><Activity className="size-5" /></div><span className="text-lg font-semibold">{brand.name}</span></div><p className="text-sm text-muted-foreground">Precisa de acesso? <span className="font-medium text-foreground">Fale com a administração</span></p></header>
  <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 pb-10">
    <Card className="w-full max-w-md gap-0 rounded-xl border border-border/60 bg-card/80 p-8 shadow-xl ring-0 backdrop-blur-lg">
      <div className="text-center"><h1 className="text-2xl font-semibold tracking-tight">Bem-vindo de volta.</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{brand.loginDescription}</p></div>
      <div className="mt-8 flex flex-col gap-3">{portalLinks.filter(item=>item.kind!==portalKind).map(({name,icon:Icon,url})=><Button key={name} variant="outline" asChild className="h-9 bg-foreground/5"><a href={url}><Icon className="size-4.5" />Acessar {name}</a></Button>)}</div>
      <div className="my-6 flex items-center gap-3"><Separator className="flex-1" /><span className="text-xs text-muted-foreground">ou continue com seu acesso</span><Separator className="flex-1" /></div>
      <LoginForm />
      <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">Médicos: utilize o CRM + UF. No primeiro acesso, a troca de senha e o cadastro da assinatura são obrigatórios.</p>
    </Card>
  </main>
  <footer className="flex flex-col items-center gap-5 px-4 pb-8 text-center"><p className="text-sm text-muted-foreground">Uma plataforma que conecta hospitais, médicos e cuidado.</p><div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 opacity-60 grayscale"><span className="flex items-center gap-1.5 text-base font-semibold tracking-tight"><Activity className="size-4" />ClimbeSoftRad</span><span className="flex items-center gap-1.5 text-base font-semibold"><Building2 className="size-4" />Hospital</span><span className="flex items-center gap-1.5 text-base font-semibold"><ShieldCheck className="size-4" />Gestão</span><span className="flex items-center gap-1.5 text-base font-medium"><ScanLine className="size-4" />DICOM</span></div></footer>
</div>

export default LoginPage
