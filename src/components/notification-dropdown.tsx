import { useState } from "react"
import {
  Bell,
  BellOff,
  CheckCheck,
  CreditCard,
  LifeBuoy,
  RefreshCw,
  Server,
  ShieldCheck,
  ShoppingCart,
  Star,
  UserPlus,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type Notification = {
  id: number
  title: string
  description: string
  time: string
  icon: LucideIcon
  color: string
  unread?: boolean
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "New order placed",
    description: "Order #1234 has been placed",
    time: "2m ago",
    icon: ShoppingCart,
    color: "bg-blue-500/20 text-blue-400 border border-blue-500/20",
    unread: true,
  },
  {
    id: 2,
    title: "Payment received",
    description: "₹4,500 received from client",
    time: "1h ago",
    icon: CreditCard,
    color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20",
    unread: true,
  },
  {
    id: 3,
    title: "New user registered",
    description: "A new user joined your platform",
    time: "3h ago",
    icon: UserPlus,
    color: "bg-violet-500/20 text-violet-400 border border-violet-500/20",
  },
  {
    id: 4,
    title: "Password changed",
    description: "A user updated their account password",
    time: "1h ago",
    icon: ShieldCheck,
    color: "bg-amber-500/20 text-amber-400 border border-amber-500/20",
  },
  {
    id: 5,
    title: "Subscription renewed",
    description: "A user renewed their subscription plan",
    time: "10m ago",
    icon: RefreshCw,
    color: "bg-rose-500/20 text-rose-400 border border-rose-500/20",
  },
  {
    id: 6,
    title: "Support ticket opened",
    description: "A user submitted a new support request",
    time: "5m ago",
    icon: LifeBuoy,
    color: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/20",
  },
  {
    id: 7,
    title: "New review received",
    description: "A customer left a 5-star review",
    time: "20m ago",
    icon: Star,
    color: "bg-lime-500/20 text-lime-400 border border-lime-500/20",
  },
  {
    id: 8,
    title: "Server restarted",
    description: "Production server was successfully restarted",
    time: "45m ago",
    icon: Server,
    color: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/20",
  },
]

type Tab = "all" | "unread"

export function NotificationDropdown() {
  const [items, setItems] = useState(initialNotifications)
  const [tab, setTab] = useState<Tab>("all")

  const unreadCount = items.filter((n) => n.unread).length
  const visible = tab === "unread" ? items.filter((n) => n.unread) : items

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })))

  const markRead = (id: number) =>
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative h-9 w-9 [&_svg]:size-5!"
        >
          <Bell />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border p-0 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {unreadCount} new
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
          >
            <CheckCheck className="size-3.5" />
            Mark all as read
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b px-4 pb-2">
          {(["all", "unread"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                tab === value
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {value}
              {value === "unread" && unreadCount > 0 && ` (${unreadCount})`}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <BellOff className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">You're all caught up</p>
              <p className="text-xs text-muted-foreground">
                No unread notifications right now.
              </p>
            </div>
          ) : (
            visible.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markRead(item.id)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                    item.unread && "bg-primary/5"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      item.color
                    )}
                  >
                    <Icon className="size-4.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-tight">
                      {item.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                    <span className="mt-1 block text-[11px] text-muted-foreground/80">
                      {item.time}
                    </span>
                  </div>

                  {item.unread && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-2">
          <Button variant="ghost" className="w-full text-sm">
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}