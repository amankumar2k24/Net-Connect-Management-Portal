"use client"

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { useTheme } from "@/contexts/theme-context"
import { ButtonHTMLAttributes, useState } from "react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> { }

export default function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)
  const isDark = theme === "dark"

  const handleToggle = () => {
    setIsAnimating(true)
    toggleTheme()
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <div className="relative group">
      <button
        type="button"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        className={cn(
          "relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 border border-blue-200 dark:border-slate-600 text-blue-600 dark:text-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-400 focus:ring-offset-2 cursor-pointer overflow-hidden",
          isAnimating && "animate-pulse",
          className,
        )}
        onClick={handleToggle}
        {...props}
      >
        {/* Background glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-xl transition-opacity duration-300",
          isDark
            ? "bg-gradient-to-br from-yellow-400/20 to-orange-400/20 opacity-100"
            : "bg-gradient-to-br from-blue-400/20 to-indigo-400/20 opacity-100"
        )} />

        {/* Icon container */}
        <div className={cn(
          "relative z-10 transition-transform duration-300",
          isAnimating && "rotate-180"
        )}>
          {isDark ? (
            <SunIcon className="h-6 w-6 drop-shadow-sm" />
          ) : (
            <MoonIcon className="h-6 w-6 drop-shadow-sm" />
          )}
        </div>

        {/* Ripple effect */}
        <div className={cn(
          "absolute inset-0 rounded-xl transition-all duration-300 opacity-0 hover:opacity-100",
          isDark
            ? "bg-gradient-to-br from-yellow-400/10 to-orange-400/10"
            : "bg-gradient-to-br from-blue-400/10 to-indigo-400/10"
        )} />
      </button>

      {/* Tooltip */}
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        <div className="bg-black dark:bg-white text-white dark:text-black text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
          Switch to {isDark ? 'Light' : 'Dark'} mode
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black dark:bg-white rotate-45"></div>
        </div>
      </div>
    </div>
  )
}
