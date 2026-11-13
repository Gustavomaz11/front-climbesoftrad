"use client"

import { useMemo, useState } from "react"
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
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"

/* -------------------------------------------------------------------------- */
/*                              Types & constants                             */
/* -------------------------------------------------------------------------- */

type Category = {
  id: number
  name: string
  description: string
  products: number
  earnings: string
  status: string
  image: string
}

type Range = { min: number; max: number }

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50]

const STATUSES = ["Active", "Published", "Draft", "Inactive"]

const PRODUCT_RANGES: Record<string, { label: string; range: Range }> = {
  small: { label: "1–10 products", range: { min: 1, max: 10 } },
  medium: { label: "11–20 products", range: { min: 11, max: 20 } },
  large: { label: "21+ products", range: { min: 21, max: Infinity } },
}

const EARNINGS_RANGES: Record<string, { label: string; range: Range }> = {
  low: { label: "Under $5,000", range: { min: 0, max: 4999.99 } },
  mid: { label: "$5,000 – $10,000", range: { min: 5000, max: 10000 } },
  high: { label: "Over $10,000", range: { min: 10000.01, max: Infinity } },
}

const COLUMN_LABELS: Record<string, string> = {
  image: "Image",
  name: "Category",
  description: "Description",
  products: "Products",
  earnings: "Earnings",
  status: "Status",
}

const statusStyles: Record<string, string> = {
  Active:
    "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 border-green-500/30",
  Published:
    "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/30",
  Draft:
    "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/30",
  Inactive:
    "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/30",
}

const toAmount = (value: string) => Number(value.replace(/[^0-9.]/g, "")) || 0

const rangeFilter: FilterFn<Category> = (row, columnId, value: Range) => {
  const n = Number(row.getValue(columnId))
  return n >= value.min && n <= value.max
}

const initialData: Category[] = [
  { id: 1, name: "Outerwear", description: "Jackets, coats, raincoats and more", products: 12, earnings: "$12,400", status: "Active", image: "/pulse-ui-react/products/01.png" },
  { id: 2, name: "Accessories", description: "Belts, hats, scarves, wallets", products: 25, earnings: "$8,950", status: "Active", image: "/pulse-ui-react/products/02.png" },
  { id: 3, name: "Footwear", description: "Shoes, sneakers, boots and sandals", products: 8, earnings: "$5,600", status: "Inactive", image: "/pulse-ui-react/products/03.png" },
  { id: 4, name: "Outerwear", description: "Jackets, coats, rainwear, and blazers", products: 12, earnings: "$9,200", status: "Published", image: "/pulse-ui-react/products/04.png" },
  { id: 5, name: "Accessories", description: "Belts, scarves, hats, and wallets", products: 15, earnings: "$4,350", status: "Active", image: "/pulse-ui-react/products/05.png" },
  { id: 6, name: "Tops", description: "Shirts, t-shirts, blouses, and polos", products: 20, earnings: "$11,800", status: "Published", image: "/pulse-ui-react/products/06.png" },

  { id: 7, name: "Bottoms", description: "Jeans, trousers, shorts, and skirts", products: 10, earnings: "$7,600", status: "Draft", image: "/pulse-ui-react/products/07.png" },
  { id: 8, name: "Sweatshirts", description: "Hoodies, pullovers, and zip-ups", products: 9, earnings: "$6,450", status: "Inactive", image: "/pulse-ui-react/products/08.png" },
  { id: 9, name: "Suits & Blazers", description: "Formal suits, tailored blazers, and dress jackets", products: 7, earnings: "$8,900", status: "Published", image: "/pulse-ui-react/products/09.png" },
  { id: 10, name: "Activewear", description: "Sportswear, gym outfits, and performance gear", products: 14, earnings: "$10,250", status: "Active", image: "/pulse-ui-react/products/10.png" },
  { id: 11, name: "Formal Footwear", description: "Dress shoes, loafers, and office-ready styles", products: 6, earnings: "$6,700", status: "Draft", image: "/pulse-ui-react/products/11.png" },
  { id: 12, name: "Casual Wear", description: "Everyday outfits, relaxed fits, and streetwear", products: 18, earnings: "$12,400", status: "Published", image: "/pulse-ui-react/products/12.png" },
  { id: 13, name: "Swimwear", description: "Bikinis, trunks, one-piece suits, and cover-ups", products: 8, earnings: "$5,150", status: "Inactive", image: "/pulse-ui-react/products/13.png" },
  { id: 14, name: "Formal Dresses", description: "Evening gowns, cocktail dresses, and party wear", products: 11, earnings: "$9,800", status: "Active", image: "/pulse-ui-react/products/14.png" },
  { id: 15, name: "Winter Essentials", description: "Coats, thermal wear, gloves, and beanies", products: 13, earnings: "$10,600", status: "Draft", image: "/pulse-ui-react/products/15.png" },
]

const emptyForm = { name: "", description: "", products: "", earnings: "", status: "" }

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

