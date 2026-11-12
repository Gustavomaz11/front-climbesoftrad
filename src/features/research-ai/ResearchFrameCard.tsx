import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Button } from '../../components/ui/Button'
import * as api from './research-api'
import type { Finding, Mask, ResearchCase, ResearchFrame } from './research-api'
export const ResearchFrameCard = ({
  job,
  frame,
  busy,
  onChange,
  onError,
  onDirty,
}: {
  job: ResearchCase
  frame: ResearchFrame
  busy: boolean
  onChange: (job: ResearchCase) => void
  onError: (message: string) => void
  onDirty: (id: string, dirty: boolean) => void
}) => {
  const editing = job.status === 'REVIEW',
    [url, setUrl] = useState(''),
    [masks, setMasks] = useState<Mask[]>(frame.masks)
  const [drawing, setDrawing] = useState<Mask | null>(null),
    [selected, setSelected] = useState<Finding | null>(null),
    [saving, setSaving] = useState(false)
  const start = useRef<{ x: number; y: number } | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    let objectUrl = ''
    void api
      .image(job.id, frame.id, editing, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch(() => {
        if (!controller.signal.aborted) onError('Não foi possível carregar uma imagem protegida.')
      })
    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [job.id, frame.id, frame.revision, editing, onError])
  const point = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(1, (event.clientX - box.left) / box.width)),
      y: Math.max(0, Math.min(1, (event.clientY - box.top) / box.height)),
    }
  }
  const changed = JSON.stringify(masks) !== JSON.stringify(frame.masks)
  useEffect(() => {
    onDirty(frame.id, changed)
    return () => onDirty(frame.id, false)
  }, [frame.id, changed, onDirty])
  const mutate = async (action: () => Promise<ResearchCase>) => {
    setSaving(true)
    try {
      onChange(await action())
    } catch {
      onError('Não foi possível salvar. Atualize a pesquisa e tente novamente.')
    } finally {
      setSaving(false)
    }
  }
  const findings = job.result?.findings.filter((f) => f.imageId === frame.id) ?? []
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-slate-100">
      <div className="flex items-center justify-between p-3">
        <h2 className="font-bold">Imagem {frame.sequence}</h2>
        <span className="text-xs text-slate-300">
          {frame.width} × {frame.height}
          {editing ? ` · ${frame.reviewed ? 'Conferida' : 'Revisão pendente'}` : ''}
        </span>
      </div>
      <div
        className="relative mx-auto bg-black"
        style={{ aspectRatio: `${frame.width}/${frame.height}` }}
      >
        {url ? (
          <img
            src={url}
            alt={`Imagem ${frame.sequence} para pesquisa`}
            className="absolute size-full object-contain"
          />
        ) : (
          <p role="status" className="p-4">
            Carregando imagem…
          </p>
        )}
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          style={{
            touchAction: editing ? 'none' : 'auto',
            cursor: editing ? 'crosshair' : 'default',
          }}
          aria-label={
            editing ? 'Arraste para ocultar identificadores' : 'Regiões sugeridas pela IA'
          }
          onPointerDown={(e) => {
            if (!editing || saving || busy) return
            e.currentTarget.setPointerCapture(e.pointerId)
            start.current = point(e)
          }}
          onPointerMove={(e) => {
            if (!start.current) return
            const p = point(e)
            setDrawing({
              x: Math.min(p.x, start.current.x),
              y: Math.min(p.y, start.current.y),
              width: Math.abs(p.x - start.current.x),
              height: Math.abs(p.y - start.current.y),
            })
          }}
          onPointerUp={() => {
            if (drawing && drawing.width > 0.002 && drawing.height > 0.002)
              setMasks((previous) => [...previous, drawing])
            start.current = null
            setDrawing(null)
          }}
          onPointerCancel={() => {
            start.current = null
            setDrawing(null)
          }}
        >
          {editing
            ? masks.map((m, i) => (
                <rect
                  key={i}
                  x={m.x * 1000}
                  y={m.y * 1000}
                  width={m.width * 1000}
                  height={m.height * 1000}
                  fill="black"
                />
              ))
            : null}
          {drawing ? (
            <rect
              x={drawing.x * 1000}
              y={drawing.y * 1000}
              width={drawing.width * 1000}
              height={drawing.height * 1000}
              fill="black"
              stroke="#fbbf24"
              strokeWidth="2"
            />
          ) : null}
          {findings.map((f, i) => (
            <g
              key={i}
              role="button"
              tabIndex={0}
              aria-label={`Região ${i + 1}: ${f.label}`}
              onClick={() => setSelected(f)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelected(f)
                }
              }}
              className="cursor-pointer outline-none focus:opacity-60"
            >
              <ellipse
                cx={(f.box[1] + f.box[3]) / 2}
                cy={(f.box[0] + f.box[2]) / 2}
                rx={(f.box[3] - f.box[1]) / 2}
                ry={(f.box[2] - f.box[0]) / 2}
                fill={selected === f ? '#fbbf2430' : 'transparent'}
                stroke="#fbbf24"
                strokeWidth="3"
              />
              <circle cx={f.box[1]} cy={Math.max(20, f.box[0] - 15)} r="16" fill="#fbbf24" />
              <text
                x={f.box[1]}
                y={Math.max(20, f.box[0] - 15) + 6}
                textAnchor="middle"
                fontSize="20"
                fill="black"
              >
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="space-y-3 p-4">
        {editing ? (
          <>
            <p className="text-xs text-slate-300">
              Confira nomes, datas e identificadores. Arraste sobre a imagem para ocultar dados que
              restaram.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={saving || busy || !changed}
                onClick={() => void mutate(() => api.saveMasks(job.id, frame, masks))}
              >
                Salvar ocultações
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={saving || busy || !masks.length}
                onClick={() => setMasks(masks.slice(0, -1))}
              >
                Desfazer máscara
              </Button>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={frame.reviewed && !changed}
                disabled={saving || busy || changed || !url}
                onChange={(e) => void mutate(() => api.review(job.id, frame, e.target.checked))}
              />
              Revisei esta imagem e não há identificadores visíveis
            </label>
          </>
        ) : null}
        {findings.length ? (
          <div className="flex flex-wrap gap-2">
            {findings.map((f, i) => (
              <button
                key={i}
                className="rounded-lg border border-amber-400 px-3 py-2 text-sm text-amber-300"
                onClick={() => setSelected(f)}
              >
                Região {i + 1} · {f.label}
              </button>
            ))}
          </div>
        ) : null}
        {selected ? (
          <div role="status" className="rounded-lg bg-slate-800 p-3 text-sm">
            <strong className="text-amber-300">{selected.label}</strong>
            <p className="mt-1">{selected.description}</p>
          </div>
        ) : null}
        {job.status === 'COMPLETED' && !findings.length ? (
          <p className="text-xs text-slate-300">
            Sem regiões marcadas nesta imagem. Isso não indica normalidade.
          </p>
        ) : null}
      </div>
    </article>
  )
}
