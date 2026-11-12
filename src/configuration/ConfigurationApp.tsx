import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, Link, useLocation } from 'react-router-dom'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { LoginPage } from '../features/auth/LoginPage'
import { useAuthentication } from '../features/auth/auth-context'
import { SettingsPageLayout } from '../features/settings/components/SettingsPageLayout'

const Physicians = lazy(() => import('../features/physicians/PhysiciansSettingsPage').then(m => ({ default: m.PhysiciansSettingsPage })))
const Units = lazy(() => import('../features/hospital-units/HospitalUnitsSettingsPage').then(m => ({ default: m.HospitalUnitsSettingsPage })))
const Modalities = lazy(() => import('../features/exam-modalities/ExamModalitiesSettingsPage').then(m => ({ default: m.ExamModalitiesSettingsPage })))
const Catalog = lazy(() => import('../features/exam-catalog/ExamCatalogSettingsPage').then(m => ({ default: m.ExamCatalogSettingsPage })))
const Memberships = lazy(() => import('../features/companies/CompanyMembershipsSettingsPage').then(m => ({ default: m.CompanyMembershipsSettingsPage })))
const Access = lazy(() => import('../features/access-control/AccessControlSettingsPage').then(m => ({ default: m.AccessControlSettingsPage })))
const Dicom = lazy(() => import('../features/dicom/DicomSettingsPage').then(m => ({ default: m.DicomSettingsPage })))
const Preparation = lazy(() => import('../features/exam-workflow/PreparationSettingsPage').then(m => ({ default: m.PreparationSettingsPage })))
const Contrast = lazy(() => import('../features/contrast-protocols/ContrastProtocolsSettingsPage').then(m => ({ default: m.ContrastProtocolsSettingsPage })))
const Prices = lazy(() => import('../features/exam-pricing/ExamPricingSettingsPage').then(m => ({ default: m.ExamPricingSettingsPage })))
const Preferences = lazy(() => import('../features/companies/CompanyPreferencesPage').then(m => ({ default: m.CompanyPreferencesPage })))
const Login = () => useAuthentication().status === 'authenticated' ? <Navigate to="/dashboard" replace /> : <LoginPage />
const Home = () => <SettingsPageLayout active="preferences" title="Gestão" description="Cadastre os hospitais que enviam exames à central e os médicos responsáveis pelos laudos.">
  <div className="grid gap-5 md:grid-cols-3">{[
    ['Médicos','Consulte CRM e UF, confira especialidades e defina as unidades autorizadas.','physicians'],
    ['Unidades (hospitais)','Cadastre os hospitais de origem dos exames recebidos pelo ClimbeSoftRad.','units'],
    ['Modalidades de exames','Pesquise o catálogo DICOM pré-preenchido e cadastre novas modalidades.','modalities'],
  ].map(([title,description,path]) => <Link key={path} to={`/settings/${path}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-cyan-500"><h2 className="text-xl font-bold text-brand-900">{title}</h2><p className="mt-3 text-sm text-slate-600">{description}</p><p className="mt-6 font-semibold text-cyan-700">Gerenciar →</p></Link>)}</div>
</SettingsPageLayout>

const RegistrationPage = ({kind}: {kind:'physicians'|'units'}) => {
  const {pathname}=useLocation()
  const Page=kind==='physicians' ? Physicians : Units
  return <ProtectedRoute><Page key={pathname} createOnOpen={pathname.endsWith('/new')} /></ProtectedRoute>
}

export default function ConfigurationApp() {
  return <Suspense fallback={<p role="status" className="p-8">Carregando Gestão…</p>}><Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
    <Route path="/settings/companies" element={<Navigate to="/dashboard" replace />} />
    {(['physicians','units'] as const).map(kind=><Route key={kind} path={`/settings/${kind}`} element={<Navigate to={`/settings/${kind}/new`} replace />} />)}
    {(['physicians','units'] as const).flatMap(kind=>['new','list'].map(action=><Route key={kind+action} path={`/settings/${kind}/${action}`} element={<RegistrationPage kind={kind} />} />))}
    {Object.entries({ modalities: Modalities, 'exam-catalog': Catalog, memberships: Memberships, 'access-control': Access, dicom: Dicom, preparation: Preparation, 'contrast-protocols': Contrast, 'exam-prices': Prices, preferences: Preferences }).map(([path,Page]) => <Route key={path} path={`/settings/${path}`} element={<ProtectedRoute><Page /></ProtectedRoute>} />)}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></Suspense>
}
