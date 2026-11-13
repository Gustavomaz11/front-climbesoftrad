"use client"

import { useState } from "react"
import {
  CircleHelp,
  Download,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

type Point = { label: string; full: string; value: number }
type TabKey = "traffic" | "authority" | "backlinks"

const months = [
  ["Nov 25", "November 2025"],
  ["Dec 25", "December 2025"],
  ["Jan 26", "January 2026"],
  ["Feb 26", "February 2026"],
  ["Mar 26", "March 2026"],
  ["Apr 26", "April 2026"],
  ["May 26", "May 2026"],
  ["Jun 26", "June 2026"],
  ["Jul 26", "July 2026"],
  ["Aug 26", "August 2026"],
  ["Sep 26", "September 2026"],
  ["Oct 26", "October 2026"],
]

const toPoints = (values: number[]): Point[] =>
  values.map((value, i) => ({
    label: months[i][0],
    full: months[i][1],
    value,
  }))

// Placeholder data, replace with real numbers.
const tabs: Record<
  TabKey,
  {
    label: string
    series: string
    subtitle: string
    from: string
    to: string
    data: Point[]
  }
> = {
  traffic: {
    label: "Organic Traffic",
    series: "Organic",
    subtitle: "organic visitors per month",
    from: "#7928ca",
    to: "#ff0080",
    data: toPoints([
      3200, 3600, 3400, 4100, 4500, 4300, 5200, 5800, 5600, 6400, 6900, 7600,
    ]),
  },
  authority: {
    label: "Domain Authority",
    series: "Authority",
    subtitle: "domain authority score per month",
    from: "#00c6fb",
    to: "#005bea",
    data: toPoints([18, 19, 19, 21, 22, 22, 24, 25, 25, 27, 28, 30]),
  },
  backlinks: {
    label: "Backlinks",
    series: "Backlinks",
    subtitle: "new backlinks per month",
    from: "#17ad37",
    to: "#98ec2d",
    data: toPoints([
      120, 150, 140, 190, 230, 210, 280, 320, 300, 380, 410, 470,
    ]),
  },
}

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const grad = (g: { from: string; to: string }) =>
  `linear-gradient(310deg, ${g.from}, ${g.to})`

const pct = (a: number, b: number) => ((a - b) / b) * 100

type TooltipProps = {
  active?: boolean
  payload?: Array<{ payload: Point }>
  data: Point[]
  series: string
  from: string
  to: string
}

function GrowthTooltip({ active, payload, data, series, from, to }: TooltipProps) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload

  const index = data.findIndex((d) => d.label === p.label)
  const prev = index > 0 ? data[index - 1].value : null
  const change = prev ? pct(p.value, prev) : null
  const up = (change ?? 0) >= 0
  const TrendIcon = up ? TrendingUp : TrendingDown

  return (
    <div className="min-w-44 rounded-xl border bg-popover px-3 py-2.5 text-popover-foreground shadow-lg">
      <p className="text-xs font-medium">{p.full}</p>

      <div className="mt-2 flex items-center gap-2 text-xs">
        <span className="size-2 rounded-full" style={{ backgroundImage: grad({ from, to }) }} />
        <span className="text-muted-foreground">{series}</span>
        <span className="ml-auto font-semibold tabular-nums">
          {p.value.toLocaleString("en-US")}
        </span>
      </div>

      {change !== null && (
        <p className="mt-2 flex justify-between border-t pt-2 text-xs text-muted-foreground">
          vs last month
          <span
            className={cn(
              "flex items-center gap-0.5 font-medium tabular-nums",
              up
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            )}
          >
            <TrendIcon className="size-3" />
            {up ? "+" : ""}
            {change.toFixed(1)}%
          </span>
        </p>
      )}
    </div>
  )
}

