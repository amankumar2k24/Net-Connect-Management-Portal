"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const STORAGE_KEY = "wifi-dashboard-theme"
const DEFAULT_THEME: Theme = "light"

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const applyTheme = (theme: Theme) => {
  const root = document.documentElement

  // Remove existing theme classes
  root.classList.remove("dark", "light")

  // Set data attribute and class
  root.dataset.theme = theme
  root.classList.add(theme)

  // Force a style recalculation
  root.style.colorScheme = theme
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null

    if (stored) {
      setThemeState(stored)
      applyTheme(stored)
      return
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initial = prefersDark ? "dark" : "light"
    setThemeState(initial)
    applyTheme(initial)
  }, [])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    applyTheme(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
