"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { RadialBar, RadialBarChart } from "recharts"

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

export const description = "A radial chart with stat tiles"

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
]

const chartConfig = {
  visitors: { label: "Visitors" },
  chrome: { label: "Chrome", color: "var(--chart-1)" },
  safari: { label: "Safari", color: "var(--chart-2)" },
  firefox: { label: "Firefox", color: "var(--chart-3)" },
  edge: { label: "Edge", color: "var(--chart-4)" },
  other: { label: "Other", color: "var(--chart-5)" },
} satisfies ChartConfig

export default function RadialChartPage() {
  const total = React.useMemo(
    () => chartData.reduce((acc, item) => acc + item.visitors, 0),
    []
  )

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle>Browser Share</CardTitle>
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
          className="mx-auto aspect-square max-h-[250px] w-full"
        >
          <RadialBarChart
            data={chartData}
            innerRadius={35}
            outerRadius={115}
            barSize={14}
            startAngle={90}
            endAngle={-270}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="browser" />}
            />
            <RadialBar
              dataKey="visitors"
              cornerRadius={8}
              background={{ fill: "var(--muted)" }}
            />
          </RadialBarChart>
        </ChartContainer>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {chartData.map((item) => {
            const config =
              chartConfig[item.browser as Exclude<keyof typeof chartConfig, "visitors">]
            const percent = ((item.visitors / total) * 100).toFixed(1)
            return (
              <div
                key={item.browser}
                className="flex flex-col gap-1 rounded-lg border p-3"
              >
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  {config.label}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold tabular-nums">
                    {item.visitors.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {percent}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}