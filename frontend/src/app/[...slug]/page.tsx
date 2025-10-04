'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    HomeIcon,
    ArrowLeftIcon,
    WifiIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    MapIcon,
    ClockIcon
} from '@heroicons/react/24/outline'

export default function CatchAllPage() {
    const router = useRouter()
    const pathname = usePathname()
    const [countdown, setCountdown] = useState(15)
    const [suggestions, setSuggestions] = useState<string[]>([])

    useEffect(() => {
        // Generate route suggestions based on the attempted path
        const pathSegments = pathname.split('/').filter(Boolean)
        const possibleRoutes = [
            '/dashboard',
            '/dashboard/users',
            '/dashboard/payments',
            '/dashboard/profile',
            '/dashboard/notifications',
            '/dashboard/payment-history',
            '/dashboard/next-payments'
        ]

        // Find similar routes
        const similar = possibleRoutes.filter(route =>
            pathSegments.some(segment =>
                route.toLowerCase().includes(segment.toLowerCase())
            )
        ).slice(0, 3)

        setSuggestions(similar.length > 0 ? similar : possibleRoutes.slice(0, 3))
    }, [pathname])

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    router.push('/dashboard')
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [router])

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                {/* Network Grid Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
                        {Array.from({ length: 144 }).map((_, i) => (
                            <div
                                key={i}
                                className="border border-blue-300 animate-pulse"
                                style={{ animationDelay: `${i * 50}ms` }}
                            />
                        ))}
                    </div>
                </div>

                {/* Floating Network Nodes */}
                {Array.from({ length: 12 }).map((_, i) => (
                    <NetworkNode key={i} delay={i * 400} />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center max-w-4xl mx-auto">
                {/* Lost in Cyberspace Header */}
                <div className="mb-8">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl">
                                <MapIcon className="h-12 w-12 text-white animate-bounce" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-ping">
                                <ExclamationTriangleIcon className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                            Lost in Cyberspace
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 mb-2">
                        The route <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-red-600">{pathname}</code> doesn't exist
                    </p>

                    <p className="text-lg text-gray-500">
                        But don't worry, we'll help you navigate back to familiar territory!
                    </p>
                </div>

                {/* Network Status Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Connection Status */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <WifiIcon className="h-8 w-8 text-green-600 animate-pulse" />
                            </div>
                            <h3 className="font-semibold text-gray-800">Network Status</h3>
                            <p className="text-sm text-green-600">Connected & Stable</p>
                        </div>

                        {/* Auto Redirect */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 relative">
                                <ClockIcon className="h-8 w-8 text-blue-600" />
                                <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                            </div>
                            <h3 className="font-semibold text-gray-800">Auto Redirect</h3>
                            <p className="text-sm text-blue-600">{countdown} seconds</p>
                        </div>

                        {/* Dashboard Access */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <HomeIcon className="h-8 w-8 text-purple-600 animate-bounce" />
                            </div>
                            <h3 className="font-semibold text-gray-800">Dashboard</h3>
                            <p className="text-sm text-purple-600">Ready & Available</p>
                        </div>
                    </div>
                </div>

                {/* Route Suggestions */}
                {suggestions.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 mb-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center justify-center gap-2">
                            <MagnifyingGlassIcon className="h-6 w-6 text-indigo-600" />
                            Maybe you were looking for...
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {suggestions.map((route, index) => (
                                <Link key={route} href={route}>
                                    <div className="group p-4 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl border border-indigo-200 hover:border-indigo-400 transition-all duration-300 hover:shadow-lg cursor-pointer">
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-200 transition-colors">
                                                {getRouteIcon(route)}
                                            </div>
                                            <h4 className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
                                                {getRouteName(route)}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">{route}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                    <Link href="/dashboard">
                        <Button className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 gap-2 px-8 py-3 text-lg">
                            <HomeIcon className="h-6 w-6" />
                            Go to Dashboard
                        </Button>
                    </Link>

                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 gap-2 px-8 py-3 text-lg"
                    >
                        <ArrowLeftIcon className="h-6 w-6" />
                        Go Back
                    </Button>
                </div>

                {/* Fun Network Fact */}
                <div className="bg-gradient-to-r from-indigo-100 to-cyan-100 rounded-2xl p-6 shadow-lg border border-indigo-200">
                    <h3 className="text-lg font-semibold text-indigo-800 mb-3">🌐 Network Trivia</h3>
                    <p className="text-sm text-indigo-700">
                        Did you know? The internet has over 1.7 billion websites, but you managed to find
                        one that doesn't exist! That's like finding a needle in a haystack... that isn't there.
                    </p>
                </div>
            </div>
        </div>
    )
}

// Helper functions
function getRouteIcon(route: string) {
    const iconClass = "h-6 w-6 text-indigo-600"

    if (route.includes('users')) return <MagnifyingGlassIcon className={iconClass} />
    if (route.includes('payments')) return <WifiIcon className={iconClass} />
    if (route.includes('profile')) return <HomeIcon className={iconClass} />
    return <HomeIcon className={iconClass} />
}

function getRouteName(route: string) {
    const segments = route.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1]

    return lastSegment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

// Network Node Component
function NetworkNode({ delay }: { delay: number }) {
    const randomX = Math.random() * 100
    const randomY = Math.random() * 100
    const randomSize = Math.random() * 8 + 4

    return (
        <div
            className="absolute"
            style={{
                left: `${randomX}%`,
                top: `${randomY}%`,
                animation: `networkPulse 3s ease-in-out infinite`,
                animationDelay: `${delay}ms`
            }}
        >
            <div
                className="bg-indigo-400 rounded-full opacity-20"
                style={{
                    width: `${randomSize}px`,
                    height: `${randomSize}px`
                }}
            />

            <style jsx>{`
        @keyframes networkPulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.2;
          }
          50% { 
            transform: scale(1.5);
            opacity: 0.4;
          }
        }
      `}</style>
        </div>
    )
}