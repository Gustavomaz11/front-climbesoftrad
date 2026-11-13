"use client"

import { Bar, BarChart, Cell, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  CircleCheck,
  Clock,
  Download,
  EllipsisVertical,
  FileText,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Trophy,
  Truck,
  type LucideIcon,
} from "lucide-react"

import { StripePattern } from "./stripe-pattern"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Placeholder data, replace with real numbers.
// Same week as the 7D view in Sales Overview: 395 orders in total.
const days = [
  { day: "M", full: "Monday", orders: 42 },
  { day: "T", full: "Tuesday", orders: 38 },
  { day: "W", full: "Wednesday", orders: 51 },
  { day: "T", full: "Thursday", orders: 58 },
  { day: "F", full: "Friday", orders: 66 },
  { day: "S", full: "Saturday", orders: 80 },
  { day: "S", full: "Sunday", orders: 60 },
]

const chartConfig = {
  orders: { label: "Orders", color: "#8b5cf6" },
} satisfies ChartConfig

type Stage = {
  label: string
  value: number
  icon: LucideIcon
  tile: string
  icon_tone: string
}

// The four stages add up to the 395 orders above.
const stages: Stage[] = [
  {
    label: "Processing",
    value: 35,
    icon: Clock,
    tile: "bg-amber-500/5 border-amber-500/20",
    icon_tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  {
    label: "Ready to ship",
    value: 12,
    icon: Package,
    tile: "bg-sky-500/5 border-sky-500/20",
    icon_tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  {
    label: "In transit",
    value: 96,
    icon: Truck,
    tile: "bg-violet-500/5 border-violet-500/20",
    icon_tone: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  {
    label: "Delivered",
    value: 252,
    icon: CircleCheck,
    tile: "bg-emerald-500/5 border-emerald-500/20",
    icon_tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
]

export default function OrderStatus() {
  const total = days.reduce((sum, d) => sum + d.orders, 0)
  const best = days.reduce((a, b) => (b.orders > a.orders ? b : a))

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
              <ShoppingBag className="size-4" />
            </div>
            <CardDescription className="text-base">
              Order Status
            </CardDescription>
          </div>

          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className="gap-1 rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              <TrendingUp className="size-3.5" />
              +9.2%
            </Badge>

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
                  View all orders
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download />
                  Download report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <RefreshCw />
                  Refresh data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {total}
          </CardTitle>
          <span className="text-xs text-muted-foreground">orders this week</span>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        {/* Day chart */}
        <ChartContainer config={chartConfig} className="h-40 w-full [&_*]:!outline-none">
          <BarChart accessibilityLayer={false} data={days} margin={{ top: 4, left: 0, right: 0 }}>
            <defs>
              <linearGradient id="barBest" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#e546d5" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <StripePattern id="barStripes" color="#8b5cf6" />
            </defs>
            <XAxis
              dataKey="full"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => value.slice(0, 1)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="orders" radius={6}>
              {days.map((d) => {
                const isBest = d.full === best.full
                return (
                  <Cell
                    key={d.full}
                    fill={isBest ? "url(#barBest)" : "url(#barStripes)"}
                    stroke={isBest ? "#4f46e5" : "#8b5cf6"}
                    strokeWidth={isBest ? 1.5 : 1}
                    strokeOpacity={isBest ? 1 : 0.5}
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ChartContainer>

        {/* Stage tiles: stretch to fill the card height */}
        <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-3">
          {stages.map((stage) => {
            const Icon = stage.icon
            const share = ((stage.value / total) * 100).toFixed(0)

            return (
              <div
                key={stage.label}
                className={cn(
                  "flex flex-col justify-between rounded-xl border p-3",
                  stage.tile
                )}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg",
                      stage.icon_tone
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {share}%
                  </span>
                </div>

                <div>
                  <p className="text-xl leading-none font-semibold tabular-nums">
                    {stage.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stage.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>

      <CardFooter className="border-t text-sm bg-background">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-amber-500" />
          <span className="text-muted-foreground">Best day</span>
          <span className="font-medium">
            {best.full}, {best.orders} orders
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}