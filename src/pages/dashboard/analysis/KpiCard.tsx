"use client"

import {
  ArrowUpRight,
  MoreHorizontal,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type Variant = "dots" | "bars" | "progress"

export type KpiCardProps = {
  id: string // unique per card, used for the gradient id
  variant: Variant
  title: string
  value: string
  subtitle: string
  change: number // percent vs last month
  lowerIsBetter?: boolean // e.g. bounce rate: a drop shows green
  icon: LucideIcon
  from: string // gradient start, hex
  to: string // gradient end, hex
  data?: number[] // for dots and bars
  percent?: number // for progress, 0 to 100
}

// Stretch or squeeze a series to n points
function resample(data: number[], n: number) {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / (n - 1)) * (data.length - 1)
    const lo = Math.floor(t)
    const hi = Math.min(lo + 1, data.length - 1)
    return data[lo] + (data[hi] - data[lo]) * (t - lo)
  })
}

/* ---------------------------------- */
/* Dot matrix */
/* ---------------------------------- */

const DOT_COLS = 24
const DOT_ROWS = 6
const DOT_HIGHLIGHT = 7 // latest columns drawn in color

function DotMatrix({ data, from, to }: { data: number[]; from: string; to: string }) {
  const series = resample(data, DOT_COLS)
  const min = Math.min(...series)
  const max = Math.max(...series)

  return (
    <div className="flex h-10 items-end justify-between" role="img" aria-label="Trend">
      {series.map((v, c) => {
        const level = 1 + Math.round(((v - min) / (max - min || 1)) * (DOT_ROWS - 1))
        const hot = c >= DOT_COLS - DOT_HIGHLIGHT

        return (
          <div key={c} className="flex flex-col-reverse gap-[3px]">
            {Array.from({ length: DOT_ROWS }).map((_, r) => {
              const filled = r < level

              return (
                <span
                  key={r}
                  className={cn(
                    "size-1 rounded-full",
                    !filled && "bg-muted-foreground/10",
                    filled && !hot && "bg-muted-foreground/30"
                  )}
                  style={
                    filled && hot
                      ? { backgroundImage: `linear-gradient(310deg, ${from}, ${to})` }
                      : undefined
                  }
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

/* ---------------------------------- */
/* Thin bars (Recharts) */
/* ---------------------------------- */

const BAR_COUNT = 40
const BAR_HIGHLIGHT = 12

function ThinBars({
  id,
  title,
  data,
  from,
  to,
}: {
  id: string
  title: string
  data: number[]
  from: string
  to: string
}) {
  const chartConfig = {
    value: { label: title, color: from },
  } satisfies ChartConfig

  const chartData = resample(data, BAR_COUNT).map((v, i) => ({
    i,
    value: Math.round(v * 10) / 10,
  }))

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-10 w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
        barCategoryGap={1}
      >
        <defs>
          <linearGradient id={`bar-${id}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>

        <XAxis dataKey="i" hide />
        <YAxis hide domain={[0, "dataMax"]} />

        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel indicator="dot" />}
        />

        <Bar dataKey="value" radius={2} maxBarSize={3} minPointSize={3}>
          {chartData.map((entry) => {
            const hot = entry.i >= BAR_COUNT - BAR_HIGHLIGHT

            return (
              <Cell
                key={entry.i}
                fill={hot ? `url(#bar-${id})` : "var(--muted-foreground)"}
                fillOpacity={hot ? 1 : 0.25}
              />
            )
          })}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

/* ---------------------------------- */
/* Card */
/* ---------------------------------- */

export default function KpiCard({
  id,
  variant,
  title,
  value,
  subtitle,
  change,
  lowerIsBetter = false,
  icon: Icon,
  from,
  to,
  data = [],
  percent = 0,
}: KpiCardProps) {
  const good = lowerIsBetter ? change < 0 : change > 0
  const TrendIcon = change >= 0 ? TrendingUp : TrendingDown
  const changeText = `${change > 0 ? "+" : ""}${change}%`
  const tone = good
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400"

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg p-0.5 shadow">
              <div
                className="flex size-7 items-center justify-center rounded-md text-white"
                style={{ backgroundImage: `linear-gradient(310deg, ${from}, ${to})` }}
              >
                <Icon className="size-3.5" />
              </div>
            </div>
            <span className="text-sm text-muted-foreground">{title}</span>
          </div>

          {variant === "dots" && (
            <span
              className={cn(
                "flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium tabular-nums",
                good
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-rose-500/30 bg-rose-500/10",
                tone
              )}
            >
              <TrendIcon className="size-3" />
              {changeText}
            </span>
          )}

          {variant === "bars" && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="More options"
              className="-my-1 -mr-2 size-7 rounded-full text-muted-foreground"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          )}

          {variant === "progress" && (
            <span
              aria-hidden
              className="flex size-6 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground"
            >
              <ArrowUpRight className="size-3.5" />
            </span>
          )}
        </div>

        {/* Value */}
        <div>
          <p className="text-2xl leading-none font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {variant === "bars" && (
              <span className={cn("mr-1.5 font-medium", tone)}>{changeText}</span>
            )}
            {subtitle}
          </p>
        </div>

        {/* Visual */}
        <div className="mt-auto pt-1">
          {variant === "dots" && <DotMatrix data={data} from={from} to={to} />}

          {variant === "bars" && (
            <ThinBars id={id} title={title} data={data} from={from} to={to} />
          )}

          {variant === "progress" && (
            <div
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={title}
              className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(Math.max(percent, 0), 100)}%`,
                  backgroundImage: `linear-gradient(to right, ${from}, ${to})`,
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}