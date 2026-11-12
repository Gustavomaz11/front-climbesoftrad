import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { useAuthentication } from '../../auth/auth-context'
import {
  createDicomSource,
  listDicomSources,
  revokeDicomSource,
  type DicomSource,
} from '../dicom-api'
export const DicomSourcesPanel = () => {
  const { user } = useAuthentication(),
    units =
      user?.companies
        .find((x) => x.id === user.activeCompany?.id)
        ?.units.filter((x) => x.active && user.activeCompany?.unitIds.includes(x.id)) ?? []
  const [items, setItems] = useState<DicomSource[]>([]),
    [unitId, setUnitId] = useState(units[0]?.id ?? ''),
    [name, setName] = useState(''),
    [token, setToken] = useState(''),
    [error, setError] = useState(''),
    [reload, setReload] = useState(0),
    [busy, setBusy] = useState(false)
  useEffect(() => {
    let active = true
    void listDicomSources()
      .then((value) => {
        if (active) setItems(value)
      })
      .catch(() => {
        if (active) setError('Receptores indisponíveis.')
      })
    return () => {
      active = false
    }
  }, [reload])
  const create = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setToken('')
    try {
      const result = await createDicomSource(unitId, name)
      setToken(result.token)
      setName('')
      setReload((x) => x + 1)
    } catch {
      setError('Não foi possível cadastrar o receptor.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">Receptores e agentes</h2>
      <form
        onSubmit={(event) => void create(event)}
        className="space-y-3 rounded-xl border bg-white p-4"
      >
        <label className="block text-sm font-semibold">
          Unidade
          <select
            required
            value={unitId}
            disabled={busy}
            onChange={(event) => setUnitId(event.target.value)}
            className="mt-1 w-full rounded border p-2"
          >
            <option value="">Selecione</option>
            {units.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Nome do receptor"
          required
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button type="submit" disabled={busy || !unitId || !name.trim()}>
          Criar credencial do agente
        </Button>
      </form>
      {token ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold">
            Credencial exibida uma vez. Configure-a no agente e guarde em local protegido.
          </p>
          <code className="mt-2 block break-all text-sm">{token}</code>
          <Button size="sm" variant="ghost" onClick={() => setToken('')}>
            Ocultar credencial
          </Button>
        </div>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
      {items.map((source) => (
        <article key={source.id} className="rounded-xl border bg-white p-4 text-sm">
          <p className="font-bold">
            {source.name} · {source.active ? 'Ativo' : 'Revogado'}
          </p>
          <p>
            Último contato:{' '}
            {source.lastSeenAt
              ? new Date(source.lastSeenAt).toLocaleString('pt-BR')
              : 'Ainda não conectado'}
          </p>
          <p>
            Versão: {source.diagnostics.version ?? '—'} · Pendentes:{' '}
            {source.diagnostics.pending ?? '—'} · Falhas: {source.diagnostics.failed ?? '—'}
          </p>
          {source.diagnostics.errorCode ? (
            <p className="text-amber-800">{source.diagnostics.errorCode}</p>
          ) : null}
          <p>
            Espaço livre:{' '}
            {source.diagnostics.freeBytes === undefined
              ? '—'
              : `${(source.diagnostics.freeBytes / 1024 ** 3).toFixed(1)} GB`}
          </p>
          {source.active ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void revokeDicomSource(source.id)
                  .then(() => setReload((x) => x + 1))
                  .catch(() => setError('Não foi possível revogar.'))
              }
            >
              Revogar credencial
            </Button>
          ) : null}
        </article>
      ))}
    </section>
  )
}