export default function CategoryList() {
  const [data, setData] = useState<Category[]>(initialData)

  // Table state
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Filter UI state (the select values). The actual filtering lives in columnFilters.
  const [statusFilter, setStatusFilter] = useState("all")
  const [productsFilter, setProductsFilter] = useState("all")
  const [earningsFilter, setEarningsFilter] = useState("all")

  // Add category sheet
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

  /* ------------------------------- columns -------------------------------- */

  const columns = useMemo<ColumnDef<Category>[]>(
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
        id: "image",
        accessorKey: "image",
        header: "Image",
        enableSorting: false,
        cell: ({ row }) => (
          <img
            src={row.original.image}
            alt={row.original.name}
            className="h-10 w-10 rounded-full border bg-muted/50 object-cover p-1"
          />
        ),
      },
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <SortHeader
            label="Category"
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        id: "description",
        accessorKey: "description",
        header: "Description",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="block min-w-48 max-w-xs truncate text-muted-foreground">
            {row.original.description}
          </span>
        ),
      },
      {
        id: "products",
        accessorKey: "products",
        filterFn: rangeFilter,
        header: ({ column }) => (
          <SortHeader
            label="Products"
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
      },
      {
        id: "earnings",
        // Filter and sort by the numeric value, display the formatted string
        accessorFn: (row) => toAmount(row.earnings),
        filterFn: rangeFilter,
        header: ({ column }) => (
          <SortHeader
            label="Earnings"
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => row.original.earnings,
      },
      {
        id: "status",
        accessorKey: "status",
        filterFn: "equalsString",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant="outline" className={statusStyles[row.original.status] ?? ""}>
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
                <DropdownMenuItem onClick={() => console.log("View category", row.original.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Edit category", row.original.id)}>
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
      const c = row.original
      return `${c.name} ${c.description} ${c.status} ${c.earnings}`
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

  const applyProducts = (value: string) => {
    setProductsFilter(value)
    table
      .getColumn("products")
      ?.setFilterValue(value === "all" ? undefined : PRODUCT_RANGES[value].range)
  }

  const applyEarnings = (value: string) => {
    setEarningsFilter(value)
    table
      .getColumn("earnings")
      ?.setFilterValue(value === "all" ? undefined : EARNINGS_RANGES[value].range)
  }

  const activeFilters = [
    statusFilter !== "all" && { label: statusFilter, clear: () => applyStatus("all") },
    productsFilter !== "all" && {
      label: PRODUCT_RANGES[productsFilter].label,
      clear: () => applyProducts("all"),
    },
    earningsFilter !== "all" && {
      label: EARNINGS_RANGES[earningsFilter].label,
      clear: () => applyEarnings("all"),
    },
  ].filter(Boolean) as { label: string; clear: () => void }[]

  const hasAnyFilter = activeFilters.length > 0 || globalFilter !== ""

  const resetFilters = () => {
    setGlobalFilter("")
    setColumnFilters([])
    setStatusFilter("all")
    setProductsFilter("all")
    setEarningsFilter("all")
  }

  /* ----------------------------- pagination ------------------------------- */

  const selectedCount = Object.keys(rowSelection).length
  const filteredTotal = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = Math.max(1, table.getPageCount())
  const from = filteredTotal === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, filteredTotal)
  const pageNumbers = getPageNumbers(pageIndex + 1, pageCount)

  /* ------------------------------ add category ----------------------------- */

  const handleSubmit = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Enter a category name."
    if (!form.description.trim()) e.description = "Enter a description."
    setErrors(e)
    if (Object.keys(e).length) return

    setData((prev) => [
      {
        id: Math.max(0, ...prev.map((c) => c.id)) + 1,
        name: form.name.trim(),
        description: form.description.trim(),
        products: Number(form.products) || 0,
        earnings: form.earnings || "$0",
        status: form.status || "Active",
        image: "/pulse-ui/products/01.png",
      },
      ...prev,
    ])
    setForm(emptyForm)
    setErrors({})
    setOpen(false)
  }

  /* ---------------------------------- UI ---------------------------------- */

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category List</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* TOOLBAR: search + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-[260px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
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

            <Button className="h-8" onClick={() => setOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Add category
            </Button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={applyStatus}>
            <SelectTrigger className="h-8 w-full sm:w-[150px]">
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

          <Select value={productsFilter} onValueChange={applyProducts}>
            <SelectTrigger className="h-8 w-full sm:w-[170px]">
              <SelectValue placeholder="Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any product count</SelectItem>
              {Object.entries(PRODUCT_RANGES).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={earningsFilter} onValueChange={applyEarnings}>
            <SelectTrigger className="h-8 w-full sm:w-[180px]">
              <SelectValue placeholder="Earnings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any earnings</SelectItem>
              {Object.entries(EARNINGS_RANGES).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasAnyFilter && (
            <Button variant="ghost" className="h-8" onClick={resetFilters}>
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
                    No categories match your filters.
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

        {/* FOOTER: rows per page, summary, numbered pagination */}
        <div className="flex flex-col gap-4 pt-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => table.setPageSize(Number(v))}
              >
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
          </div>
        </div>
      </CardContent>

      {/* ADD CATEGORY SHEET */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>Add new category</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 px-4 pb-4">
            <div className="space-y-2">
              <Label>Category name</Label>
              <Input
                placeholder="Category name"
                value={form.name}
                aria-invalid={!!errors.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                placeholder="Category description"
                value={form.description}
                aria-invalid={!!errors.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Products</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.products}
                  onChange={(e) => setForm({ ...form, products: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Total earnings</Label>
                <Input
                  placeholder="$0"
                  value={form.earnings}
                  onChange={(e) => setForm({ ...form, earnings: e.target.value })}
                />
              </div>
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

            <div className="space-y-2">
              <Label>Category image</Label>
              <Input type="file" accept="image/*" />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Discard
              </Button>
              <Button onClick={handleSubmit}>Save category</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  )
}