"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextValue {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

const STORAGE_KEY = "flowlink-theme"
const DEFAULT_THEME: Theme = "light"

const ThemeContext = createContext<ThemeContextValue>({
    theme: DEFAULT_THEME,
    setTheme: () => { },
    toggleTheme: () => { }
})

const applyTheme = (theme: Theme) => {
    if (typeof window === 'undefined') return

    const root = document.documentElement

    console.log('Applying theme:', theme)

    // Remove existing theme classes
    root.classList.remove("dark", "light")

    // Set data attribute and class
    root.dataset.theme = theme
    root.classList.add(theme)

    // Force a style recalculation
    root.style.colorScheme = theme

    // Ensure body background is updated
    document.body.className = document.body.className.replace(/bg-\w+/g, '')
    document.body.classList.add(theme === 'dark' ? 'bg-background' : 'bg-background')

    console.log('Theme applied. Root classes:', root.classList.toString(), 'Data theme:', root.dataset.theme)
}

interface ThemeProviderProps {
    children?: React.ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        if (typeof window === 'undefined') return

        const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null

        if (stored && (stored === 'light' || stored === 'dark')) {
            setThemeState(stored)
            applyTheme(stored)
            return
        }

        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        const initial = prefersDark ? "dark" : "light"
        setThemeState(initial)
        applyTheme(initial)
    }, [])

    // Apply theme whenever it changes - always call this hook
    useEffect(() => {
        if (mounted && typeof window !== 'undefined') {
            applyTheme(theme)
        }
    }, [theme, mounted])

    const setTheme = (next: Theme) => {
        setThemeState(next)
        if (mounted && typeof window !== 'undefined') {
            applyTheme(next)
            window.localStorage.setItem(STORAGE_KEY, next)
        }
    }

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

    const value = useMemo<ThemeContextValue>(
        () => ({ theme, setTheme, toggleTheme }),
        [theme],
    )

    // Prevent hydration mismatch by rendering consistently
    if (!mounted) {
        return <ThemeContext.Provider value={value}><div>{children}</div></ThemeContext.Provider>
    }

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        console.error("useTheme called outside ThemeProvider")
        return {
            theme: DEFAULT_THEME,
            setTheme: () => { },
            toggleTheme: () => { }
        }
    }
    return context
}