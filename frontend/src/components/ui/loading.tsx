import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

interface LoadingDotsProps {
    className?: string
}

interface LoadingPulseProps {
    className?: string
}

interface LoadingSkeletonProps {
    className?: string
    lines?: number
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12'
    }

    return (
        <div className={cn('animate-spin rounded-full border-2 border-muted border-t-primary', sizeClasses[size], className)}>
        </div>
    )
}

export function LoadingDots({ className }: LoadingDotsProps) {
    return (
        <div className={cn('flex space-x-1', className)}>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
    )
}

export function LoadingPulse({ className }: LoadingPulseProps) {
    return (
        <div className={cn('animate-pulse', className)}>
            <div className="flex space-x-4">
                <div className="rounded-full bg-muted h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function LoadingSkeleton({ className, lines = 3 }: LoadingSkeletonProps) {
    return (
        <div className={cn('animate-pulse', className)}>
            <div className="space-y-3">
                {Array.from({ length: lines }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        </div>
    )
}

interface LoadingButtonProps {
    loading?: boolean
    children: React.ReactNode
    className?: string
    size?: 'sm' | 'md' | 'lg'
    [key: string]: any
}

export function LoadingButton({ loading = false, children, className, size = 'md', ...props }: LoadingButtonProps) {
    return (
        <button
            disabled={loading}
            className={cn(
                'inline-flex items-center justify-center rounded-md font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-50',
                'bg-primary text-primary-foreground hover:bg-primary/90',
                {
                    'h-8 px-3 text-xs': size === 'sm',
                    'h-10 px-4 py-2': size === 'md',
                    'h-11 px-8': size === 'lg'
                },
                className
            )}
            {...props}
        >
            {loading && <LoadingSpinner size="sm" className="mr-2" />}
            {children}
        </button>
    )
}

interface LoadingCardProps {
    className?: string
}

export function LoadingCard({ className }: LoadingCardProps) {
    return (
        <div className={cn('rounded-lg border bg-card p-6 animate-pulse', className)}>
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-muted h-12 w-12"></div>
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                    <div className="h-3 bg-muted rounded w-4/6"></div>
                </div>
            </div>
        </div>
    )
}