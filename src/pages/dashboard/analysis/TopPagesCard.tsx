"use client"

import { ArrowRight, FileText } from "lucide-react"

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Placeholder data, replace with real numbers.
const pages = [
  { path: "/home", views: 18240, visitors: 12300, bounce: 31.2, time: "1m 48s" },
  { path: "/products", views: 14860, visitors: 9800, bounce: 36.8, time: "2m 36s" },
  { path: "/products/wireless-headphones", views: 9420, visitors: 6100, bounce: 42.5, time: "3m 12s" },
  { path: "/cart", views: 7150, visitors: 4900, bounce: 28.4, time: "1m 22s" },
  { path: "/checkout", views: 5380, visitors: 3700, bounce: 19.6, time: "2m 05s" },
  { path: "/blog/ecommerce-trends", views: 4960, visitors: 4100, bounce: 58.3, time: "4m 41s" },
  { path: "/pricing", views: 3810, visitors: 2900, bounce: 44.1, time: "1m 54s" },
]

// Lower bounce is better
const bounceTone = (v: number) =>
  v < 35
    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
    : v < 50
      ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
      : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"

export default function TopPagesCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400">
            <FileText className="size-5" />
          </div>
          <div>
            <CardTitle className="mb-0 text-lg font-medium">Top Pages</CardTitle>
            <CardDescription>Most visited pages this month</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="overflow-x-auto rounded-xl border">
          <Table className="min-w-[520px]">
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead>Page</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Visitors</TableHead>
                <TableHead className="text-right">Bounce</TableHead>
                <TableHead className="text-right">Avg. time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((p) => (
                <TableRow key={p.path}>
                  <TableCell className="max-w-48 truncate font-mono text-xs font-medium">
                    {p.path}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {p.views.toLocaleString("en-US")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.visitors.toLocaleString("en-US")}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums",
                        bounceTone(p.bounce)
                      )}
                    >
                      {p.bounce}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {p.time}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="justify-between bg-background">
        <span className="text-muted-foreground">Top 7 of 42 pages</span>
        <Button variant="ghost" className="gap-1.5">
          View all pages
          <ArrowRight className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}