import type { SettingsSection } from '../settings-section'
import { Building2, ShieldCheck, Stethoscope } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuthentication } from '../../auth/auth-context'
import { hasAnyPermission } from '../../auth/auth.types'

interface SettingsNavigationProps {
  active: SettingsSection
}

const items = [
  {id:'modalities',label:'Modalidades',to:'/settings/modalities',icon:Building2,permissions:['exam.catalog.view']},
  {id:'preparation',label:'Preparação',to:'/settings/preparation',icon:Building2,permissions:['exams.preparation.manage']},
  {id:'dicom',label:'Recepção de imagens',to:'/settings/dicom',icon:Building2,permissions:['dicom.import','dicom.sources.manage','dicom.review']},
  {id:'contrast-protocols',label:'Protocolos de contraste',to:'/settings/contrast-protocols',icon:Stethoscope,permissions:['contrast.protocols.view']},
  {id:'exam-prices',label:'Preços de exames',to:'/settings/exam-prices',icon:Building2,permissions:['exam.prices.view']},
  {
    id: 'exam-catalog',
    label: 'Catálogo de exames',
    to: '/settings/exam-catalog',
    icon: Building2,
    permissions: ['exam.catalog.view'],
  },
  {
    id: 'memberships',
    label: 'Usuários e vínculos',
    to: '/settings/memberships',
    icon: ShieldCheck,
    permissions: ['users.view', 'users.create', 'memberships.manage'],
  },
  {
    id: 'physicians',
    label: 'Médicos',
    to: '/settings/physicians',
    icon: Stethoscope,
    permissions: ['physicians.view'],
  },
  {
    id: 'units',
    label: 'Unidades',
    to: '/settings/units',
    icon: Building2,
    permissions: ['units.view'],
  },
  {
    id: 'access-control',
    label: 'Cargos e permissões',
    to: '/settings/access-control',
    icon: ShieldCheck,
    permissions: ['roles.view', 'users.view'],
  },
] as const

export const SettingsNavigation = ({ active }: SettingsNavigationProps) => {
  const { user } = useAuthentication()
  return (
    <nav
      aria-label="Seções da Gestão"
      className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
    >
      {items
        .filter(
          (item) => user && (user.isPlatformAdmin || hasAnyPermission(user, [...item.permissions])),
        )
        .map(({ id, label, to, icon: Icon }) => (
          <NavLink
            key={id}
            to={to}
            aria-current={active === id ? 'page' : undefined}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${active === id ? 'bg-brand-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-brand-900'}`}
          >
            <Icon size={17} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
    </nav>
  )
}
