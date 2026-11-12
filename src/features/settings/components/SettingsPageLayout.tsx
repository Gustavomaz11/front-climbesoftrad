import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppSidebar } from '../../exams/components/AppSidebar'
import { DashboardHeader } from '../../exams/components/DashboardHeader'
import { useAuthentication } from '../../auth/auth-context'
import { SettingsNavigation } from './SettingsNavigation'
import type { SettingsSection } from '../settings-section'

export const SettingsPageLayout = ({
  active,
  title,
  description,
  children,
}: {
  active: SettingsSection
  title: string
  description: string
  children: ReactNode
}) => {
  const { user, logout } = useAuthentication()
  const [navigationOpen, setNavigationOpen] = useState(false)
  const navigate = useNavigate()
  if (!user) return null
  return (
    <div className="flex min-h-screen bg-slate-100">
      <AppSidebar
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        userRole={user.role}
        userPermissions={user.permissions}
        activeItem={active}
      />
      <div className="min-w-0 flex-1">
        <DashboardHeader
          userName={user.fullName}
          userRole={user.role}
          onOpenNavigation={() => setNavigationOpen(true)}
          onLogout={() => void logout().then(() => navigate('/login', { replace: true }))}
        />
        <main className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Gestão</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-950">{title}</h1>
          <p className="mb-6 mt-2 text-sm text-slate-500">{description}</p>
          <SettingsNavigation active={active} />
          {children}
        </main>
      </div>
    </div>
  )
}
