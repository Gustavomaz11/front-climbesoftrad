"use client"

import { useState } from "react"
import {
  ArrowRight,
  Apple,
  CreditCardIcon,
  Download,
  EllipsisVertical,
  FileText,
  Film,
  RefreshCw,
  Tickets,
  UserIcon,
  Youtube,
  type LucideIcon,
} from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Status = "Pending" | "Done" | "Failed"
type Filter = "all" | "in" | "out"

type Transaction = {
  name: string
  date: string
  status: Status
  type: "in" | "out"
  amount: number
  icon: LucideIcon
  gradient: string
}

// Placeholder data, replace with real numbers. Newest first.
const transactions: Transaction[] = [
  { name: "YouTube", date: "Jun 15", status: "Pending", type: "out", amount: 50, icon: Youtube, gradient: "bg-[linear-gradient(310deg,#f857a6,#ff5858)]" },
  { name: "John Doe", date: "Jun 14", status: "Done", type: "out", amount: 100, icon: UserIcon, gradient: "bg-[linear-gradient(310deg,#4facfe,#00f2fe)]" },
  { name: "Sans Brothers", date: "Jun 13", status: "Failed", type: "in", amount: 120, icon: CreditCardIcon, gradient: "bg-[linear-gradient(310deg,#0ba360,#3cba92)]" },
  { name: "Cinema City", date: "Jun 6", status: "Done", type: "out", amount: 75, icon: Film, gradient: "bg-[linear-gradient(310deg,#8e2de2,#4a00e0)]" },
  { name: "Apple Store", date: "May 29", status: "Done", type: "out", amount: 199, icon: Apple, gradient: "bg-[linear-gradient(310deg,#f7971e,#ffd200)]" },
  { name: "Stripe Payout", date: "May 27", status: "Pending", type: "in", amount: 540, icon: Tickets, gradient: "bg-[linear-gradient(310deg,#667eea,#764ba2)]" },
]

const STATUS_STYLES: Record<Status, { dot: string; text: string }> = {
  Pending: { dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  Done: { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  Failed: { dot: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "in", label: "Income" },
  { key: "out", label: "Expense" },
]

const money = (n: number) => `$${n.toLocaleString("en-US")}`

export default function TransactionsCard() {
  const [filter, setFilter] = useState<Filter>("all")

  // Failed transactions never moved money, so they are left out of the totals
  const valid = transactions.filter((t) => t.status !== "Failed")
  const moneyIn = valid.filter((t) => t.type === "in").reduce((s, t) => s + t.amount, 0)
  const moneyOut = valid.filter((t) => t.type === "out").reduce((s, t) => s + t.amount, 0)

  const rows = transactions.filter((t) => filter === "all" || t.type === filter)

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-lg font-medium">Transactions</CardTitle>
          <CardDescription>Recent transactions overview</CardDescription>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="More options"
              className="rounded-full [&_svg]:size-5"
            >
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <FileText />
              View detailed report
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download />
              Download report
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <RefreshCw />
              Refresh data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl border px-3 py-2">
            <p className="text-xs text-muted-foreground">Money in</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              +{money(moneyIn)}
            </p>
          </div>
          <div className="rounded-xl border px-3 py-2">
            <p className="text-xs text-muted-foreground">Money out</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-rose-600 dark:text-rose-400">
              -{money(moneyOut)}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div
          role="group"
          aria-label="Filter transactions"
          className="flex w-fit rounded-lg bg-muted p-0.5"
        >
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                filter === f.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </CardContent>
      {/* List */}
      <ScrollArea className="h-[280px] rounded-xl px-4 -mx-2">
        <div className="flex flex-1 flex-col">
          {rows.map((item) => {
            const Icon = item.icon
            const status = STATUS_STYLES[item.status]
            const failed = item.status === "Failed"

            return (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg p-0.5 shadow">
                    <div
                    className={cn(
                      "flex size-8.5 shrink-0 items-center justify-center rounded-md text-white",
                      item.gradient
                    )}
                  >
                    <Icon className="size-5" />
                   </div>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium leading-none">
                      {item.name}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      {item.date}
                      <span className="text-muted-foreground/40">•</span>
                      <span className={cn("flex items-center gap-1", status.text)}>
                        <span className={cn("size-1.5 rounded-full", status.dot)} />
                        {item.status}
                      </span>
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-sm font-semibold tabular-nums",
                    failed
                      ? "text-muted-foreground line-through"
                      : item.type === "in"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-foreground"
                  )}
                >
                  {item.type === "in" ? "+" : "-"}
                  {money(item.amount)}
                </span>
              </div>
            )
          })}
        </div>
      </ScrollArea>
      <CardFooter className="w-full bg-background">
        <Button variant="outline" className="w-full">
          View all transactions
          <ArrowRight className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}