import { ShieldX } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '../../components/ui/Button'
import { portalLinks } from '@/portal/portal-navigation'
import { useAuthentication } from './auth-context'
import { canAccessPortal, currentPortal, portalNames } from './portal-access'

export const PortalAccessDenied = () => {
  const { user, logout } = useAuthentication()
  return <main className="grid min-h-screen place-items-center bg-background p-6">
    <Card className="w-full max-w-lg"><CardContent className="space-y-5 pt-6">
      <ShieldX className="size-9 text-muted-foreground" />
      <h1 className="text-xl font-bold">Acesso {currentPortal === 'configuracoes' ? 'à' : 'ao'} {portalNames[currentPortal]} não autorizado</h1>
      <p className="text-sm text-muted-foreground">Solicite à Gestão a liberação deste portal ou acesse uma das áreas autorizadas abaixo.</p>
      <div className="flex flex-wrap gap-3">{portalLinks.filter(p => canAccessPortal(user, p.kind)).map(p => <a key={p.kind} className="rounded-md border border-border px-4 py-2 text-sm font-medium" href={p.url}>{p.name}</a>)}</div>
      <Button variant="outline" onClick={() => void logout()}>Sair da conta</Button>
    </CardContent></Card>
  </main>
}
