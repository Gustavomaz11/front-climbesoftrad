/* eslint-disable react/only-export-components -- This file exports the router configuration. */
import { Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, useLocation, type RouteObject } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import LoginPage from '@/auth/basic/LoginPage'
import { AuthenticationProvider } from '@/project/features/auth/AuthenticationProvider'
import { useAuthentication } from '@/project/features/auth/auth-context'
import { ProtectedRoute } from '@/project/features/auth/ProtectedRoute'
import { WorkspaceContextBar } from '@/project/features/companies/WorkspaceContextBar'

const Loading = () => <p role="status" className="p-8 text-sm text-muted-foreground">Carregando…</p>
const Root = () => <AuthenticationProvider><Suspense fallback={<Loading />}><Outlet /></Suspense></AuthenticationProvider>
const Login = () => useAuthentication().status === 'authenticated' ? <Navigate to="/dashboard" replace /> : <LoginPage />
const Protected = () => <ProtectedRoute><Outlet /></ProtectedRoute>
const Documents = () => <><div className="portal-chrome"><WorkspaceContextBar /></div><Outlet /></>
const reportRoutes: RouteObject[] = [
  { path:'/dashboard', lazy:async()=>({ Component:(await import('@/project/features/auth/AuthenticatedHome')).AuthenticatedHome }) },
  { path:'/overview', lazy:async()=>({ Component:(await import('@/portal/ReportingOverview')).ReportingOverview }) },
  { path:'/patients', lazy:async()=>({ Component:(await import('@/project/features/patients/PatientsPage')).PatientsPage }) },
  { path:'/patients/review', lazy:async()=>({ Component:(await import('@/project/features/patients/PatientReviewsPage')).PatientReviewsPage }) },
  { path:'/patients/imports', lazy:async()=>({ Component:(await import('@/project/features/patients/PatientImportsPage')).PatientImportsPage }) },
  { path:'/patients/:patientId', lazy:async()=>({ Component:(await import('@/project/features/patients/PatientDetailsPage')).PatientDetailsPage }) },
]
const documentRoutes: RouteObject[] = [
  { path:'/reports/:examId', lazy:async()=>({ Component:(await import('@/project/features/reports/ReportEditorPage')).ReportEditorPage }) },
  { path:'/prescriptions/:examId', lazy:async()=>({ Component:(await import('@/project/features/prescriptions/PrescriptionEditorPage')).PrescriptionEditorPage }) },
  { path:'/images/:examId', lazy:async()=>({ Component:(await import('@/project/features/dicom/StudyImagesPage')).StudyImagesPage }) },
  { path:'/viewer/:examId', lazy:async()=>({ Component:(await import('@/project/features/dicom/DicomViewerLaunchPage')).DicomViewerLaunchPage }) },
  { path:'/research/exams/:examId', lazy:async()=>({ Component:(await import('@/project/features/research-ai/ResearchAiPage')).ResearchAiPage }) },
]
const managementRoutes: RouteObject[] = [
  { path:'/dashboard', lazy:async()=>({ Component:(await import('@/portal/ManagementHome')).ManagementHome }) },
  ...(['physicians','units'] as const).flatMap(kind=>[
    { path:'/settings/'+kind,element:<Navigate to={'/settings/'+kind+'/list'} replace /> },
    ...(['new','list'] as const).map(action=>({path:'/settings/'+kind+'/'+action,lazy:async()=>{
      const Page=kind==='physicians' ? (await import('@/project/features/physicians/PhysiciansSettingsPage')).PhysiciansSettingsPage : (await import('@/project/features/hospital-units/HospitalUnitsSettingsPage')).HospitalUnitsSettingsPage
      return { Component:()=>{const location=useLocation();return <Page key={location.pathname} createOnOpen={action==='new'} />} }
    }})),
  ]),
  { path:'/settings/modalities', lazy:async()=>({ Component:(await import('@/project/features/exam-modalities/ExamModalitiesSettingsPage')).ExamModalitiesSettingsPage }) },
  { path:'/settings/exam-catalog', lazy:async()=>({ Component:(await import('@/project/features/exam-catalog/ExamCatalogSettingsPage')).ExamCatalogSettingsPage }) },
  { path:'/settings/memberships', lazy:async()=>({ Component:(await import('@/project/features/companies/CompanyMembershipsSettingsPage')).CompanyMembershipsSettingsPage }) },
  { path:'/settings/access-control', lazy:async()=>({ Component:(await import('@/project/features/access-control/AccessControlSettingsPage')).AccessControlSettingsPage }) },
  { path:'/settings/dicom', lazy:async()=>({ Component:(await import('@/project/features/dicom/DicomSettingsPage')).DicomSettingsPage }) },
  { path:'/settings/preparation', lazy:async()=>({ Component:(await import('@/project/features/exam-workflow/PreparationSettingsPage')).PreparationSettingsPage }) },
  { path:'/settings/contrast-protocols', lazy:async()=>({ Component:(await import('@/project/features/contrast-protocols/ContrastProtocolsSettingsPage')).ContrastProtocolsSettingsPage }) },
  { path:'/settings/exam-prices', lazy:async()=>({ Component:(await import('@/project/features/exam-pricing/ExamPricingSettingsPage')).ExamPricingSettingsPage }) },
  { path:'/settings/preferences', lazy:async()=>({ Component:(await import('@/project/features/companies/CompanyPreferencesPage')).CompanyPreferencesPage }) },
  { path:'/settings/companies',element:<Navigate to="/dashboard" replace /> },
]
const hospitalRoutes: RouteObject[] = [
  { path:'/dashboard',lazy:async()=>({Component:(await import('@/project/hospital/HospitalInboxPage')).HospitalInboxPage}) },
  { path:'/results',lazy:async()=>({Component:(await import('@/project/hospital/HospitalResultsPage')).HospitalResultsPage}) },
  { path:'/results/:id',lazy:async()=>({Component:(await import('@/project/hospital/HospitalResultPage')).default}) },
]
const ErrorPage=()=> <main className="grid min-h-svh place-content-center gap-4 p-8 text-center"><h1 className="text-xl font-semibold">Não foi possível abrir esta página.</h1><p className="text-sm text-muted-foreground">Atualize a página para tentar novamente.</p><a href="/dashboard" className="text-sm underline">Voltar ao início</a></main>
const kind=import.meta.env.VITE_PORTAL_KIND
const pages=kind==='hospital'?hospitalRoutes:kind==='configuracoes'?managementRoutes:reportRoutes
export const router=createBrowserRouter([{element:<Root />,errorElement:<ErrorPage />,children:[
  {path:'/login',element:<Login />},
  {path:'/',element:<Navigate to="/dashboard" replace />},
  {element:<Protected />,children:[{element:<AppLayout />,children:pages},...(kind==='sourad'?[{element:<Documents />,children:documentRoutes}]:[])]},
  ...(kind==='sourad'?[{path:'/settings/*',element:<ManagementRedirect />}]:[]),
  {path:'*',element:<Navigate to="/dashboard" replace />},
]}])
function ManagementRedirect(){const location=useLocation();window.location.replace((import.meta.env.VITE_CONFIGURACOES_URL||'http://localhost:5185')+location.pathname+location.search);return <Loading />}
