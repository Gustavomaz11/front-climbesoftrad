"use client"

import { useState } from "react"
import { Eye, FileText, Trophy } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"

type Point = { label: string; full: string; visitors: number; views: number }
type RangeKey = "7d" | "30d" | "90d"

// Placeholder data, replace with real numbers.
const week: Point[] = [
  { label: "Mon", full: "Monday", visitors: 920, views: 2900 },
  { label: "Tue", full: "Tuesday", visitors: 860, views: 2700 },
  { label: "Wed", full: "Wednesday", visitors: 990, views: 3200 },
  { label: "Thu", full: "Thursday", visitors: 1100, views: 3600 },
  { label: "Fri", full: "Friday", visitors: 1240, views: 4100 },
  { label: "Sat", full: "Saturday", visitors: 1380, views: 4700 },
  { label: "Sun", full: "Sunday", visitors: 1050, views: 3400 },
]

const month: Point[] = [
  { label: "Oct 1", full: "Oct 1 - 3", visitors: 1900, views: 6100 },
  { label: "Oct 4", full: "Oct 4 - 6", visitors: 2150, views: 7000 },
  { label: "Oct 7", full: "Oct 7 - 9", visitors: 2050, views: 6600 },
  { label: "Oct 10", full: "Oct 10 - 12", visitors: 2400, views: 7900 },
  { label: "Oct 13", full: "Oct 13 - 15", visitors: 2300, views: 7500 },
  { label: "Oct 16", full: "Oct 16 - 18", visitors: 2650, views: 8800 },
  { label: "Oct 19", full: "Oct 19 - 21", visitors: 2900, views: 9700 },
  { label: "Oct 22", full: "Oct 22 - 24", visitors: 2750, views: 9100 },
  { label: "Oct 25", full: "Oct 25 - 27", visitors: 3150, views: 10600 },
  { label: "Oct 28", full: "Oct 28 - 30", visitors: 3300, views: 11200 },
]

const quarter: Point[] = [
  4200, 4600, 4400, 5100, 5300, 5000, 5800, 6200, 5900, 6700, 7100, 6800,
].map((visitors, i) => ({
  label: `W${i + 1}`,
  full: `Week ${i + 1}`,
  visitors,
  views: Math.round(visitors * (3.1 + (i % 3) * 0.08)),
}))

const ranges: Record<RangeKey, { label: string; unit: string; data: Point[] }> = {
  "7d": { label: "7D", unit: "day", data: week },
  "30d": { label: "30D", unit: "period", data: month },
  "90d": { label: "90D", unit: "week", data: quarter },
}

// Same gradient pairs as the Total Visitors and Page Views KPI cards
const VISITORS = { from: "#7928ca", to: "#ff0080" }
const VIEWS = { from: "#00c6fb", to: "#005bea" }

const chartConfig = {
  views: { label: "Page views", color: VIEWS.from },
  visitors: { label: "Visitors", color: VISITORS.from },
} satisfies ChartConfig

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const grad = (g: { from: string; to: string }) =>
  `linear-gradient(310deg, ${g.from}, ${g.to})`

type TooltipProps = {
  active?: boolean
  payload?: Array<{ payload: Point }>
}

function TrafficTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload

  const rows = [
    { label: "Visitors", value: p.visitors, style: grad(VISITORS) },
    { label: "Page views", value: p.views, style: grad(VIEWS) },
  ]

  return (
    <div className="min-w-44 rounded-xl border bg-popover px-3 py-2.5 text-popover-foreground shadow-lg">
      <p className="text-xs font-medium">{p.full}</p>
      <div className="mt-2 space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2 text-xs">
            <span className="size-2 rounded-full" style={{ backgroundImage: r.style }} />
            <span className="text-muted-foreground">{r.label}</span>
            <span className="ml-auto font-semibold tabular-nums">
              {r.value.toLocaleString("en-US")}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">
        Pages / visit{" "}
        <span className="font-medium text-foreground">
          {(p.views / p.visitors).toFixed(1)}
        </span>
      </p>
    </div>
  )
}

export default function TrafficOverviewCard() {
  const [range, setRange] = useState<RangeKey>("30d")
  const { data, unit } = ranges[range]

  const totalVisitors = data.reduce((s, p) => s + p.visitors, 0)
  const totalViews = data.reduce((s, p) => s + p.views, 0)
  const peak = data.reduce((a, b) => (b.visitors > a.visitors ? b : a))

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="mb-0 text-lg font-medium">Traffic Overview</CardTitle>
          <CardDescription>Visitors and page views</CardDescription>
        </div>

        <div role="group" aria-label="Time range" className="flex rounded-lg bg-muted p-0.5">
          {(Object.keys(ranges) as RangeKey[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={range === key}
              onClick={() => setRange(key)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                range === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {ranges[key].label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {/* Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ backgroundImage: grad(VISITORS) }} />
            <span className="text-muted-foreground">Visitors</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ backgroundImage: grad(VIEWS) }} />
            <span className="text-muted-foreground">Page views</span>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="aspect-auto min-h-64 w-full flex-1">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
          >
            <defs>
              {/* Visitors: gradient fill fading out */}
              <linearGradient id="fillTrafficVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={VISITORS.to} stopOpacity={0.45} />
                <stop offset="100%" stopColor={VISITORS.from} stopOpacity={0.02} />
              </linearGradient>

              {/* Gradient lines, left to right */}
              <linearGradient id="strokeTrafficVisitors" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={VISITORS.from} />
                <stop offset="100%" stopColor={VISITORS.to} />
              </linearGradient>
              <linearGradient id="strokeTrafficViews" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={VIEWS.from} />
                <stop offset="100%" stopColor={VIEWS.to} />
              </linearGradient>

              {/* Stripes on the larger layer only, so the two areas stay distinct */}
              <pattern
                id="patternTrafficViews"
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="8" height="8" fill={VIEWS.to} fillOpacity={0.08} />
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="8"
                  stroke={VIEWS.to}
                  strokeWidth="2"
                  strokeOpacity={0.35}
                />
              </pattern>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v: number) => compact.format(v)}
            />

            <ChartTooltip cursor={false} content={<TrafficTooltip />} />

            {/* Visitors are part of page views, so the areas overlap */}
            <Area
              dataKey="views"
              type="monotone"
              fill="url(#patternTrafficViews)"
              stroke="url(#strokeTrafficViews)"
              strokeWidth={2.5}
            />
            <Area
              dataKey="visitors"
              type="monotone"
              fill="url(#fillTrafficVisitors)"
              stroke="url(#strokeTrafficVisitors)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-wrap gap-x-6 gap-y-2 border-t text-sm">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-amber-500" />
          <span className="text-muted-foreground">Peak {unit}</span>
          <span className="font-medium">
            {peak.full}, {compact.format(peak.visitors)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="size-4" style={{ color: VISITORS.to }} />
          <span className="text-muted-foreground">Visitors</span>
          <span className="font-medium">{compact.format(totalVisitors)}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="size-4" style={{ color: VIEWS.to }} />
          <span className="text-muted-foreground">Pages / visit</span>
          <span className="font-medium">{(totalViews / totalVisitors).toFixed(1)}</span>
        </div>
      </CardFooter>
    </Card>
  )
}