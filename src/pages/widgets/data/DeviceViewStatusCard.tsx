"use client"

import { Laptop, Smartphone, Tablet, type LucideIcon } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

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

export const description = "A donut chart showing views by device"

const devices: {
  key: "mobile" | "tablet" | "laptop"
  label: string
  views: number
  icon: LucideIcon
}[] = [
  { key: "mobile", label: "Mobile", views: 450, icon: Smartphone },
  { key: "tablet", label: "Tablet", views: 300, icon: Tablet },
  { key: "laptop", label: "Laptop", views: 250, icon: Laptop },
]

const totalViews = devices.reduce((sum, d) => sum + d.views, 0)

const chartData = devices.map((d) => ({
  device: d.key,
  views: d.views,
  fill: `var(--color-${d.key})`,
}))

const chartConfig = {
  views: { label: "Views" },
  mobile: { label: "Mobile", color: "var(--chart-1)" },
  tablet: { label: "Tablet", color: "var(--chart-2)" },
  laptop: { label: "Laptop", color: "var(--chart-3)" },
} satisfies ChartConfig

export default function DeviceViewStatusCard() {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-0">
        <CardTitle className="text-lg font-medium">Device View Status</CardTitle>
        <CardDescription>Page views by device type</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[220px] w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="views"
              nameKey="device"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={3}
              cornerRadius={6}
              strokeWidth={0}
            >
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
                          className="fill-foreground text-3xl font-bold tabular-nums"
                        >
                          {totalViews.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 22}
                          className="fill-muted-foreground text-sm"
                        >
                          Total Views
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="space-y-3">
          {devices.map(({ key, label, views, icon: Icon }) => {
            const color = chartConfig[key].color
            const share = Math.round((views / totalViews) * 100)

            return (
              <div key={key} className="flex items-center gap-3 rounded-lg border p-3">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    color,
                    backgroundColor: `color-mix(in oklab, ${color} 15%, transparent)`,
                  }}
                >
                  <Icon className="size-4.5" />
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{label}</p>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {share}%
                    </span>
                  </div>
                  <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${share}%`, backgroundColor: color }}
                    />
                  </div>
                </div>

                <span className="ml-2 text-lg font-semibold tabular-nums">
                  {views.toLocaleString()}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}