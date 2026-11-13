"use client"

import * as React from "react"
import {
  Archive,
  ArrowUpDown,
  ChevronRight,
  Clock,
  Cloud,
  Download,
  File as FileIcon,
  FileText,
  Folder,
  HardDrive,
  Image as ImageIcon,
  LayoutGrid,
  List,
  type LucideIcon,
  MoreVertical,
  Music,
  Plus,
  Search,
  Star,
  Trash2,
  UploadCloud,
  Video,
  X,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

/* ---------------- types & config ---------------- */

type FileType = "document" | "image" | "video" | "audio" | "archive"
type ViewMode = "grid" | "list"
type SortBy = "date" | "name" | "size"

type FileItem = {
  id: string
  name: string
  type: FileType
  size: string
  rawSize: number // MB
  updatedAt: string
  starred: boolean
  members: string[]
  previewUrl: string | null
  folderId?: string
}

type FolderItem = {
  id: string
  name: string
  filesCount: number
  size: string
  tone: string
}

const fileTypes: Record<
  FileType,
  { label: string; ext: string; icon: LucideIcon; tone: string }
> = {
  document: { label: "Documents", ext: "pdf", icon: FileText, tone: "bg-blue-500/10 text-blue-500" },
  image: { label: "Images", ext: "png", icon: ImageIcon, tone: "bg-emerald-500/10 text-emerald-500" },
  video: { label: "Videos", ext: "mp4", icon: Video, tone: "bg-purple-500/10 text-purple-500" },
  audio: { label: "Audio", ext: "mp3", icon: Music, tone: "bg-pink-500/10 text-pink-500" },
  archive: { label: "Archives", ext: "zip", icon: Archive, tone: "bg-amber-500/10 text-amber-500" },
}

const categoryToType: Record<string, FileType> = Object.fromEntries(
  Object.entries(fileTypes).map(([type, cfg]) => [cfg.label, type as FileType])
)

const overviewNav = [
  { label: "All Files", icon: HardDrive },
  { label: "Recents", icon: Clock },
  { label: "Starred", icon: Star },
]

const BASE_USED_GB = 45.5
const PLAN_GB = 50

/* ---------------- mock data ---------------- */

const providers = [
  { id: "gdrive", name: "Google Drive", tone: "bg-blue-500/10 text-blue-500", used: 45.5, total: 50 },
  { id: "dropbox", name: "Dropbox", tone: "bg-indigo-500/10 text-indigo-500", used: 1.2, total: 5 },
  { id: "onedrive", name: "OneDrive", tone: "bg-cyan-500/10 text-cyan-500", used: 8.5, total: 15 },
  { id: "icloud", name: "iCloud", tone: "bg-slate-500/10 text-slate-500", used: 12.8, total: 20 },
]

const folders: FolderItem[] = [
  { id: "f1", name: "UI & UX Design Assets", filesCount: 142, size: "2.4 GB", tone: "bg-amber-500/10 text-amber-500" },
  { id: "f2", name: "Marketing Campaigns 2026", filesCount: 38, size: "840 MB", tone: "bg-rose-500/10 text-rose-500" },
  { id: "f3", name: "Financial Reports & Invoices", filesCount: 89, size: "410 MB", tone: "bg-emerald-500/10 text-emerald-500" },
  { id: "f4", name: "Source Code Repositories", filesCount: 512, size: "1.8 GB", tone: "bg-indigo-500/10 text-indigo-500" },
]

const initialFiles: FileItem[] = [
  {
    id: "1",
    name: "Q4_Financial_Report_2025.pdf",
    type: "document",
    size: "4.2 MB",
    rawSize: 4.2,
    updatedAt: "2026-02-14",
    starred: true,
    members: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    ],
    previewUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
    folderId: "f3",
  },
  {
    id: "2",
    name: "Brand_Identity_Guidelines.fig",
    type: "image",
    size: "18.5 MB",
    rawSize: 18.5,
    updatedAt: "2026-02-18",
    starred: false,
    members: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"],
    previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
    folderId: "f1",
  },
  {
    id: "3",
    name: "Product_Launch_Teaser.mp4",
    type: "video",
    size: "145.0 MB",
    rawSize: 145.0,
    updatedAt: "2026-01-30",
    starred: true,
    members: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    ],
    previewUrl: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800",
    folderId: "f2",
  },
  {
    id: "4",
    name: "Podcast_Episode_42_Audio.mp3",
    type: "audio",
    size: "32.1 MB",
    rawSize: 32.1,
    updatedAt: "2026-02-01",
    starred: false,
    members: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"],
    previewUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
    folderId: "f2",
  },
  {
    id: "5",
    name: "Website_Assets_v2.1.zip",
    type: "archive",
    size: "88.4 MB",
    rawSize: 88.4,
    updatedAt: "2026-02-10",
    starred: false,
    members: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"],
    previewUrl: null,
    folderId: "f1",
  },
  {
    id: "6",
    name: "User_Research_Interviews.docx",
    type: "document",
    size: "1.8 MB",
    rawSize: 1.8,
    updatedAt: "2026-02-19",
    starred: true,
    members: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"],
    previewUrl: null,
    folderId: "f1",
  },
]

