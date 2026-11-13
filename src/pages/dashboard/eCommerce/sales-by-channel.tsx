"use client"

import {
  Download,
  EllipsisVertical,
  FileText,
  Layers,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react"
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts"

import { cn } from "@/lib/utils"
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

// Placeholder data, replace with real numbers.
// Revenue adds up to $48,250, the same total as Total Revenue.
const channels = [
  { key: "website", label: "Website", revenue: 19300, change: 12.4, from: "#17ad37", to: "#98ec2d" },
  { key: "app", label: "Mobile app", revenue: 12060, change: 21.4, from: "#7928ca", to: "#ff0080" },
  { key: "market", label: "Marketplace", revenue: 8690, change: 6.8, from: "#00c6fb", to: "#005bea" },
  { key: "social", label: "Social shop", revenue: 5790, change: -2.3, from: "#f7971e", to: "#ffd200" },
  { key: "offline", label: "Offline", revenue: 2410, change: -5.1, from: "#ee0979", to: "#ff6a00" },
]

const chartConfig = {
  share: { label: "Share" },
} satisfies ChartConfig

const money = (n: number) => `$${n.toLocaleString("en-US")}`

type TooltipProps = {
  active?: boolean
  payload?: Array<{ payload: { label: string; revenue: number; share: number } }>
}

function ChannelTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload

  return (
    <div className="min-w-36 rounded-xl border bg-popover px-3 py-2 text-popover-foreground shadow-lg">
      <p className="text-xs text-muted-foreground">{p.label}</p>
      <p className="mt-1 text-base leading-none font-semibold tabular-nums">
        {money(p.revenue)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{p.share.toFixed(1)}% of sales</p>
    </div>
  )
}

export default function SalesByChannel() {
  const total = channels.reduce((sum, c) => sum + c.revenue, 0)

  const rows = channels.map((c) => ({
    ...c,
    share: (c.revenue / total) * 100,
  }))
  const top = rows[0]

  // Recharts draws the first item as the innermost ring, so reverse it
  // to put the biggest channel on the outside.
  const chartData = [...rows].reverse().map((r) => ({
    ...r,
    fill: `url(#chan-fill-${r.key})`,
  }))

  return (
    <Card className="h-full w-full gap-4">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Layers className="size-4" />
            </div>
            <CardDescription className="text-base">
              Sales by Channel
            </CardDescription>
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
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <RefreshCw />
                Refresh data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-baseline gap-2">
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {money(total)}
          </CardTitle>
          <span className="text-xs text-muted-foreground">from 1,800 orders</span>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-5">
        {/* Radial bars */}
        <div className="group relative mx-auto aspect-square w-full max-w-56">

          <ChartContainer config={chartConfig} className="aspect-square size-full">

            <RadialBarChart
              data={chartData}
              startAngle={90}
              endAngle={-270}
              innerRadius="34%"
              outerRadius="100%"
              barSize={10}
            >
              <defs>
                {rows.map((r) => (
                  <linearGradient
                    key={r.key}
                    id={`chan-fill-${r.key}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={r.from} />
                    <stop offset="100%" stopColor={r.to} />
                  </linearGradient>
                ))}
              </defs>

              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <ChartTooltip
  cursor={false}
  offset={24}
  position={{ x: 0, y: -8 }}
  allowEscapeViewBox={{ x: true, y: true }}
  wrapperStyle={{ zIndex: 50, outline: "none", pointerEvents: "none" }}
  content={<ChannelTooltip />}
/>
              <RadialBar
                dataKey="share"
                cornerRadius={10}
                background={{ fill: "var(--muted)" }}
              />
            </RadialBarChart>
          </ChartContainer>


          {/* Center label */}
  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
    <span className="text-xl leading-none font-semibold tabular-nums">
      {top.share.toFixed(0)}%
    </span>
    <span className="mt-1 text-xs text-muted-foreground">{top.label}</span>
  </div>
        </div>

        {/* Channel list */}
        <div className="flex flex-1 flex-col justify-center gap-3">
          {rows.map((r) => {
            const positive = r.change >= 0
            const TrendIcon = positive ? TrendingUp : TrendingDown

            return (
              <div key={r.key} className="flex items-center gap-3 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    background: `linear-gradient(310deg, ${r.from}, ${r.to})`,
                  }}
                />
                <span className="font-medium">{r.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {r.share.toFixed(0)}%
                </span>

                <span className="ml-auto font-semibold tabular-nums">
                  {money(r.revenue)}
                </span>
                <span
                  className={cn(
                    "flex w-14 items-center justify-end gap-0.5 text-xs font-medium tabular-nums",
                    positive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  <TrendIcon className="size-3" />
                  {Math.abs(r.change)}%
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>

      <CardFooter className="bg-background">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-amber-500" />
          <span className="text-muted-foreground">Top channel</span>
          <span className="font-medium">
            {top.label}, {money(top.revenue)}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}