"use client"

import { useState } from "react"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type Language = {
  code: string
  name: string
}

const languages: Language[] = [
  { code: "01", name: "English" },
  { code: "02", name: "French" },
  { code: "03", name: "Japan" },
  { code: "04", name: "Canada" },
  { code: "05", name: "Australia" },
  { code: "06", name: "Sweden" },
  { code: "07", name: "United Kingdom" },
  { code: "08", name: "Switzerland" },
]

// Works with the Vite `base` setting, so no hardcoded "/pulse-ui/"
const flagSrc = (code: string) =>
  `${import.meta.env.BASE_URL}images/countries/${code}.png`

export function LanguageDropdown() {
  const [selected, setSelected] = useState<Language>(languages[0])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Language: ${selected.name}`}
          className="h-9 w-9"
        >
          <img
            src={flagSrc(selected.code)}
            alt={selected.name}
            className="size-5 rounded-full object-cover ring-1 ring-border"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 max-w-[calc(100vw-2rem)] rounded-xl p-3 shadow-xl"
      >
        <DropdownMenuLabel className="px-1 pt-0 pb-2 text-sm font-semibold">
          Select language
        </DropdownMenuLabel>

        <div className="grid grid-cols-2 gap-1.5">
          {languages.map((lang) => {
            const isSelected = selected.code === lang.code

            return (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setSelected(lang)}
                className={cn(
                  "cursor-pointer gap-2 rounded-lg border px-2.5 py-1.5",
                  isSelected
                    ? "border-primary/40 bg-primary/5"
                    : "border-transparent"
                )}
              >
                <img
                  src={flagSrc(lang.code)}
                  alt=""
                  className="size-5 shrink-0 rounded-full object-cover ring-1 ring-border"
                />
                <span className="truncate text-sm">{lang.name}</span>
                {isSelected && (
                  <Check className="ml-auto size-4 shrink-0 text-primary" />
                )}
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}