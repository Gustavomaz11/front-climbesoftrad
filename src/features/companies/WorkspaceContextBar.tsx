import { Building2, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { useAuthentication } from '../auth/auth-context'
import type { WorkspaceSelection } from './company.types'
import { TutorialButton } from '../tutorial/TutorialButton'
import { brand } from '../../config/brand'
import { PhysicianSignatureModal } from '../physicians/components/PhysicianSignatureModal'

export const WorkspaceContextBar = () => {
  const { user, selectWorkspace, switchingContext, refreshUser } = useAuthentication()
  const [error, setError] = useState('')
  const [signatureOpen, setSignatureOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  if (!user?.activeCompany) return null
  const company = user.companies.find((item) => item.id === user.activeCompany?.id)
  const select = async (selection: WorkspaceSelection) => {
    setError('')
    try {
      await selectWorkspace(selection)
      if (
        location.pathname.startsWith('/reports/') ||
        location.pathname.startsWith('/prescriptions/')
      ) {
        navigate('/dashboard', { replace: true })
      }
    } catch {
      setError(
        'Não foi possível trocar o contexto. Confira o acesso e salve as alterações pendentes.',
      )
    }
  }
  return (
    <div className="report-editor-chrome border-b border-cyan-200 bg-cyan-50 px-4 py-2 text-sm text-brand-950 print:hidden">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3">
        <Building2 size={18} aria-hidden="true" />
        <span className="font-semibold">{brand.name}</span>
        {import.meta.env.VITE_PORTAL_KIND !== 'configuracoes' && <label className="flex items-center gap-2 font-semibold">
          Hospital de origem
          <select
            aria-label="Unidade ativa"
            className="max-w-64 rounded-lg border border-cyan-200 bg-white px-2 py-1"
            value={user.activeCompany.selectedUnitId ?? ''}
            disabled={switchingContext}
            onChange={(event) =>
              void select({ companyId: user.activeCompany!.id, unitId: event.target.value || null })
            }
          >
            <option value="">Todos os hospitais autorizados</option>
            {company?.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </label>}
        <span className="text-xs text-brand-700">{user.accessRole.name}</span>
        <div className="ml-auto flex items-center gap-2">
          {user.role === 'DOCTOR' && <Button variant="ghost" size="sm" onClick={() => setSignatureOpen(true)}>Minha assinatura</Button>}
          {import.meta.env.VITE_PORTAL_KIND !== 'hospital' && user.activeCompany.membershipId ? (
            <button
              type="button"
              className="text-xs font-bold underline"
              onClick={() => navigate('/settings/preferences')}
            >
              Minhas preferências
            </button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Atualizar acesso"
            disabled={switchingContext}
            onClick={() => {
              void refreshUser().catch(() => setError('Não foi possível atualizar o acesso.'))
            }}
          >
            <RefreshCw size={15} />
          </Button>
          {import.meta.env.VITE_PORTAL_KIND !== 'hospital' && <TutorialButton />}
        </div>
        {switchingContext ? (
          <span role="status" className="text-xs">
            Trocando contexto...
          </span>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-xs font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <PhysicianSignatureModal open={signatureOpen} required={false} onClose={() => setSignatureOpen(false)} onDone={async () => { await refreshUser(); setSignatureOpen(false) }} />
    </div>
  )
}
