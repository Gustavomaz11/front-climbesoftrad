"use client"

import { useMemo, useState, type ReactNode } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Columns3,
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react"

/* -------------------------------------------------------------------------- */
/*                              Types & constants                             */
/* -------------------------------------------------------------------------- */

type Order = {
  id: number
  orderNumber: string
  customerName: string
  customerImage?: string
  email: string
  total: string
  products: number
  date: string // ISO yyyy-mm-dd
  status: string
}

type Range = { min: number; max: number }
type DateRange = { from: string; to: string }

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50]
const STATUSES = ["Pending", "Processing", "Completed", "Cancelled"]

const TOTAL_RANGES: Record<string, { label: string; range: Range }> = {
  low: { label: "Under $100", range: { min: 0, max: 99.99 } },
  mid: { label: "$100 – $250", range: { min: 100, max: 250 } },
  high: { label: "Over $250", range: { min: 250.01, max: Infinity } },
}

const COLUMN_LABELS: Record<string, string> = {
  orderNumber: "Order",
  customer: "Customer",
  email: "Email",
  products: "Products",
  total: "Total",
  date: "Date",
  status: "Status",
}

const statusClass = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 border-green-500/30"
    case "Pending":
      return "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/30"
    case "Processing":
      return "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/30"
    case "Cancelled":
      return "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/30"
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/30"
  }
}

const toAmount = (value: string) => Number(value.replace(/[^0-9.]/g, "")) || 0

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

const rangeFilter: FilterFn<Order> = (row, columnId, value: Range) => {
  const n = Number(row.getValue(columnId))
  return n >= value.min && n <= value.max
}

const dateRangeFilter: FilterFn<Order> = (row, columnId, value: DateRange) => {
  const d = String(row.getValue(columnId))
  return (!value.from || d >= value.from) && (!value.to || d <= value.to)
}

const initialData: Order[] = [
  { id: 1, orderNumber: "ORD-001", customerName: "John Doe", customerImage: "https://randomuser.me/api/portraits/men/10.jpg", email: "john@example.com", total: "$156.00", products: 3, date: "2024-02-01", status: "Completed" },
  { id: 2, orderNumber: "ORD-002", customerName: "Sarah Smith", customerImage: "https://randomuser.me/api/portraits/women/20.jpg", email: "sarah@example.com", total: "$89.50", products: 2, date: "2024-02-02", status: "Processing" },
  { id: 3, orderNumber: "ORD-003", customerName: "Michael Brown", customerImage: "https://randomuser.me/api/portraits/men/30.jpg", email: "michael@example.com", total: "$245.75", products: 5, date: "2024-02-03", status: "Pending" },
  { id: 4, orderNumber: "ORD-004", customerName: "Emily Davis", customerImage: "https://randomuser.me/api/portraits/women/40.jpg", email: "emily@example.com", total: "$123.00", products: 2, date: "2024-02-04", status: "Completed" },
  { id: 5, orderNumber: "ORD-005", customerName: "Robert Wilson", customerImage: "https://randomuser.me/api/portraits/men/50.jpg", email: "robert@example.com", total: "$198.99", products: 4, date: "2024-02-05", status: "Processing" },
  { id: 6, orderNumber: "ORD-006", customerName: "Lisa Anderson", customerImage: "https://randomuser.me/api/portraits/women/60.jpg", email: "lisa@example.com", total: "$67.50", products: 1, date: "2024-02-06", status: "Cancelled" },
  { id: 7, orderNumber: "ORD-007", customerName: "James Taylor", customerImage: "https://randomuser.me/api/portraits/men/70.jpg", email: "james@example.com", total: "$312.45", products: 6, date: "2024-02-07", status: "Completed" },
  { id: 8, orderNumber: "ORD-008", customerName: "Jennifer Martinez", customerImage: "https://randomuser.me/api/portraits/women/80.jpg", email: "jennifer@example.com", total: "$145.30", products: 3, date: "2024-02-08", status: "Pending" },
  { id: 9, orderNumber: "ORD-009", customerName: "David Garcia", customerImage: "https://randomuser.me/api/portraits/men/90.jpg", email: "david@example.com", total: "$220.00", products: 4, date: "2024-02-09", status: "Processing" },
  { id: 10, orderNumber: "ORD-010", customerName: "Amanda Thomas", customerImage: "https://randomuser.me/api/portraits/women/90.jpg", email: "amanda@example.com", total: "$89.99", products: 2, date: "2024-02-10", status: "Completed" },
  { id: 11, orderNumber: "ORD-011", customerName: "Christopher Lee", customerImage: "https://randomuser.me/api/portraits/men/11.jpg", email: "chris@example.com", total: "$276.50", products: 5, date: "2024-02-11", status: "Processing" },
  { id: 12, orderNumber: "ORD-012", customerName: "Michelle White", customerImage: "https://randomuser.me/api/portraits/women/12.jpg", email: "michelle@example.com", total: "$134.75", products: 3, date: "2024-02-12", status: "Pending" },
  { id: 13, orderNumber: "ORD-013", customerName: "Daniel Harris", customerImage: "https://randomuser.me/api/portraits/men/13.jpg", email: "daniel@example.com", total: "$198.50", products: 4, date: "2024-02-13", status: "Completed" },
  { id: 14, orderNumber: "ORD-014", customerName: "Jessica Clark", customerImage: "https://randomuser.me/api/portraits/women/14.jpg", email: "jessica@example.com", total: "$299.99", products: 5, date: "2024-02-14", status: "Cancelled" },
  { id: 15, orderNumber: "ORD-015", customerName: "Matthew Rodriguez", customerImage: "https://randomuser.me/api/portraits/men/15.jpg", email: "matthew@example.com", total: "$156.25", products: 3, date: "2024-02-15", status: "Processing" },
]

