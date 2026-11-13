"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Bell,
  Calendar,
  CircleHelp,
  ClipboardList,
  CornerDownLeft,
  FileText,
  FolderOpen,
  KeyRound,
  Landmark,
  LayoutDashboard,
  MessageCircle,
  PackagePlus,
  Search,
  ShoppingCart,
  User,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

type SearchItem = {
  label: string
  to: string
  icon: LucideIcon
  color: string
  keywords?: string[]
}

type SearchGroup = {
  heading: string
  items: SearchItem[]
}

// Routes match the sidebar menu. Add or remove entries here.
const groups: SearchGroup[] = [
  {
    heading: "Dashboard",
    items: [
      { label: "Analytics", to: "/dashboard/analytics", icon: BarChart3, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400", keywords: ["stats", "charts"] },
      { label: "CRM", to: "/dashboard/crm", icon: BriefcaseBusiness, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", keywords: ["customers", "leads"] },
      { label: "eCommerce", to: "/dashboard/eCommerce", icon: LayoutDashboard, color: "bg-sky-500/10 text-sky-600 dark:text-sky-400", keywords: ["sales", "store"] },
    ],
  },
  {
    heading: "eCommerce",
    items: [
      { label: "Product List", to: "/eCommerce/product-list", icon: ShoppingCart, color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400", keywords: ["products", "items"] },
      { label: "Add Product", to: "/eCommerce/add-product", icon: PackagePlus, color: "bg-teal-500/10 text-teal-600 dark:text-teal-400", keywords: ["new", "create"] },
      { label: "Order List", to: "/eCommerce/order-list", icon: ClipboardList, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", keywords: ["orders"] },
      { label: "Customer List", to: "/eCommerce/customer-list", icon: Users, color: "bg-rose-500/10 text-rose-600 dark:text-rose-400", keywords: ["customers", "clients"] },
      { label: "Invoice", to: "/eCommerce/invoice", icon: FileText, color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", keywords: ["billing", "payment"] },
    ],
  },
  {
    heading: "Applications",
    items: [
      { label: "Chatbox", to: "/app/chatbox", icon: MessageCircle, color: "bg-pink-500/10 text-pink-600 dark:text-pink-400", keywords: ["messages", "chat"] },
      { label: "Calendar", to: "/app/calendar", icon: Calendar, color: "bg-orange-500/10 text-orange-600 dark:text-orange-400", keywords: ["events", "schedule"] },
      { label: "File Manager", to: "/app/file-manager", icon: FolderOpen, color: "bg-sky-500/10 text-sky-600 dark:text-sky-400", keywords: ["files", "documents"] },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Profile", to: "/account/profile", icon: User, color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
      { label: "Edit Profile", to: "/account/edit-profile", icon: UserCog, color: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400" },
      { label: "Password Setting", to: "/account/password-setting", icon: KeyRound, color: "bg-slate-500/10 text-slate-600 dark:text-slate-300", keywords: ["security", "settings"] },
      { label: "Notifications", to: "/account/notifications", icon: Bell, color: "bg-lime-500/10 text-lime-600 dark:text-lime-400" },
    ],
  },
  {
    heading: "More",
    items: [
      { label: "Pricing", to: "/pricing/pricing-tables", icon: Landmark, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", keywords: ["plans"] },
      { label: "Documentation", to: "/docs", icon: BookOpen, color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", keywords: ["docs", "help"] },
      { label: "FAQ", to: "/faq", icon: CircleHelp, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", keywords: ["questions", "help"] },
    ],
  },
]

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border bg-background px-1 font-sans text-[10px] font-medium text-muted-foreground">
      {children}
    </kbd>
  )
}

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  // Keyboard shortcut (Ctrl + K / Cmd + K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const go = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <>
      {/* Trigger */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className="h-9 w-9 [&_svg]:size-5!"
      >
        <Search />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, apps, settings..." />

        <CommandList className="max-h-[420px]">
          <CommandEmpty>
            <div className="flex flex-col items-center gap-1 py-10 text-center">
              <p className="text-sm font-medium">No results found</p>
              <p className="text-xs text-muted-foreground">
                Try a different keyword.
              </p>
            </div>
          </CommandEmpty>

          {groups.map((group, groupIndex) => (
            <React.Fragment key={group.heading}>
              {groupIndex > 0 && <CommandSeparator />}

              <CommandGroup heading={group.heading}>
                {group.items.map((item) => {
                  const Icon = item.icon

                  return (
                    <CommandItem
                      key={item.to}
                      value={`${group.heading} ${item.label}`}
                      keywords={item.keywords}
                      onSelect={() => go(item.to)}
                      className="group cursor-pointer gap-3 rounded-lg py-2"
                    >
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg",
                          item.color
                        )}
                      >
                        <Icon className="size-4" />
                      </div>

                      <span className="text-sm">{item.label}</span>

                      <CornerDownLeft className="ml-auto size-3.5 text-muted-foreground opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>

        {/* Footer: keyboard hints */}
        <div className="flex items-center gap-4 border-t bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd>
            Open
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Kbd>Esc</Kbd>
            Close
          </span>
        </div>
      </CommandDialog>
    </>
  )
}