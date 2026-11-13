
"use client"

import { TrendingUp } from "lucide-react"
import { AreaChart, Area, ResponsiveContainer } from "recharts"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const totalRevenue = "$18.4K"
const weeklyChange = 7.8

const areaData = [
  { value: 30 },
  { value: 45 },
  { value: 35 },
  { value: 65 },
  { value: 40 },
  { value: 80 },
  { value: 50 },
]

export default function AreaStatsCard() {
  const isUp = weeklyChange >= 0

  return (
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total Revenue
        </CardTitle>
        <h2 className="text-3xl font-bold tabular-nums">
          {totalRevenue}
        </h2>
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
            <TrendingUp className="size-3" />
            {isUp ? "+" : ""}
            {weeklyChange}%
          </Badge>

          <CardDescription>from last week</CardDescription>
        </div>

        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>

              <Area
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#areaGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
