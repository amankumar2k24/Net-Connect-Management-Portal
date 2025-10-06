'use client'

import { useEffect, useState } from 'react'

interface RotatingLoaderProps {
    message?: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export default function RotatingLoader({
    message = "Loading plans...",
    size = 'md',
    className = ''
}: RotatingLoaderProps) {
    const [rotation, setRotation] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(prev => (prev + 2) % 360)
        }, 16)

        return () => clearInterval(interval)
    }, [])

    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32'
    }

    return (
        <div className={`flex flex-col items-center justify-center space-y-6 ${className}`}>
            <div className="relative">
                <div
                    className={`${sizeClasses[size]} rounded-full border-4 border-transparent`}
                    style={{
                        background: `conic-gradient(from ${rotation}deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)`,
                        filter: 'blur(2px)',
                        opacity: 0.7
                    }}
                />

                <div
                    className={`absolute inset-1 ${sizeClasses[size]} rounded-full`}
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        background: `conic-gradient(from ${rotation}deg, transparent 0deg, rgba(255,255,255,0.8) 45deg, transparent 90deg)`
                    }}
                />

                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 shadow-lg">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-white/30 to-transparent" />
                </div>
            </div>

            <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground animate-pulse">
                    {message}
                </p>
                <div className="flex space-x-1 justify-center">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{
                                animationDelay: `${i * 0.2}s`,
                                animationDuration: '1s'
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export function WiFiRotatingLoader({
    message = "Connecting to plans...",
    className = ''
}: RotatingLoaderProps) {
    const [rotation, setRotation] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(prev => (prev + 2) % 360)
        }, 50) // Slower for better visibility

        return () => clearInterval(interval)
    }, [])

    return (
        <div className={`flex flex-col items-center justify-center space-y-8 ${className}`}>
            {/* Main rotating ring with high contrast */}
            <div className="relative w-48 h-48">
                {/* Outer glowing ring - more visible */}
                <div
                    className="absolute inset-0 rounded-full border-8"
                    style={{
                        background: `conic-gradient(from ${rotation}deg, 
                            #3b82f6 0deg, 
                            #8b5cf6 90deg, 
                            #ec4899 180deg, 
                            #f59e0b 270deg, 
                            #3b82f6 360deg)`,
                        transform: `rotate(${rotation}deg)`,
                        filter: 'blur(4px)',
                        boxShadow: `
                            0 0 60px rgba(59, 130, 246, 0.8),
                            0 0 100px rgba(139, 92, 246, 0.6),
                            0 0 140px rgba(236, 72, 153, 0.4)
                        `
                    }}
                />

                {/* Middle ring with solid colors */}
                <div
                    className="absolute inset-4 rounded-full border-4"
                    style={{
                        borderColor: '#3b82f6',
                        background: `conic-gradient(from ${-rotation * 2}deg, 
                            rgba(59, 130, 246, 0.3) 0deg, 
                            rgba(139, 92, 246, 0.3) 120deg, 
                            rgba(236, 72, 153, 0.3) 240deg, 
                            rgba(59, 130, 246, 0.3) 360deg)`,
                        transform: `rotate(${-rotation}deg)`,
                        boxShadow: 'inset 0 0 30px rgba(59, 130, 246, 0.5)'
                    }}
                />

                {/* WiFi signal bars - more prominent */}
                <div className="absolute inset-12 flex items-end justify-center space-x-2">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-gradient-to-t from-blue-600 via-blue-400 to-blue-200 rounded-t-xl shadow-lg"
                            style={{
                                width: `${(i + 1) * 6}px`,
                                height: `${(i + 1) * 12}px`,
                                opacity: Math.sin((rotation + i * 90) * Math.PI / 180) * 0.5 + 0.8,
                                transform: `scaleY(${Math.sin((rotation + i * 90) * Math.PI / 180) * 0.4 + 0.8})`,
                                boxShadow: `0 0 20px rgba(59, 130, 246, 0.6)`
                            }}
                        />
                    ))}
                </div>

                {/* Central pulsing core - brighter */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="w-8 h-8 rounded-full animate-pulse shadow-2xl"
                        style={{
                            background: `radial-gradient(circle, #3b82f6, #8b5cf6)`,
                            boxShadow: `
                                0 0 30px rgba(59, 130, 246, 0.8),
                                0 0 60px rgba(139, 92, 246, 0.6)
                            `
                        }}
                    >
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-white/60 to-transparent" />
                    </div>
                </div>

                {/* Orbiting particles - more visible */}
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-4 h-4 rounded-full shadow-lg"
                        style={{
                            top: '50%',
                            left: '50%',
                            background: `radial-gradient(circle, #3b82f6, #8b5cf6)`,
                            transform: `translate(-50%, -50%) rotate(${rotation * 3 + (i * 60)}deg) translateY(-80px)`,
                            opacity: Math.sin((rotation + i * 60) * Math.PI / 180) * 0.4 + 0.8,
                            boxShadow: `0 0 15px rgba(59, 130, 246, 0.8)`
                        }}
                    />
                ))}
            </div>

            {/* Enhanced loading message with better contrast */}
            <div className="text-center space-y-4">
                <p className="text-2xl font-bold text-foreground">
                    {message}
                </p>
                <p className="text-base text-muted-foreground font-medium">
                    Preparing the best connectivity options for you
                </p>

                {/* More visible animated dots */}
                <div className="flex space-x-3 justify-center">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-full shadow-lg"
                            style={{
                                background: `linear-gradient(45deg, #3b82f6, #8b5cf6)`,
                                animationDelay: `${i * 0.2}s`,
                                animationDuration: '1.5s',
                                boxShadow: `0 0 10px rgba(59, 130, 246, 0.6)`,
                                transform: `scale(${Math.sin((rotation + i * 72) * Math.PI / 180) * 0.3 + 1})`
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Background ripple effects - more visible */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute border-2 rounded-full animate-ping"
                        style={{
                            borderColor: `rgba(59, 130, 246, ${0.3 - i * 0.1})`,
                            width: `${(i + 1) * 150}px`,
                            height: `${(i + 1) * 150}px`,
                            animationDelay: `${i * 1}s`,
                            animationDuration: '4s'
                        }}
                    />
                ))}
            </div>
        </div>
    )
}