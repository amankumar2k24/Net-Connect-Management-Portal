'use client'

import { CreditCardIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export function PaymentsTableLoader() {
    return (
        <div className="space-y-4">
            {/* Animated header */}
            <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20"></div>
                        <div className="relative rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-4 shadow-lg">
                            <CreditCardIcon className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ArrowPathIcon className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm font-medium text-muted-foreground">Loading transactions...</span>
                    </div>
                </div>
            </div>

            {/* Skeleton rows */}
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                    <PaymentRowSkeleton key={index} delay={index * 100} />
                ))}
            </div>
        </div>
    )
}

function PaymentRowSkeleton({ delay }: { delay: number }) {
    return (
        <div
            className="grid grid-cols-1 gap-3 px-6 py-5 lg:grid-cols-[1fr_1.5fr_1fr_1fr_0.8fr] lg:items-center animate-pulse"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Reference */}
            <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%]"></div>

            {/* User info */}
            <div className="flex flex-col space-y-2">
                <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-3/4"></div>
                <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-1/2"></div>
            </div>

            {/* Amount */}
            <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-20"></div>

            {/* Date */}
            <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-24"></div>

            {/* Status and actions */}
            <div className="flex flex-col items-end gap-2">
                <div className="h-6 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-full animate-shimmer bg-[length:200%_100%] w-16"></div>
                <div className="h-8 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%] w-20"></div>
            </div>
        </div>
    )
}

export function PaymentsStatsLoader() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
                <PaymentStatCardSkeleton key={index} delay={index * 150} />
            ))}
        </div>
    )
}

function PaymentStatCardSkeleton({ delay }: { delay: number }) {
    return (
        <div
            className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg rounded-lg p-6 animate-pulse"
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