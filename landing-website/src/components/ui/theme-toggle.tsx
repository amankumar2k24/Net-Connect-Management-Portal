'use client'

import { useTheme } from '@/contexts/theme-context'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { Button } from './button'

export default function ThemeToggle() {
    const themeContext = useTheme()

    if (!themeContext) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-accent"
                aria-label="Toggle theme"
                disabled
            >
                <MoonIcon className="h-5 w-5 text-slate-600" />
            </Button>
        )
    }

    const { theme, toggleTheme } = themeContext

    const handleToggle = () => {
        console.log('Theme toggle clicked, current theme:', theme)
        toggleTheme()
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="rounded-full hover:bg-accent"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <SunIcon className="h-5 w-5 text-yellow-500" />
            ) : (
                <MoonIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            )}
        </Button>
    )
}