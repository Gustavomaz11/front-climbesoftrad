"use client"

import { MoreHorizontal, RefreshCw, Download, TrendingDown, TrendingUp, ExternalLink } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Placeholder data, replace with real numbers.
// Countries + others add up to 25,300, the same total as Total Visitors.
const countries = [
  { code: "us", name: "United States", visitors: 6900, change: 12.4 },
  { code: "gb", name: "United Kingdom", visitors: 3400, change: 8.1 },
  { code: "in", name: "India", visitors: 2900, change: 18.6 },
  { code: "de", name: "Germany", visitors: 2100, change: -2.3 },
  { code: "ca", name: "Canada", visitors: 1800, change: 5.2 },
  { code: "au", name: "Australia", visitors: 1400, change: -1.4 },
  { code: "fr", name: "France", visitors: 1200, change: 3.7 },
  { code: "br", name: "Brazil", visitors: 1000, change: 9.9 },
  { code: "jp", name: "Japan", visitors: 900, change: -0.8 },
  { code: "nl", name: "Netherlands", visitors: 700, change: 4.5 },
  { code: "es", name: "Spain", visitors: 600, change: 2.1 },
  { code: "it", name: "Italy", visitors: 500, change: -3.2 },
  { code: "sg", name: "Singapore", visitors: 400, change: 6.3 },
]
const OTHERS = 1500

export default function VisitorsByCountryCard() {
  const total = countries.reduce((s, c) => s + c.visitors, 0) + OTHERS

  return (
    <Card className="h-full gap-4">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="mb-0 text-lg font-medium">Visitors by Country</CardTitle>
          <CardDescription>Top locations this month</CardDescription>
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

      <CardContent className="flex-1 px-0">
        <ScrollArea className="h-88">
          <div className="pr-3">
            {countries.map((c, i) => {
              const share = (c.visitors / total) * 100
              const positive = c.change >= 0
              const TrendIcon = positive ? TrendingUp : TrendingDown

              return (
                <div
                  key={c.code}
                  className="flex items-center gap-3 border-b py-2.5 last:border-b-0 px-4"
                >
                  <span className="w-4 text-xs text-muted-foreground tabular-nums">{i + 1}</span>

                  <img
                    src={`https://flagcdn.com/w40/${c.code}.png`}
                    alt={c.name}
                    loading="lazy"
                    className="size-7 shrink-0 rounded-full object-cover ring-1 ring-border"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm leading-none font-medium">{c.name}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
                      {c.visitors.toLocaleString("en-US")} visitors
                    </p>
                  </div>

                  <div className="ml-auto text-right">
                    <p className="text-sm leading-none font-semibold tabular-nums">
                      {share.toFixed(1)}%
                    </p>
                    <p
                      className={cn(
                        "mt-1.5 flex items-center justify-end gap-0.5 text-xs font-medium tabular-nums",
                        positive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      )}
                    >
                      <TrendIcon className="size-3" />
                      {Math.abs(c.change)}%
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="justify-between border-t text-sm">
        <span className="text-muted-foreground">Other countries</span>
        <span className="font-medium tabular-nums">
          {OTHERS.toLocaleString("en-US")}
        </span>
      </CardFooter>
    </Card>
  )
}