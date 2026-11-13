
"use client"

import { TrendingUp } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const totalSessions = "4.5K"
const weeklyChange = 8.2

const sessionsData = [
  { value: 30 },
  { value: 45 },
  { value: 20 },
  { value: 60 },
  { value: 40 },
  { value: 70 },
  { value: 50 },
]

export default function TotalSessionsCard() {
  const isUp = weeklyChange >= 0
  const TrendIcon = isUp ? TrendingUp : TrendingUp

  return (
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total Sessions
        </CardTitle>
        <h2 className="text-3xl font-bold tabular-nums">
          {totalSessions}
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
            <TrendIcon className="size-3" />
            {isUp ? "+" : ""}
            {weeklyChange}%
          </Badge>

          <CardDescription>from last week</CardDescription>
        </div>

        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sessionsData}>
              <Line
                type="linear"
                dataKey="value"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{
                  r: 4,
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
