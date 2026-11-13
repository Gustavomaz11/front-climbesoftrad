"use client"

import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
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
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table"

import {
  ArrowDown,
  TrendingUp,
  ArrowUp,
  ArrowUpDown,
  TrendingDown,
  Box,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Users,
  Wallet,
} from "lucide-react"

import { cn } from "@/lib/utils"
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
  DropdownMenuContent,
  DropdownMenuItem,
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

interface Product {
  id: number
  name: string
  category: string
  stock: string
  sku: string
  price: number
  status: string
  image: string
}

const initialProducts: Product[] = [
  { id: 1, name: "Denim Jacket", category: "Outerwear", stock: "In Stock", sku: "DJ-659", price: 120, status: "Published", image: "/pulse-ui-react/products/01.png" },
  { id: 2, name: "Leather Belt", category: "Accessories", stock: "In Stock", sku: "LB-500", price: 45, status: "Published", image: "/pulse-ui-react/products/02.png" },
  { id: 3, name: "Slim Fit Jeans", category: "Bottoms", stock: "Low Stock", sku: "SFJ-2021", price: 89, status: "Draft", image: "/pulse-ui-react/products/03.png" },
  { id: 4, name: "Formal Blazer", category: "Suits & Blazers", stock: "In Stock", sku: "FB-300", price: 199, status: "Published", image: "/pulse-ui-react/products/04.png" },
  { id: 5, name: "Running Shoes", category: "Footwear", stock: "Out of Stock", sku: "RS-150", price: 75, status: "Inactive", image: "/pulse-ui-react/products/05.png" },
  { id: 6, name: "Cotton Hoodie", category: "Sweatshirts", stock: "In Stock", sku: "CH-100", price: 149, status: "Draft", image: "/pulse-ui-react/products/06.png" },
  { id: 7, name: "Wool Scarf", category: "Accessories", stock: "Low Stock", sku: "WS-220", price: 39, status: "Published", image: "/pulse-ui-react/products/07.png" },
  { id: 8, name: "Graphic T-Shirt", category: "Tops", stock: "In Stock", sku: "GT-310", price: 29, status: "Published", image: "/pulse-ui-react/products/08.png" },
  { id: 9, name: "Raincoat", category: "Outerwear", stock: "Out of Stock", sku: "RC-450", price: 89, status: "Archived", image: "/pulse-ui-react/products/09.png" },
]

