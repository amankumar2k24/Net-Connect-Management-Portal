'use client'

import { useTheme } from '@/contexts/theme-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    SunIcon,
    MoonIcon,
    SwatchIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline'

export default function ThemeShowcase() {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-8 theme-transition">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-4">
                        <SwatchIcon className="h-12 w-12 text-primary" />
                        <h1 className="text-4xl font-bold text-gradient-primary">
                            WaveNet Theme System
                        </h1>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Experience seamless light and dark mode switching with our comprehensive theme system.
                        Every component adapts beautifully to your preferred theme.
                    </p>

                    {/* Theme Toggle */}
                    <div className="flex items-center justify-center space-x-4 pt-4">
                        <span className="text-sm font-medium text-muted-foreground">
                            Current theme: <span className="text-primary font-semibold capitalize">{theme}</span>
                        </span>
                        <Button onClick={toggleTheme} className="gap-2">
                            {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
                            Switch to {isDark ? 'Light' : 'Dark'} Mode
                        </Button>
                    </div>
                </div>

                {/* Color Palette */}
                <Card className="card-enhanced">
                    <CardHeader>
                        <CardTitle>Color Palette</CardTitle>
                        <CardDescription>
                            Our adaptive color system that changes based on your theme preference
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <ColorSwatch name="Primary" className="bg-primary" />
                            <ColorSwatch name="Secondary" className="bg-secondary" />
                            <ColorSwatch name="Success" className="bg-green-500" />
                            <ColorSwatch name="Warning" className="bg-yellow-500" />
                            <ColorSwatch name="Danger" className="bg-red-500" />
                            <ColorSwatch name="Info" className="bg-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                {/* Component Examples */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Cards Showcase */}
                    <Card className="card-enhanced">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                Interactive Cards
                            </CardTitle>
                            <CardDescription>
                                Cards with hover effects and theme-aware shadows
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="card-enhanced2 p-4 hover:scale-105 transition-transform cursor-pointer">
                                    <h3 className="font-semibold text-foreground">Hover Card</h3>
                                    <p className="text-sm text-muted-foreground">Interactive card with hover effects</p>
                                </div>
                                <div className="card-enhanced2 p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                                    <h3 className="font-semibold text-primary">Gradient Card</h3>
                                    <p className="text-sm text-muted-foreground">Card with theme-aware gradient</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Indicators */}
                    <Card className="card-enhanced">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                                Status Indicators
                            </CardTitle>
                            <CardDescription>
                                Status badges that adapt to theme changes
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                <StatusBadge type="success" icon={CheckCircleIcon}>Success</StatusBadge>
                                <StatusBadge type="warning" icon={ExclamationTriangleIcon}>Warning</StatusBadge>
                                <StatusBadge type="error" icon={XCircleIcon}>Error</StatusBadge>
                                <StatusBadge type="info" icon={InformationCircleIcon}>Info</StatusBadge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Button Variations */}
                <Card className="card-enhanced">
                    <CardHeader>
                        <CardTitle>Button Variations</CardTitle>
                        <CardDescription>
                            Different button styles that work perfectly in both themes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <Button variant="default">Primary Button</Button>
                            <Button variant="secondary">Secondary Button</Button>
                            <Button variant="outline">Outline Button</Button>
                            <Button variant="ghost">Ghost Button</Button>
                            <Button variant="destructive">Destructive Button</Button>
                            <Button variant="link">Link Button</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Theme Features */}
                <Card className="card-enhanced">
                    <CardHeader>
                        <CardTitle>Theme Features</CardTitle>
                        <CardDescription>
                            Advanced theming capabilities built into the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FeatureItem
                                title="Automatic Detection"
                                description="Respects your system's theme preference by default"
                            />
                            <FeatureItem
                                title="Smooth Transitions"
                                description="Seamless animations when switching between themes"
                            />
                            <FeatureItem
                                title="Persistent Storage"
                                description="Remembers your theme choice across sessions"
                            />
                            <FeatureItem
                                title="Component Aware"
                                description="Every component adapts to the current theme"
                            />
                            <FeatureItem
                                title="Custom Shadows"
                                description="Theme-specific shadow systems for depth"
                            />
                            <FeatureItem
                                title="Accessible Colors"
                                description="WCAG compliant color contrasts in both themes"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function ColorSwatch({ name, className }: { name: string; className: string }) {
    return (
        <div className="text-center space-y-2">
            <div className={`w-full h-16 rounded-lg ${className} shadow-md`} />
            <p className="text-sm font-medium text-foreground">{name}</p>
        </div>
    )
}

function StatusBadge({
    type,
    icon: Icon,
    children
}: {
    type: 'success' | 'warning' | 'error' | 'info'
    icon: React.ComponentType<{ className?: string }>
    children: React.ReactNode
}) {
    const styles = {
        success: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20',
        warning: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
        error: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
        info: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20'
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${styles[type]}`}>
            <Icon className="h-4 w-4" />
            {children}
        </span>
    )
}

function FeatureItem({ title, description }: { title: string; description: string }) {
    return (
        <div className="space-y-2">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    )
}