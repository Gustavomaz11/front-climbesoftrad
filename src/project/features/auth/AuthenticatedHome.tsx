import { useNavigate } from 'react-router-dom'
import { ExamsDashboard } from '../exams/ExamsDashboard'
import { useAuthentication } from './auth-context'

export const AuthenticatedHome = () => {
  const { user, logout } = useAuthentication()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  if (!user) return null

  return <ExamsDashboard user={user} onLogout={() => void handleLogout()} />
}
