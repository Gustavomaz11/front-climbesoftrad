"use client"

import { TrendingUp, Wallet } from "lucide-react"
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
import { StripePattern } from "./stripe-pattern"

// Placeholder data, replace with real numbers.
// The last month is $48,250, which is +12.5% over the month before.
const chartData = [
  { month: "Jan", revenue: 28400 },
  { month: "Feb", revenue: 35200 },
  { month: "Mar", revenue: 31800 },
  { month: "Apr", revenue: 38600 },
  { month: "May", revenue: 42900 },
  { month: "Jun", revenue: 48250 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#17ad37",
  },
} satisfies ChartConfig

export default function RevenueChartCard() {
  return (
    <Card className="h-full gap-4 overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Wallet className="size-4" />
            </div>
            <CardDescription className="text-base">
              Total Revenue
            </CardDescription>
          </div>

          <Badge
            variant="outline"
            className="gap-1 rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          >
            <TrendingUp className="size-3.5" />
            +12.5%
          </Badge>
        </div>

        <div className="flex items-baseline gap-2">
          <CardTitle className="text-2xl font-semibold tabular-nums">
            $48,250
          </CardTitle>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      </CardHeader>

      {/* Chart runs to the card edges; -mb-6 cancels the card's bottom padding */}
      <CardContent className="-mb-6 min-h-0 flex-1 px-0">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-full min-h-32 w-full [&_*]:!outline-none"
        >
          <AreaChart
            accessibilityLayer={false}
            data={chartData}
            margin={{ left: 0, right: 0, top: 4, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
              </linearGradient>

              <StripePattern
                id="patternRevenue"
                color="var(--color-revenue)"
              />
            </defs>

            <XAxis dataKey="month" hide />
            <YAxis hide domain={[0, "dataMax + 8000"]} />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />

            <Area
              dataKey="revenue"
              type="monotone"
              fill="url(#patternRevenue)"
              stroke="var(--color-revenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}