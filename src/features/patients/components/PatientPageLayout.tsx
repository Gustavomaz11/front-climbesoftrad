import { useState, type ReactNode } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthentication } from '../../auth/auth-context'
import { AppSidebar } from '../../exams/components/AppSidebar'
import { DashboardHeader } from '../../exams/components/DashboardHeader'
export const PatientPageLayout = ({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) => {
  const { user, logout } = useAuthentication()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  if (!user) return null
  return (
    <div className="flex min-h-screen bg-slate-100">
      <AppSidebar
        open={open}
        onClose={() => setOpen(false)}
        activeItem="patients"
        userRole={user.role}
        userPermissions={user.permissions}
      />
      <div className="min-w-0 flex-1">
        <DashboardHeader
          userName={user.fullName}
          userRole={user.role}
          onOpenNavigation={() => setOpen(true)}
          onLogout={() => void logout().then(() => navigate('/login', { replace: true }))}
        />
        <main className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6 lg:p-8">
          <Link to="/patients" className="text-xs font-bold uppercase tracking-wide text-brand-700">
            Pacientes
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-950">{title}</h1>
          <p className="text-sm text-slate-600">{description}</p>
          {children}
        </main>
      </div>
    </div>
  )
}
