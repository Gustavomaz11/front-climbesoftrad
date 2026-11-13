import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "@/providers/theme-provider"   // was "next-themes"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUIThemeStore } from "@/store/ui-theme.store"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { setTheme: setCustomTheme } = useUIThemeStore()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <Button variant="ghost" className="[&_svg]:size-4.5 h-8 w-8">
        <Sun />
      </Button>
    )
  }

  // dark-blue and gaussian-black count as dark too
  const isDark = resolvedTheme === "dark"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="relative [&_svg]:!size-5 h-9 w-9"
            onClick={() => {
              setCustomTheme("")
              setTheme(isDark ? "light" : "dark")
            }}
            aria-label="Toggle theme"
          >
            <Sun className={`transition-all ${isDark ? "rotate-90 scale-0" : "rotate-0 scale-100"}`} />
            <Moon className={`absolute transition-all ${isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0"}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isDark ? "Switch to light mode" : "Switch to dark mode"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}