const today = () => new Date().toISOString().slice(0, 10)

const emptyForm = {
  customerName: "",
  email: "",
  total: "",
  products: "",
  date: today(),
  status: "",
  notes: "",
}

/** Page numbers with ellipsis, e.g. 1 … 4 5 6 … 12 (1-based). */
function getPageNumbers(current: number, total: number): (number | "ellipsis-start" | "ellipsis-end")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [1]
  const left = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)

  if (left > 2) pages.push("ellipsis-start")
  for (let p = left; p <= right; p++) pages.push(p)
  if (right < total - 1) pages.push("ellipsis-end")

  pages.push(total)
  return pages
}

/* -------------------------------------------------------------------------- */
/*                               Stat cards (static)                          */
/* -------------------------------------------------------------------------- */

type Stat = {
  label: string
  value: string
  change: string
  trend: "up" | "down"
  /** true when "up" is good news (e.g. completed), false when "up" is bad (e.g. failed) */
  upIsGood: boolean
  icon: ReactNode
  iconBox: string
}

const stats: Stat[] = [
  {
    label: "Pending payment",
    value: "156",
    change: "8.2%",
    trend: "up",
    upIsGood: false,
    icon: <Clock className="h-5 w-5" />,
    iconBox: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
  },
  {
    label: "Completed",
    value: "12,689",
    change: "14.6%",
    trend: "up",
    upIsGood: true,
    icon: <CheckCircle2 className="h-5 w-5" />,
    iconBox: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  {
    label: "Refunded",
    value: "124",
    change: "3.1%",
    trend: "down",
    upIsGood: false,
    icon: <RotateCcw className="h-5 w-5" />,
    iconBox: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  },
  {
    label: "Failed",
    value: "32",
    change: "1.8%",
    trend: "down",
    upIsGood: false,
    icon: <AlertCircle className="h-5 w-5" />,
    iconBox: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
  },
]

function OrderStatCard({ stat }: { stat: Stat }) {
  const good = stat.trend === "up" ? stat.upIsGood : !stat.upIsGood
  const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.iconBox}`}>
            {stat.icon}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
                good
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400"
              }`}
            >
              <TrendIcon className="h-3 w-3" />
              {stat.change}
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                           Sortable column header                           */
/* -------------------------------------------------------------------------- */

