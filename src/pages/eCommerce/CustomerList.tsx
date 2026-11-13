"use client"

import { useMemo, useState, type ReactNode } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type Row,
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
import { useIsMobile } from "@/hooks/use-mobile"
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
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  DollarSign,
  Eye,
  Globe,
  MoreVertical,
  Pencil,
  Plus,
  Receipt,
  Search,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react"

/* -------------------------------------------------------------------------- */
/*                              Types & constants                             */
/* -------------------------------------------------------------------------- */

type Customer = {
  id: number
  name: string
  image?: string
  email: string
  phone: string
  joinDate: string // ISO yyyy-mm-dd
  totalOrders: number
  totalSpent: string
  country: string
}

type Range = { min: number; max: number }
type DateRange = { from: string; to: string }

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
  br: { name: "Brazil", code: "br" },
}

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50]

const ORDER_RANGES: Record<string, { label: string; range: Range }> = {
  few: { label: "1–5 orders", range: { min: 1, max: 5 } },
  some: { label: "6–10 orders", range: { min: 6, max: 10 } },
  many: { label: "11+ orders", range: { min: 11, max: Infinity } },
}

const SPENT_RANGES: Record<string, { label: string; range: Range }> = {
  low: { label: "Under $1,000", range: { min: 0, max: 999.99 } },
  mid: { label: "$1,000 – $2,500", range: { min: 1000, max: 2500 } },
  high: { label: "Over $2,500", range: { min: 2500.01, max: Infinity } },
}

const COLUMN_LABELS: Record<string, string> = {
  name: "Customer",
  email: "Email",
  phone: "Phone",
  totalOrders: "Orders",
  totalSpent: "Total spent",
  joinDate: "Joined",
  country: "Country",
}

const toAmount = (value: string) => Number(value.replace(/[^0-9.]/g, "")) || 0

const money = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD" })

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

const flagSrc = (country: string, size = "48x36") =>
  `https://flagcdn.com/${size}/${countryData[country]?.code ?? country}.png`

const rangeFilter: FilterFn<Customer> = (row, columnId, value: Range) => {
  const n = Number(row.getValue(columnId))
  return n >= value.min && n <= value.max
}

const dateRangeFilter: FilterFn<Customer> = (row, columnId, value: DateRange) => {
  const d = String(row.getValue(columnId))
  return (!value.from || d >= value.from) && (!value.to || d <= value.to)
}

const initialData: Customer[] = [
  { id: 1, name: "John Doe", image: "https://randomuser.me/api/portraits/men/1.jpg", email: "john@example.com", phone: "+1 (555) 123-4567", joinDate: "2024-01-15", totalOrders: 8, totalSpent: "$1,250.50", country: "us" },
  { id: 2, name: "Sarah Smith", image: "https://randomuser.me/api/portraits/women/2.jpg", email: "sarah@example.com", phone: "+1 (555) 234-5678", joinDate: "2024-01-20", totalOrders: 5, totalSpent: "$890.00", country: "ca" },
  { id: 3, name: "Michael Brown", image: "https://randomuser.me/api/portraits/men/3.jpg", email: "michael@example.com", phone: "+1 (555) 345-6789", joinDate: "2024-01-10", totalOrders: 12, totalSpent: "$2,150.75", country: "br" },
  { id: 4, name: "Emily Davis", image: "https://randomuser.me/api/portraits/women/4.jpg", email: "emily@example.com", phone: "+1 (555) 456-7890", joinDate: "2024-02-01", totalOrders: 3, totalSpent: "$425.00", country: "de" },
  { id: 5, name: "Robert Wilson", image: "https://randomuser.me/api/portraits/men/5.jpg", email: "robert@example.com", phone: "+1 (555) 567-8901", joinDate: "2023-12-20", totalOrders: 15, totalSpent: "$3,200.25", country: "it" },
  { id: 6, name: "Lisa Anderson", image: "https://randomuser.me/api/portraits/women/6.jpg", email: "lisa@example.com", phone: "+1 (555) 678-9012", joinDate: "2024-01-25", totalOrders: 2, totalSpent: "$199.99", country: "fr" },
  { id: 7, name: "James Taylor", image: "https://randomuser.me/api/portraits/men/7.jpg", email: "james@example.com", phone: "+1 (555) 789-0123", joinDate: "2023-11-30", totalOrders: 20, totalSpent: "$4,567.50", country: "au" },
  { id: 8, name: "Jennifer Martinez", image: "https://randomuser.me/api/portraits/women/8.jpg", email: "jennifer@example.com", phone: "+1 (555) 890-1234", joinDate: "2024-01-05", totalOrders: 7, totalSpent: "$1,050.00", country: "pk" },
  { id: 9, name: "David Garcia", image: "https://randomuser.me/api/portraits/men/9.jpg", email: "david@example.com", phone: "+1 (555) 901-2345", joinDate: "2024-02-03", totalOrders: 1, totalSpent: "$150.00", country: "cn" },
  { id: 10, name: "Amanda Thomas", image: "https://randomuser.me/api/portraits/women/10.jpg", email: "amanda@example.com", phone: "+1 (555) 012-3456", joinDate: "2024-01-30", totalOrders: 6, totalSpent: "$875.50", country: "jp" },
  { id: 11, name: "Christopher Lee", image: "https://randomuser.me/api/portraits/men/11.jpg", email: "chris@example.com", phone: "+1 (555) 123-4567", joinDate: "2023-12-15", totalOrders: 18, totalSpent: "$3,500.00", country: "us" },
  { id: 12, name: "Michelle White", image: "https://randomuser.me/api/portraits/women/12.jpg", email: "michelle@example.com", phone: "+1 (555) 234-5678", joinDate: "2024-01-28", totalOrders: 4, totalSpent: "$650.75", country: "ca" },
  { id: 13, name: "Daniel Harris", image: "https://randomuser.me/api/portraits/men/13.jpg", email: "daniel@example.com", phone: "+1 (555) 345-6789", joinDate: "2024-02-02", totalOrders: 9, totalSpent: "$1,400.00", country: "uk" },
  { id: 14, name: "Jessica Clark", image: "https://randomuser.me/api/portraits/women/14.jpg", email: "jessica@example.com", phone: "+1 (555) 456-7890", joinDate: "2024-01-18", totalOrders: 11, totalSpent: "$2,300.50", country: "de" },
  { id: 15, name: "Matthew Rodriguez", image: "https://randomuser.me/api/portraits/men/15.jpg", email: "matthew@example.com", phone: "+1 (555) 567-8901", joinDate: "2024-01-22", totalOrders: 5, totalSpent: "$950.00", country: "it" },
]

