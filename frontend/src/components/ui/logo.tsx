'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
    className?: string
    size?: 'sm' | 'md' | 'lg'
    variant?: 'horizontal' | 'icon' | 'stacked'
    showText?: boolean
}

export function Logo({
    className,
    size = 'md',
    variant = 'horizontal',
    showText = true
}: LogoProps) {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    }

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-lg',
        lg: 'text-2xl'
    }

    const LogoIcon = () => (
        <div className={cn(
            'rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shadow-lg border border-primary/20',
            sizeClasses[size]
        )}>
            <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-3/5 h-3/5 text-primary-foreground"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Modern connectivity hub design */}
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.9" />

                {/* Connection nodes at corners */}
                <circle cx="5" cy="5" r="1.5" fill="currentColor" opacity="0.7" />
                <circle cx="19" cy="5" r="1.5" fill="currentColor" opacity="0.7" />
                <circle cx="5" cy="19" r="1.5" fill="currentColor" opacity="0.7" />
                <circle cx="19" cy="19" r="1.5" fill="currentColor" opacity="0.7" />

                {/* Dynamic connection lines */}
                <path
                    d="M6.5 6.5L9.5 9.5M17.5 6.5L14.5 9.5M6.5 17.5L9.5 14.5M17.5 17.5L14.5 14.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    opacity="0.6"
                    strokeLinecap="round"
                />

                {/* Central pulse effect */}
                <circle cx="12" cy="12" r="1" fill="currentColor" opacity="1" />

                {/* Signal waves */}
                <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="0.8" opacity="0.3" fill="none" />
                <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="0.8" opacity="0.2" fill="none" />
            </svg>
        </div>
    )

    if (variant === 'icon') {
        return <LogoIcon />
    }

    if (variant === 'stacked') {
        return (
            <div className={cn('flex flex-col items-center space-y-2', className)}>
                <LogoIcon />
                {showText && (
                    <div className="text-center">
                        <span className={cn(
                            'font-bold text-primary block tracking-tight font-poppins',
                            textSizeClasses[size]
                        )}>
                            NetConnect
                        </span>
                        <div className="text-xs text-muted-foreground/80 mt-1 font-medium tracking-wide font-poppins">Management Portal</div>
                    </div>
                )}
            </div>
        )
    }

    // Default horizontal variant
    return (
        <div className={cn('flex items-center space-x-3', className)}>
            <LogoIcon />
            {showText && (
                <div className="flex flex-col">
                    <span className={cn(
                        'font-bold text-primary leading-tight tracking-tight font-poppins',
                        textSizeClasses[size]
                    )}>
                        NetConnect
                    </span>
                    <span className="text-xs text-muted-foreground/80 leading-tight font-medium tracking-wide font-poppins">Management Portal</span>
                </div>
            )}
        </div>
    )
}

export default Logo