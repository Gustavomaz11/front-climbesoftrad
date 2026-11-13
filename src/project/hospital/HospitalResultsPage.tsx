import { Navigate } from 'react-router-dom'
import { PageHeading } from '@/portal/PageHeading'
import { useAuthentication } from '../features/auth/auth-context'
import { HospitalResults } from './HospitalResults'

export const HospitalResultsPage = () => {
  const { user } = useAuthentication()
  if (!user?.permissions.includes('hospital.results.view')) return <Navigate to="/dashboard" replace />
  return <main className="mx-auto max-w-[1600px] p-4 sm:p-7 lg:p-8"><PageHeading eyebrow="Hospital" title="Laudos recebidos" description="Consulte os resultados finalizados, assinados e enviados pela central para o seu hospital." /><HospitalResults /></main>
}
