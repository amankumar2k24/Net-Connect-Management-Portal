'use client'

import {
    UsersIcon,
    CreditCardIcon,
    ChartBarIcon,
    ArrowPathIcon,
    HomeIcon,
    BellIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline'

// Dashboard Stats Loader
export function DashboardStatsLoader() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
                <DashboardStatCardSkeleton key={index} delay={index * 150} />
            ))}
        </div>
    )
}

function DashboardStatCardSkeleton({ delay }: { delay: number }) {
    const colors = [
        'from-blue-50 to-blue-100',
        'from-green-50 to-green-100',
        'from-purple-50 to-purple-100',
        'from-yellow-50 to-yellow-100'
    ]

    return (
        <div
            className={`bg-gradient-to-br ${colors[delay / 150]} border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg p-6 animate-pulse`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between">
                <div className="space-y-3 flex-1">
                    <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-24"></div>
                    <div className="h-8 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-16"></div>
                    <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-20"></div>
                </div>
                <div className="p-3 bg-slate-200 rounded-xl">
                    <div className="h-6 w-6 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300 rounded animate-shimmer bg-[length:200%_100%]"></div>
                </div>
            </div>
        </div>
    )
}

// Users Table Loader
export function UsersTableLoader() {
    return (
        <div className="space-y-4">
            {/* Animated header */}
            <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20"></div>
                        <div className="relative rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-4 shadow-lg">
                            <UsersIcon className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ArrowPathIcon className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm font-medium text-muted-foreground">Loading users...</span>
                    </div>
                </div>
            </div>

            {/* Skeleton rows */}
            <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <UserRowSkeleton key={index} delay={index * 100} />
                ))}
            </div>
        </div>
    )
}

function UserRowSkeleton({ delay }: { delay: number }) {
    return (
        <div
            className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-[0.4fr_0.8fr_1.5fr_1.5fr_1fr_0.8fr_0.8fr_0.6fr] animate-pulse"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* S No */}
            <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-6"></div>

            {/* User ID */}
            <div className="flex flex-col space-y-1">
                <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%]"></div>
                <div className="h-2 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-8"></div>
            </div>

            {/* Name */}
            <div className="flex flex-col space-y-1">
                <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%]"></div>
                <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-16"></div>
            </div>

            {/* Email */}
            <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%]"></div>

            {/* Phone */}
            <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-24"></div>

            {/* Role */}
            <div className="h-6 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 rounded-full animate-shimmer bg-[length:200%_100%] w-12"></div>

            {/* Status */}
            <div className="h-6 bg-gradient-to-r from-green-200 via-green-300 to-green-200 rounded-full animate-shimmer bg-[length:200%_100%] w-16"></div>

            {/* Actions */}
            <div className="flex justify-end">
                <div className="h-6 w-6 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%]"></div>
            </div>
        </div>
    )
}

// Recent Activity Loader
export function RecentActivityLoader() {
    return (
        <div className="space-y-4">
            {/* Header with icon */}
            <div className="flex items-center justify-center py-6">
                <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                        <div className="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-20"></div>
                        <div className="relative rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 p-3 shadow-lg">
                            <ChartBarIcon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ArrowPathIcon className="h-3 w-3 animate-spin text-indigo-500" />
                        <span className="text-xs font-medium text-muted-foreground">Loading activity...</span>
                    </div>
                </div>
            </div>

            {/* Activity items */}
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <ActivityItemSkeleton key={index} delay={index * 150} />
                ))}
            </div>
        </div>
    )
}

function ActivityItemSkeleton({ delay }: { delay: number }) {
    return (
        <div
            className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-100 animate-pulse"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-200 via-blue-300 to-blue-200 animate-shimmer bg-[length:200%_100%] shadow-sm"></div>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-3/4"></div>
                <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-1/2"></div>
            </div>
            <div className="flex-shrink-0">
                <div className="h-6 bg-gradient-to-r from-green-200 via-green-300 to-green-200 rounded-full animate-shimmer bg-[length:200%_100%] w-16"></div>
            </div>
        </div>
    )
}

// Payment History Loader
export function PaymentHistoryLoader() {
    return (
        <div className="space-y-4">
            {/* Animated header */}
            <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20"></div>
                        <div className="relative rounded-full bg-gradient-to-r from-green-500 to-emerald-600 p-4 shadow-lg">
                            <DocumentTextIcon className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ArrowPathIcon className="h-4 w-4 animate-spin text-green-500" />
                        <span className="text-sm font-medium text-muted-foreground">Loading payment history...</span>
                    </div>
                </div>
            </div>

            {/* Payment items */}
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                    <PaymentItemSkeleton key={index} delay={index * 120} />
                ))}
            </div>
        </div>
    )
}

function PaymentItemSkeleton({ delay }: { delay: number }) {
    return (
        <div
            className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 animate-pulse"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="space-y-1">
                <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-20"></div>
                <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-24"></div>
            </div>
            <div className="h-6 bg-gradient-to-r from-green-200 via-green-300 to-green-200 rounded-full animate-shimmer bg-[length:200%_100%] w-16"></div>
        </div>
    )
}

// Generic Content Loader
export function ContentLoader({
    icon: Icon = HomeIcon,
    message = "Loading content...",
    rows = 3,
    iconColor = "from-blue-500 to-purple-600"
}: {
    icon?: React.ComponentType<{ className?: string }>
    message?: string
    rows?: number
    iconColor?: string
}) {
    return (
        <div className="space-y-4">
            {/* Animated header */}
            <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20"></div>
                        <div className={`relative rounded-full bg-gradient-to-r ${iconColor} p-4 shadow-lg`}>
                            <Icon className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ArrowPathIcon className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm font-medium text-muted-foreground">{message}</span>
                    </div>
                </div>
            </div>

            {/* Generic content rows */}
            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, index) => (
                    <GenericRowSkeleton key={index} delay={index * 100} />
                ))}
            </div>
        </div>
    )
}

function GenericRowSkeleton({ delay }: { delay: number }) {
    return (
        <div
            className="p-4 bg-white rounded-lg border border-gray-100 animate-pulse"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="space-y-3">
                <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-3/4"></div>
                <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-1/2"></div>
                <div className="flex space-x-2">
                    <div className="h-6 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 rounded-full animate-shimmer bg-[length:200%_100%] w-16"></div>
                    <div className="h-6 bg-gradient-to-r from-green-200 via-green-300 to-green-200 rounded-full animate-shimmer bg-[length:200%_100%] w-20"></div>
                </div>
            </div>
        </div>
    )
}

// Notification Loader
export function NotificationLoader() {
    return (
        <ContentLoader
            icon={BellIcon}
            message="Loading notifications..."
            rows={4}
            iconColor="from-yellow-500 to-orange-600"
        />
    )
}