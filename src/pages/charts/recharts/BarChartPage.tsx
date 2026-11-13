"use client"

import { useState } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
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
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "An interactive multiple bar chart"

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

type View = "all" | "desktop" | "mobile"

const views: { value: View; label: string }[] = [
  { value: "all", label: "All" },
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
]

const first = chartData[0]
const last = chartData[chartData.length - 1]
const prev = chartData[chartData.length - 2]

const totalDesktop = chartData.reduce((sum, d) => sum + d.desktop, 0)
const totalMobile = chartData.reduce((sum, d) => sum + d.mobile, 0)

export default function BarChartPage() {
  const [view, setView] = useState<View>("all")

  // Value of one data point for the current view
  const valueOf = (d: (typeof chartData)[number]) =>
    view === "desktop" ? d.desktop : view === "mobile" ? d.mobile : d.desktop + d.mobile

  const total = chartData.reduce((sum, d) => sum + valueOf(d), 0)
  const average = Math.round(total / chartData.length)
  const change = ((valueOf(last) - valueOf(prev)) / valueOf(prev)) * 100
  const isUp = change >= 0

  const stats = [
    { label: "Desktop", value: totalDesktop, dot: "bg-(--chart-1)" },
    { label: "Mobile", value: totalMobile, dot: "bg-(--chart-2)" },
    { label: "Avg / month", value: average, dot: "bg-muted-foreground/40" },
  ]

  return (
    <Card className="relative isolate w-full overflow-hidden bg-background/60 shadow-sm supports-backdrop-filter:backdrop-blur-xl">
      {/* Soft glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
      />

      <CardHeader className="border-b">
        <div className="flex w-full flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle>Visitors by device</CardTitle>
            <CardDescription>
              {first.month} – {last.month}
            </CardDescription>
          </div>

          {/* Segmented control */}
          <div
            role="group"
            aria-label="Chart view"
            className="inline-flex rounded-lg border bg-muted/50 p-1"
          >
            {views.map((v) => (
              <button
                key={v.value}
                type="button"
                aria-pressed={view === v.value}
                onClick={() => setView(v.value)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  view === v.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Headline number */}
        <div className="mb-6 flex flex-wrap items-end gap-3">
          <div className="text-4xl font-semibold tabular-nums tracking-tight">
            {total.toLocaleString()}
          </div>
          <span
            className={cn(
              "mb-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
              isUp
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            )}
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

        <ChartContainer
          config={chartConfig}
          className="h-65 w-full sm:h-80 md:h-95"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            barGap={4}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="barDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-desktop)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--color-desktop)" stopOpacity={0.45} />
              </linearGradient>

              <linearGradient id="barMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-mobile)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--color-mobile)" stopOpacity={0.45} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              interval="preserveStartEnd"
            />

            <YAxis tickLine={false} axisLine={false} width={35} />

            <ChartTooltip
              cursor={{ fill: "var(--muted)", fillOpacity: 0.4 }}
              content={<ChartTooltipContent indicator="dot" />}
            />

            <Bar
              dataKey="desktop"
              fill="url(#barDesktop)"
              radius={[8, 8, 0, 0]}
              maxBarSize={28}
              hide={view === "mobile"}
            />

            <Bar
              dataKey="mobile"
              fill="url(#barMobile)"
              radius={[8, 8, 0, 0]}
              maxBarSize={28}
              hide={view === "desktop"}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="border-t p-0">
        <dl className="grid w-full grid-cols-3 divide-x">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-4">
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={cn("h-2 w-2 rounded-full", stat.dot)} />
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