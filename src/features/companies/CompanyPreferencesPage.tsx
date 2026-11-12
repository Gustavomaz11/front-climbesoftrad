import { useEffect, useState } from 'react'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { SettingsPageLayout } from '../settings/components/SettingsPageLayout'
import { ownCompanyMembership, saveMembershipPreferences } from './company-api'
import type { CompanyMembership } from './company.types'

export const CompanyPreferencesPage = () => {
  const [membership, setMembership] = useState<CompanyMembership | null>(null)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  useEffect(() => {
    let active = true
    void ownCompanyMembership()
      .then((item) => {
        if (active) {
          setMembership(item)
          setText(item.signatureText ?? '')
        }
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar suas preferências.')
      })
    return () => {
      active = false
    }
  }, [])
  const save = async () => {
    if (!membership) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const updated = await saveMembershipPreferences(
        membership.id,
        membership.preferencesVersion,
        text || null,
      )
      setMembership({ ...membership, ...updated })
      setNotice('Preferências salvas nesta empresa.')
    } catch {
      setError('Não foi possível salvar. Recarregue para conferir a revisão atual.')
    } finally {
      setSaving(false)
    }
  }
  return (
    <SettingsPageLayout
      active="preferences"
      title="Minhas preferências"
      description="Personalize sua assinatura visual para a empresa ativa."
    >
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {notice ? (
        <Alert variant="success" className="mb-4">
          {notice}
        </Alert>
      ) : null}
      <section className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Input
          label="Texto adicional da assinatura"
          value={text}
          maxLength={500}
          disabled={!membership || saving}
          onChange={(event) => setText(event.target.value)}
        />
        <p className="mt-3 text-sm text-slate-500">
          Deixe vazio para utilizar o padrão da empresa ou unidade.
        </p>
        <Button
          className="mt-5"
          disabled={!membership}
          loading={saving}
          onClick={() => void save()}
        >
          Salvar preferências
        </Button>
      </section>
    </SettingsPageLayout>
  )
}
