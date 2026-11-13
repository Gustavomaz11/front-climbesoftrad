import { Card as SurfaceCard } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { useAuthentication } from '../auth/auth-context'
import { hasAnyPermission, hasPermission } from '../auth/auth.types'
import { SettingsPageLayout } from '../settings/components/SettingsPageLayout'
import { createCompany, listCompanies, setCompanyActive, updateCompany } from './company-api'
import type { Company } from './company.types'
import { CompanyPresentationEditor } from './components/CompanyPresentationEditor'

export const CompaniesSettingsPage = () => {
  const { user, refreshUser, selectWorkspace } = useAuthentication()
  const [companies, setCompanies] = useState<Company[]>([])
  const [reload, setReload] = useState(0)
  const [editing, setEditing] = useState<Company | null | undefined>(undefined)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let current = true
    void listCompanies()
      .then((items) => {
        if (current) setCompanies(items)
      })
      .catch(() => {
        if (current) setError('Não foi possível carregar as empresas.')
      })
    return () => {
      current = false
    }
  }, [reload])
  if (!user) return null
  if (
    !user.isPlatformAdmin &&
    !hasAnyPermission(user, ['companies.view', 'company.settings.view', 'company.settings.manage'])
  )
    return <Navigate to="/dashboard" replace />
  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (editing) await updateCompany(editing.id, name)
      else await createCompany(name)
      await refreshUser()
      setReload((value) => value + 1)
      setEditing(undefined)
    } catch {
      setError('Não foi possível salvar. Confira o nome e a empresa ativa.')
    } finally {
      setBusy(false)
    }
  }
  const toggle = async (company: Company) => {
    setBusy(true)
    setError('')
    try {
      await setCompanyActive(company.id, !company.active)
      await refreshUser()
      setReload((value) => value + 1)
    } catch {
      setError('Não foi possível alterar a situação da empresa.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <SettingsPageLayout
      active="companies"
      title="Empresas"
      description="Administre o contexto de trabalho e a apresentação dos documentos."
    >
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {user.isPlatformAdmin ? (
        <Button
          className="mb-4"
          onClick={() => {
            setName('')
            setEditing(null)
          }}
        >
          Adicionar empresa
        </Button>
      ) : null}
      <SurfaceCard className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-border bg-card shadow-sm gap-0 py-0 ring-0">
        {companies.map((company) => (
          <article key={company.id} className="flex flex-wrap items-center gap-3 p-5">
            <div className="min-w-48 flex-1">
              <h2 className="font-bold text-foreground">{company.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {company.id === user.activeCompany?.id
                  ? 'Empresa ativa nesta aba'
                  : 'Outro contexto'}
              </p>
            </div>
            <span
              className={
                'text-xs font-bold ' + (company.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')
              }
            >
              {company.active ? 'Ativa' : 'Inativa'}
            </span>
            {company.active && company.id !== user.activeCompany?.id ? (
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => {
                  void selectWorkspace({ companyId: company.id, unitId: null }).catch(() =>
                    setError('Não foi possível selecionar.'),
                  )
                }}
              >
                Selecionar
              </Button>
            ) : null}
            {company.id === user.activeCompany?.id &&
            user.activeCompany.allUnits &&
            hasPermission(user, 'companies.manage') ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setName(company.name)
                  setEditing(company)
                }}
              >
                Editar
              </Button>
            ) : null}
            {user.isPlatformAdmin ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => void toggle(company)}
              >
                {company.active ? 'Desativar' : 'Reativar'}
              </Button>
            ) : null}
          </article>
        ))}
      </SurfaceCard>
      {user.activeCompany && hasPermission(user, 'company.settings.view') ? (
        <CompanyPresentationEditor />
      ) : null}
      {editing !== undefined ? (
        <Modal
          open
          title={editing ? 'Editar empresa' : 'Adicionar empresa'}
          onClose={() => {
            if (!busy) setEditing(undefined)
          }}
          footer={
            <>
              <Button variant="ghost" disabled={busy} onClick={() => setEditing(undefined)}>
                Cancelar
              </Button>
              <Button type="submit" form="company-form" loading={busy}>
                Salvar empresa
              </Button>
            </>
          }
        >
          <form id="company-form" onSubmit={(event) => void save(event)}>
            <Input
              label="Nome da empresa"
              value={name}
              required
              minLength={2}
              maxLength={120}
              onChange={(event) => setName(event.target.value)}
            />
          </form>
        </Modal>
      ) : null}
    </SettingsPageLayout>
  )
}
