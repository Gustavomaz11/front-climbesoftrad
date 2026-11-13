"use client"

import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowDownRight,
  ArrowUpRight,
  Box,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  PackageSearch,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Users,
  Wallet,
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

type Product = {
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

const PAGE_SIZE = 8

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

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

const sorters: Record<string, (a: Product, b: Product) => number> = {
  featured: () => 0,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name),
}

export default function ProductGrid() {
  const [data, setData] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState("all")
  const [sort, setSort] = useState("featured")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<number[]>([])
  const [pendingDelete, setPendingDelete] = useState<number[] | null>(null)

  const categories = useMemo(
    () => Array.from(new Set(data.map((p) => p.category))).sort(),
    [data]
  )
  const statuses = useMemo(
    () => Array.from(new Set(data.map((p) => p.status))).sort(),
    [data]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return data
      .filter(
        (p) =>
          (category === "all" || p.category === category) &&
          (status === "all" || p.status === status) &&
          (!q || `${p.name} ${p.category} ${p.sku}`.toLowerCase().includes(q))
      )
      .sort(sorters[sort])
  }, [data, search, category, status, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const paginated = filtered.slice(start, start + PAGE_SIZE)

  const allOnPageSelected =
    paginated.length > 0 && paginated.every((p) => selected.includes(p.id))
  const someOnPageSelected = paginated.some((p) => selected.includes(p.id))
  const hasFilters = search || category !== "all" || status !== "all"

  const toggleOne = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )

  const toggleAllOnPage = (checked: boolean) => {
    const ids = paginated.map((p) => p.id)
    setSelected((prev) =>
      checked
        ? Array.from(new Set([...prev, ...ids]))
        : prev.filter((id) => !ids.includes(id))
    )
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    const ids = new Set(pendingDelete)
    setData((prev) => prev.filter((p) => !ids.has(p.id)))
    setSelected((prev) => prev.filter((id) => !ids.has(id)))
    setPendingDelete(null)
  }

  const resetFilters = () => {
    setSearch("")
    setCategory("all")
    setStatus("all")
    setPage(1)
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
          value={data.length.toLocaleString("en-US")}
          trend="+5.0%"
          icon={<Box />}
          positive
          gradient="bg-linear-to-tr from-[#7928ca] to-[#ff0080]"
        />
      </div>

      {/* PRODUCTS GRID */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b">
          <div>
            <CardTitle className="mb-0 text-lg">Products Grid</CardTitle>
            <CardDescription>Visual product management</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-[240px] max-w-full">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            <Link to="/ecommerce/add-product">
              <Button size="sm">
                <Plus className="mr-1 size-5" />
                Add Product
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  aria-label="Select all on this page"
                  checked={
                    allOnPageSelected
                      ? true
                      : someOnPageSelected
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={(v) => toggleAllOnPage(!!v)}
                />
                {selected.length > 0 ? `${selected.length} selected` : "Select all"}
              </label>

              {selected.length > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setPendingDelete(selected)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={category}
                onValueChange={(v) => {
                  setCategory(v)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: low to high</SelectItem>
                  <SelectItem value="price-desc">Price: high to low</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button variant="ghost" onClick={resetFilters}>
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Grid */}
          {paginated.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginated.map((product) => (
                <ProductGridCard
                  key={product.id}
                  product={product}
                  selected={selected.includes(product.id)}
                  onSelect={() => toggleOne(product.id)}
                  onDelete={() => setPendingDelete([product.id])}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
              <PackageSearch className="size-10 text-muted-foreground" />
              <p className="font-medium">No products found</p>
              <p className="text-sm text-muted-foreground">
                Try a different search or clear the filters.
              </p>
              {hasFilters && (
                <Button variant="outline" size="sm" className="mt-2" onClick={resetFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground tabular-nums">
              {filtered.length === 0
                ? "Showing 0 of 0"
                : `Showing ${start + 1} - ${start + paginated.length} of ${filtered.length}`}
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous page"
                className="size-8"
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  size="icon"
                  variant={n === safePage ? "default" : "ghost"}
                  className="size-8 text-sm tabular-nums"
                  onClick={() => setPage(n)}
                >
                  {n}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                aria-label="Next page"
                className="size-8"
                disabled={safePage === totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DELETE CONFIRMATION */}
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

/* PRODUCT CARD */
function ProductGridCard({
  product,
  selected,
  onSelect,
  onDelete,
}: {
  product: Product
  selected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  return (
    <Card
      className={cn(
        "group gap-0 overflow-hidden py-0 shadow-none transition-all hover:shadow-md",
        selected && "border-primary ring-1 ring-primary"
      )}
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted/50">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover p-6 transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          <Checkbox
            aria-label={`Select ${product.name}`}
            className="bg-background"
            checked={selected}
            onCheckedChange={onSelect}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                aria-label="Product actions"
                className="size-8 rounded-full"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="size-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={onDelete}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Badge
          variant="outline"
          className={cn("absolute bottom-3 left-3 backdrop-blur-sm", statusTone(product.status))}
        >
          {product.status}
        </Badge>
      </div>

      {/* Info */}
      <CardContent className="space-y-3">
        <div>
          <h4 className="truncate leading-tight font-semibold">{product.name}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold tabular-nums">
            {currency.format(product.price)}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("size-2 rounded-full", stockTone(product.stock))} />
            {product.stock}
          </span>
        </div>

        <p className="border-t py-3 font-mono text-xs text-muted-foreground">
          SKU: {product.sku}
        </p>
      </CardContent>
    </Card>
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
}: {
  title: string
  value: string
  trend: string
  icon: React.ReactNode
  positive?: boolean
  gradient: string
}) {
  const TrendIcon = positive ? ArrowUpRight : ArrowDownRight

  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-md text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-medium">{value}</h3>

          <div
            className={cn(
              "mt-2 flex items-center gap-1 text-sm font-medium",
              positive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            )}
          >
            <TrendIcon className="size-4" />
            <span>{trend}</span>
          </div>
        </div>

        <div className={`rounded-xl p-2 text-white ${gradient}`}>{icon}</div>
      </CardContent>
    </Card>
  )
}