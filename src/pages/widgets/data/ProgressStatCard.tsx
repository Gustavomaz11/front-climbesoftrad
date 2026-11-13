import { AlertTriangle, Info, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ProgressVariant = "success" | "danger" | "info" | "warning"

interface ProgressStatCardProps {
  title: string
  value: string
  progress: number
  badgeText: string
  variant?: ProgressVariant
  icon?: LucideIcon
}

const variantStyles: Record<
  ProgressVariant,
  { icon: LucideIcon; tile: string; bar: string; badge: string; text: string }
> = {
  success: {
    icon: TrendingUp,
    tile: "bg-emerald-500/15 text-emerald-500",
    bar: "bg-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-500",
    text: "text-emerald-500",
  },
  danger: {
    icon: TrendingDown,
    tile: "bg-rose-500/15 text-rose-500",
    bar: "bg-rose-500",
    badge: "bg-rose-500/15 text-rose-500",
    text: "text-rose-500",
  },
  info: {
    icon: Info,
    tile: "bg-blue-500/15 text-blue-500",
    bar: "bg-blue-500",
    badge: "bg-blue-500/15 text-blue-500",
    text: "text-blue-500",
  },
  warning: {
    icon: AlertTriangle,
    tile: "bg-yellow-500/15 text-yellow-500",
    bar: "bg-yellow-500",
    badge: "bg-yellow-500/15 text-yellow-500",
    text: "text-yellow-500",
  },
}

export default function ProgressStatCard({
  title,
  value,
  progress,
  badgeText,
  variant = "success",
  icon,
}: ProgressStatCardProps) {
  const styles = variantStyles[variant]
  const Icon = icon ?? styles.icon
  const pct = Math.min(100, Math.max(0, progress))

  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <h2 className="text-3xl font-bold tabular-nums">{value}</h2>
          </div>
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              styles.tile
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>

        <div className="space-y-2">
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={title}
            className="bg-muted h-1 w-full overflow-hidden rounded-full"
          >
            <div
              className={cn("h-full rounded-full transition-all duration-500", styles.bar)}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={cn("font-medium", styles.badge)}>
              {badgeText}
            </Badge>
            <span className={cn("text-sm font-semibold tabular-nums", styles.text)}>
              {pct}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}