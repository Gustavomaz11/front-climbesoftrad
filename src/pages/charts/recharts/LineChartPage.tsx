"use client"

import { useState } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "An interactive multiple line chart"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 173, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
  { month: "July", desktop: 260, mobile: 180 },
  { month: "August", desktop: 310, mobile: 220 },
  { month: "September", desktop: 280, mobile: 210 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

type SeriesKey = keyof typeof chartConfig

const seriesKeys: SeriesKey[] = ["desktop", "mobile"]

const first = chartData[0]
const last = chartData[chartData.length - 1]
const prev = chartData[chartData.length - 2]

// Per-series numbers, derived from chartData
const seriesStats = seriesKeys.map((key) => {
  const total = chartData.reduce((sum, d) => sum + d[key], 0)
  const change = ((last[key] - prev[key]) / prev[key]) * 100
  return { key, total, change }
})

export default function LineChartPage() {
  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>({
    desktop: true,
    mobile: true,
  })

  // Keep at least one line on screen
  const toggle = (key: SeriesKey) => {
    const othersOn = seriesKeys.some((k) => k !== key && visible[k])
    if (visible[key] && !othersOn) return
    setVisible((v) => ({ ...v, [key]: !v[key] }))
  }

  // Combined value of the visible lines for one month
  const valueOf = (d: (typeof chartData)[number]) =>
    seriesKeys.reduce((sum, k) => sum + (visible[k] ? d[k] : 0), 0)

  const total = chartData.reduce((sum, d) => sum + valueOf(d), 0)
  const average = Math.round(total / chartData.length)
  const peak = chartData.reduce((a, b) => (valueOf(b) > valueOf(a) ? b : a))

  const stats = [
    { label: "Total", value: total.toLocaleString() },
    { label: "Avg / month", value: average.toLocaleString() },
    { label: "Peak month", value: peak.month.slice(0, 3) },
  ]

  return (
    <Card className="relative isolate overflow-hidden bg-background/60 shadow-sm supports-backdrop-filter:backdrop-blur-xl">
      {/* Soft glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
      />

      <CardHeader className="border-b">
        <CardTitle>Traffic over time</CardTitle>
        <CardDescription>
          {first.month} – {last.month} · click a card to show or hide a line
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Series cards, double as the legend */}
        <div className="grid gap-3 sm:grid-cols-2">
          {seriesStats.map(({ key, total: seriesTotal, change }) => {
            const { label, color } = chartConfig[key]
            const on = visible[key]
            const isUp = change >= 0

            return (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(key)}
                style={{ borderColor: on ? color : undefined }}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  on ? "bg-muted/40" : "opacity-50 hover:opacity-80"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {label}
                  </span>

                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium",
                      isUp
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive"
                    )}
                  >
                    {isUp ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {isUp ? "+" : ""}
                    {change.toFixed(1)}%
                  </span>
                </div>

                <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
                  {seriesTotal.toLocaleString()}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  vs {prev.month}
                </div>
              </button>
            )
          })}
        </div>

        <ChartContainer
          config={chartConfig}
          className="h-65 w-full sm:h-80 md:h-90"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12, top: 8 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />

            <ChartTooltip
              cursor={{ strokeDasharray: "4 4" }}
              content={<ChartTooltipContent indicator="dot" />}
            />

            <Line
              dataKey="desktop"
              type="monotone"
              stroke="var(--color-desktop)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
              hide={!visible.desktop}
            />

            <Line
              dataKey="mobile"
              type="monotone"
              stroke="var(--color-mobile)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
              hide={!visible.mobile}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="border-t p-0">
        <dl className="grid w-full grid-cols-3 divide-x">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-4">
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardFooter>
    </Card>
  )
}