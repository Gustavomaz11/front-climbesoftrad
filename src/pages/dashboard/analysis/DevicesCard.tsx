"use client"

import { useState } from "react"
import { Monitor, Smartphone, Tablet, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Device = {
  key: string
  label: string
  visitors: number
  icon: LucideIcon
  from: string
  to: string
  tone: string
}

// Placeholder data, replace with real numbers. Adds up to 25,300.
const devices: Device[] = [
  { key: "mobile", label: "Mobile", visitors: 12650, icon: Smartphone, from: "#7928ca", to: "#ff0080", tone: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
  { key: "desktop", label: "Desktop", visitors: 10626, icon: Monitor, from: "#00c6fb", to: "#005bea", tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
  { key: "tablet", label: "Tablet", visitors: 2024, icon: Tablet, from: "#f7971e", to: "#ffd200", tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
]

/* Gauge geometry (SVG units) */
const CX = 120
const CY = 120
const R = 100
const STROKE = 22
const GAP = 4 // visual gap between segments, in degrees
const CAP = ((STROKE / 2) / R) * (180 / Math.PI) // degrees taken up by a round cap

const rad = (deg: number) => (deg * Math.PI) / 180
const pointAt = (deg: number) => ({
  x: CX + R * Math.cos(rad(deg)),
  y: CY - R * Math.sin(rad(deg)),
})

const total = devices.reduce((s, d) => s + d.visitors, 0)

// Walk the half circle from 180deg (left) to 0deg (right)
const span = 180 - GAP * (devices.length - 1)
let cursor = 180
const segments = devices.map((d) => {
  const sweep = (span * d.visitors) / total
  const mid = cursor - sweep / 2
  const half = Math.max((sweep - 2 * CAP) / 2, 0.5)
  cursor -= sweep + GAP

  const a = pointAt(mid + half)
  const b = pointAt(mid - half)

  return {
    ...d,
    path: `M ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${b.x} ${b.y}`,
    a,
    b,
    share: (d.visitors / total) * 100,
  }
})

export default function DevicesCard() {
  const [active, setActive] = useState<string | null>(null)
  const current = segments.find((s) => s.key === active)

  return (
    <Card className="h-full gap-4">
      <CardHeader>
        <CardTitle className="mb-0 text-lg font-medium">Devices</CardTitle>
        <CardDescription>Visitors by device type</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-6">
        {/* Gauge: takes the spare height and centers itself */}
        <div className="flex flex-1 items-center justify-center">
          <div className="relative w-full max-w-sm">
            <svg
              viewBox="0 0 240 132"
              className="w-full"
              role="img"
              aria-label="Visitors by device type"
            >
              <defs>
                {segments.map((s) => (
                  <linearGradient
                    key={s.key}
                    id={`dev-grad-${s.key}`}
                    gradientUnits="userSpaceOnUse"
                    x1={s.a.x}
                    y1={s.a.y}
                    x2={s.b.x}
                    y2={s.b.y}
                  >
                    <stop offset="0%" stopColor={s.from} />
                    <stop offset="100%" stopColor={s.to} />
                  </linearGradient>
                ))}
              </defs>

              {/* Background track */}
              <path
                d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
                fill="none"
                stroke="var(--muted)"
                strokeWidth={STROKE}
                strokeLinecap="round"
              />

              {/* Segments */}
              {segments.map((s) => (
                <path
                  key={s.key}
                  d={s.path}
                  fill="none"
                  stroke={`url(#dev-grad-${s.key})`}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  className="cursor-pointer transition-opacity duration-200"
                  style={{ opacity: active && active !== s.key ? 0.3 : 1 }}
                  onMouseEnter={() => setActive(s.key)}
                  onMouseLeave={() => setActive(null)}
                />
              ))}
            </svg>

            {/* Center label */}
            <div className="pointer-events-none absolute inset-x-0 bottom-[5%] flex flex-col items-center">
              <span className="text-3xl leading-none font-semibold tabular-nums">
                {current
                  ? current.visitors.toLocaleString("en-US")
                  : `${(total / 1000).toFixed(1)}k`}
              </span>
              <span className="mt-1.5 text-xs text-muted-foreground">
                {current
                  ? `${current.label}, ${current.share.toFixed(0)}%`
                  : "total visitors"}
              </span>
            </div>
          </div>
        </div>

        {/* Device tiles */}
        <div className="grid grid-cols-3 gap-3">
          {devices.map((d) => {
            const Icon = d.icon

            return (
              <div
                key={d.key}
                onMouseEnter={() => setActive(d.key)}
                onMouseLeave={() => setActive(null)}
                className={cn(
                  "rounded-xl border bg-muted/30 p-3 transition-colors",
                  active === d.key && "border-foreground/20 bg-muted/60"
                )}
              >
                <div className={cn("flex size-8 items-center justify-center rounded-lg", d.tone)}>
                  <Icon className="size-4" />
                </div>
                <p className="mt-3 text-lg leading-none font-semibold tabular-nums">
                  {((d.visitors / total) * 100).toFixed(0)}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{d.label}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}