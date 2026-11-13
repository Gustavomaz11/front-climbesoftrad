"use client"

import { TrendingDown, TrendingUp, UserPlus } from "lucide-react"
import { Bar, BarChart, Cell, XAxis } from "recharts"

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

export const description = "A bar chart card showing new customers"

// ---- Variables ----
const totalCustomers = "1.2K"
const weeklyChange = 3.2 // % vs last week, negative values switch the badge to red
// -------------------

const customersData = [
  { day: "Mon", value: 20 },
  { day: "Tue", value: 45 },
  { day: "Wed", value: 30 },
  { day: "Thu", value: 60 },
  { day: "Fri", value: 25 },
  { day: "Sat", value: 75 },
  { day: "Sun", value: 55 },
]

const chartConfig = {
  value: { label: "New Customers", color: "var(--chart-2)" },
} satisfies ChartConfig

// Index of the highest bar, which is drawn at full strength
const peakIndex = customersData.reduce(
  (best, d, i, arr) => (d.value > arr[best].value ? i : best),
  0
)

export default function NewCustomersCard() {
  const isUp = weeklyChange >= 0
  const TrendIcon = isUp ? TrendingUp : TrendingDown

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            New Customers
          </CardTitle>
          <h2 className="text-3xl font-bold tabular-nums">{totalCustomers}</h2>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500">
          <UserPlus className="size-4.5" />
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
          <BarChart
            accessibilityLayer
            data={customersData}
            margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
            barCategoryGap="20%"
          >
            <XAxis dataKey="day" hide />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.5, radius: 6 }}
              content={<ChartTooltipContent hideLabel={false} indicator="dot" />}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} minPointSize={4}>
              {customersData.map((_, i) => (
                <Cell
                  key={i}
                  fill="var(--color-value)"
                  fillOpacity={i === peakIndex ? 1 : 0.35}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}