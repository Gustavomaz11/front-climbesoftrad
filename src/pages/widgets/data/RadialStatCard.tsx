"use client"

import { useId } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface RadialStatCardProps {
  title: string
  subtitle?: string
  value: number
  label: string
  color?: string      // gradient start
  colorTo?: string    // gradient end
  change?: number
  description?: string
}

export default function RadialStatCard({
  title,
  subtitle = "January – June 2024",
  value,
  label,
  color = "#3b82f6",
  colorTo,
  change,
  description,
}: RadialStatCardProps) {
  const end = colorTo ?? color   // falls back to a single color if colorTo isn't passed
  const id = useId().replace(/:/g, "")
  const hasChange = typeof change === "number"
  const positive = (change ?? 0) >= 0
  const TrendIcon = positive ? TrendingUp : TrendingDown

  return (
    <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </div>

        {hasChange && (
          <Badge
            variant="secondary"
            className={cn(
              "gap-1 rounded-full border-0 px-2.5 py-1 font-medium",
              positive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" />
            {positive ? "+" : ""}
            {change}%
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div className="relative mx-auto h-48 w-full max-w-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={[{ value }]}
              startAngle={225}
              endAngle={-45}
              innerRadius="85%"
              outerRadius="100%"
              barSize={16}
            >
              <defs>
                <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={color} />
                  <stop offset="100%" stopColor={end} />
                </linearGradient>
              </defs>

              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} angleAxisId={0} />

              <RadialBar
                dataKey="value"
                cornerRadius={999}
                fill={`url(#grad-${id})`}
                background={{ className: "fill-muted" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold tracking-tight tabular-nums">
              {value}
              <span className="text-xl font-semibold text-muted-foreground">%</span>
            </span>
            <span className="mt-0.5 text-sm text-muted-foreground">{label}</span>
          </div>
        </div>

        {description && (
          <p className="text-center text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}