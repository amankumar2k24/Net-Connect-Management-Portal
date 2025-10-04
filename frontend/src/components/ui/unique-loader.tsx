'use client'

import { useState, useEffect } from 'react'

// Unique WiFi Signal Loader
export function WiFiSignalLoader({ message = "Loading..." }: { message?: string }) {
    const [activeSignal, setActiveSignal] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSignal(prev => (prev + 1) % 4)
        }, 300)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex flex-col items-center justify-center py-16 space-y-8">
            {/* WiFi Signal Animation */}
            <div className="relative">
                {/* Outer glow effect */}
                <div className="absolute inset-0 animate-pulse">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl"></div>
                </div>

                {/* WiFi Signal Bars */}
                <div className="relative flex items-end justify-center space-x-2 h-20">
                    {[1, 2, 3, 4].map((bar) => (
                        <div
                            key={bar}
                            className={`w-3 rounded-t-full transition-all duration-300 ${activeSignal >= bar - 1
                                ? 'bg-gradient-to-t from-blue-500 to-purple-500 shadow-lg shadow-blue-500/50'
                                : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                            style={{
                                height: `${bar * 12}px`
                            }}
                        />
                    ))}
                </div>

                {/* Pulsing WiFi Icon */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center animate-bounce">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.24 0 1 1 0 01-1.415-1.414 5 5 0 017.07 0 1 1 0 01-1.415 1.414zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Loading Text with Typewriter Effect */}
            <div className="text-center space-y-3">
                <TypewriterText text={message} />
                <div className="flex justify-center space-x-1">
                    {[0, 1, 2].map((dot) => (
                        <div
                            key={dot}
                            className={`w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

// Floating Particles Loader
export function FloatingParticlesLoader({ message = "Loading..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 space-y-8 relative overflow-hidden">
            {/* Floating Particles Background */}
            <div className="absolute inset-0">
                {Array.from({ length: 20 }).map((_, i) => (
                    <FloatingParticle key={i} delay={i * 200} />
                ))}
            </div>

            {/* Central Loading Element */}
            <div className="relative z-10">
                <div className="w-24 h-24 relative">
                    {/* Rotating Rings */}
                    <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-transparent border-b-green-500 border-l-yellow-500 rounded-full animate-spin-reverse"></div>
                    <div className="absolute inset-4 border-4 border-transparent border-t-pink-500 border-r-indigo-500 rounded-full animate-spin-slow"></div>

                    {/* Center Glow */}
                    <div className="absolute inset-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
                </div>
            </div>

            {/* Loading Message */}
            <div className="relative z-10 text-center">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {message}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">Please wait while we prepare your content</p>
            </div>
        </div>
    )
}

// DNA Helix Loader
export function DNAHelixLoader({ message = "Loading..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 space-y-8">
            {/* DNA Helix Animation */}
            <div className="relative w-16 h-32">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-4 h-4 rounded-full animate-dna-rotate"
                        style={{
                            left: `${Math.sin((i * Math.PI) / 4) * 20 + 24}px`,
                            top: `${i * 4}px`,
                            backgroundColor: i % 2 === 0 ? '#3b82f6' : '#8b5cf6',
                        }}
                    />
                ))}
            </div>

            {/* Message */}
            <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">{message}</h3>
                <div className="mt-2 flex justify-center">
                    <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>


        </div>
    )
}

// Morphing Shapes Loader
export function MorphingShapesLoader({ message = "Loading..." }: { message?: string }) {
    const [currentShape, setCurrentShape] = useState(0)
    const shapes = ['circle', 'square', 'triangle', 'hexagon']

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentShape(prev => (prev + 1) % shapes.length)
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex flex-col items-center justify-center py-16 space-y-8">
            {/* Morphing Shape */}
            <div className="relative w-20 h-20">
                <div
                    className={`w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-in-out shadow-lg ${currentShape === 0 ? 'rounded-full' :
                        currentShape === 1 ? 'rounded-lg' :
                            currentShape === 2 ? 'rounded-none transform rotate-45' :
                                'rounded-xl transform rotate-12'
                        }`}
                    style={{
                        clipPath: currentShape === 2 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                            currentShape === 3 ? 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' :
                                'none'
                    }}
                />

                {/* Orbiting Dots */}
                {[0, 1, 2].map((dot) => (
                    <div
                        key={dot}
                        className="absolute w-3 h-3 bg-white rounded-full shadow-lg animate-orbit"
                        style={{
                            transformOrigin: '40px 40px'
                        }}
                    />
                ))}
            </div>

            {/* Loading Text */}
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{message}</h3>
                <p className="text-sm text-muted-foreground">Shape: {shapes[currentShape]}</p>
            </div>


        </div>
    )
}

// Typewriter Effect Component
function TypewriterText({ text }: { text: string }) {
    const [displayText, setDisplayText] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayText(prev => prev + text[currentIndex])
                setCurrentIndex(prev => prev + 1)
            }, 100)
            return () => clearTimeout(timeout)
        } else {
            const timeout = setTimeout(() => {
                setDisplayText('')
                setCurrentIndex(0)
            }, 2000)
            return () => clearTimeout(timeout)
        }
    }, [currentIndex, text])

    return (
        <h3 className="text-lg font-semibold text-foreground min-h-[28px]">
            {displayText}
            <span className="animate-pulse">|</span>
        </h3>
    )
}

// Floating Particle Component
function FloatingParticle({ delay }: { delay: number }) {
    const randomX = Math.random() * 100
    const randomY = Math.random() * 100
    const randomSize = Math.random() * 4 + 2
    const randomDuration = Math.random() * 3 + 2

    return (
        <div
            className="absolute rounded-full animate-float bg-gradient-to-r from-blue-400 to-purple-400 opacity-30"
            style={{
                left: `${randomX}%`,
                top: `${randomY}%`,
                width: `${randomSize}px`,
                height: `${randomSize}px`
            }}
        />
    )
}

