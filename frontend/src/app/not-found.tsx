'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    HomeIcon,
    ArrowLeftIcon,
    WifiIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

export default function NotFound() {
    const router = useRouter()
    const [countdown, setCountdown] = useState(10)
    const [isAnimating, setIsAnimating] = useState(true)

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

    useEffect(() => {
        const animationTimer = setTimeout(() => {
            setIsAnimating(false)
        }, 2000)

        return () => clearTimeout(animationTimer)
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Floating WiFi Signals */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <FloatingWiFiSignal key={i} delay={i * 300} />
                ))}

                {/* Geometric Shapes */}
                <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-200/30 rotate-45 animate-bounce"></div>
                <div className="absolute top-1/2 left-10 w-16 h-16 bg-green-200/30 rounded-lg animate-spin" style={{ animationDuration: '8s' }}></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center max-w-2xl mx-auto">
                {/* 404 Animation */}
                <div className="mb-8">
                    <div className={`text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent transition-all duration-2000 ${isAnimating ? 'scale-150 rotate-12' : 'scale-100 rotate-0'
                        }`}>
                        404
                    </div>

                    {/* Glitch Effect */}
                    <div className="relative mt-4">
                        <div className="absolute inset-0 text-4xl md:text-5xl font-bold text-red-500 opacity-20 animate-pulse transform translate-x-1">
                            PAGE NOT FOUND
                        </div>
                        <div className="absolute inset-0 text-4xl md:text-5xl font-bold text-blue-500 opacity-20 animate-pulse transform -translate-x-1">
                            PAGE NOT FOUND
                        </div>
                        <h1 className="relative text-4xl md:text-5xl font-bold text-gray-800 animate-pulse">
                            PAGE NOT FOUND
                        </h1>
                    </div>
                </div>

                {/* Error Message */}
                <div className="mb-8 space-y-4">
                    <div className="flex justify-center">
                        <div className="p-4 bg-yellow-100 rounded-full animate-bounce">
                            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                        </div>
                    </div>

                    <p className="text-lg text-gray-600 leading-relaxed">
                        Oops! It looks like you've wandered into uncharted digital territory.
                        The page you're looking for seems to have disconnected from our network.
                    </p>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <WifiIcon className="h-5 w-5 text-blue-500 animate-pulse" />
                            <span className="text-sm font-medium text-gray-700">Connection Status</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            Don't worry! Our WiFi dashboard is still fully operational.
                            Let's get you back to managing your network.
                        </div>
                    </div>
                </div>

                {/* Auto Redirect Countdown */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-1 inline-block">
                        <div className="bg-white rounded-full px-6 py-3">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-8 h-8 border-4 border-blue-200 rounded-full"></div>
                                    <div
                                        className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"
                                        style={{ animationDuration: '1s' }}
                                    ></div>
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-semibold text-gray-800">
                                        Auto-redirecting in {countdown}s
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Taking you back to dashboard
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/dashboard">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 gap-2 px-8 py-3">
                            <HomeIcon className="h-5 w-5" />
                            Go to Dashboard
                        </Button>
                    </Link>

                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 gap-2 px-8 py-3"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Go Back
                    </Button>

                    <Link href="/dashboard/users">
                        <Button
                            variant="ghost"
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-300 gap-2 px-8 py-3"
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                            Browse Users
                        </Button>
                    </Link>
                </div>

                {/* Fun Facts */}
                <div className="mt-12 text-center">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Did you know?</h3>
                        <p className="text-sm text-gray-600">
                            The first 404 error was created at CERN in 1992. Now you're experiencing
                            a modern, WiFi-themed version of this internet classic!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Floating WiFi Signal Component
function FloatingWiFiSignal({ delay }: { delay: number }) {
    const randomX = Math.random() * 100
    const randomY = Math.random() * 100
    const randomSize = Math.random() * 0.5 + 0.5
    const randomDuration = Math.random() * 4 + 3

    return (
        <div
            className="absolute opacity-10"
            style={{
                left: `${randomX}%`,
                top: `${randomY}%`,
                transform: `scale(${randomSize})`,
                animation: `floatWifi ${randomDuration}s ease-in-out infinite`,
                animationDelay: `${delay}ms`
            }}
        >
            <WifiIcon className="h-12 w-12 text-blue-500" />

            <style jsx>{`
        @keyframes floatWifi {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(${randomSize}); 
            opacity: 0.1;
          }
          50% { 
            transform: translateY(-30px) rotate(180deg) scale(${randomSize * 1.2}); 
            opacity: 0.3;
          }
        }
      `}</style>
        </div>
    )
}