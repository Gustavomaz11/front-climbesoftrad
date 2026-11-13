"use client"

import { TrendingDown, TrendingUp, Users } from "lucide-react"
import { Area, AreaChart, XAxis, YAxis } from "recharts"

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

export const description = "A sparkline card showing website visitors"

// ---- Variables ----
const totalVisitors = "43K"
const weeklyChange = 5.6 // % vs last week, negative values switch the badge to red
// -------------------

const visitorsData = [
  { day: "Mon", value: 20 },
  { day: "Tue", value: 35 },
  { day: "Wed", value: 25 },
  { day: "Thu", value: 60 },
  { day: "Fri", value: 15 },
  { day: "Sat", value: 75 },
  { day: "Sun", value: 30 },
]

const chartConfig = {
  value: { label: "Visitors", color: "var(--chart-1)" },
} satisfies ChartConfig

export default function WebsiteVisitorsCard() {
  const isUp = weeklyChange >= 0
  const TrendIcon = isUp ? TrendingUp : TrendingDown

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Website Visitors
          </CardTitle>
          <h2 className="text-3xl font-bold tabular-nums">{totalVisitors}</h2>
        </div>
        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Users className="size-4.5" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={
              isUp
                ? "gap-1 bg-emerald-500/15 font-medium text-emerald-500"
                : "gap-1 bg-rose-500/15 font-medium text-rose-500"
            }
          >
            <TrendIcon className="size-3" />
            {isUp ? "+" : ""}
            {weeklyChange}%
          </Badge>
          <CardDescription>from last week</CardDescription>
        </div>

        <ChartContainer config={chartConfig} className="aspect-auto h-24 w-full">
          <AreaChart data={visitorsData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillVisitorsSpark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" hide />
            <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="value"
              type="monotone"
              stroke="var(--color-value)"
              strokeWidth={2.5}
              fill="url(#fillVisitorsSpark)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}