"use client"

import { Activity } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Placeholder data, replace with real numbers.
// Active users per minute over the last 30 minutes (oldest first).
const perMinute = [
  38, 42, 40, 45, 44, 48, 46, 50, 47, 52, 49, 55, 53, 51, 56, 58, 54, 57, 60, 59,
  62, 58, 61, 64, 63, 66, 62, 65, 68, 70,
]

const activePages = [
  { path: "/home", users: 412 },
  { path: "/products", users: 336 },
  { path: "/cart", users: 218 },
  { path: "/checkout", users: 142 },
]

export default function ActiveUsersCard() {
  const now = 1248
  const max = Math.max(...perMinute)
  const topUsers = Math.max(...activePages.map((p) => p.users))

  return (
    <Card className="h-full gap-4">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Activity className="size-5" />
            </div>
            <CardDescription className="text-base">Active Users</CardDescription>
          </div>

          <span className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {now.toLocaleString("en-US")}
          </CardTitle>
          <span className="text-xs text-muted-foreground">on the site right now</span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5">
        {/* Per-minute strip */}
        {/* Per-minute strip: takes the spare height */}
<div className="flex min-h-28 flex-1 flex-col">
  <div
    className="flex flex-1 items-end gap-[3px]"
    role="img"
    aria-label="Active users per minute, last 30 minutes"
  >
    {perMinute.map((v, i) => (
      <span
        key={i}
        title={`${30 - i} min ago: ${v} users`}
        className={cn(
          "flex-1 rounded-full",
          i === perMinute.length - 1
            ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
            : "bg-emerald-500/25"
        )}
        style={{ height: `${Math.max((v / max) * 100, 10)}%` }}
      />
    ))}
  </div>
  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
    <span>30 min ago</span>
    <span>Now</span>
  </div>
</div>

        {/* Active pages */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Top active pages</p>
          {activePages.map((p) => (
            <div key={p.path} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs font-medium">{p.path}</span>
                <span className="font-semibold tabular-nums">{p.users}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                  style={{ width: `${(p.users / topUsers) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="justify-between border-t text-sm">
        <span className="text-muted-foreground">Peak today</span>
        <span className="font-medium tabular-nums">1,412 users</span>
      </CardFooter>
    </Card>
  )
}