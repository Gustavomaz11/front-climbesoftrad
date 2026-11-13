import { canAccessPortal } from './portal-access'
import { PortalAccessDenied } from './PortalAccessDenied'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthentication } from './auth-context'

interface ProtectedRouteProps {
  children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { status, user, switchingContext, workspaceEpoch } = useAuthentication()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <main className="grid min-h-screen min-h-[100svh] place-items-center bg-muted">
        <p className="text-sm font-medium text-muted-foreground" role="status">
          Restaurando sessão segura...
        </p>
      </main>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!canAccessPortal(user)) return <PortalAccessDenied />

  if (user?.mustChangePassword || user?.mustUploadSignature) {
    return <main className="min-h-screen min-h-[100svh] bg-muted" />
  }

  if (!user?.activeCompany || (user.centralCompanyId && user.activeCompany.id!==user.centralCompanyId))
    return <main className="p-8"><h1 className="text-xl font-bold">Acesso à área indisponível</h1><p className="mt-2">Seu usuário precisa estar vinculado à central ClimbeSoftRad e aos hospitais autorizados.</p></main>

  return (
    <>
      {switchingContext ? (
        <p role="status" className="p-8 text-center text-sm text-muted-foreground">
          Salvando alterações e trocando o contexto...
        </p>
      ) : null}
      <div
        hidden={switchingContext}
        key={
          (user?.activeCompany?.id ?? 'platform') +
          ':' +
          (user?.activeCompany?.selectedUnitId ?? 'all') +
          ':' +
          workspaceEpoch
        }
      >
        {children}
      </div>
    </>
  )
}
