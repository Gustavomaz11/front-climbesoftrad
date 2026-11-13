"use client"

import { useMemo, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Banknote,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  CreditCard,
  Download,
  EllipsisVertical,
  Eye,
  Landmark,
  Pencil,
  Search,
  Star,
  Trash2,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

/* ---------------------------------- */
/* Types */
/* ---------------------------------- */

type Status = "Completed" | "Pending" | "Canceled"
type Payment = "Card" | "PayPal" | "Bank" | "COD"

type Order = {
  id: string
  orderNo: string
  name: string
  image: string
  category: string
  quantity: number
  amount: number // unit price, a number so sorting works
  payment: Payment
  vendor: string
  city: string
  status: Status
  rating: number
  date: string
}

/* ---------------------------------- */
/* Data */
/* ---------------------------------- */

const img = (id: string) =>
  `https://images.unsplash.com/${id}?w=200&h=200&fit=crop`

// Placeholder data, replace with real numbers.
const initialOrders: Order[] = [
  { id: "1", orderNo: "#ORD-1001", name: "Sports Shoes", image: img("photo-1542291026-7eec264c27ff"), category: "Footwear", quantity: 1, amount: 149, payment: "Card", vendor: "Julia Sunota", city: "New York, US", status: "Completed", rating: 5.0, date: "2025-01-10" },
  { id: "2", orderNo: "#ORD-1002", name: "Golden Watch", image: img("photo-1523275335684-37898b6baf30"), category: "Accessories", quantity: 2, amount: 168, payment: "PayPal", vendor: "Robert Fox", city: "London, UK", status: "Completed", rating: 5.0, date: "2025-01-09" },
  { id: "3", orderNo: "#ORD-1003", name: "Men Polo Tshirt", image: img("photo-1521572163474-6864f9cf17ab"), category: "Fashion", quantity: 3, amount: 124, payment: "Bank", vendor: "Emma Watson", city: "Toronto, CA", status: "Pending", rating: 4.0, date: "2025-01-08" },
  { id: "4", orderNo: "#ORD-1004", name: "Blue Jeans Casual", image: img("photo-1542272604-787c3835535d"), category: "Fashion", quantity: 1, amount: 289, payment: "COD", vendor: "Jacob Jones", city: "Sydney, AU", status: "Completed", rating: 3.0, date: "2025-01-07" },
  { id: "5", orderNo: "#ORD-1005", name: "Fancy Shirts", image: img("photo-1583743814966-8936f5b7be1a"), category: "Fashion", quantity: 2, amount: 389, payment: "Card", vendor: "Kristin Watson", city: "Berlin, DE", status: "Canceled", rating: 2.0, date: "2025-01-06" },
  { id: "6", orderNo: "#ORD-1006", name: "Wireless Headphones", image: img("photo-1505740420928-5e560c06d30e"), category: "Electronics", quantity: 3, amount: 199, payment: "PayPal", vendor: "Albert Flores", city: "Mumbai, IN", status: "Completed", rating: 4.5, date: "2025-01-05" },
  { id: "7", orderNo: "#ORD-1007", name: "Over-Ear Headphones", image: img("photo-1484704849700-f032a568e944"), category: "Electronics", quantity: 1, amount: 259, payment: "Bank", vendor: "Cody Fisher", city: "New York, US", status: "Completed", rating: 4.5, date: "2025-01-04" },
  { id: "8", orderNo: "#ORD-1008", name: "Aviator Sunglasses", image: img("photo-1572635196237-14b3f281503f"), category: "Accessories", quantity: 2, amount: 92, payment: "COD", vendor: "Jenny Wilson", city: "London, UK", status: "Pending", rating: 4.0, date: "2025-01-04" },
  { id: "9", orderNo: "#ORD-1009", name: "Running Sneakers", image: img("photo-1491553895911-0055eca6402d"), category: "Footwear", quantity: 3, amount: 135, payment: "Card", vendor: "Guy Hawkins", city: "Toronto, CA", status: "Completed", rating: 4.5, date: "2025-01-03" },
  { id: "10", orderNo: "#ORD-1010", name: "Leather Handbag", image: img("photo-1584917865442-de89df76afd3"), category: "Accessories", quantity: 1, amount: 342, payment: "PayPal", vendor: "Esther Howard", city: "Sydney, AU", status: "Completed", rating: 5.0, date: "2025-01-03" },
  { id: "11", orderNo: "#ORD-1011", name: "Smart Watch Pro", image: img("photo-1546868871-7041f2a55e12"), category: "Electronics", quantity: 2, amount: 399, payment: "Bank", vendor: "Darrell Steward", city: "Berlin, DE", status: "Pending", rating: 4.0, date: "2025-01-02" },
  { id: "12", orderNo: "#ORD-1012", name: "Classic Leather Shoes", image: img("photo-1560343090-f0409e92791a"), category: "Footwear", quantity: 3, amount: 178, payment: "COD", vendor: "Marvin McKinney", city: "Mumbai, IN", status: "Canceled", rating: 2.5, date: "2025-01-02" },
  { id: "13", orderNo: "#ORD-1013", name: "Mirrorless Camera", image: img("photo-1526170375885-4d8ecf77b99f"), category: "Electronics", quantity: 1, amount: 849, payment: "Card", vendor: "Savannah Nguyen", city: "New York, US", status: "Completed", rating: 5.0, date: "2025-01-01" },
  { id: "14", orderNo: "#ORD-1014", name: "Travel Backpack", image: img("photo-1553062407-98eeb64c6a62"), category: "Accessories", quantity: 2, amount: 79, payment: "PayPal", vendor: "Ralph Edwards", city: "London, UK", status: "Completed", rating: 4.0, date: "2024-12-31" },
  { id: "15", orderNo: "#ORD-1015", name: "Sports Shoes", image: img("photo-1542291026-7eec264c27ff"), category: "Footwear", quantity: 3, amount: 149, payment: "Bank", vendor: "Brooklyn Simmons", city: "Toronto, CA", status: "Pending", rating: 4.5, date: "2024-12-30" },
  { id: "16", orderNo: "#ORD-1016", name: "Golden Watch", image: img("photo-1523275335684-37898b6baf30"), category: "Accessories", quantity: 1, amount: 168, payment: "COD", vendor: "Leslie Alexander", city: "Sydney, AU", status: "Completed", rating: 4.5, date: "2024-12-29" },
  { id: "17", orderNo: "#ORD-1017", name: "Men Polo Tshirt", image: img("photo-1521572163474-6864f9cf17ab"), category: "Fashion", quantity: 2, amount: 124, payment: "Card", vendor: "Theresa Webb", city: "Berlin, DE", status: "Canceled", rating: 1.5, date: "2024-12-28" },
  { id: "18", orderNo: "#ORD-1018", name: "Blue Jeans Casual", image: img("photo-1542272604-787c3835535d"), category: "Fashion", quantity: 3, amount: 289, payment: "PayPal", vendor: "Kathryn Murphy", city: "Mumbai, IN", status: "Completed", rating: 4.0, date: "2024-12-27" },
  { id: "19", orderNo: "#ORD-1019", name: "Wireless Headphones", image: img("photo-1505740420928-5e560c06d30e"), category: "Electronics", quantity: 1, amount: 199, payment: "Bank", vendor: "Arlene McCoy", city: "New York, US", status: "Pending", rating: 3.5, date: "2024-12-26" },
  { id: "20", orderNo: "#ORD-1020", name: "Fancy Shirts", image: img("photo-1583743814966-8936f5b7be1a"), category: "Fashion", quantity: 2, amount: 389, payment: "COD", vendor: "Dianne Russell", city: "London, UK", status: "Completed", rating: 4.5, date: "2024-12-25" },
  { id: "21", orderNo: "#ORD-1021", name: "Leather Handbag", image: img("photo-1584917865442-de89df76afd3"), category: "Accessories", quantity: 3, amount: 342, payment: "Card", vendor: "Floyd Miles", city: "Toronto, CA", status: "Completed", rating: 5.0, date: "2024-12-24" },
  { id: "22", orderNo: "#ORD-1022", name: "Aviator Sunglasses", image: img("photo-1572635196237-14b3f281503f"), category: "Accessories", quantity: 1, amount: 92, payment: "PayPal", vendor: "Annette Black", city: "Sydney, AU", status: "Canceled", rating: 2.0, date: "2024-12-23" },
  { id: "23", orderNo: "#ORD-1023", name: "Smart Watch Pro", image: img("photo-1546868871-7041f2a55e12"), category: "Electronics", quantity: 2, amount: 399, payment: "Bank", vendor: "Devon Lane", city: "Berlin, DE", status: "Completed", rating: 4.5, date: "2024-12-22" },
  { id: "24", orderNo: "#ORD-1024", name: "Travel Backpack", image: img("photo-1553062407-98eeb64c6a62"), category: "Accessories", quantity: 3, amount: 79, payment: "COD", vendor: "Cameron Williamson", city: "Mumbai, IN", status: "Pending", rating: 3.5, date: "2024-12-21" },
]

/* ---------------------------------- */
/* Config */
/* ---------------------------------- */

const STATUS_STYLES: Record<Status, string> = {
  Completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  Pending: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  Canceled: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
}

const PAYMENT_ICONS: Record<Payment, LucideIcon> = {
  Card: CreditCard,
  PayPal: Wallet,
  Bank: Landmark,
  COD: Banknote,
}

const STATUS_FILTERS = ["All", "Completed", "Pending", "Canceled"] as const

// Names shown in the Columns menu
const COLUMN_LABELS: Record<string, string> = {
  name: "Item",
  orderNo: "Order",
  category: "Category",
  quantity: "Qty",
  amount: "Price",
  total: "Total",
  payment: "Payment",
  vendor: "Vendor",
  city: "Location",
  status: "Status",
  rating: "Rating",
  date: "Date",
}

// Only the important columns show by default. The rest are in the Columns menu.
const DEFAULT_VISIBILITY: VisibilityState = {
  amount: false,
  city: false,
  rating: false,
  date: false,
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

function SortHeader<T>({
  column,
  title,
}: {
  column: Column<T, unknown>
  title: string
}) {
  const sorted = column.getIsSorted()
  const Icon =
    sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 gap-1.5"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      <Icon className={cn("size-3.5", !sorted && "text-muted-foreground")} />
    </Button>
  )
}

// TanStack has no export feature, so this is the one small helper that stays.
function downloadCsv(rows: Order[]) {
  const header = [
    "Order", "Item", "Category", "Qty", "Price", "Total",
    "Payment", "Vendor", "Location", "Status", "Rating", "Date",
  ]
  const body = rows.map((r) => [
    r.orderNo, r.name, r.category, r.quantity, r.amount, r.amount * r.quantity,
    r.payment, r.vendor, r.city, r.status, r.rating, r.date,
  ])
  const csv = [header, ...body]
    .map((line) => line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n")

  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }))
  const a = document.createElement("a")
  a.href = url
  a.download = "orders.csv"
  a.click()
  URL.revokeObjectURL(url)
}

