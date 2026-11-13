"use client"

import { useMemo, useState } from "react"
import { Percent, ShoppingCart, TrendingUp, Trophy, type LucideIcon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const description = "A stacked bar chart with patterned fills"

type Range = "weekly" | "monthly" | "yearly"

type ChartItem = {
  label: string
  visitors: number
  sales: number
}

const chartData: Record<Range, ChartItem[]> = {
  weekly: [
    { label: "Mon", visitors: 40, sales: 60 },
    { label: "Tue", visitors: 55, sales: 75 },
    { label: "Wed", visitors: 50, sales: 70 },
    { label: "Thu", visitors: 65, sales: 90 },
    { label: "Fri", visitors: 70, sales: 95 },
    { label: "Sat", visitors: 60, sales: 80 },
    { label: "Sun", visitors: 75, sales: 110 },
  ],
  monthly: [
    { label: "Jan", visitors: 80, sales: 120 },
    { label: "Feb", visitors: 100, sales: 180 },
    { label: "Mar", visitors: 70, sales: 140 },
    { label: "Apr", visitors: 130, sales: 220 },
    { label: "May", visitors: 120, sales: 200 },
    { label: "Jun", visitors: 150, sales: 260 },
    { label: "Jul", visitors: 130, sales: 230 },
    { label: "Aug", visitors: 170, sales: 300 },
    { label: "Sep", visitors: 140, sales: 250 },
    { label: "Oct", visitors: 190, sales: 340 },
    { label: "Nov", visitors: 160, sales: 290 },
    { label: "Dec", visitors: 200, sales: 360 },
  ],
  yearly: [
    { label: "2021", visitors: 1200, sales: 1800 },
    { label: "2022", visitors: 1500, sales: 2300 },
    { label: "2023", visitors: 1800, sales: 2900 },
    { label: "2024", visitors: 2100, sales: 3400 },
    { label: "2025", visitors: 2400, sales: 3900 },
  ],
}

const chartConfig = {
  visitors: { label: "Visitors", color: "var(--chart-1)" },
  sales: { label: "Sales", color: "var(--chart-2)" },
} satisfies ChartConfig

const periodChange = 2.5

type Insight = {
  label: string
  value: string
  icon: LucideIcon
  iconClass: string
}

export default function VisitorsSalesStackedCard() {
  const [range, setRange] = useState<Range>("monthly")

  const insights = useMemo<Insight[]>(() => {
    const data = chartData[range]
    const totalSales = data.reduce((sum, d) => sum + d.sales, 0)
    const totalVisitors = data.reduce((sum, d) => sum + d.visitors, 0)
    const peak = data.reduce((best, d) => (d.sales > best.sales ? d : best), data[0])

    return [
      {
        label: "Peak period",
        value: peak.label,
        icon: Trophy,
        iconClass: "bg-yellow-500/15 text-yellow-500",
      },
      {
        label: "Total sales",
        value: totalSales.toLocaleString(),
        icon: ShoppingCart,
        iconClass: "bg-emerald-500/15 text-emerald-500",
      },
      {
        label: "Sales / visitor",
        value: (totalSales / totalVisitors).toFixed(2),
        icon: Percent,
        iconClass: "bg-blue-500/15 text-blue-500",
      },
    ]
  }, [range])

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-medium">Visitors / Sales</CardTitle>
          <CardDescription>Showing {range} totals</CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="gap-1 font-medium text-emerald-600 dark:text-emerald-400"
            title="Change vs last period"
          >
            <TrendingUp className="size-3" />+{periodChange}%
          </Badge>

          <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
            <TabsList className="h-8">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData[range]}
            barSize={28}
            margin={{ top: 8, left: 0, right: 8 }}
          >
            <defs>
              {/* Visitors: diagonal stripes */}
              <pattern
                id="patternVisitors"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="8" height="8" fill="var(--color-visitors)" fillOpacity={0.15} />
                <rect width="3" height="8" fill="var(--color-visitors)" />
              </pattern>

              {/* Sales: dots */}
              <pattern
                id="patternSales"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
              >
                <rect width="8" height="8" fill="var(--color-sales)" fillOpacity={0.15} />
                <circle cx="4" cy="4" r="1.6" fill="var(--color-sales)" />
              </pattern>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />

            <Bar
              dataKey="visitors"
              stackId="a"
              fill="url(#patternVisitors)"
              stroke="var(--color-visitors)"
              strokeWidth={1}
              radius={[0, 0, 6, 6]}
            />
            <Bar
              dataKey="sales"
              stackId="a"
              fill="url(#patternSales)"
              stroke="var(--color-sales)"
              strokeWidth={1}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ChartContainer>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-sm">
          {(Object.keys(chartConfig) as (keyof typeof chartConfig)[]).map((key) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="size-3 rounded-sm"
                style={{ backgroundColor: chartConfig[key].color }}
              />
              {chartConfig[key].label}
            </div>
          ))}
        </div>
      </CardContent>

      {/* Insights: single row */}
      <CardFooter className="border-t">
        <div className="grid w-full grid-cols-3 divide-x">
          {insights.map(({ label, value, icon: Icon, iconClass }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 px-2 text-center sm:flex-row sm:text-left"
            >
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground truncate text-xs">{label}</p>
                <p className="text-base font-semibold tabular-nums">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}