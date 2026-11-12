import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../features/auth/LoginPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { useAuthentication } from '../features/auth/auth-context'
import { HospitalInboxPage } from './HospitalInboxPage'
import { lazy, Suspense } from 'react'
const HospitalResultPage = lazy(() => import('./HospitalResultPage'))

const LoginRoute = () => {
  const { status } = useAuthentication()
  return status === 'authenticated' ? <Navigate to="/dashboard" replace /> : <LoginPage />
}

export default function HospitalApp() {
  return <Routes>
    <Route path="/login" element={<LoginRoute />} />
    <Route path="/dashboard" element={<ProtectedRoute><HospitalInboxPage /></ProtectedRoute>} />
    <Route path="/results/:id" element={<ProtectedRoute><Suspense fallback={<p role="status" className="p-8">Carregando laudo…</p>}><HospitalResultPage /></Suspense></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
}
