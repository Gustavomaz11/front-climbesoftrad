import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { AuthenticatedHome } from './features/auth/AuthenticatedHome'
import { useAuthentication } from './features/auth/auth-context'
import { LoginPage } from './features/auth/LoginPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'

const ReportEditor = lazy(() => import('./features/reports/ReportEditorPage').then(m => ({ default: m.ReportEditorPage })))
const PrescriptionEditor = lazy(() => import('./features/prescriptions/PrescriptionEditorPage').then(m => ({ default: m.PrescriptionEditorPage })))
const Patients = lazy(() => import('./features/patients/PatientsPage').then(m => ({ default: m.PatientsPage })))
const PatientDetails = lazy(() => import('./features/patients/PatientDetailsPage').then(m => ({ default: m.PatientDetailsPage })))
const PatientReviews = lazy(() => import('./features/patients/PatientReviewsPage').then(m => ({ default: m.PatientReviewsPage })))
const PatientImports = lazy(() => import('./features/patients/PatientImportsPage').then(m => ({ default: m.PatientImportsPage })))
const Images = lazy(() => import('./features/dicom/StudyImagesPage').then(m => ({ default: m.StudyImagesPage })))
const Viewer = lazy(() => import('./features/dicom/DicomViewerLaunchPage').then(m => ({ default: m.DicomViewerLaunchPage })))
const Research = lazy(() => import('./features/research-ai/ResearchAiPage').then(m => ({ default: m.ResearchAiPage })))
const LoginRoute = () => useAuthentication().status === 'authenticated' ? <Navigate to="/dashboard" replace /> : <LoginPage />

const ConfigurationRedirect = () => {
  const location = useLocation()
  useEffect(() => {
    window.location.replace((import.meta.env.VITE_CONFIGURACOES_URL || 'http://localhost:5175') + location.pathname + location.search)
  }, [location.pathname, location.search])
  return <p role="status" className="p-8">Abrindo Gestão…</p>
}

export default function App() {
  return <Suspense fallback={<main role="status" className="p-8">Carregando…</main>}><Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginRoute />} />
    <Route path="/dashboard" element={<ProtectedRoute><AuthenticatedHome /></ProtectedRoute>} />
    <Route path="/settings/*" element={<ConfigurationRedirect />} />
    <Route path="/reports/:examId" element={<ProtectedRoute><ReportEditor /></ProtectedRoute>} />
    <Route path="/prescriptions/:examId" element={<ProtectedRoute><PrescriptionEditor /></ProtectedRoute>} />
    <Route path="/images/:examId" element={<ProtectedRoute><Images /></ProtectedRoute>} />
    <Route path="/viewer/:examId" element={<ProtectedRoute><Viewer /></ProtectedRoute>} />
    <Route path="/research/exams/:examId" element={<ProtectedRoute><Research /></ProtectedRoute>} />
    <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
    <Route path="/patients/review" element={<ProtectedRoute><PatientReviews /></ProtectedRoute>} />
    <Route path="/patients/imports" element={<ProtectedRoute><PatientImports /></ProtectedRoute>} />
    <Route path="/patients/:patientId" element={<ProtectedRoute><PatientDetails /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense>
}
