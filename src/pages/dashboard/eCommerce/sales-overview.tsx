"use client"

import { useState } from "react"
import {
  Download,
  EllipsisVertical,
  FileSpreadsheet,
  FileText,
  Percent,
  RefreshCw,
  ShoppingCart,
  Trophy,
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
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
  type ChartConfig,
} from "@/components/ui/chart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import {StripePattern} from"./stripe-pattern"

type Point = {
  label: string
  full: string
  revenue: number
  profit: number
  orders: number
}

type RangeKey = "7d" | "6m" | "12m"

// Placeholder data, replace with real numbers
const week: Point[] = [
  { label: "Mon", full: "Monday", revenue: 3200, profit: 1100, orders: 42 },
  { label: "Tue", full: "Tuesday", revenue: 2900, profit: 980, orders: 38 },
  { label: "Wed", full: "Wednesday", revenue: 3800, profit: 1350, orders: 51 },
  { label: "Thu", full: "Thursday", revenue: 4300, profit: 1600, orders: 58 },
  { label: "Fri", full: "Friday", revenue: 5100, profit: 1900, orders: 66 },
  { label: "Sat", full: "Saturday", revenue: 6200, profit: 2400, orders: 80 },
  { label: "Sun", full: "Sunday", revenue: 4700, profit: 1700, orders: 60 },
]

const sixMonths: Point[] = [
  { label: "Jan", full: "January", revenue: 28400, profit: 9700, orders: 1050 },
  { label: "Feb", full: "February", revenue: 35200, profit: 12400, orders: 1280 },
  { label: "Mar", full: "March", revenue: 31800, profit: 10900, orders: 1190 },
  { label: "Apr", full: "April", revenue: 38600, profit: 13500, orders: 1420 },
  { label: "May", full: "May", revenue: 42900, profit: 15200, orders: 1590 },
  { label: "Jun", full: "June", revenue: 48250, profit: 17100, orders: 1800 },
]

const earlierMonths: Point[] = [
  { label: "Jul", full: "July", revenue: 21800, profit: 7200, orders: 760 },
  { label: "Aug", full: "August", revenue: 23400, profit: 7900, orders: 830 },
  { label: "Sep", full: "September", revenue: 22100, profit: 7400, orders: 790 },
  { label: "Oct", full: "October", revenue: 25600, profit: 8800, orders: 920 },
  { label: "Nov", full: "November", revenue: 31200, profit: 11000, orders: 1150 },
  { label: "Dec", full: "December", revenue: 36800, profit: 13100, orders: 1320 },
]

const ranges: Record<
  RangeKey,
  { label: string; unit: string; data: Point[] }
> = {
  "7d": { label: "7D", unit: "day", data: week },
  "6m": { label: "6M", unit: "month", data: sixMonths },
  "12m": {
    label: "12M",
    unit: "month",
    data: [...earlierMonths, ...sixMonths],
  },
}

const chartConfig = {
  revenue: { label: "Revenue", color: "#8b5cf6" },
  profit: { label: "Profit", color: "#10b981" },
} satisfies ChartConfig

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
})

type SalesTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: Point }>
}

function SalesTooltip({ active, payload }: SalesTooltipProps) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload
  const margin = ((point.profit / point.revenue) * 100).toFixed(1)

  const rows = [
    { label: "Revenue", value: `$${point.revenue.toLocaleString("en-US")}`, dot: "bg-violet-500" },
    { label: "Profit", value: `$${point.profit.toLocaleString("en-US")}`, dot: "bg-emerald-500" },
  ]

  return (
    <div className="min-w-44 rounded-xl border bg-popover px-3 py-2.5 text-popover-foreground shadow-lg">
      <p className="text-xs font-medium">{point.full}</p>

      <div className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-2 text-xs">
            <span className={cn("size-2 rounded-full", row.dot)} />
            <span className="text-muted-foreground">{row.label}</span>
            <span className="ml-auto font-semibold tabular-nums">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">
        Profit margin{" "}
        <span className="font-medium text-foreground">{margin}%</span>
      </p>
    </div>
  )
}

export default function SalesOverview() {
  const [range, setRange] = useState<RangeKey>("6m")
  const { data, unit } = ranges[range]

  const totals = data.reduce(
    (sum, p) => ({
      revenue: sum.revenue + p.revenue,
      profit: sum.profit + p.profit,
      orders: sum.orders + p.orders,
    }),
    { revenue: 0, profit: 0, orders: 0 }
  )
  const best = data.reduce((a, b) => (b.revenue > a.revenue ? b : a))
  const avgOrder = totals.revenue / totals.orders
  const margin = (totals.profit / totals.revenue) * 100

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="mb-0 text-lg font-medium">Sales Overview</CardTitle>
          <CardDescription>Revenue and profit performance</CardDescription>
        </div>

        <div className="flex items-center gap-1">
          {/* Range switch */}
          <div
            role="group"
            aria-label="Time range"
            className="flex rounded-lg bg-muted p-0.5"
          >
            {(Object.keys(ranges) as RangeKey[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={range === key}
                onClick={() => setRange(key)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  range === key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {ranges[key].label}
              </button>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="More options"
                className="rounded-full [&_svg]:size-5"
              >
                <EllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileText />
                View detailed report
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download />
                Download report
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileSpreadsheet />
                Export as CSV / PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <RefreshCw />
                Refresh data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {/* Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-violet-500" />
            <span className="text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Profit</span>
          </div>
        </div>

        {/* Chart */}
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-72 w-full [&_*]:!outline-none"
        >
          <AreaChart
            accessibilityLayer={false}
            data={data}
            margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillSalesRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillSalesProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-profit)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--color-profit)" stopOpacity={0.02} />
              </linearGradient>

              <StripePattern
                id="patternSalesRevenue"
                color="var(--color-revenue)"
              />
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(value: number) => usd.format(value)}
            />

            <ChartTooltip cursor={false} content={<SalesTooltip />} />

            {/* Profit is part of revenue, so the areas overlap instead of stacking */}
            <Area
  dataKey="revenue"
  type="monotone"
  fill="url(#patternSalesRevenue)"
  stroke="var(--color-revenue)"
  strokeWidth={2}
/>
            <Area
              dataKey="profit"
              type="monotone"
              fill="url(#fillSalesProfit)"
              stroke="var(--color-profit)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-wrap gap-x-6 gap-y-2 border-t text-sm">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-amber-500" />
          <span className="text-muted-foreground">Best {unit}</span>
          <span className="font-medium">
            {best.full}, {usd.format(best.revenue)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ShoppingCart className="size-4 text-sky-500" />
          <span className="text-muted-foreground">Avg. order</span>
          <span className="font-medium">${avgOrder.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Percent className="size-4 text-emerald-500" />
          <span className="text-muted-foreground">Margin</span>
          <span className="font-medium">{margin.toFixed(1)}%</span>
        </div>

      </CardFooter>
    </Card>
  )
}