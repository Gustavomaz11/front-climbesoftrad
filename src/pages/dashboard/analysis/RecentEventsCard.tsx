"use client"

import { useState } from "react"
import {
  CreditCard,
  Megaphone,
  ShoppingBag,
  ShoppingCart,
  UserPlus,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type EventType = "purchase" | "signup" | "cart" | "checkout" | "campaign"
type Filter = "all" | "purchase" | "signup" | "cart"

const EVENT_CONFIG: Record<EventType, { label: string; icon: LucideIcon; tone: string }> = {
  purchase: { label: "Purchase", icon: ShoppingBag, tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  signup: { label: "Sign up", icon: UserPlus, tone: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
  cart: { label: "Added to cart", icon: ShoppingCart, tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  checkout: { label: "Checkout started", icon: CreditCard, tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
  campaign: { label: "Campaign click", icon: Megaphone, tone: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "purchase", label: "Purchases" },
  { key: "signup", label: "Sign ups" },
  { key: "cart", label: "Carts" },
]

// Placeholder data, replace with real numbers. Newest first.
const events: { id: number; type: EventType; user: string; detail: string; place: string; time: string }[] = [
  { id: 1, type: "purchase", user: "Julia Sunota", detail: "Sports Shoes, $149", place: "New York, US", time: "Just now" },
  { id: 2, type: "cart", user: "Robert Fox", detail: "Golden Watch", place: "London, UK", time: "1 min ago" },
  { id: 3, type: "signup", user: "Emma Watson", detail: "via Google", place: "Toronto, CA", time: "3 min ago" },
  { id: 4, type: "checkout", user: "Jacob Jones", detail: "3 items, $412", place: "Sydney, AU", time: "4 min ago" },
  { id: 5, type: "campaign", user: "Kristin Watson", detail: "Autumn Sale email", place: "Berlin, DE", time: "6 min ago" },
  { id: 6, type: "purchase", user: "Albert Flores", detail: "Wireless Headphones, $199", place: "Mumbai, IN", time: "9 min ago" },
  { id: 7, type: "signup", user: "Cody Fisher", detail: "via email", place: "New York, US", time: "12 min ago" },
  { id: 8, type: "cart", user: "Jenny Wilson", detail: "Aviator Sunglasses", place: "London, UK", time: "14 min ago" },
]

export default function RecentEventsCard() {
  const [filter, setFilter] = useState<Filter>("all")
  const rows = events.filter((e) => filter === "all" || e.type === filter)

  return (
    <Card className="h-full gap-4">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="mb-0 text-lg font-medium">Recent Events</CardTitle>
          <CardDescription>Live activity across your store</CardDescription>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f.key} value={f.key}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="flex-1">
        {rows.length ? (
          <ol className="relative space-y-4">
            {/* Timeline line */}
            <span className="absolute top-2 bottom-2 left-5 w-px bg-border" aria-hidden />

            {rows.map((e) => {
              const cfg = EVENT_CONFIG[e.type]
              const Icon = cfg.icon

              return (
                <li key={e.id} className="relative flex items-center gap-3">
                  <div
                    className={cn(
                      "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-lg ring-4 ring-card",
                      cfg.tone
                    )}
                  >
                    <Icon className="size-4.5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm leading-none font-medium">
                      {e.user}
                      <span className="ml-2 font-normal text-muted-foreground">{cfg.label}</span>
                    </p>
                    <p className="mt-1.5 truncate text-xs text-muted-foreground">
                      {e.detail}
                      <span className="mx-1.5 text-muted-foreground/40">•</span>
                      {e.place}
                    </p>
                  </div>

                  <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
                    {e.time}
                  </span>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">No events yet.</p>
        )}
      </CardContent>

      <CardFooter className="justify-between border-t text-sm">
        <span className="text-muted-foreground">Showing last 30 minutes</span>
        <span className="font-medium tabular-nums">{rows.length} events</span>
      </CardFooter>
    </Card>
  )
}