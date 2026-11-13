
"use client"

import { ShoppingCart, TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// Placeholder data, replace with real numbers.
// Where each of the 25,300 visitors ended up. Purchased = 1,800 = 7.1%.
const chartData = [
  { key: "purchased", label: "Purchased", value: 1800, from: "#6ee7b7", to: "#059669" },
  { key: "checkout", label: "Left at checkout", value: 1600, from: "#fcd34d", to: "#d97706" },
  { key: "cart", label: "Left with cart", value: 2700, from: "#c4b5fd", to: "#7c3aed" },
  { key: "viewed", label: "Viewed only", value: 12100, from: "#7dd3fc", to: "#0284c7" },
  { key: "bounced", label: "Bounced", value: 7100, from: "#fda4af", to: "#e11d48" },
]

const chartConfig = {
  value: { label: "Visitors" },
} satisfies ChartConfig


export default function ConversionRate() {
  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card className="h-full gap-4 overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400">
              <ShoppingCart className="size-4.5" />
            </div>
            <CardDescription className="text-base">
              Conversion Rate
            </CardDescription>
          </div>

          <Badge
            variant="outline"
            className="gap-1 rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          >
            <TrendingUp className="size-3.5" />
            +0.6%
          </Badge>
        </div>

        <div className="flex items-baseline gap-2">
          <CardTitle className="text-2xl font-semibold tabular-nums">
            7.1%
          </CardTitle>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        {/* Donut */}
        <div className="relative mx-auto aspect-square w-full max-w-36">
          <ChartContainer config={chartConfig} className="aspect-square size-full">
            <PieChart>
  <defs>
    {chartData.map((d) => (
      <linearGradient
        key={d.key}
        id={`conv-fill-${d.key}`}
        x1="0"
        y1="0"
        x2="1"
        y2="1"
      >
        <stop offset="0%" stopColor={d.from} />
        <stop offset="100%" stopColor={d.to} />
      </linearGradient>
    ))}
  </defs>

  <ChartTooltip
    cursor={false}
    offset={16}
    wrapperStyle={{ zIndex: 50, outline: "none" }}
    allowEscapeViewBox={{ x: true, y: true }}
    content={<ChartTooltipContent hideLabel nameKey="label" />}
  />
  <Pie
    data={chartData.map((d) => ({
      ...d,
      fill: `url(#conv-fill-${d.key})`,
    }))}
    dataKey="value"
    nameKey="label"
    innerRadius="74%"
    outerRadius="100%"
    paddingAngle={2}
    cornerRadius={4}
    strokeWidth={0}
  />
</PieChart>
          </ChartContainer>

          {/* Center label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg leading-none font-semibold tabular-nums">
              {(total / 1000).toFixed(1)}k
            </span>
            <span className="mt-1 text-xs text-muted-foreground">visitors</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}