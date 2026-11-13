"use client"

import * as React from "react"
import {
  type Column,
  type ColumnDef,
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
  Pencil,
  Search,
  Settings2,
  Trash2,
} from "lucide-react"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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

type Member = {
  id: number
  name: string
  username: string
  role: string
  email: string
  teams: string[]
  status: "Active" | "Inactive"
  avatar: string
}

const initialMembers: Member[] = [
  {
    id: 1,
    name: "Olivia Rhye",
    username: "@olivia",
    role: "Product Designer",
    email: "olivia@untitledui.com",
    teams: ["Design", "Product", "Marketing"],
    status: "Active",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    id: 2,
    name: "Phoenix Baker",
    username: "@phoenix",
    role: "Product Manager",
    email: "phoenix@untitledui.com",
    teams: ["Design", "Product", "Marketing"],
    status: "Active",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    id: 3,
    name: "Lana Steiner",
    username: "@lana",
    role: "Frontend Developer",
    email: "lana@untitledui.com",
    teams: ["Design", "Product", "Marketing"],
    status: "Active",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    id: 4,
    name: "Dylan Patel",
    username: "@dylan",
    role: "Backend Developer",
    email: "dylan@untitledui.com",
    teams: ["Engineering"],
    status: "Inactive",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    id: 5,
    name: "Ava Chen",
    username: "@ava",
    role: "UX Researcher",
    email: "ava@untitledui.com",
    teams: ["Design", "Research"],
    status: "Active",
    avatar: "https://randomuser.me/api/portraits/women/5.jpg",
  },
  {
    id: 6,
    name: "Leo Kim",
    username: "@leo",
    role: "DevOps Engineer",
    email: "leo@untitledui.com",
    teams: ["Engineering", "Infrastructure"],
    status: "Active",
    avatar: "https://randomuser.me/api/portraits/men/6.jpg",
  },
  {
    id: 7,
    name: "Nina Singh",
    username: "@nina",
    role: "QA Analyst",
    email: "nina@untitledui.com",
    teams: ["Quality Assurance"],
    status: "Active",
    avatar: "https://randomuser.me/api/portraits/women/7.jpg",
  },
  {
    id: 8,
    name: "Ethan Wright",
    username: "@ethan",
    role: "Data Scientist",
    email: "ethan@untitledui.com",
    teams: ["Data", "Product"],
    status: "Active",
    avatar: "https://randomuser.me/api/portraits/men/8.jpg",
  },
  {
    id: 9,
    name: "Maya Kapoor",
    username: "@maya",
    role: "Marketing Lead",
    email: "maya@untitledui.com",
    teams: ["Marketing"],
    status: "Inactive",
    avatar: "https://randomuser.me/api/portraits/women/9.jpg",
  },
]

function SortableHeader({
  column,
  title,
}: {
  column: Column<Member, unknown>
  title: string
}) {
  const sorted = column.getIsSorted()
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "asc" ? (
        <ArrowUp className="ml-2 size-3.5" />
      ) : sorted === "desc" ? (
        <ArrowDown className="ml-2 size-3.5" />
      ) : (
        <ArrowUpDown className="text-muted-foreground ml-2 size-3.5" />
      )}
    </Button>
  )
}

const getColumns = (
  onDelete: (member: Member) => void
): ColumnDef<Member>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <img
          src={row.original.avatar}
          alt={row.original.name}
          className="size-10 rounded-full object-cover"
        />
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-muted-foreground text-sm">
            {row.original.username}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={
          row.original.status === "Active"
            ? "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400"
            : "bg-muted text-muted-foreground"
        }
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => <SortableHeader column={column} title="Role" />,
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
  },
  {
    accessorKey: "teams",
    header: "Teams",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.teams.map((team) => (
          <Badge key={team} variant="secondary" className="text-xs">
            {team}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Edit ${row.original.name}`}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${row.original.name}`}
          className="text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400"
          onClick={() => onDelete(row.original)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    ),
  },
]

export default function TeamTable() {
  const [data, setData] = React.useState(initialMembers)
  const [memberToDelete, setMemberToDelete] = React.useState<Member | null>(
    null
  )
  const columns = React.useMemo(() => getColumns(setMemberToDelete), [])

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => String(row.id),
    state: { sorting, globalFilter, columnVisibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, value: string) =>
      [
        row.original.name,
        row.original.username,
        row.original.role,
        row.original.email,
      ]
        .join(" ")
        .toLowerCase()
        .includes(value.toLowerCase()),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  })

  const handleDelete = () => {
    if (!memberToDelete) return
    const id = memberToDelete.id
    setData((prev) => prev.filter((m) => m.id !== id))
    setMemberToDelete(null)
  }

  const { pageIndex, pageSize } = table.getState().pagination
  const filteredCount = table.getFilteredRowModel().rows.length
  const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, filteredCount)

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-xl">Team Members</CardTitle>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search members..."
              className="rounded-full pl-9"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full">
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
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="rounded-full whitespace-nowrap">
            Add New Member
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/40 transition">
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
                  No matching members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <p className="text-muted-foreground text-sm">
            Showing {from}-{to} of {filteredCount} members
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
                  {[5, 10, 20].map((size) => (
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
      </CardContent>

      <AlertDialog
        open={!!memberToDelete}
        onOpenChange={(open) => {
          if (!open) setMemberToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="text-foreground font-medium">
                {memberToDelete?.name}
              </span>{" "}
              from the team. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-600 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}