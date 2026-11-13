"use client"

import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Receipt,
  ShoppingBag,
  Trash2,
  UserPlus,
  type LucideIcon,
} from "lucide-react"

/* -------------------------------------------------------------------------- */
/*                       Static sample data (replace freely)                  */
/* -------------------------------------------------------------------------- */

const countryData: Record<string, { name: string; code: string }> = {
  pk: { name: "Pakistan", code: "pk" },
  ca: { name: "Canada", code: "ca" },
  it: { name: "Italy", code: "it" },
  de: { name: "Germany", code: "de" },
  cn: { name: "China", code: "cn" },
  us: { name: "United States", code: "us" },
  uk: { name: "United Kingdom", code: "gb" },
  fr: { name: "France", code: "fr" },
  au: { name: "Australia", code: "au" },
  jp: { name: "Japan", code: "jp" },
}

const customer = {
  id: 1,
  name: "John Doe",
  image: "https://randomuser.me/api/portraits/men/1.jpg",
  email: "john@example.com",
  phone: "+1 (555) 123-4567",
  country: "us",
  city: "Austin, Texas",
  joinDate: "Jan 15, 2024",
  status: "Active",
  tags: ["VIP", "Newsletter"],
  totalOrders: 8,
  totalSpent: "$1,250.50",
  avgOrder: "$156.31",
  lastOrder: "Feb 5, 2024",
  address: ["John Doe", "1208 Congress Avenue", "Austin, TX 78701", "United States"],
  notes: "Prefers email contact. Usually orders outerwear and accessories.",
  recentOrders: [
    { id: "ORD-001", date: "Feb 5, 2024", status: "Completed", items: 3, total: "$156.00" },
    { id: "ORD-002", date: "Jan 28, 2024", status: "Completed", items: 2, total: "$89.50" },
    { id: "ORD-003", date: "Jan 15, 2024", status: "Completed", items: 3, total: "$245.75" },
  ],
  monthlySpend: [
    { month: "Sep", amount: 120 },
    { month: "Oct", amount: 210 },
    { month: "Nov", amount: 95 },
    { month: "Dec", amount: 340 },
    { month: "Jan", amount: 245.5 },
    { month: "Feb", amount: 240 },
  ],
  activity: [
    { title: "Placed order ORD-001", note: "3 items · $156.00", time: "Feb 5, 2024", icon: ShoppingBag },
    { title: "Placed order ORD-002", note: "2 items · $89.50", time: "Jan 28, 2024", icon: ShoppingBag },
    { title: "Placed order ORD-003", note: "3 items · $245.75", time: "Jan 15, 2024", icon: ShoppingBag },
    { title: "Account created", note: "Signed up with email", time: "Jan 15, 2024", icon: UserPlus },
  ],
}

const statusClass = (status: string) => {
  switch (status) {
    case "Active":
    case "Completed":
      return "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 border-green-500/30"
    case "Pending":
      return "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/30"
    case "Processing":
      return "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/30"
    case "Inactive":
      return "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/30"
    case "Suspended":
    case "Cancelled":
      return "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/30"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const maxSpend = Math.max(...customer.monthlySpend.map((m) => m.amount))

/* -------------------------------------------------------------------------- */
/*                                 Small parts                                */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  icon: Icon,
  iconBox,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  iconBox: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBox}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function InfoRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/40">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium">{children}</div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function CustomerDetails() {
  const country = countryData[customer.country]

  return (
    <div className="min-w-0 space-y-6">
      {/* BACK + ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="-ml-2">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to customers
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Pencil className="mr-1.5 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/40 text-red-600 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* PROFILE BANNER */}
      <Card className="overflow-hidden py-0">
        <div className="h-20 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent sm:h-24" />
        <CardContent className="px-6 pb-6">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <img
                src={customer.image}
                alt={customer.name}
                className="h-20 w-20 rounded-full border-4 border-background bg-muted object-cover sm:h-24 sm:w-24"
              />
              <div className="space-y-1 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">{customer.name}</h1>
                  <Badge variant="outline" className={statusClass(customer.status)}>
                    {customer.status}
                  </Badge>
                  {customer.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Customer #{customer.id} · Joined {customer.joinDate}
                </p>
              </div>
            </div>

            <Button className="sm:mb-1">
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Send message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total orders"
          value={customer.totalOrders}
          icon={ShoppingBag}
          iconBox="bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400"
        />
        <StatCard
          label="Total spent"
          value={customer.totalSpent}
          icon={DollarSign}
          iconBox="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
        />
        <StatCard
          label="Avg. order value"
          value={customer.avgOrder}
          icon={Receipt}
          iconBox="bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400"
        />
        <StatCard
          label="Last order"
          value={customer.lastOrder}
          icon={Clock}
          iconBox="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ============================ MAIN COLUMN ============================ */}
        <div className="min-w-0 space-y-6">
          {/* RECENT ORDERS */}
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div className="space-y-1.5">
                <CardTitle>Recent orders</CardTitle>
                <CardDescription>Latest {customer.recentOrders.length} of {customer.totalOrders} orders.</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View all
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="pl-6">Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden sm:table-cell">Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {customer.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="pl-6 font-medium">{order.id}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{order.date}</TableCell>
                      <TableCell className="hidden sm:table-cell">{order.items}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusClass(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right font-medium">{order.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* SPENDING */}
          <Card>
            <CardHeader>
              <CardTitle>Spending</CardTitle>
              <CardDescription>Amount spent per month over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-44 items-end gap-3 sm:gap-5">
                {customer.monthlySpend.map((m) => (
                  <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-xs font-medium">${m.amount % 1 ? m.amount.toFixed(2) : m.amount}</span>
                    <div
                      className="w-full max-w-12 rounded-t-md bg-primary/80"
                      style={{ height: `${(m.amount / maxSpend) * 100}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{m.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ACTIVITY */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Recent actions by this customer.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-6">
                {customer.activity.map((item, i) => {
                  const Icon = item.icon
                  const isLast = i === customer.activity.length - 1
                  return (
                    <li key={item.title} className="relative flex gap-4">
                      {!isLast && (
                        <span
                          aria-hidden
                          className="absolute left-[17px] top-9 h-[calc(100%-12px)] w-px bg-border"
                        />
                      )}
                      <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-muted/60">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-0.5 pt-0.5">
                        <div className="flex flex-wrap items-center justify-between gap-x-4">
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.note}</p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* ============================== SIDEBAR ============================== */}
        <aside className="min-w-0 space-y-6">
          {/* CONTACT */}
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow icon={Mail} label="Email">
                <span className="break-all">{customer.email}</span>
              </InfoRow>
              <InfoRow icon={Phone} label="Phone">
                {customer.phone}
              </InfoRow>
              <InfoRow icon={MapPin} label="Location">
                <span className="flex items-center gap-2">
                  <img
                    src={`https://flagcdn.com/24x18/${country.code}.png`}
                    alt=""
                    className="h-4 w-6 rounded-sm border"
                  />
                  {customer.city}, {country.name}
                </span>
              </InfoRow>
              <InfoRow icon={Calendar} label="Customer since">
                {customer.joinDate}
              </InfoRow>
            </CardContent>
          </Card>

          {/* DEFAULT ADDRESS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Default address</CardTitle>
              <Badge variant="secondary">Shipping</Badge>
            </CardHeader>
            <CardContent>
              <address className="space-y-0.5 text-sm not-italic">
                {customer.address.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </address>
            </CardContent>
          </Card>

          {/* NOTES */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{customer.notes}</p>
              <Separator />
              <Button variant="outline" size="sm" className="w-full">
                Edit notes
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}