/* ---------------- small pieces ---------------- */

function TypeIcon({
  type,
  className,
}: {
  type: FileType
  className?: string
}) {
  const { icon: Icon, tone } = fileTypes[type]
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg",
        tone,
        className
      )}
    >
      <Icon className="size-4" />
    </div>
  )
}

function NavButton({
  active,
  icon: Icon,
  label,
  count,
  onClick,
}: {
  active: boolean
  icon: LucideIcon
  label: string
  count?: number
  onClick: () => void
}) {
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      className="w-full justify-between"
      onClick={onClick}
    >
      <span className="flex items-center gap-3">
        <Icon className="size-4" />
        {label}
      </span>
      {count !== undefined && (
        <span className="text-muted-foreground text-xs tabular-nums">{count}</span>
      )}
    </Button>
  )
}

function AvatarGroup({ members }: { members: string[] }) {
  return (
    <div className="flex -space-x-2">
      {members.map((src, i) => (
        <Avatar key={i} className="ring-background size-6 ring-2">
          <AvatarImage src={src} alt="Collaborator" />
          <AvatarFallback className="text-[10px]">U</AvatarFallback>
        </Avatar>
      ))}
    </div>
  )
}

/* ---------------- page ---------------- */

export default function FileManagerDashboard() {
  const [files, setFiles] = React.useState(initialFiles)
  const [activeCategory, setActiveCategory] = React.useState("All Files")
  const [currentFolder, setCurrentFolder] = React.useState<FolderItem | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid")
  const [sortBy, setSortBy] = React.useState<SortBy>("date")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [previewId, setPreviewId] = React.useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = React.useState<string[] | null>(null)
  const [isUploadOpen, setIsUploadOpen] = React.useState(false)

  const [newFileName, setNewFileName] = React.useState("")
  const [newFileType, setNewFileType] = React.useState<FileType>("document")

  const previewFile = files.find((f) => f.id === previewId) ?? null

  /* ----- filtering & sorting ----- */

  const filteredFiles = React.useMemo(() => {
    const list = files
      .filter((file) => {
        if (!file.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
        if (currentFolder) return file.folderId === currentFolder.id
        if (activeCategory === "Starred") return file.starred
        const type = categoryToType[activeCategory]
        return type ? file.type === type : true
      })
      .sort((a, b) => {
        if (activeCategory === "Recents") {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        }
        if (sortBy === "name") return a.name.localeCompare(b.name)
        if (sortBy === "size") return b.rawSize - a.rawSize
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })

    return activeCategory === "Recents" && !currentFolder ? list.slice(0, 4) : list
  }, [files, activeCategory, currentFolder, searchQuery, sortBy])

  const usedGB = BASE_USED_GB + files.reduce((acc, f) => acc + f.rawSize, 0) / 1000
  const usedPercent = Math.min(100, Math.round((usedGB / PLAN_GB) * 100))

  const allSelected =
    filteredFiles.length > 0 && filteredFiles.every((f) => selectedIds.includes(f.id))
  const someSelected = filteredFiles.some((f) => selectedIds.includes(f.id))

  const showOverview = !currentFolder && activeCategory === "All Files" && !searchQuery

  /* ----- handlers ----- */

  const goTo = (category: string) => {
    setActiveCategory(category)
    setCurrentFolder(null)
  }

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )

  const toggleSelectAll = () =>
    setSelectedIds(allSelected ? [] : filteredFiles.map((f) => f.id))

  const toggleStar = (id: string) =>
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, starred: !f.starred } : f))
    )

  const confirmDelete = () => {
    if (!pendingDelete) return
    setFiles((prev) => prev.filter((f) => !pendingDelete.includes(f.id)))
    setSelectedIds((prev) => prev.filter((id) => !pendingDelete.includes(id)))
    if (previewId && pendingDelete.includes(previewId)) setPreviewId(null)
    setPendingDelete(null)
  }

  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newFileName.trim()
    if (!name) return

    const { ext } = fileTypes[newFileType]
    const rawSize = parseFloat((Math.random() * 15 + 0.5).toFixed(1))

    const newFile: FileItem = {
      id: Date.now().toString(),
      name: name.endsWith(`.${ext}`) ? name : `${name}.${ext}`,
      type: newFileType,
      size: `${rawSize} MB`,
      rawSize,
      updatedAt: new Date().toISOString().split("T")[0],
      starred: false,
      members: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"],
      previewUrl:
        newFileType === "image"
          ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"
          : null,
      folderId: currentFolder?.id,
    }

    setFiles((prev) => [newFile, ...prev])
    setNewFileName("")
    setIsUploadOpen(false)
  }

  const deleteLabel =
    pendingDelete && pendingDelete.length === 1
      ? files.find((f) => f.id === pendingDelete[0])?.name
      : `${pendingDelete?.length ?? 0} files`

  /* ----- render ----- */

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col xl:flex-row">
      {/* ================= SIDEBAR ================= */}
      <aside className="bg-card flex w-full shrink-0 flex-col justify-between border p-4 xl:w-72 rounded-xl">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg">
              <Cloud className="size-5" />
            </div>
            <div>
              <h1 className="text-lg leading-none font-semibold">Nexus Cloud</h1>
              <p className="text-muted-foreground mt-1 text-xs">Smart Storage System</p>
            </div>
          </div>

          <Button className="w-full" onClick={() => setIsUploadOpen(true)}>
            <Plus className="mr-2 size-4" />
            Upload New File
          </Button>

          <nav className="space-y-1">
            <p className="text-muted-foreground px-3 pb-1 text-xs font-medium tracking-wider uppercase">
              Overview
            </p>
            {overviewNav.map(({ label, icon }) => (
              <NavButton
                key={label}
                label={label}
                icon={icon}
                active={activeCategory === label && !currentFolder}
                count={
                  label === "All Files"
                    ? files.length
                    : label === "Starred"
                      ? files.filter((f) => f.starred).length
                      : undefined
                }
                onClick={() => goTo(label)}
              />
            ))}

            <p className="text-muted-foreground px-3 pt-4 pb-1 text-xs font-medium tracking-wider uppercase">
              File Categories
            </p>
            {Object.values(fileTypes).map(({ label, icon }) => (
              <NavButton
                key={label}
                label={label}
                icon={icon}
                active={activeCategory === label && !currentFolder}
                onClick={() => goTo(label)}
              />
            ))}
          </nav>
        </div>

        <Card className="gap-3 shadow-none">
          <CardContent className="space-y-3 px-4">
            <div className="flex items-center justify-between text-xs font-medium">
              <span>Storage Used</span>
              <span className="text-muted-foreground tabular-nums">
                {usedGB.toFixed(1)} GB / {PLAN_GB} GB
              </span>
            </div>
            <Progress value={usedPercent} className="h-2" />
            <p className="text-muted-foreground text-xs">
              {usedPercent}% of your plan capacity is currently in use.
            </p>
          </CardContent>
        </Card>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 space-y-6 overflow-y-auto py-0 px-6">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files, folders or tags..."
              className="px-9"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <ToggleGroup
              type="single"
              variant="outline"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as ViewMode)}
            >
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="w-[150px]">
                <ArrowUpDown className="text-muted-foreground size-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="size">Sort by Size</SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6" />

            <Avatar>
              <AvatarImage
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                alt="User profile"
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <Separator />

        {/* Breadcrumb + bulk actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <button
              type="button"
              className="hover:text-foreground transition-colors"
              onClick={() => goTo("All Files")}
            >
              Drive
            </button>
            <ChevronRight className="size-4" />
            <span className="text-foreground font-medium">
              {currentFolder ? currentFolder.name : activeCategory}
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="bg-muted flex items-center gap-3 rounded-lg border px-3 py-1.5 text-sm">
              <span className="font-medium">{selectedIds.length} selected</span>
              <Separator orientation="vertical" className="h-4" />
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400"
                onClick={() => setPendingDelete(selectedIds)}
              >
                <Trash2 className="mr-2 size-4" />
                Delete selected
              </Button>
            </div>
          )}
        </div>

        {/* Connected clouds */}
        {showOverview && (
          <section className="space-y-3">
            <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Connected Clouds
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {providers.map((provider) => {
                const percent = Math.round((provider.used / provider.total) * 100)
                return (
                  <Card key={provider.id} className="gap-3 py-4 shadow-none">
                    <CardContent className="space-y-3 px-4">
                      <div className="flex items-start justify-between">
                        <div
                          className={cn(
                            "flex size-10 items-center justify-center rounded-lg",
                            provider.tone
                          )}
                        >
                          <Cloud className="size-5" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="-mt-1 -mr-2 size-8"
                              aria-label={`${provider.name} options`}
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Manage</DropdownMenuItem>
                            <DropdownMenuItem>Disconnect</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium">{provider.name}</h3>
                        <p className="text-muted-foreground text-xs">
                          {provider.used} GB of {provider.total} GB
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <Progress value={percent} className="h-1.5" />
                        <p className="text-muted-foreground text-right text-xs">
                          {percent}% used
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* Folders */}
        {showOverview && (
          <section className="space-y-3">
            <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Folders
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {folders.map((folder) => (
                <Card
                  key={folder.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setCurrentFolder(folder)}
                  onKeyDown={(e) => e.key === "Enter" && setCurrentFolder(folder)}
                  className="hover:bg-accent/50 group cursor-pointer gap-0 py-4 shadow-none transition-colors"
                >
                  <CardContent className="flex items-center justify-between gap-3 px-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-lg",
                          folder.tone
                        )}
                      >
                        <Folder className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{folder.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {folder.filesCount} files · {folder.size}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Files */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              {currentFolder ? `Files in ${currentFolder.name}` : "Recent & Filtered Files"}
            </h2>
            <span className="text-muted-foreground text-xs">
              {filteredFiles.length} item(s)
            </span>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
              <div className="bg-muted text-muted-foreground mb-3 flex size-14 items-center justify-center rounded-full">
                <FileIcon className="size-7" />
              </div>
              <p className="font-medium">No files found</p>
              <p className="text-muted-foreground mt-1 max-w-xs text-xs">
                Try adjusting your search query or switching navigation categories.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredFiles.map((file) => {
                const isSelected = selectedIds.includes(file.id)
                return (
                  <Card
                    key={file.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setPreviewId(file.id)}
                    onKeyDown={(e) => e.key === "Enter" && setPreviewId(file.id)}
                    className={cn(
                      "hover:bg-accent/50 group cursor-pointer gap-3 py-4 shadow-none transition-colors",
                      isSelected && "border-primary"
                    )}
                  >
                    <CardContent className="space-y-3 px-4">
                      <div
                        className="flex items-center justify-between"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(file.id)}
                          aria-label={`Select ${file.name}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="-mr-2 size-8"
                          aria-label={file.starred ? "Unstar" : "Star"}
                          onClick={() => toggleStar(file.id)}
                        >
                          <Star
                            className={cn(
                              "size-4",
                              file.starred && "fill-amber-400 text-amber-400"
                            )}
                          />
                        </Button>
                      </div>

                      <div className="bg-muted flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border">
                        {file.previewUrl ? (
                          <img
                            src={file.previewUrl}
                            alt={file.name}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <TypeIcon type={file.type} className="size-12" />
                        )}
                      </div>

                      <div>
                        <p className="truncate text-sm font-medium" title={file.name}>
                          {file.name}
                        </p>
                        <div className="text-muted-foreground mt-1 flex items-center justify-between text-xs">
                          <span>{file.size}</span>
                          <span>{file.updatedAt}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allSelected || (someSelected && "indeterminate")}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Collaborators</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow
                      key={file.id}
                      data-state={selectedIds.includes(file.id) && "selected"}
                      onClick={() => setPreviewId(file.id)}
                      className="cursor-pointer"
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.includes(file.id)}
                          onCheckedChange={() => toggleSelect(file.id)}
                          aria-label={`Select ${file.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <TypeIcon type={file.type} />
                          <span className="font-medium">{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{file.size}</TableCell>
                      <TableCell>
                        <AvatarGroup members={file.members} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {file.updatedAt}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={file.starred ? "Unstar" : "Star"}
                            onClick={() => toggleStar(file.id)}
                          >
                            <Star
                              className={cn(
                                "size-4",
                                file.starred && "fill-amber-400 text-amber-400"
                              )}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${file.name}`}
                            className="text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400"
                            onClick={() => setPendingDelete([file.id])}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </main>

      {/* ================= UPLOAD DIALOG ================= */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload New File</DialogTitle>
            <DialogDescription>
              Add a document or media file to your cloud drive.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddFile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-name">File name</Label>
              <Input
                id="file-name"
                required
                placeholder="e.g. Project_Brief_2026"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-type">File category</Label>
              <Select
                value={newFileType}
                onValueChange={(v) => setNewFileType(v as FileType)}
              >
                <SelectTrigger id="file-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(fileTypes) as FileType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {fileTypes[type].label.replace(/s$/, "")} (.{fileTypes[type].ext})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="hover:border-primary/50 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors">
              <UploadCloud className="text-muted-foreground mb-2 size-8" />
              <p className="text-sm font-medium">
                Drag &amp; drop files here, or click to browse
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Supports files up to 500 MB
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Upload file</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= PREVIEW DIALOG ================= */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
          {previewFile && (
            <>
              <DialogHeader className="border-b p-4 pr-12">
                <div className="flex items-center gap-3">
                  <TypeIcon type={previewFile.type} />
                  <div className="min-w-0 text-left">
                    <DialogTitle className="truncate text-sm">
                      {previewFile.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      {previewFile.size} · Modified {previewFile.updatedAt}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="bg-muted/50 flex min-h-[250px] flex-1 items-center justify-center overflow-y-auto p-6">
                {previewFile.previewUrl ? (
                  <img
                    src={previewFile.previewUrl}
                    alt={previewFile.name}
                    className="max-h-80 w-auto rounded-lg border object-contain"
                  />
                ) : (
                  <div className="space-y-3 text-center">
                    <TypeIcon type={previewFile.type} className="mx-auto size-14" />
                    <p className="text-sm font-medium">No direct preview available</p>
                    <p className="text-muted-foreground text-xs">
                      Download the file to view its full content.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t p-4">
                <Button variant="outline" size="sm" onClick={() => toggleStar(previewFile.id)}>
                  <Star
                    className={cn(
                      "mr-2 size-4",
                      previewFile.starred && "fill-amber-400 text-amber-400"
                    )}
                  />
                  {previewFile.starred ? "Starred" : "Star"}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-600 dark:text-red-400"
                    onClick={() => setPendingDelete([previewFile.id])}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </Button>
                  <Button size="sm">
                    <Download className="mr-2 size-4" />
                    Download
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= DELETE CONFIRMATION ================= */}
      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteLabel}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="text-foreground font-medium">{deleteLabel}</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-600 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}