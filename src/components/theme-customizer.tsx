import { useUIThemeStore } from "@/store/ui-theme.store"
import { useTheme } from "@/providers/theme-provider"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Check, RotateCcw, Settings } from "lucide-react"

type ThemeOption = {
  id: string
  label: string
  description: string
  mode: "light" | "dark" // next-themes mode this theme needs
  colors: {
    bg: string // page background
    sidebar: string
    card: string
    primary: string
    text: string
  }
}

const THEMES: ThemeOption[] = [
  {
    id: "dark-blue",
    label: "Dark Blue",
    description: "Deep blue glass",
    mode: "dark",
    colors: {
      bg: "oklch(0.178 0.028 265.9)",
      sidebar: "oklch(0.145 0.035 267)",
      card: "oklch(0.245 0.035 266)",
      primary: "oklch(0.622 0.174 263.5)",
      text: "oklch(0.984 0.003 247.9)",
    },
  },
  {
    id: "gaussian-black",
    label: "Gaussian Black",
    description: "Frosted black",
    mode: "dark",
    colors: {
      bg: "oklch(0.145 0 0)",
      sidebar: "oklch(0.1 0 0)",
      card: "oklch(0.235 0 0)",
      primary: "oklch(0.985 0 0)",
      text: "oklch(0.985 0 0)",
    },
  },
  {
    id: "classic-light",
    label: "Classic Light",
    description: "Soft pastel glass",
    mode: "light",
    colors: {
      bg: "oklch(0.962 0.018 272.3)",
      sidebar: "oklch(1 0 0)",
      card: "oklch(1 0 0)",
      primary: "oklch(0.542 0.245 293)",
      text: "oklch(0.206 0.039 265.5)",
    },
  },
  {
    id: "semi-dark",
    label: "Semi Dark",
    description: "Dark sidebar, light page",
    mode: "light",
    colors: {
      bg: "oklch(0.97 0 0)",
      sidebar: "oklch(0.205 0 0)",
      card: "oklch(1 0 0)",
      primary: "oklch(0.488 0.243 264.376)",
      text: "oklch(0.145 0 0)",
    },
  },
]

function ThemePreview({ colors }: { colors: ThemeOption["colors"] }) {
  return (
    <div
      className="flex h-20 w-full overflow-hidden rounded-md border border-black/10"
      style={{ background: colors.bg }}
    >
      {/* Sidebar */}
      <div
        className="flex w-1/4 flex-col gap-1 p-1.5"
        style={{ background: colors.sidebar }}
      >
        <span
          className="h-1.5 w-full rounded-full"
          style={{ background: colors.primary }}
        />
        <span
          className="h-1 w-3/4 rounded-full opacity-40"
          style={{ background: colors.text }}
        />
        <span
          className="h-1 w-2/3 rounded-full opacity-40"
          style={{ background: colors.text }}
        />
        <span
          className="h-1 w-3/4 rounded-full opacity-40"
          style={{ background: colors.text }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-1.5">
        <span
          className="h-2 w-full rounded-sm opacity-90"
          style={{ background: colors.card }}
        />
        <div className="flex flex-1 gap-1.5">
          <span
            className="flex-1 rounded-sm"
            style={{ background: colors.card }}
          />
          <span
            className="flex-1 rounded-sm"
            style={{ background: colors.card }}
          />
        </div>
        <span
          className="h-2 w-1/3 rounded-full"
          style={{ background: colors.primary }}
        />
      </div>
    </div>
  )
}

export default function ThemeCustomizer() {
  const { setTheme: setMode } = useTheme() // next-themes (light / dark / system)
  const { theme, setTheme } = useUIThemeStore() // custom themes

  return (
    <Sheet>
      {/* Trigger */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button
                size="icon"
                className="fixed bottom-4 right-4 z-50 size-10 cursor-pointer rounded-full shadow-lg transition hover:bg-primary/90 [&_svg]:size-5"
              >
                <Settings className="animate-spin [animation-duration:4s]" />
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">Theme Customizer</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Panel */}
      <SheetContent side="right" className="w-[22rem] gap-0 p-0 sm:max-w-[22rem]">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle>Theme Customizer</SheetTitle>
          <SheetDescription>
            Pick a look for your dashboard. It applies instantly.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Themes
          </p>

          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((t) => {
              const active = theme === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setMode(t.mode)
                    setTheme(t.id)
                  }}
                  aria-pressed={active}
                  className={`group relative rounded-xl border p-2 text-left transition hover:border-primary/50 hover:bg-foreground/5 ${
                    active
                      ? "border-primary bg-foreground/5 ring-1 ring-primary"
                      : "border-border"
                  }`}
                >
                  <ThemePreview colors={t.colors} />

                  <div className="mt-2 flex items-start justify-between gap-1 px-0.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.label}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {t.description}
                      </p>
                    </div>

                    {active && (
                      <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </span>
                    )}
                  </div>

                  {/* Color dots */}
                  <div className="mt-2 flex items-center gap-1.5 px-0.5">
                    {[t.colors.bg, t.colors.sidebar, t.colors.card, t.colors.primary].map(
                      (c, i) => (
                        <span
                          key={i}
                          className="size-3.5 rounded-full border border-black/15 dark:border-white/20"
                          style={{ background: c }}
                        />
                      )
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
              setTheme("") // remove custom theme
              setMode("system") // back to system light/dark
            }}
          >
            <RotateCcw className="size-4" />
            Reset theme
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}