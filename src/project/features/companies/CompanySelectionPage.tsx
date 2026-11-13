import { Card as SurfaceCard } from '@/components/ui/card'
import { Building2, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { useAuthentication } from '../auth/auth-context'

export const CompanySelectionPage = () => {
  const { user, selectWorkspace, switchingContext, logout } = useAuthentication()
  const [error, setError] = useState(false)
  const navigate = useNavigate()
  if (!user) return null
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <SurfaceCard className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm gap-0 py-0 ring-0">
        <Building2 className="text-brand-700" size={28} />
        <h1 className="mt-4 text-2xl font-bold text-foreground">Selecione a empresa</h1>
        <p className="mt-2 text-sm text-muted-foreground">Escolha onde deseja trabalhar nesta aba.</p>
        {error ? (
          <Alert variant="error" className="mt-4">
            Não foi possível selecionar a empresa.
          </Alert>
        ) : null}
        <div className="mt-5 grid gap-3">
          {user.companies.map((company) => (
            <Button
              key={company.id}
              variant="outline"
              disabled={switchingContext}
              onClick={() => {
                setError(false)
                void selectWorkspace({ companyId: company.id, unitId: null }).catch(() =>
                  setError(true),
                )
              }}
            >
              {company.name} · {company.accessRole.name}
            </Button>
          ))}
          {!user.companies.length ? (
            <p className="text-sm text-muted-foreground">
              Você não possui vínculo ativo. Solicite acesso ao administrador da empresa.
            </p>
          ) : null}
        </div>
        <div className="mt-6 flex gap-3">
          {user.isPlatformAdmin ? (
            <Button variant="outline" onClick={() => navigate('/settings/companies')}>
              Administrar empresas
            </Button>
          ) : null}
          <Button variant="ghost" leftIcon={<LogOut size={16} />} onClick={() => void logout()}>
            Sair
          </Button>
        </div>
      </SurfaceCard>
    </main>
  )
}
