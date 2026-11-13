"use client"

import { useState } from "react"
import {
  BarChart3,
  Briefcase,
  Calendar,
  Cloud,
  CreditCard,
  File,
  FileText,
  FolderKanban,
  Grid2x2Plus,
  Inbox,
  MessageCircle,
  Search,
  SearchX,
  Settings,
  ShoppingCart,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type AppItem = {
  icon: LucideIcon
  label: string
  color: string
}

const appItems: AppItem[] = [
  { icon: FolderKanban, label: "Projects", color: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300" },
  { icon: FileText, label: "Invoice", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  { icon: Users, label: "Teams", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  { icon: MessageCircle, label: "Chat", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { icon: ShoppingCart, label: "Billing", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
  { icon: CreditCard, label: "Payment", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { icon: Briefcase, label: "Management", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { icon: Inbox, label: "Inbox", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
  { icon: File, label: "Docs", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  { icon: Calendar, label: "Events", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
  { icon: Cloud, label: "Cloud", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  { icon: Store, label: "Store", color: "bg-red-500/10 text-red-600 dark:text-red-400" },
  { icon: BarChart3, label: "Analytics", color: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400" },
  { icon: Settings, label: "Settings", color: "bg-slate-500/10 text-slate-600 dark:text-slate-300" },
]

export function AppLauncherDropdown() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = appItems.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase())
  )

  // Clear the search each time the panel closes
  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    if (!value) setQuery("")
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Apps"
          className="h-9 w-9 [&_svg]:size-5!"
        >
          <Grid2x2Plus />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl p-0 shadow-xl"
      >
        {/* Header + search */}
        <div className="space-y-3 border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Apps</h3>
            <span className="text-xs text-muted-foreground">
              {appItems.length} available
            </span>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search apps..."
              className="h-8 w-full rounded-lg border bg-muted/40 pr-3 pl-9 text-sm outline-hidden transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background"
            />
          </div>
        </div>

        {/* App grid */}
        <div className="max-h-80 overflow-y-auto p-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <SearchX className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No apps found</p>
              <p className="text-xs text-muted-foreground">
                Try a different search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {filtered.map((item) => {
                const Icon = item.icon

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleOpenChange(false)}
                    className="group flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-muted"
                  >
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110",
                        item.color
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <span className="w-full truncate text-center text-xs font-medium">
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-2">
          <Button variant="ghost" className="h-8 w-full text-sm">
            View all apps
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}