function SortHeader({
  label,
  sorted,
  onToggle,
}: {
  label: string
  sorted: false | "asc" | "desc"
  onToggle: () => void
}) {
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown
  return (
    <Button type="button" variant="ghost" size="sm" className="-ml-3 h-8" onClick={onToggle}>
      {label}
      <Icon className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" />
    </Button>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

export default function OrderList() {
  const [data, setData] = useState<Order[]>(initialData)

  // Table state
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Filter UI state
  const [statusFilter, setStatusFilter] = useState("all")
  const [totalFilter, setTotalFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // New order sheet
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const deleteRows = (ids: number[]) => {
    setData((prev) => prev.filter((o) => !ids.includes(o.id)))
    setRowSelection((prev) => {
      const next = { ...prev }
      ids.forEach((id) => delete next[String(id)])
      return next
    })
  }

  /* ------------------------------- columns -------------------------------- */

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <Checkbox
            aria-label="Select all on this page"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label="Select row"
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
          />
        ),
      },
      {
        id: "orderNumber",
        accessorKey: "orderNumber",
        header: ({ column }) => (
          <SortHeader
            label="Order"
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => <span className="font-medium">{row.original.orderNumber}</span>,
      },
      {
        id: "customer",
        accessorKey: "customerName",
        header: ({ column }) => (
          <SortHeader
            label="Customer"
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => {
          const o = row.original
          return (
            <div className="flex min-w-40 items-center gap-2">
              {o.customerImage ? (
                <img
                  src={o.customerImage}
                  alt={o.customerName}
                  className="h-8 w-8 rounded-full border bg-muted/50 object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted text-xs font-medium">
                  {initials(o.customerName)}
                </div>
              )}
              <span>{o.customerName}</span>
            </div>
          )
        },
      },
      {
        id: "email",
        accessorKey: "email",
        header: "Email",
        enableSorting: false,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
      },
      {
        id: "products",
        accessorKey: "products",
        header: ({ column }) => (
          <SortHeader
            label="Products"
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
      },
      {
        id: "total",
        // Filter and sort by the numeric value, display the formatted string
        accessorFn: (row) => toAmount(row.total),
        filterFn: rangeFilter,
        header: ({ column }) => (
          <SortHeader
            label="Total"
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => <span className="font-medium">{row.original.total}</span>,
      },
      {
        id: "date",
        accessorKey: "date",
        filterFn: dateRangeFilter,
        header: ({ column }) => (
          <SortHeader
            label="Date"
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.date)}</span>,
      },
      {
        id: "status",
        accessorKey: "status",
        filterFn: "equalsString",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant="outline" className={statusClass(row.original.status)}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open actions" className="h-8 w-8 rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => console.log("View order", row.original.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Edit order", row.original.id)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => deleteRows([row.original.id])}
                >
                  <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    []
  )

  /* -------------------------------- table --------------------------------- */

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, columnFilters, sorting, rowSelection, columnVisibility },
    initialState: { pagination: { pageSize: ROWS_PER_PAGE_OPTIONS[0] } },
    getRowId: (row) => String(row.id),
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, value: string) => {
      const o = row.original
      return `${o.orderNumber} ${o.customerName} ${o.email} ${o.status} ${o.total}`
        .toLowerCase()
        .includes(String(value).toLowerCase())
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  /* ------------------------------- filters -------------------------------- */

  const applyStatus = (value: string) => {
    setStatusFilter(value)
    table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value)
  }

  const applyTotal = (value: string) => {
    setTotalFilter(value)
    table.getColumn("total")?.setFilterValue(value === "all" ? undefined : TOTAL_RANGES[value].range)
  }

  const applyDates = (from: string, to: string) => {
    setDateFrom(from)
    setDateTo(to)
    table.getColumn("date")?.setFilterValue(from || to ? { from, to } : undefined)
  }

  const activeFilters = [
    statusFilter !== "all" && { label: statusFilter, clear: () => applyStatus("all") },
    totalFilter !== "all" && { label: TOTAL_RANGES[totalFilter].label, clear: () => applyTotal("all") },
    (dateFrom || dateTo) && {
      label: `${dateFrom ? formatDate(dateFrom) : "Any"} → ${dateTo ? formatDate(dateTo) : "Any"}`,
      clear: () => applyDates("", ""),
    },
  ].filter(Boolean) as { label: string; clear: () => void }[]

  const hasAnyFilter = activeFilters.length > 0 || globalFilter !== ""

  const resetFilters = () => {
    setGlobalFilter("")
    setColumnFilters([])
    setStatusFilter("all")
    setTotalFilter("all")
    setDateFrom("")
    setDateTo("")
  }

  /* ----------------------------- pagination ------------------------------- */

  const selectedCount = Object.keys(rowSelection).length
  const filteredTotal = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = Math.max(1, table.getPageCount())
  const from = filteredTotal === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, filteredTotal)
  const pageNumbers = getPageNumbers(pageIndex + 1, pageCount)
  const showEdgeButtons = pageCount > 5

  /* ------------------------------ create order ----------------------------- */

  const handleSubmit = () => {
    const e: Record<string, string> = {}
    if (!form.customerName.trim()) e.customerName = "Enter the customer name."
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address."
    if (!form.total || !(toAmount(form.total) > 0)) e.total = "Enter an order total."
    setErrors(e)
    if (Object.keys(e).length) return

    setData((prev) => {
      const nextId = Math.max(0, ...prev.map((o) => o.id)) + 1
      return [
        {
          id: nextId,
          orderNumber: `ORD-${String(nextId).padStart(3, "0")}`,
          customerName: form.customerName.trim(),
          email: form.email.trim(),
          total: `$${toAmount(form.total).toFixed(2)}`,
          products: Number(form.products) || 1,
          date: form.date || today(),
          status: form.status || "Pending",
        },
        ...prev,
      ]
    })
    setForm({ ...emptyForm, date: today() })
    setErrors({})
    setOpen(false)
  }

  /* ---------------------------------- UI ---------------------------------- */

  return (
    <div className="min-w-0 space-y-6">
      {/* STAT CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <OrderStatCard key={s.label} stat={s} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:w-[260px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-9"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedCount > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-9"
                  onClick={() => deleteRows(Object.keys(rowSelection).map(Number))}
                >
                  Delete selected ({selectedCount})
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9">
                    <Columns3 className="mr-1.5 h-4 w-4" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((col) => col.getCanHide())
                    .map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        checked={col.getIsVisible()}
                        onCheckedChange={(v) => col.toggleVisibility(!!v)}
                        onSelect={(e) => e.preventDefault()}
                      >
                        {COLUMN_LABELS[col.id] ?? col.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button className="h-9" onClick={() => setOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                New order
              </Button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={applyStatus}>
              <SelectTrigger className="h-9 w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={totalFilter} onValueChange={applyTotal}>
              <SelectTrigger className="h-9 w-full sm:w-[160px]">
                <SelectValue placeholder="Order total" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any total</SelectItem>
                {Object.entries(TOTAL_RANGES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Input
                type="date"
                aria-label="From date"
                className="h-9 sm:w-[150px]"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => applyDates(e.target.value, dateTo)}
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="date"
                aria-label="To date"
                className="h-9 sm:w-[150px]"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => applyDates(dateFrom, e.target.value)}
              />
            </div>

            {hasAnyFilter && (
              <Button variant="ghost" size="sm" className="h-9" onClick={resetFilters}>
                <X className="mr-1 h-4 w-4" />
                Reset
              </Button>
            )}
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.map((f) => (
                <Badge key={f.label} variant="secondary" className="gap-1 pr-1">
                  {f.label}
                  <button
                    type="button"
                    aria-label={`Remove ${f.label} filter`}
                    className="rounded-sm p-0.5 hover:bg-background/60"
                    onClick={f.clear}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* TABLE */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className={header.id === "select" ? "w-10" : undefined}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getVisibleLeafColumns().length}
                      className="h-28 text-center text-muted-foreground"
                    >
                      No orders match your filters.
                      {hasAnyFilter && (
                        <Button variant="link" className="px-1" onClick={resetFilters}>
                          Reset filters
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* FOOTER */}
          <div className="flex flex-col gap-4 pt-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <Select value={String(pageSize)} onValueChange={(v) => table.setPageSize(Number(v))}>
                  <SelectTrigger className="h-8 w-[72px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROWS_PER_PAGE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <span>
                Showing {from}–{to} of {filteredTotal}
                {filteredTotal !== data.length && ` (filtered from ${data.length})`}
              </span>

              {selectedCount > 0 && <span>{selectedCount} selected</span>}
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {showEdgeButtons && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="First page"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.setPageIndex(0)}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label="Previous page"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {pageNumbers.map((p) =>
                typeof p === "string" ? (
                  <span key={p} className="px-1.5 text-sm text-muted-foreground">
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    size="icon"
                    className="h-8 w-8"
                    variant={p === pageIndex + 1 ? "default" : "outline"}
                    aria-label={`Page ${p}`}
                    aria-current={p === pageIndex + 1 ? "page" : undefined}
                    onClick={() => table.setPageIndex(p - 1)}
                  >
                    {p}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label="Next page"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {showEdgeButtons && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Last page"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.setPageIndex(pageCount - 1)}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>

        {/* NEW ORDER SHEET */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[420px]">
            <SheetHeader>
              <SheetTitle>Create new order</SheetTitle>
            </SheetHeader>

            <div className="space-y-4 px-4 pb-4">
              <div className="space-y-2">
                <Label>Customer name</Label>
                <Input
                  placeholder="Enter customer name"
                  value={form.customerName}
                  aria-invalid={!!errors.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                />
                {errors.customerName && <p className="text-sm text-destructive">{errors.customerName}</p>}
              </div>

              <div className="space-y-2">
                <Label>Email address</Label>
                <Input
                  type="email"
                  placeholder="customer@example.com"
                  value={form.email}
                  aria-invalid={!!errors.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order total</Label>
                  <Input
                    placeholder="$0.00"
                    value={form.total}
                    aria-invalid={!!errors.total}
                    onChange={(e) => setForm({ ...form, total: e.target.value })}
                  />
                  {errors.total && <p className="text-sm text-destructive">{errors.total}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Products</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={form.products}
                    onChange={(e) => setForm({ ...form, products: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Order notes</Label>
                <Textarea
                  rows={3}
                  placeholder="Add any notes about the order"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Discard
                </Button>
                <Button onClick={handleSubmit}>Create order</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </Card>
    </div>
  )
}