const today = () => new Date().toISOString().slice(0, 10)

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  joinDate: today(),
  country: "",
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
/*                                 Small parts                                */
/* -------------------------------------------------------------------------- */

function Avatar({ name, image, size = "h-8 w-8" }: { name: string; image?: string; size?: string }) {
  return image ? (
    <img src={image} alt={name} className={`${size} rounded-full border bg-muted/50 object-cover`} />
  ) : (
    <div className={`${size} flex items-center justify-center rounded-full border bg-muted text-xs font-medium`}>
      {initials(name)}
    </div>
  )
}

function CountryCell({ country, flag = "h-5 w-7" }: { country: string; flag?: string }) {
  return (
    <div className="flex min-w-32 items-center gap-2">
      <img
        src={flagSrc(country)}
        alt=""
        className={`${flag} rounded-sm border object-cover`}
      />
      <span>{countryData[country]?.name ?? "Unknown"}</span>
    </div>
  )
}

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

function RowActions({ customer, onDelete }: { customer: Customer; onDelete: (id: number) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open actions" className="h-8 w-8 rounded-full">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => console.log("View customer", customer.id)}>
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log("Edit customer", customer.id)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => onDelete(customer.id)}
        >
          <Trash2 className="mr-2 h-4 w-4 text-red-600" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Stat cards                                  */
/* -------------------------------------------------------------------------- */

function CustomerStatCard({
  icon,
  iconBox,
  label,
  value,
  change,
}: {
  icon: ReactNode
  iconBox: string
  label: string
  value: string | number
  /** Static sample trend, replace with real data */
  change: string
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBox}`}>
            {icon}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              {change}
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

export default function CustomerList() {
  const isMobile = useIsMobile()
  const [data, setData] = useState<Customer[]>(initialData)

  // Table state
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Filter UI state
  const [countryFilter, setCountryFilter] = useState("all")
  const [ordersFilter, setOrdersFilter] = useState("all")
  const [spentFilter, setSpentFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // New customer sheet
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const deleteRows = (ids: number[]) => {
    setData((prev) => prev.filter((c) => !ids.includes(c.id)))
    setRowSelection((prev) => {
      const next = { ...prev }
      ids.forEach((id) => delete next[String(id)])
      return next
    })
  }

  /* ------------------------------ stat values ------------------------------ */

  const stats = useMemo(() => {
    const revenue = data.reduce((sum, c) => sum + toAmount(c.totalSpent), 0)
    const orders = data.reduce((sum, c) => sum + c.totalOrders, 0)
    return {
      customers: data.length,
      countries: new Set(data.map((c) => c.country)).size,
      revenue,
      aov: orders ? revenue / orders : 0,
    }
  }, [data])

  /* ------------------------------- columns -------------------------------- */

  const columns = useMemo<ColumnDef<Customer>[]>(
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
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <SortHeader
            label="Customer"
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <div className="flex min-w-40 items-center gap-2">
            <Avatar name={row.original.name} image={row.original.image} />
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      },
      {
        id: "email",
        accessorKey: "email",
        header: "Email",
        enableSorting: false,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
      },
      {
        id: "phone",
        accessorKey: "phone",
        header: "Phone",
        enableSorting: false,
        cell: ({ row }) => <span className="whitespace-nowrap">{row.original.phone}</span>,
      },
      {
        id: "totalOrders",
        accessorKey: "totalOrders",
        filterFn: rangeFilter,
        header: ({ column }) => (
          <SortHeader
            label="Orders"
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
      },
      {
        id: "totalSpent",
        // Filter and sort by the numeric value, display the formatted string
        accessorFn: (row) => toAmount(row.totalSpent),
        filterFn: rangeFilter,
        header: ({ column }) => (
          <SortHeader
            label="Total spent"
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => <span className="font-medium">{row.original.totalSpent}</span>,
      },
      {
        id: "joinDate",
        accessorKey: "joinDate",
        filterFn: dateRangeFilter,
        header: ({ column }) => (
          <SortHeader
            label="Joined"
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.joinDate)}</span>,
      },
      {
        id: "country",
        // Sort by country name, filter by country code
        accessorFn: (row) => row.country,
        sortingFn: (a, b) =>
          (countryData[a.original.country]?.name ?? "").localeCompare(
            countryData[b.original.country]?.name ?? ""
          ),
        filterFn: "equalsString",
        header: ({ column }) => (
          <SortHeader
            label="Country"
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => <CountryCell country={row.original.country} />,
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <RowActions customer={row.original} onDelete={(id) => deleteRows([id])} />
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
      const c = row.original
      return `${c.name} ${c.email} ${c.phone} ${countryData[c.country]?.name ?? ""}`
        .toLowerCase()
        .includes(String(value).toLowerCase())
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  /* ------------------------------- filters -------------------------------- */

  const applyCountry = (value: string) => {
    setCountryFilter(value)
    table.getColumn("country")?.setFilterValue(value === "all" ? undefined : value)
  }

  const applyOrders = (value: string) => {
    setOrdersFilter(value)
    table.getColumn("totalOrders")?.setFilterValue(value === "all" ? undefined : ORDER_RANGES[value].range)
  }

  const applySpent = (value: string) => {
    setSpentFilter(value)
    table.getColumn("totalSpent")?.setFilterValue(value === "all" ? undefined : SPENT_RANGES[value].range)
  }

  const applyDates = (from: string, to: string) => {
    setDateFrom(from)
    setDateTo(to)
    table.getColumn("joinDate")?.setFilterValue(from || to ? { from, to } : undefined)
  }

  const activeFilters = [
    countryFilter !== "all" && {
      label: countryData[countryFilter]?.name ?? countryFilter,
      clear: () => applyCountry("all"),
    },
    ordersFilter !== "all" && { label: ORDER_RANGES[ordersFilter].label, clear: () => applyOrders("all") },
    spentFilter !== "all" && { label: SPENT_RANGES[spentFilter].label, clear: () => applySpent("all") },
    (dateFrom || dateTo) && {
      label: `Joined ${dateFrom ? formatDate(dateFrom) : "any"} → ${dateTo ? formatDate(dateTo) : "any"}`,
      clear: () => applyDates("", ""),
    },
  ].filter(Boolean) as { label: string; clear: () => void }[]

  const hasAnyFilter = activeFilters.length > 0 || globalFilter !== ""

  const resetFilters = () => {
    setGlobalFilter("")
    setColumnFilters([])
    setCountryFilter("all")
    setOrdersFilter("all")
    setSpentFilter("all")
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
  const rows = table.getRowModel().rows

  /* ----------------------------- add customer ------------------------------ */

  const handleSubmit = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Enter the customer's name."
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address."
    if (!form.country) e.country = "Select a country."
    setErrors(e)
    if (Object.keys(e).length) return

    setData((prev) => [
      {
        id: Math.max(0, ...prev.map((c) => c.id)) + 1,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || "—",
        joinDate: form.joinDate || today(),
        totalOrders: 0,
        totalSpent: "$0.00",
        country: form.country,
      },
      ...prev,
    ])
    setForm({ ...emptyForm, joinDate: today() })
    setErrors({})
    setOpen(false)
  }

  /* ---------------------------------- UI ---------------------------------- */

  return (
    <div className="min-w-0 space-y-6">
      {/* STAT CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CustomerStatCard
          icon={<Users className="h-5 w-5" />}
          iconBox="bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400"
          label="Total customers"
          value={stats.customers}
          change="12.5%"
        />
        <CustomerStatCard
          icon={<Globe className="h-5 w-5" />}
          iconBox="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
          label="Countries"
          value={stats.countries}
          change="2 new"
        />
        <CustomerStatCard
          icon={<DollarSign className="h-5 w-5" />}
          iconBox="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
          label="Total revenue"
          value={money(stats.revenue)}
          change="9.3%"
        />
        <CustomerStatCard
          icon={<Receipt className="h-5 w-5" />}
          iconBox="bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400"
          label="Avg. order value"
          value={money(stats.aov)}
          change="4.1%"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:w-[260px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
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
                  className="h-8"
                  onClick={() => deleteRows(Object.keys(rowSelection).map(Number))}
                >
                  Delete selected ({selectedCount})
                </Button>
              )}

              {!isMobile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-8">
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
              )}

              <Button className="h-8" onClick={() => setOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                New customer
              </Button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={countryFilter} onValueChange={applyCountry}>
              <SelectTrigger className="h-8 w-full sm:w-[170px]">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {Object.entries(countryData).map(([code, c]) => (
                  <SelectItem key={code} value={code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ordersFilter} onValueChange={applyOrders}>
              <SelectTrigger className="h-8 w-full sm:w-[140px]">
                <SelectValue placeholder="Orders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any orders</SelectItem>
                {Object.entries(ORDER_RANGES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={spentFilter} onValueChange={applySpent}>
              <SelectTrigger className="h-8 w-full sm:w-[160px]">
                <SelectValue placeholder="Total spent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any spend</SelectItem>
                {Object.entries(SPENT_RANGES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Input
                type="date"
                aria-label="Joined from"
                className="h-8 sm:w-[150px]"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => applyDates(e.target.value, dateTo)}
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="date"
                aria-label="Joined to"
                className="h-8 sm:w-[150px]"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => applyDates(dateFrom, e.target.value)}
              />
            </div>

            {hasAnyFilter && (
              <Button variant="ghost" size="sm" className="h-8" onClick={resetFilters}>
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

          {/* LIST */}
          {rows.length === 0 ? (
            <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
              No customers match your filters.
              {hasAnyFilter && (
                <Button variant="link" className="px-1" onClick={resetFilters}>
                  Reset filters
                </Button>
              )}
            </div>
          ) : isMobile ? (
            <MobileCards rows={rows} onDelete={(id) => deleteRows([id])} />
          ) : (
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
                  {rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

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

        {/* NEW CUSTOMER SHEET */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[420px]">
            <SheetHeader>
              <SheetTitle>Add new customer</SheetTitle>
            </SheetHeader>

            <div className="space-y-4 px-4 pb-4">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input
                  placeholder="Enter customer name"
                  value={form.name}
                  aria-invalid={!!errors.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
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

              <div className="space-y-2">
                <Label>Phone number</Label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Join date</Label>
                  <Input
                    type="date"
                    value={form.joinDate}
                    onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                    <SelectTrigger aria-invalid={!!errors.country}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(countryData).map(([code, c]) => (
                        <SelectItem key={code} value={code}>
                          <div className="flex items-center gap-2">
                            <img src={flagSrc(code, "24x18")} alt="" className="h-4 w-6 rounded-sm" />
                            {c.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Customer notes</Label>
                <Textarea
                  rows={3}
                  placeholder="Add any notes about the customer"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Discard
                </Button>
                <Button onClick={handleSubmit}>Add customer</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </Card>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                         Mobile card layout (from rows)                     */
/* -------------------------------------------------------------------------- */

function MobileCards({
  rows,
  onDelete,
}: {
  rows: Row<Customer>[]
  onDelete: (id: number) => void
}) {
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const c = row.original
        return (
          <Card key={row.id} className="p-4" data-state={row.getIsSelected() && "selected"}>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <Checkbox
                    aria-label="Select customer"
                    checked={row.getIsSelected()}
                    onCheckedChange={(v) => row.toggleSelected(!!v)}
                  />
                  <Avatar name={c.name} image={c.image} size="h-10 w-10" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                  </div>
                </div>
                <RowActions customer={c} onDelete={onDelete} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{c.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Orders</p>
                  <p className="font-medium">{c.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total spent</p>
                  <p className="font-medium">{c.totalSpent}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="font-medium">{formatDate(c.joinDate)}</p>
                </div>
              </div>

              <CountryCell country={c.country} />
            </div>
          </Card>
        )
      })}
    </div>
  )
}