/* ---------------------------------- */
/* Component */
/* ---------------------------------- */

export default function ProductOrdersTable() {
  const [data, setData] = useState<Order[]>(initialOrders)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(DEFAULT_VISIBILITY)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pendingDelete, setPendingDelete] = useState<string[]>([])

  const deleteOrders = (ids: string[]) => {
    setData((prev) => prev.filter((o) => !ids.includes(o.id)))
    setRowSelection({})
  }

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
            aria-label={`Select ${row.original.orderNo}`}
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
          />
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => <SortHeader column={column} title="Item" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <img
              src={row.original.image}
              alt={row.original.name}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = "/images/placeholder-product.png"
              }}
              className="size-10 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm leading-none font-medium">
                {row.original.name}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {formatDate(row.original.date)}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "orderNo",
        header: ({ column }) => <SortHeader column={column} title="Order" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium text-muted-foreground">
            {row.original.orderNo}
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: ({ column }) => <SortHeader column={column} title="Category" />,
        cell: ({ row }) => (
          <Badge variant="secondary" className="rounded-full font-normal">
            {row.original.category}
          </Badge>
        ),
      },
      {
        id: "total",
        accessorFn: (row) => row.amount * row.quantity,
        header: ({ column }) => <SortHeader column={column} title="Total" />,
        cell: ({ getValue }) => (
          <span className="font-semibold tabular-nums">
            {usd.format(getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: "payment",
        header: ({ column }) => <SortHeader column={column} title="Payment" />,
        cell: ({ row }) => {
          const Icon = PAYMENT_ICONS[row.original.payment]
          return (
            <span className="flex items-center gap-1.5 text-sm">
              <Icon className="size-4 text-muted-foreground" />
              {row.original.payment}
            </span>
          )
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => <SortHeader column={column} title="Status" />,
        filterFn: "equalsString",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn("rounded-full", STATUS_STYLES[row.original.status])}
          >
            {row.original.status}
          </Badge>
        ),
      },

      /* Hidden by default, toggle from the Columns menu */
      {
        accessorKey: "quantity",
        header: ({ column }) => <SortHeader column={column} title="Qty" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.quantity}</span>,
      },
      {
        accessorKey: "amount",
        header: ({ column }) => <SortHeader column={column} title="Price" />,
        cell: ({ row }) => (
          <span className="tabular-nums">{usd.format(row.original.amount)}</span>
        ),
      },
      {
        accessorKey: "vendor",
        header: ({ column }) => <SortHeader column={column} title="Vendor" />,
      },
      {
        accessorKey: "city",
        header: ({ column }) => <SortHeader column={column} title="Location" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap">{row.original.city}</span>
        ),
      },
      {
        accessorKey: "rating",
        header: ({ column }) => <SortHeader column={column} title="Rating" />,
        cell: ({ row }) => (
          <span className="flex items-center gap-1 text-sm tabular-nums">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {row.original.rating.toFixed(1)}
          </span>
        ),
      },
      {
        accessorKey: "date",
        header: ({ column }) => <SortHeader column={column} title="Date" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap">{formatDate(row.original.date)}</span>
        ),
      },

      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Row actions"
                  className="size-8 rounded-full"
                >
                  <EllipsisVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pencil />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-600 focus:text-rose-600"
                  onSelect={() => setPendingDelete([row.original.id])}
                >
                  <Trash2 className="text-rose-600" />
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

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: { sorting, columnFilters, globalFilter, columnVisibility, rowSelection },
    initialState: { pagination: { pageSize: 5 } },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const statusFilter =
    (table.getColumn("status")?.getFilterValue() as string | undefined) ?? "All"
  const selectedRows = table.getSelectedRowModel().rows
  const { pageIndex, pageSize } = table.getState().pagination

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b">
        <div>
          <CardTitle className="mb-0 text-lg font-medium">Recent Orders</CardTitle>
          <CardDescription>Latest product purchases</CardDescription>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            downloadCsv(table.getFilteredRowModel().rows.map((r) => r.original))
          }
        >
          <Download className="size-4" />
          Export
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search order, item, vendor..."
              className="pl-9"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>

          <Tabs
            value={statusFilter}
            onValueChange={(v) =>
              table.getColumn("status")?.setFilterValue(v === "All" ? undefined : v)
            }
          >
            <TabsList>
              {STATUS_FILTERS.map((s) => (
                <TabsTrigger key={s} value={s}>
                  {s}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto gap-1.5">
                <Columns3 className="size-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((c) => c.getCanHide())
                .map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.id}
                    checked={c.getIsVisible()}
                    onCheckedChange={(v) => c.toggleVisibility(!!v)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {COLUMN_LABELS[c.id] ?? c.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bulk actions */}
        {selectedRows.length > 0 && (
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-2">
            <p className="text-sm text-muted-foreground">
              {selectedRows.length} selected
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadCsv(selectedRows.map((r) => r.original))}
              >
                Export
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  setPendingDelete(selectedRows.map((r) => r.original.id))
                }
              >
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border">
          <Table className="min-w-[760px]">
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id} className="hover:bg-transparent">
                  {group.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(header.column.id === "select" && "w-10")}
                    >
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
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={table.getVisibleLeafColumns().length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {selectedRows.length} of {table.getFilteredRowModel().rows.length} row(s) selected
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => table.setPageSize(Number(v))}
              >
                <SelectTrigger size="sm" className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <span className="text-sm text-muted-foreground tabular-nums">
              Page {pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
            </span>

            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="size-8" aria-label="First page" disabled={!table.getCanPreviousPage()} onClick={() => table.setPageIndex(0)}>
                <ChevronsLeft className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="size-8" aria-label="Previous page" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="size-8" aria-label="Next page" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
                <ChevronRight className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="size-8" aria-label="Last page" disabled={!table.getCanNextPage()} onClick={() => table.setPageIndex(table.getPageCount() - 1)}>
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Confirm delete */}
      <AlertDialog
        open={pendingDelete.length > 0}
        onOpenChange={(open) => {
          if (!open) setPendingDelete([])
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {pendingDelete.length > 1 ? `${pendingDelete.length} orders` : "this order"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected{" "}
              {pendingDelete.length > 1 ? "orders" : "order"} will be permanently
              removed from the list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 text-white hover:bg-rose-700"
              onClick={() => {
                deleteOrders(pendingDelete)
                setPendingDelete([])
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}