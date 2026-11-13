"use client"

import { useState } from "react"
import {
  Compass,
  Download,
  ExternalLink,
  Link2,
  Mail,
  MoreHorizontal,
  RefreshCw,
  Search,
  Share2,
  Trophy,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import { Cell, Pie, PieChart } from "recharts"

import { cn } from "@/lib/utils"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
type Source = {
  key: string
  label: string
  visitors: number
  change: number
  icon: LucideIcon
  from: string
  to: string
}

// Placeholder data, replace with real numbers.
// Visitors add up to 25,300, the same total as the Total Visitors card.
const sources: Source[] = [
  { key: "organic", label: "Organic search", visitors: 10120, change: 14.2, icon: Search, from: "#17ad37", to: "#98ec2d" },
  { key: "direct", label: "Direct", visitors: 6325, change: 5.6, icon: Compass, from: "#00c6fb", to: "#005bea" },
  { key: "social", label: "Social media", visitors: 4048, change: 21.8, icon: Share2, from: "#7928ca", to: "#ff0080" },
  { key: "referral", label: "Referral", visitors: 2783, change: -3.4, icon: Link2, from: "#f7971e", to: "#ffd200" },
  { key: "email", label: "Email", visitors: 2024, change: -1.2, icon: Mail, from: "#ee0979", to: "#ff6a00" },
]

const chartConfig = Object.fromEntries(
  sources.map((s) => [s.key, { label: s.label, color: s.from }])
) satisfies ChartConfig


const periods = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
]
const grad = (s: Source) => `linear-gradient(310deg, ${s.from}, ${s.to})`

type TooltipProps = {
  active?: boolean
  payload?: Array<{ payload: Source }>
  total: number
}

function SourceTooltip({ active, payload, total }: TooltipProps) {
  if (!active || !payload?.length) return null
  const s = payload[0].payload

  return (
    <div className="min-w-40 rounded-xl border bg-popover px-3 py-2.5 text-popover-foreground shadow-lg">
      <div className="flex items-center gap-2 text-xs">
        <span className="size-2 rounded-full" style={{ backgroundImage: grad(s) }} />
        <span className="font-medium">{s.label}</span>
      </div>
      <p className="mt-2 flex justify-between text-xs text-muted-foreground">
        Visitors
        <span className="font-semibold text-foreground tabular-nums">
          {s.visitors.toLocaleString("en-US")}
        </span>
      </p>
      <p className="mt-1 flex justify-between text-xs text-muted-foreground">
        Share
        <span className="font-medium text-foreground tabular-nums">
          {((s.visitors / total) * 100).toFixed(1)}%
        </span>
      </p>
    </div>
  )
}

export default function TrafficSourcesCard() {
  const [period, setPeriod] = useState("30d")
  const periodLabel = periods.find((p) => p.value === period)?.label
  const total = sources.reduce((s, x) => s + x.visitors, 0)
  const ranked = [...sources].sort((a, b) => b.visitors - a.visitors)
  const topSources = ranked.slice(0, 3)
  const top = ranked[0]

  return (
    <Card className="h-full gap-3">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="mb-0 text-lg font-medium">Traffic Sources</CardTitle>
          <CardDescription>Where your visitors come from</CardDescription>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Actions"
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[popup-open]:bg-muted data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuItem>
              <RefreshCw className="size-4" />
              Refresh
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="size-4" />
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ExternalLink className="size-4" />
              View full report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5">
        {/* Donut */}
        <div className="relative mx-auto size-48 shrink-0">
          <ChartContainer
            config={chartConfig}
            className="relative z-10 aspect-square size-full"
          >
            <PieChart>
              <defs>
                {sources.map((s) => (
                  <linearGradient key={s.key} id={`fill-source-${s.key}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={s.from} />
                    <stop offset="100%" stopColor={s.to} />
                  </linearGradient>
                ))}
              </defs>

              <ChartTooltip cursor={false} content={<SourceTooltip total={total} />} />

              <Pie
                data={sources}
                dataKey="visitors"
                nameKey="label"
                innerRadius="68%"
                outerRadius="100%"
                paddingAngle={3}
                cornerRadius={6}
                stroke="none"
              >
                {sources.map((s) => (
                  <Cell key={s.key} fill={`url(#fill-source-${s.key})`} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl leading-none font-semibold tabular-nums">
              {total.toLocaleString("en-US")}
            </span>
            <span className="mt-1.5 text-xs text-muted-foreground">visitors</span>
          </div>
        </div>

        {/* Sources */}
        <div className="space-y-0">
          {topSources.map((s) => {
            const Icon = s.icon
            const share = (s.visitors / total) * 100
            const positive = s.change >= 0
            const TrendIcon = positive ? TrendingUp : TrendingDown

            return (
              <div
                key={s.key}
                className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/50"
              >
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ backgroundImage: grad(s) }}
                >
                  <Icon className="size-4" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm leading-none font-medium">{s.label}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
                    {s.visitors.toLocaleString("en-US")}
                  </p>
                </div>

                <div className="ml-auto flex items-center gap-3">
                  <span
                    className={cn(
                      "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                      positive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    )}
                  >
                    <TrendIcon className="size-3" />
                    {Math.abs(s.change)}%
                  </span>
                  <span className="w-9 text-right text-sm font-semibold tabular-nums">
                    {share.toFixed(0)}%
                  </span>
                </div>
              </div>
            )
          })}

          {/* Other sources, shown once below the list */}
          <p className="px-2 pt-1 text-xs text-muted-foreground">
            Other sources{" "}
            <span className="font-medium text-foreground tabular-nums">
              {(
                ((total - topSources.reduce((s, x) => s + x.visitors, 0)) / total) *
                100
              ).toFixed(0)}
              %
            </span>
          </p>
        </div>
      </CardContent>

      <CardFooter className="border-t text-sm">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-amber-500" />
          <span className="text-muted-foreground">Top source</span>
          <span className="font-medium">{top.label}</span>
        </div>
      </CardFooter>
    </Card>
  )
}