export default function TrafficOverviewCard() {
  const [active, setActive] = useState<TabKey>("traffic")
  const tab = tabs[active]

  const chartConfig = {
    value: { label: tab.series, color: tab.from },
  } satisfies ChartConfig

  // Insights
  const values = tab.data.map((d) => d.value)
  const first = tab.data[0]
  const latest = tab.data[tab.data.length - 1]
  const previous = tab.data[tab.data.length - 2]
  const avg = values.reduce((s, v) => s + v, 0) / values.length
  const best = tab.data.reduce((a, b) => (b.value > a.value ? b : a))
  const monthChange = pct(latest.value, previous.value)
  const totalGrowth = pct(latest.value, first.value)

  const insights = [
    {
      label: "Latest",
      value: compact.format(latest.value),
      note: `${monthChange >= 0 ? "+" : ""}${monthChange.toFixed(1)}% vs last month`,
      positive: monthChange >= 0,
    },
    {
      label: "Monthly average",
      value: compact.format(Math.round(avg * 10) / 10),
      note: "Last 12 months",
    },
    {
      label: "Best month",
      value: best.label,
      note: `${compact.format(best.value)} ${tab.series.toLowerCase()}`,
    },
    {
      label: "12-month growth",
      value: `${totalGrowth >= 0 ? "+" : ""}${totalGrowth.toFixed(0)}%`,
      note: `Since ${first.label}`,
      positive: totalGrowth >= 0,
    },
  ]

  const downloadCsv = () => {
    const rows = ["Month,Value", ...tab.data.map((d) => `${d.full},${d.value}`)]
    const blob = new Blob([rows.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${active}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div>
          <CardTitle className="mb-0 flex items-center gap-1.5 text-lg font-medium">
            Monthly Traffic Growth
            <CircleHelp className="size-4 text-muted-foreground" />
          </CardTitle>
          <CardDescription>{tab.subtitle}</CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={active} onValueChange={(v) => setActive(v as TabKey)}>
            <TabsList>
              {(Object.keys(tabs) as TabKey[]).map((key) => (
                <TabsTrigger key={key} value={key}>
                  {tabs[key].label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <button
            type="button"
            aria-label="Download data"
            onClick={downloadCsv}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Download className="size-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {/* Chart */}
        <ChartContainer config={chartConfig} className="aspect-auto min-h-64 w-full flex-1">
          <AreaChart
            accessibilityLayer
            data={tab.data}
            margin={{ left: 0, right: 12, top: 8, bottom: 0 }}
          >
            <defs>
              {/* Gradient line, left to right */}
              <linearGradient id={`stroke-${active}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={tab.from} />
                <stop offset="100%" stopColor={tab.to} />
              </linearGradient>

              {/* Stripe pattern fill, same as the first chart */}
              <pattern
                id={`pattern-${active}`}
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="6" height="6" fill={tab.to} fillOpacity={0.08} />
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="6"
                  stroke={tab.to}
                  strokeWidth="2"
                  strokeOpacity={0.35}
                />
              </pattern>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={8}
              padding={{ left: 8, right: 8 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v: number) => compact.format(v)}
            />

            <ChartTooltip
              cursor={{
                stroke: "var(--muted-foreground)",
                strokeOpacity: 0.4,
                strokeDasharray: "3 3",
              }}
              content={
                <GrowthTooltip
                  data={tab.data}
                  series={tab.series}
                  from={tab.from}
                  to={tab.to}
                />
              }
            />

            <Area
              key={active}
              dataKey="value"
              type="linear"
              stroke={`url(#stroke-${active})`}
              strokeWidth={2.5}
              fill={`url(#pattern-${active})`}
              dot={{ r: 3.5, fill: "var(--background)", stroke: tab.from, strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "var(--background)", stroke: tab.to, strokeWidth: 2 }}
            />
          </AreaChart>
        </ChartContainer>

        {/* Legend */}
        <div className="flex items-center gap-2 text-sm">
          <span
            className="h-1 w-4 rounded-full"
            style={{ backgroundImage: grad(tab) }}
          />
          <span className="text-muted-foreground">{tab.series}</span>
        </div>
      </CardContent>

      <CardFooter className="bg-background">
        {/* Bordered insights grid: gap-px on a border-colored background draws the lines */}
        <div className="grid w-full grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
          {insights.map((item) => {
            const hasTrend = item.positive !== undefined
            const TrendIcon = item.positive ? TrendingUp : TrendingDown

            return (
              <div
                key={item.label}
                className="flex flex-col justify-between gap-3 bg-card px-4 py-3.5 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundImage: grad(tab) }}
                  />
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    {item.label}
                  </p>
                </div>

                <p className="text-2xl leading-none font-semibold tracking-tight tabular-nums">
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