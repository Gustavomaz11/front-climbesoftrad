import { useAuthentication } from '../../auth/auth-context'
import { Bell, LogOut, Menu } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

interface DashboardHeaderProps {
  userName: string
  userRole: 'USER' | 'ADMIN' | 'DOCTOR'
  onOpenNavigation: () => void
  onLogout: () => void
}

export const DashboardHeader = ({
  userName,
  userRole,
  onOpenNavigation,
  onLogout,
}: DashboardHeaderProps) => {
  const { user } = useAuthentication()
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenNavigation}
          aria-label="Abrir menu"
        >
          <Menu size={21} />
        </Button>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">
            {user?.accessRole.name || (userRole === 'DOCTOR' ? 'Médico' : 'Portal de exames')}
          </p>
          <p className="truncate text-sm font-bold text-slate-900">Olá, {userName}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-3">
        <Button variant="ghost" size="icon" aria-label="Notificações">
          <Bell size={19} />
        </Button>
        <span className="hidden size-9 place-items-center rounded-full bg-brand-100 text-xs font-extrabold text-brand-800 sm:grid">
          {initials}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          leftIcon={<LogOut size={17} />}
          className="px-2 sm:px-3"
        >
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  )
}
