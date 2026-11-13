"use client"

import { TrendingDown, TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A stacked area chart with a legend"

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

// Everything below is derived from chartData, so the card never drifts out of sync
const totalDesktop = chartData.reduce((sum, d) => sum + d.desktop, 0)
const totalMobile = chartData.reduce((sum, d) => sum + d.mobile, 0)
const total = totalDesktop + totalMobile
const average = Math.round(total / chartData.length)

const last = chartData[chartData.length - 1]
const prev = chartData[chartData.length - 2]
const lastTotal = last.desktop + last.mobile
const prevTotal = prev.desktop + prev.mobile
const change = ((lastTotal - prevTotal) / prevTotal) * 100
const isUp = change >= 0

const stats = [
  { label: "Desktop", value: totalDesktop, dot: "bg-(--chart-1)" },
  { label: "Mobile", value: totalMobile, dot: "bg-(--chart-2)" },
  { label: "Avg / month", value: average, dot: "bg-muted-foreground/40" },
]

export default function AreaChartPage() {
  return (
    <Card className="relative isolate overflow-hidden bg-background/60 shadow-sm supports-backdrop-filter:backdrop-blur-xl">
      {/* Soft glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
      />

      <CardHeader className="border-b">
        <div className="flex w-full flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle>Visitors</CardTitle>
            <CardDescription>
              Desktop and mobile traffic, {chartData[0].month} –{" "}
              {last.month}
            </CardDescription>
          </div>

          <div className="sm:text-right">
            <div className="text-3xl font-semibold tabular-nums tracking-tight">
              {total.toLocaleString()}
            </div>
            <span
              className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                isUp
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {isUp ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isUp ? "+" : ""}
              {change.toFixed(1)}% vs {prev.month}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <ChartContainer
          config={chartConfig}
          className="h-65 w-full sm:h-80 md:h-95"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12, top: 8 }}
          >
            <defs>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.55} />
                <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.02} />
              </linearGradient>

              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.55} />
                <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.02} />
              </linearGradient>
            </defs>

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

            <Area
              dataKey="mobile"
              type="monotone"
              stroke="var(--color-mobile)"
              fill="url(#fillMobile)"
              strokeWidth={2}
              stackId="a"
              dot={false}
              activeDot={{ r: 4 }}
            />

            <Area
              dataKey="desktop"
              type="monotone"
              stroke="var(--color-desktop)"
              fill="url(#fillDesktop)"
              strokeWidth={2}
              stackId="a"
              dot={false}
              activeDot={{ r: 4 }}
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="border-t p-0">
        <dl className="grid w-full grid-cols-3 divide-x">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-4">
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${stat.dot}`} />
                {stat.label}
              </dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">
                {stat.value.toLocaleString()}
              </dd>
            </div>
          ))}
        </dl>
      </CardFooter>
    </Card>
  )
}