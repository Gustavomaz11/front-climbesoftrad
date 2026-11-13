"use client"

import { Users } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Placeholder data, replace with real numbers.
// Each row is a weekly signup cohort. Values are the % still active in week 0, 1, 2...
const cohorts = [
  { label: "Sep 17", users: 3100, values: [100, 41, 33, 29, 26, 24] },
  { label: "Sep 24", users: 3250, values: [100, 43, 35, 30, 27] },
  { label: "Oct 1", users: 3400, values: [100, 44, 36, 31] },
  { label: "Oct 8", users: 3600, values: [100, 46, 37] },
  { label: "Oct 15", users: 3750, values: [100, 47] },
  { label: "Oct 22", users: 3900, values: [100] },
]

const WEEKS = 6
const GRID = "grid grid-cols-[64px_56px_repeat(6,minmax(0,1fr))] items-center gap-1.5"

// Violet intensity grows with retention
const alphaFor = (v: number) =>
  v === 100 ? 0.9 : Math.min(0.12 + (v / 60) * 0.6, 0.85)

export default function RetentionCard() {
  const week1 = cohorts.filter((c) => c.values.length > 1).map((c) => c.values[1])
  const avgWeek1 = week1.reduce((s, v) => s + v, 0) / week1.length
  const best = cohorts
    .filter((c) => c.values.length > 1)
    .reduce((a, b) => (b.values[1] > a.values[1] ? b : a))

  return (
    <Card className="h-full gap-4">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
            <Users className="size-5" />
          </div>
          <div>
            <CardTitle className="mb-0 text-lg font-medium">Visitor Retention</CardTitle>
            <CardDescription>Weekly cohorts, % of visitors who came back</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="overflow-x-auto">
          <div className="min-w-[480px] space-y-1.5">
            {/* Header */}
            <div className={`${GRID} text-xs text-muted-foreground`}>
              <span>Cohort</span>
              <span>Users</span>
              {Array.from({ length: WEEKS }).map((_, i) => (
                <span key={i} className="text-center">
                  W{i}
                </span>
              ))}
            </div>

            {/* Rows */}
            {cohorts.map((c) => (
              <div key={c.label} className={GRID}>
                <span className="text-xs font-medium">{c.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {c.users.toLocaleString("en-US")}
                </span>

                {Array.from({ length: WEEKS }).map((_, i) => {
                  const v = c.values[i]

                  if (v === undefined) {
                    return <span key={i} className="h-10 rounded-md bg-muted/30" />
                  }

                  const alpha = alphaFor(v)

                  return (
                    <span
                      key={i}
                      title={`${c.label}, week ${i}: ${v}%`}
                      className="flex h-10 items-center justify-center rounded-md text-xs font-medium tabular-nums"
                      style={{
                        backgroundColor: `rgba(139, 92, 246, ${alpha})`,
                        color: alpha > 0.5 ? "#fff" : "var(--foreground)",
                      }}
                    >
                      {v}%
                    </span>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Scale */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Low</span>
          <div
            className="h-2 w-32 rounded-full"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(139,92,246,0.15), rgba(139,92,246,0.85))",
            }}
          />
          <span>High</span>
        </div>
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-x-6 gap-y-2 border-t text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Avg. week 1 retention</span>
          <span className="font-medium tabular-nums">{avgWeek1.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Best cohort</span>
          <span className="font-medium">
            {best.label}, {best.values[1]}%
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}