const statusTone = (status: string) => {
  switch (status) {
    case "Published":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
    case "Draft":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
    case "Inactive":
      return "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const stockTone = (stock: string) =>
  stock === "In Stock"
    ? "bg-emerald-500"
    : stock === "Low Stock"
      ? "bg-amber-500"
      : "bg-rose-500"

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

/* ---------------------------------- */
/* Sortable header */
/* ---------------------------------- */

function SortableHeader({
  column,
  children,
}: {
  column: Column<Product, unknown>
  children: React.ReactNode
}) {
  const sorted = column.getIsSorted()
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown

  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className="-ml-2 flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-muted"
    >
      {children}
      <Icon className={cn("size-3.5", !sorted && "text-muted-foreground")} />
    </button>
  )
}

/* ---------------------------------- */
/* Page */
/* ---------------------------------- */

export default function ProductList() {
  const [data, setData] = useState<Product[]>(initialProducts)
  const [pendingDelete, setPendingDelete] = useState<number[] | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [rowSelection, setRowSelection] = useState({})

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableGlobalFilter: false,
        header: ({ table }) => (
          <Checkbox
            aria-label="Select all on this page"
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={`Select ${row.original.name}`}
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
          />
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => <SortableHeader column={column}>Product</SortableHeader>,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <img
              src={row.original.image}
              alt={row.original.name}
              className="size-10 rounded-full border bg-muted/50 object-cover p-1"
            />
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: ({ column }) => <SortableHeader column={column}>Category</SortableHeader>,
        filterFn: "equalsString",
      },
      {
        accessorKey: "stock",
        enableGlobalFilter: false,
        header: ({ column }) => <SortableHeader column={column}>Stock</SortableHeader>,
        cell: ({ getValue }) => {
          const stock = getValue<string>()
          return (
            <span className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full", stockTone(stock))} />
              {stock}
            </span>
          )
        },
      },
      {
        accessorKey: "sku",
        enableGlobalFilter: false,
        header: "SKU",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "price",
        enableGlobalFilter: false,
        header: ({ column }) => <SortableHeader column={column}>Price</SortableHeader>,
        cell: ({ getValue }) => (
          <span className="font-medium tabular-nums">
            {currency.format(getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
        filterFn: "equalsString",
        cell: ({ getValue }) => {
          const status = getValue<string>()
          return (
            <Badge variant="outline" className={statusTone(status)}>
              {status}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="block text-right">Actions</span>,
        cell: ({ row }) => (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Row actions"
                  className="size-8 rounded-full"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => console.log("View product", row.original.id)}>
                  <Eye className="size-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Edit product", row.original.id)}>
                  <Pencil className="size-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => setPendingDelete([row.original.id])}
                >
                  <Trash2 className="size-4" />
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
    getRowId: (row) => String(row.id),
    state: { sorting, columnFilters, globalFilter, rowSelection },
    initialState: { pagination: { pageSize: 5 } },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const statusColumn = table.getColumn("status")!
  const categoryColumn = table.getColumn("category")!

  const statusOptions = Array.from(statusColumn.getFacetedUniqueValues().keys()).sort()
  const categoryOptions = Array.from(categoryColumn.getFacetedUniqueValues().keys()).sort()

  const selectedRows = table.getSelectedRowModel().rows
  const filteredCount = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination
  const pageRows = table.getRowModel().rows.length
  const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1
  const to = pageIndex * pageSize + pageRows

  const exportToCSV = () => {
    const headers = ["Name", "Category", "Stock", "SKU", "Price", "Status"]
    const lines = selectedRows.map(({ original: p }) =>
      [p.name, p.category, p.stock, p.sku, p.price, p.status]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )

    const blob = new Blob([[headers.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8;",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "products.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const confirmDelete = () => {
  if (!pendingDelete) return
  const ids = new Set(pendingDelete)

  setData((prev) => prev.filter((p) => !ids.has(p.id)))
  table.setRowSelection((prev) =>
    Object.fromEntries(Object.entries(prev).filter(([id]) => !ids.has(Number(id))))
  )
  setPendingDelete(null)
}

  return (
    <div className="space-y-6">
      {/* KPI CARDS */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Orders"
          value="8,542"
          trend="+3.5%"
          icon={<ShoppingBag />}
          positive
          gradient="bg-linear-to-tr from-[#ee0979] to-[#ff6a00]"
        />
        <StatCard
          title="Total Revenue"
          value="$23,456"
          trend="+8.5%"
          icon={<Wallet />}
          positive
          gradient="bg-linear-to-tr from-[#00c6fb] to-[#005bea]"
        />
        <StatCard
          title="Customers"
          value="5,678"
          trend="-2.5%"
          icon={<Users />}
          gradient="bg-linear-to-tr from-[#17ad37] to-[#98ec2d]"
        />
        <StatCard
          title="Products"
          value="1,234"
          trend="+5.0%"
          icon={<Box />}
          positive
          gradient="bg-linear-to-tr from-[#7928ca] to-[#ff0080]"
        />
      </div>

      {/* PRODUCT LIST */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b">
          <div>
            <CardTitle className="mb-0 text-lg">Products List</CardTitle>
            <CardDescription>Manage your product catalog</CardDescription>
          </div>

          <div className="relative w-[280px] max-w-full">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Selection bar */}
          {selectedRows.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-2">
              <p className="text-sm text-muted-foreground">
                {selectedRows.length} selected
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={exportToCSV}>
                  <Download className="size-4" />
                  Export
                </Button>
                <Button
  size="sm"
  variant="destructive"
  onClick={() => setPendingDelete(selectedRows.map((r) => r.original.id))}
>
  <Trash2 className="size-4" />
  Delete
</Button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <Select
                value={(statusColumn.getFilterValue() as string) ?? "all"}
                onValueChange={(v) => statusColumn.setFilterValue(v === "all" ? undefined : v)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={(categoryColumn.getFilterValue() as string) ?? "all"}
                onValueChange={(v) => categoryColumn.setFilterValue(v === "all" ? undefined : v)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(columnFilters.length > 0 || globalFilter) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    table.resetColumnFilters()
                    table.resetGlobalFilter()
                  }}
                >
                  Reset
                </Button>
              )}
            </div>

            <Link to="/ecommerce/add-product">
              <Button size="sm">
                <Plus className="mr-1 size-5" />
                Add Product
              </Button>
            </Link>
          </div>

          {/* Table */}
          <div className="relative w-full overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                {table.getHeaderGroups().map((group) => (
                  <TableRow key={group.id}>
                    {group.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={header.column.id === "select" ? "w-10" : undefined}
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
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-2">
            <p className="text-sm text-muted-foreground tabular-nums">
              Showing {from} - {to} of {filteredCount}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Rows per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => table.setPageSize(Number(v))}
                >
                  <SelectTrigger size="sm" className="w-[72px]">
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

              <span className="text-sm tabular-nums">
                Page {pageIndex + 1} of {Math.max(1, table.getPageCount())}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Previous page"
                  className="size-8"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Next page"
                  className="size-8"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <AlertDialog
  open={pendingDelete !== null}
  onOpenChange={(open) => {
    if (!open) setPendingDelete(null)
  }}
>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>
        {pendingDelete && pendingDelete.length > 1
          ? `Delete ${pendingDelete.length} products?`
          : "Delete this product?"}
      </AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.{" "}
        {pendingDelete && pendingDelete.length > 1
          ? "The selected products will be permanently removed from the list."
          : "The selected product will be permanently removed from the list."}
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        className="bg-destructive text-white hover:bg-destructive/90"
        onClick={confirmDelete}
      >
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    </div>
  )
}

/* KPI CARD */
function StatCard({
  title,
  value,
  trend,
  icon,
  positive,
  gradient,
  note = "vs last month",
}: {
  title: string
  value: string
  trend: string
  icon: React.ReactNode
  positive?: boolean
  gradient: string
  note?: string
}) {
  const TrendIcon = positive ? TrendingUp : TrendingDown

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div
            className={`flex size-10 items-center justify-center rounded-xl text-white shadow-sm [&_svg]:size-5 ${gradient}`}
          >
            {icon}
          </div>

          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
              positive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            <TrendIcon className="size-3" />
            {trend}
          </span>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="mt-1 text-3xl leading-none font-semibold tracking-tight tabular-nums">
            {value}
          </h3>
        </div>

        <p className="border-t pt-3 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  )
}