import { Navigate, useNavigate } from 'react-router-dom'
import { ExamsDashboard } from '../exams/ExamsDashboard'
import { useAuthentication } from './auth-context'

export const AuthenticatedHome = ({ personal = false }: { personal?: boolean }) => {
  const { user, logout } = useAuthentication()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  if (!user) return null
  if (personal && user.role !== 'DOCTOR') return <Navigate to="/dashboard" replace />

  return <ExamsDashboard key={personal ? 'personal' : 'general'} user={user} personal={personal} onLogout={() => void handleLogout()} />
}

export const MyQueuePage = () => <AuthenticatedHome personal />
