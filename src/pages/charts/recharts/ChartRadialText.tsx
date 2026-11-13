"use client"

import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"

export const description = "A radial progress chart with centered text"

const TARGET = 300 // placeholder goal, replace with your real target

const chartData = [
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
]

const chartConfig = {
  visitors: { label: "Visitors" },
  safari: { label: "Safari", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function ChartRadialText() {
  const value = chartData[0].visitors
  const progress = Math.min(value / TARGET, 1)
  const endAngle = 90 - progress * 360

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle>Safari Visitors</CardTitle>
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
            startAngle={90}
            endAngle={endAngle}
            innerRadius={85}
            outerRadius={115}
            barSize={16}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[92, 78]}
            />
            <RadialBar dataKey="visitors" cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold tabular-nums"
                        >
                          {value.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 26}
                          className="fill-muted-foreground text-xs"
                        >
                          Visitors
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: chartConfig.safari.color }}
              />
              Progress
            </div>
            <span className="text-lg font-semibold tabular-nums">
              {(progress * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span className="bg-muted-foreground/40 size-2 rounded-full" />
              Target
            </div>
            <span className="text-lg font-semibold tabular-nums">
              {TARGET.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}