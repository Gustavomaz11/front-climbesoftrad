"use client"

import { MoreHorizontal, TrendingDown, TrendingUp, RefreshCw, Download, ExternalLink } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Week = { week: string; full: string; newUsers: number; returning: number }

// Placeholder data, replace with real numbers.
// 8 weeks add up to 25,300: 15,700 new + 9,600 returning.
const chartData: Week[] = [
  { week: "W1", full: "Week 1", newUsers: 2100, returning: 1300 },
  { week: "W2", full: "Week 2", newUsers: 2350, returning: 1250 },
  { week: "W3", full: "Week 3", newUsers: 2200, returning: 1400 },
  { week: "W4", full: "Week 4", newUsers: 2600, returning: 1550 },
  { week: "W5", full: "Week 5", newUsers: 2850, returning: 1500 },
  { week: "W6", full: "Week 6", newUsers: 2700, returning: 1700 },
  { week: "W7", full: "Week 7", newUsers: 3100, returning: 1850 },
  { week: "W8", full: "Week 8", newUsers: 3400, returning: 2100 },
]

// Same gradient pairs as the other cards
const NEW = { from: "#7dd3fc", to: "#38bdf8" }
const RETURNING = { from: "#2563eb", to: "#1d4ed8" }

const chartConfig = {
  newUsers: { label: "New", color: NEW.from },
  returning: { label: "Returning", color: RETURNING.from },
} satisfies ChartConfig

const grad = (g: { from: string; to: string }) =>
  `linear-gradient(310deg, ${g.from}, ${g.to})`

const fmt = (n: number) => n.toLocaleString("en-US")
const rate = (w: Week) => (w.returning / (w.newUsers + w.returning)) * 100

type TooltipProps = {
  active?: boolean
  payload?: Array<{ payload: Week }>
}

function UsersTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const w = payload[0].payload

  const rows = [
    { label: "New", value: w.newUsers, style: grad(NEW) },
    { label: "Returning", value: w.returning, style: grad(RETURNING) },
  ]

  return (
    <div className="min-w-44 rounded-xl border bg-popover px-3 py-2.5 text-popover-foreground shadow-lg">
      <p className="text-xs font-medium">{w.full}</p>

      <div className="mt-2 space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2 text-xs">
            <span className="size-2 rounded-full" style={{ backgroundImage: r.style }} />
            <span className="text-muted-foreground">{r.label}</span>
            <span className="ml-auto font-semibold tabular-nums">{fmt(r.value)}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 space-y-1 border-t pt-2 text-xs">
        <p className="flex justify-between text-muted-foreground">
          Total
          <span className="font-medium text-foreground tabular-nums">
            {fmt(w.newUsers + w.returning)}
          </span>
        </p>
        <p className="flex justify-between text-muted-foreground">
          Returning rate
          <span className="font-medium text-foreground tabular-nums">
            {rate(w).toFixed(1)}%
          </span>
        </p>
      </div>
    </div>
  )
}

export default function NewVsReturningCard() {
  const newTotal = chartData.reduce((s, d) => s + d.newUsers, 0)
  const retTotal = chartData.reduce((s, d) => s + d.returning, 0)
  const total = newTotal + retTotal

  const first = chartData[0]
const last = chartData[chartData.length - 1]
const rateChange = rate(last) - rate(first)

const insights = [
  {
    label: "Returning rate",
    value: `${((retTotal / total) * 100).toFixed(1)}%`,
    note: "8-week average",
  },
  {
    label: "Latest week",
    value: `${rate(last).toFixed(1)}%`,
    note: `${rateChange >= 0 ? "+" : ""}${rateChange.toFixed(1)} pts since W1`,
    positive: rateChange >= 0,
  },
]
  return (
    <Card className="h-full gap-4">

      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="mb-0 text-lg font-medium">New vs Returning</CardTitle>
          <CardDescription>Last 8 weeks</CardDescription>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Actions"
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[popup-open]:bg-muted data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuItem>
              <RefreshCw className="size-4" />
              Refresh
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="size-4" />
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ExternalLink className="size-4" />
              View full report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ backgroundImage: grad(NEW) }} />
            <span className="text-muted-foreground">New</span>
            <span className="font-medium tabular-nums">{fmt(newTotal)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ backgroundImage: grad(RETURNING) }} />
            <span className="text-muted-foreground">Returning</span>
            <span className="font-medium tabular-nums">{fmt(retTotal)}</span>
          </div>
        </div>

        {/* Chart */}
        <ChartContainer config={chartConfig} className="aspect-auto min-h-48 w-full flex-1">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
            barCategoryGap="24%"
          >
            <defs>
              <linearGradient id="fillNewUsers" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor={NEW.from} />
                <stop offset="100%" stopColor={NEW.to} />
              </linearGradient>
              <linearGradient id="fillReturningUsers" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor={RETURNING.from} />
                <stop offset="100%" stopColor={RETURNING.to} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis hide />

            <ChartTooltip
              cursor={{ fill: "var(--muted)", fillOpacity: 0.4, radius: 8 }}
              content={<UsersTooltip />}
            />

            <Bar
  dataKey="returning"
  stackId="users"
  maxBarSize={36}
  fill="url(#fillReturningUsers)"
  stroke="var(--card)"
  strokeWidth={2}
  radius={[0, 0, 6, 6]}
/>
<Bar
  dataKey="newUsers"
  stackId="users"
  maxBarSize={36}
  fill="url(#fillNewUsers)"
  stroke="var(--card)"
  strokeWidth={2}
  radius={[6, 6, 0, 0]}
/>
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="border-t">
        {/* Bordered insights grid: gap-px on a border-colored background draws the lines */}
        <div className="grid w-full grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border">
          {insights.map((item) => {
            const hasTrend = item.positive !== undefined
            const TrendIcon = item.positive ? TrendingUp : TrendingDown

            return (
              <div
                key={item.label}
                className="flex flex-col justify-between gap-2.5 bg-card px-3 py-3 transition-colors hover:bg-muted/40"
              >
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {item.label}
                </p>
                <p className="text-xl leading-none font-semibold tracking-tight tabular-nums">
                  {item.value}
                </p>
                {hasTrend ? (
                  <span
                    className={cn(
                      "flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                      item.positive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    )}
                  >
                    <TrendIcon className="size-3" />
                    {item.note}
                  </span>
                ) : (
                  <p className="text-xs text-muted-foreground">{item.note}</p>
                )}
              </div>
            )
          })}
        </div>
      </CardFooter>
    </Card>
  )
}