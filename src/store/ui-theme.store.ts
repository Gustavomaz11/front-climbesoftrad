import { create } from "zustand"
import { persist } from "zustand/middleware"

type UIThemeState = {
  theme: string
  setTheme: (t: string) => void
}

export const useUIThemeStore = create<UIThemeState>()(
  persist(
    (set) => ({
      theme: "dark-blue",              // default
      setTheme: (theme) => set({ theme }),
    }),
    { name: "ui-theme" }               // localStorage key
  )
)