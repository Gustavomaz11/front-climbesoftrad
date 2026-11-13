import { Activity, Building2, FileCheck2, FileInput, FileStack, FolderHeart, Home, Layers3, ListChecks, Network, Settings2, ShieldCheck, Stethoscope, UsersRound, Wallet, SlidersHorizontal, ScanLine } from 'lucide-react'
import type { AuthenticatedUser } from '@/project/features/auth/auth.types'

const management = [
  { label: 'Visão geral', to: '/dashboard', icon: Home, permissions: [] },
  { label: 'Médicos', to: '/settings/physicians/list', icon: Stethoscope, permissions: ['physicians.view'] },
  { label: 'Unidades e Routers', to: '/settings/units/list', icon: Building2, permissions: ['units.view'] },
  { label: 'Modalidades', to: '/settings/modalities', icon: ScanLine, permissions: ['exam.catalog.view'] },
  { label: 'Catálogo de exames', to: '/settings/exam-catalog', icon: Layers3, permissions: ['exam.catalog.view'] },
  { label: 'Usuários e vínculos', to: '/settings/memberships', icon: UsersRound, permissions: ['users.view', 'users.create', 'memberships.manage'] },
  { label: 'Cargos e permissões', to: '/settings/access-control', icon: ShieldCheck, permissions: ['roles.view', 'users.view'] },
  { label: 'Recepção de imagens', to: '/settings/dicom', icon: Network, permissions: ['dicom.import', 'dicom.sources.manage', 'dicom.review'] },
  { label: 'Preparação', to: '/settings/preparation', icon: ListChecks, permissions: ['exams.preparation.manage'] },
  { label: 'Protocolos de contraste', to: '/settings/contrast-protocols', icon: FileStack, permissions: ['contrast.protocols.view'] },
  { label: 'Preços de exames', to: '/settings/exam-prices', icon: Wallet, permissions: ['exam.prices.view'] },
  { label: 'Preferências', to: '/settings/preferences', icon: SlidersHorizontal, permissions: ['company.settings.view'] },
]
const reporting = [
  { label: 'Visão geral', to: '/overview', icon: Home, permissions: ['exams.view'] },
  { label: 'Fila de exames', to: '/dashboard', icon: FileStack, permissions: ['exams.view'] },
  { label: 'Minha fila', to: '/my-queue', icon: ListChecks, permissions: ['exams.view'], doctorOnly: true },
  { label: 'Pacientes', to: '/patients', icon: FolderHeart, permissions: ['patients.view'] },
]
const hospital = [
  { label: 'Envios de exames', to: '/dashboard', icon: FileInput, permissions: ['hospital.intake.view'] },
  { label: 'Laudos recebidos', to: '/results', icon: FileCheck2, permissions: ['hospital.results.view'] },
]

export const portalKind = import.meta.env.VITE_PORTAL_KIND || 'sourad'
export const portalNavigation = (user: AuthenticatedUser) =>
  (portalKind === 'configuracoes' ? management : portalKind === 'hospital' ? hospital : reporting)
    .filter(item => (!('doctorOnly' in item) || !item.doctorOnly || user.role === 'DOCTOR') && (!item.permissions.length || user.role === 'ADMIN' || item.permissions.some(permission => user.permissions.includes(permission))))

export const portalLinks = [
  { name: 'ClimbeSoftRad', description: 'Central de laudos', icon: Activity, kind: 'sourad', url: import.meta.env.VITE_SOURAD_URL || 'http://localhost:5173' },
  { name: 'Hospital', description: 'Envio de exames', icon: Building2, kind: 'hospital', url: import.meta.env.VITE_HOSPITAL_URL || 'http://localhost:5174' },
  { name: 'Gestão', description: 'Cadastros e configurações', icon: Settings2, kind: 'configuracoes', url: import.meta.env.VITE_CONFIGURACOES_URL || 'http://localhost:5175' },
]
