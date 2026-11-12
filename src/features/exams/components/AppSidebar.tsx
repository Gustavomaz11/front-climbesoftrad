import type { SettingsSection } from '../../settings/settings-section'
import {
  CalendarDays,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { brand } from '../../../config/brand'
import { useNavigate } from 'react-router-dom'

interface AppSidebarProps {
  open: boolean
  onClose: () => void
  activeItem?: 'patients' | 'exams' | SettingsSection
  userRole: 'USER' | 'ADMIN' | 'DOCTOR'
  userPermissions?: string[]
}

const navigation = [
  { id: 'overview', label: 'Visão geral', icon: LayoutDashboard },
  { id: 'exams', label: 'Exames', icon: FileText },
  { id: 'patients', label: 'Pacientes', icon: Users },
  { id: 'schedule', label: 'Agenda', icon: CalendarDays },
] as const

const settingsPermissions = [
  'exams.preparation.manage',
  'dicom.import', 'dicom.sources.manage', 'dicom.review',
  'contrast.protocols.view',
  'exam.prices.view',
  'exam.catalog.view',
  'physicians.view',
  'units.view',
  'roles.view',
  'users.view',
  'users.create',
  'companies.view',
  'company.settings.view',
]

export const AppSidebar = ({
  open,
  onClose,
  activeItem = 'exams',
  userRole,
  userPermissions = [],
}: AppSidebarProps) => {
  const navigate = useNavigate()
  const configuration = import.meta.env.VITE_PORTAL_KIND === 'configuracoes'
  const settingsVisible =
    userRole === 'ADMIN' ||
    settingsPermissions.some((permission) => userPermissions.includes(permission))
  const settingsTarget =
    userPermissions.includes('exams.preparation.manage') && userRole !== 'ADMIN'
      ? '/settings/preparation'
      : userRole === 'ADMIN' || userPermissions.includes('physicians.view')
      ? '/settings/physicians'
      : userPermissions.includes('units.view')
        ? '/settings/units'
        : userPermissions.includes('roles.view') || userPermissions.includes('users.view')
          ? '/settings/access-control'
          : '/settings/companies'
  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Fechar navegação"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-950 text-white shadow-2xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:self-start lg:translate-x-0 lg:shadow-none ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/[0.08] px-5">
          <a
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-cyan-300"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200">
              <HeartPulse size={22} aria-hidden="true" />
            </span>
            <span>
              <span className="block font-bold">{brand.name}</span>
              <span className="text-[0.62rem] font-semibold tracking-[0.14em] text-cyan-100/55 uppercase">
                {brand.productLabel}
              </span>
            </span>
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X size={19} />
          </Button>
        </div>

        <nav
          className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-6"
          aria-label="Navegação principal"
        >
          <p className="mb-3 px-3 text-[0.65rem] font-bold tracking-[0.14em] text-slate-500 uppercase">
            Navegação
          </p>
          {configuration && [
            {id:'physicians',label:'Médicos',icon:Users,permission:'physicians.view'},
            {id:'units',label:'Unidades',icon:HeartPulse,permission:'units.view'},
            {id:'modalities',label:'Modalidades de exames',icon:FileText,permission:'exam.catalog.view'},
          ].filter(item=>userRole==='ADMIN' || userPermissions.includes(item.permission)).map(({id,label,icon:Icon})=><button
            key={id} type="button" aria-current={activeItem===id ? 'page' : undefined}
            onClick={()=>{navigate(`/settings/${id}`);onClose()}}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${activeItem===id ? 'bg-cyan-300/12 text-cyan-100' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'}`}>
            <Icon size={19} aria-hidden="true" />{label}
          </button>)}
          {(configuration ? [] : navigation).map(({ id, label, icon: Icon }) => {
            const active = id === activeItem
            return (
              <button
                key={label}
                type="button"
                aria-current={active ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? 'bg-cyan-300/12 text-cyan-100' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'}`}
                onClick={() => {
                  if (id === 'exams') navigate('/dashboard')
                  if (id === 'patients' && userPermissions.includes('patients.view'))
                    navigate('/patients')
                  onClose()
                }}
              >
                <Icon size={19} aria-hidden="true" />
                {label}
                {active ? <span className="ml-auto size-1.5 rounded-full bg-cyan-300" /> : null}
              </button>
            )
          })}
        </nav>

        <div className="shrink-0 border-t border-white/[0.08] p-3">
          {settingsVisible ? (
            <button
              type="button"
              aria-current={
                activeItem !== 'exams' && activeItem !== 'patients' ? 'page' : undefined
              }
              onClick={() => {
                if (configuration) navigate('/dashboard')
                else window.location.assign((import.meta.env.VITE_CONFIGURACOES_URL || 'http://localhost:5175') + settingsTarget)
                onClose()
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${activeItem !== 'exams' ? 'bg-cyan-300/12 text-cyan-100' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'}`}
            >
              <Settings size={19} aria-hidden="true" />
              {configuration ? 'Início da Gestão' : 'Gestão'}
            </button>
          ) : null}
          {configuration && <a href={import.meta.env.VITE_SOURAD_URL || 'http://localhost:5173'} className="mt-2 block rounded-xl px-3 py-3 text-sm font-semibold text-cyan-100 hover:bg-white/10">Abrir ClimbeSoftRad ↗</a>}
        </div>
      </aside>
    </>
  )
}
