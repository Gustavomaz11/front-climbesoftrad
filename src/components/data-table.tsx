"use client"

import * as React from "react"
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
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
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
  Settings2,
  SlidersHorizontal,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

/* ---------------- types ---------------- */

export type DataTableFilter = {
  /** Column id (accessorKey) to filter on, e.g. "status" */
  columnId: string
  label: string
  options: string[]
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filters?: DataTableFilter[]
  searchPlaceholder?: string
  /** Used for exported file names and the print title */
  fileName?: string
  pageSizes?: number[]
  getRowId?: (row: TData, index: number) => string
}

/* ---------------- export helpers ---------------- */

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return ""
  if (Array.isArray(value)) return value.join("; ")
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

const escapeCSV = (value: string) =>
  /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

const escapeHTML = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const getHeaderLabel = <TData,>(column: Column<TData, unknown>) =>
  typeof column.columnDef.header === "string" ? column.columnDef.header : column.id

/* ---------------- sortable header ---------------- */

function SortableHeader<TData>({
  column,
  children,
}: {
  column: Column<TData, unknown>
  children: React.ReactNode
}) {
  if (!column.getCanSort()) return <>{children}</>

  const sorted = column.getIsSorted()
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className="hover:text-foreground -ml-1 inline-flex items-center gap-2 rounded px-1 py-0.5 select-none"
    >
      {children}
      {sorted === "asc" ? (
        <ArrowUp className="size-3.5" />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3.5" />
      ) : (
        <ArrowUpDown className="text-muted-foreground size-3.5" />
      )}
    </button>
  )
}

/* ---------------- component ---------------- */

export function DataTable<TData, TValue>({
  columns,
  data,
  filters = [],
  searchPlaceholder = "Search...",
  fileName = "table-data",
  pageSizes = [10, 20, 50],
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  // Prepend a selection column and make filter columns accept multiple values.
  const allColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    const filterIds = new Set(filters.map((f) => f.columnId))

    const selectColumn: ColumnDef<TData, TValue> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all rows on this page"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }

    const mapped = columns.map((col) => {
      const id =
        col.id ?? ("accessorKey" in col ? String(col.accessorKey) : undefined)
      return id && filterIds.has(id)
        ? ({ ...col, filterFn: "arrIncludesSome" } as ColumnDef<TData, TValue>)
        : col
    })

    return [selectColumn, ...mapped]
  }, [columns, filters])

  const table = useReactTable({
    data,
    columns: allColumns,
    getRowId,
    state: {
      sorting,
      globalFilter,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    initialState: { pagination: { pageSize: pageSizes[0] } },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  /* ----- export (selected rows if any, otherwise everything matching the filters) ----- */

  const getExportData = () => {
    const columnsToExport = table
      .getVisibleLeafColumns()
      .filter((column) => column.accessorFn)

    const selected = table.getFilteredSelectedRowModel().rows
    const rows: Row<TData>[] = selected.length
      ? selected
      : table.getFilteredRowModel().rows

    return {
      headers: columnsToExport.map(getHeaderLabel),
      body: rows.map((row) =>
        columnsToExport.map((column) => formatValue(row.getValue(column.id)))
      ),
    }
  }

  const exportToCSV = () => {
    const { headers, body } = getExportData()
    const csv = [headers, ...body]
      .map((line) => line.map(escapeCSV).join(","))
      .join("\r\n")

    // BOM keeps Excel from mangling UTF-8 characters
    downloadBlob(
      new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }),
      `${fileName}.csv`
    )
  }

  const exportToExcel = async () => {
    const XLSX = await import("xlsx")
    const { headers, body } = getExportData()
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...body])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data")
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  }

  const exportToPDF = async () => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ])
    const { headers, body } = getExportData()
    const doc = new jsPDF({ orientation: headers.length > 5 ? "l" : "p" })
    autoTable(doc, { head: [headers], body })
    doc.save(`${fileName}.pdf`)
  }

  const handlePrint = () => {
    const { headers, body } = getExportData()
    const win = window.open("", "_blank", "width=900,height=700")
    if (!win) return

    const head = headers.map((h) => `<th>${escapeHTML(h)}</th>`).join("")
    const rows = body
      .map(
        (line) =>
          `<tr>${line.map((cell) => `<td>${escapeHTML(cell)}</td>`).join("")}</tr>`
      )
      .join("")

    win.document.write(`<!doctype html>
<html>
  <head>
    <title>${escapeHTML(fileName)}</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 24px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
      th { background: #f5f5f5; }
    </style>
  </head>
  <body>
    <table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>
  </body>
</html>`)
    win.document.close()
    win.focus()
    win.print()
  }

  /* ----- derived UI state ----- */

  const { pageIndex, pageSize } = table.getState().pagination
  const filteredCount = table.getFilteredRowModel().rows.length
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, filteredCount)
  const isFiltered = globalFilter.length > 0 || columnFilters.length > 0

  const resetFilters = () => {
    setGlobalFilter("")
    setColumnFilters([])
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>

        {filters.map((filter) => {
          const column = table.getColumn(filter.columnId)
          const value = (column?.getFilterValue() as string[] | undefined) ?? []

          return (
            <DropdownMenu key={filter.columnId}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="mr-2 size-4" />
                  {filter.label}
                  {value.length > 0 && (
                    <Badge variant="secondary" className="ml-2 rounded-full px-1.5">
                      {value.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filter.options.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option}
                    checked={value.includes(option)}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(checked) => {
                      const next = checked
                        ? [...value, option]
                        : value.filter((v) => v !== option)
                      column?.setFilterValue(next.length ? next : undefined)
                    }}
                  >
                    {option}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        })}

        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Reset
            <X className="ml-2 size-4" />
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 size-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {getHeaderLabel(column)}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 size-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {selectedCount > 0
                  ? `${selectedCount} selected row(s)`
                  : `All ${filteredCount} row(s)`}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={exportToCSV}>
                <FileText className="mr-2 size-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={exportToExcel}>
                <FileSpreadsheet className="mr-2 size-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={exportToPDF}>
                <FileText className="mr-2 size-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handlePrint}>
                <Printer className="mr-2 size-4" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.id === "select" ? "w-10" : undefined}
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : undefined
                    }
                  >
                    {header.isPlaceholder ? null : (
                      <SortableHeader column={header.column}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </SortableHeader>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
                  className="text-muted-foreground h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          {selectedCount > 0
            ? `${selectedCount} of ${filteredCount} row(s) selected`
            : `Showing ${from}-${to} of ${filteredCount} row(s)`}
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Rows</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger size="sm" className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizes.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className="text-sm tabular-nums">
            Page {pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}