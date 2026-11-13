import {
  Airplay,
  ChartColumnDecreasing,
  Clock,
  Lightbulb,
  type LucideIcon,
  TrendingDown,
  TrendingUp,
  UserPlus,
  UserRoundX,
  Wallet,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// Full class strings so Tailwind can detect them.
const tones = {
  emerald: {
    tile: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    bar: "[&>div]:bg-emerald-500",
  },
  indigo: {
    tile: "border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    bar: "[&>div]:bg-indigo-500",
  },
  pink: {
    tile: "border-pink-500/20 bg-pink-500/10 text-pink-600 dark:text-pink-400",
    bar: "[&>div]:bg-pink-500",
  },
  teal: {
    tile: "border-teal-500/20 bg-teal-500/10 text-teal-600 dark:text-teal-400",
    bar: "[&>div]:bg-teal-500",
  },
  yellow: {
    tile: "border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    bar: "[&>div]:bg-yellow-500",
  },
  violet: {
    tile: "border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400",
    bar: "[&>div]:bg-violet-500",
  },
  orange: {
    tile: "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    bar: "[&>div]:bg-orange-500",
  },
} as const

type Metric = {
  label: string
  value: string
  change: string
  trend: "up" | "down"
  progress: number
  icon: LucideIcon
  tone: keyof typeof tones
}

const metrics: Metric[] = [
  { label: "Revenue", value: "$7,926", change: "12%", trend: "up", progress: 60, icon: Wallet, tone: "emerald" },
  { label: "Active Users", value: "428", change: "8%", trend: "up", progress: 75, icon: UserRoundX, tone: "indigo" },
  { label: "Bounce Rate", value: "42%", change: "5%", trend: "up", progress: 42, icon: Lightbulb, tone: "pink" },
  { label: "Customer Retention", value: "78%", change: "3%", trend: "up", progress: 78, icon: Airplay, tone: "teal" },
  { label: "Avg. Session Duration", value: "5m 20s", change: "1m", trend: "down", progress: 65, icon: Clock, tone: "yellow" },
  { label: "Conversion Rate", value: "3.6%", change: "2%", trend: "down", progress: 36, icon: ChartColumnDecreasing, tone: "violet" },
  { label: "New Signups", value: "1,245", change: "12%", trend: "up", progress: 55, icon: UserPlus, tone: "orange" },
]

export default function TopTrafficChannelsCard() {
  return (
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="text-lg">Top Traffic Channels</CardTitle>
        <CardDescription>Based on visitor data</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-6">
          {metrics.map(({ label, value, change, trend, progress, icon: Icon, tone }) => {
            const TrendIcon = trend === "up" ? TrendingUp : TrendingDown
            return (
              <div key={label} className="flex items-center gap-5">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl border",
                    tones[tone].tile
                  )}
                >
                  <Icon className="size-5" />
                </div>

                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium tabular-nums">{value}</span>
                      <span
                        className={cn(
                          "flex items-center text-sm tabular-nums",
                          trend === "up"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        )}
                      >
                        <TrendIcon className="mr-1 size-4" />
                        {change}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={progress}
                    className={cn("bg-muted mt-2 h-1.5 [&>div]:rounded-full", tones[tone].bar)}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}