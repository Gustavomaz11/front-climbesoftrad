"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

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

export const description = "A radar chart comparing desktop and mobile visitors"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-3)" },
} satisfies ChartConfig

const totals = {
  desktop: chartData.reduce((acc, d) => acc + d.desktop, 0),
  mobile: chartData.reduce((acc, d) => acc + d.mobile, 0),
}
const grandTotal = totals.desktop + totals.mobile

export default function RadarChartPage() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle>Device Usage</CardTitle>
          <CardDescription>January - June 2024</CardDescription>
        </div>
        <Badge variant="secondary" className="gap-1 font-medium">
          <TrendingUp className="size-3" />
          5.2%
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[260px] w-full"
        >
          <RadarChart data={chartData} outerRadius="75%">
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarAngleAxis
              dataKey="month"
              tickFormatter={(value: string) => value.slice(0, 3)}
              tick={{ fontSize: 12 }}
            />
            <PolarGrid radialLines={false} className="stroke-border" />
            <Radar
              dataKey="desktop"
              fill="var(--color-desktop)"
              fillOpacity={0.25}
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={{ r: 3, fillOpacity: 1 }}
            />
            <Radar
              dataKey="mobile"
              fill="var(--color-mobile)"
              fillOpacity={0.25}
              stroke="var(--color-mobile)"
              strokeWidth={2}
              dot={{ r: 3, fillOpacity: 1 }}
            />
          </RadarChart>
        </ChartContainer>

        <div className="grid grid-cols-2 gap-3">
          {(["desktop", "mobile"] as const).map((key) => (
            <div key={key} className="flex flex-col gap-1 rounded-lg border p-3">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: chartConfig[key].color }}
                />
                {chartConfig[key].label}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold tabular-nums">
                  {totals[key].toLocaleString()}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {((totals[key] / grandTotal) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}