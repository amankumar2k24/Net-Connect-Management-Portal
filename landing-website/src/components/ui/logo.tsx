'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
    className?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
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
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    }

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-lg',
        lg: 'text-2xl',
        xl: 'text-4xl'
    }

    const LogoIcon = () => (
        <div className={cn(
            'rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center shadow-lg border border-blue-400/30',
            sizeClasses[size]
        )}>
            <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-3/5 h-3/5 text-white"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Modern WiFi Symbol */}
                <circle
                    cx="12"
                    cy="18"
                    r="2"
                    fill="currentColor"
                />

                {/* WiFi Arcs */}
                <path
                    d="M8 14C9.5 12.5 10.7 12 12 12C13.3 12 14.5 12.5 16 14"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                />
                <path
                    d="M5.5 10.5C7.8 8.2 9.8 7.5 12 7.5C14.2 7.5 16.2 8.2 18.5 10.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                />
                <path
                    d="M3 7C6.2 3.8 8.9 3 12 3C15.1 3 17.8 3.8 21 7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.6"
                />

                {/* Data Flow Dots */}
                <circle cx="7" cy="12" r="1" fill="currentColor" opacity="0.7">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="17" cy="12" r="1" fill="currentColor" opacity="0.7">
                    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                </circle>
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
                            'font-bold text-foreground block tracking-tight font-poppins',
                            textSizeClasses[size]
                        )}>
                            FlowLink
                        </span>
                        <div className="text-xs text-muted-foreground mt-1 font-medium tracking-wide font-poppins">WiFi Solutions</div>
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
                        'font-bold text-foreground leading-tight tracking-tight font-poppins',
                        textSizeClasses[size]
                    )}>
                        FlowLink
                    </span>
                    <span className="text-xs text-muted-foreground leading-tight font-medium tracking-wide font-poppins">WiFi Solutions</span>
                </div>
            )}
        </div>
    )
}

export default Logo