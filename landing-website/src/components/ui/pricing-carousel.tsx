'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { CheckIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface PaymentPlan {
    id: string
    name?: string
    description?: string
    amount: number
    durationMonths: number
    durationLabel?: string
    features?: string[]
    isPopular?: boolean
    isActive: boolean
    sortOrder: number
}

interface PricingCarouselProps {
    plans: PaymentPlan[]
    getDefaultFeatures: (durationMonths: number) => string[]
}

export default function PricingCarousel({ plans, getDefaultFeatures }: PricingCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const [touchStart, setTouchStart] = useState(0)
    const [mounted, setMounted] = useState(false)
    const [touchEnd, setTouchEnd] = useState(0)
    const carouselRef = useRef<HTMLDivElement>(null)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    // Auto-rotate every 5 seconds
    useEffect(() => {
        if (!mounted) return

        const interval = setInterval(() => {
            if (!isAnimating) {
                nextPlan()
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [currentIndex, isAnimating, mounted])

    // Keyboard navigation
    useEffect(() => {
        if (!mounted) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (isAnimating) return

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault()
                    prevPlan()
                    break
                case 'ArrowRight':
                    e.preventDefault()
                    nextPlan()
                    break
                case 'Home':
                    e.preventDefault()
                    goToPlan(0)
                    break
                case 'End':
                    e.preventDefault()
                    goToPlan(plans.length - 1)
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isAnimating, plans.length, mounted])

    const nextPlan = () => {
        if (isAnimating) return
        setIsAnimating(true)
        setCurrentIndex((prev) => (prev + 1) % plans.length)
        setTimeout(() => setIsAnimating(false), 600)
    }

    const prevPlan = () => {
        if (isAnimating) return
        setIsAnimating(true)
        setCurrentIndex((prev) => (prev - 1 + plans.length) % plans.length)
        setTimeout(() => setIsAnimating(false), 600)
    }

    const goToPlan = (index: number) => {
        if (isAnimating || index === currentIndex) return
        setIsAnimating(true)
        setCurrentIndex(index)
        setTimeout(() => setIsAnimating(false), 600)
    }

    // Touch handlers for swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return

        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > 50
        const isRightSwipe = distance < -50

        if (isLeftSwipe) {
            nextPlan()
        } else if (isRightSwipe) {
            prevPlan()
        }
    }

    // Mouse drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setTouchStart(e.clientX)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (touchStart) {
            setTouchEnd(e.clientX)
        }
    }

    const handleMouseUp = () => {
        if (!touchStart || !touchEnd) return

        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > 50
        const isRightSwipe = distance < -50

        if (isLeftSwipe) {
            nextPlan()
        } else if (isRightSwipe) {
            prevPlan()
        }

        setTouchStart(0)
        setTouchEnd(0)
    }

    const getCardStyle = (index: number) => {
        if (!mounted) {
            return {
                transform: 'translateX(0%) scale(1) rotateY(0deg)',
                zIndex: 1,
                opacity: index === 0 ? 1 : 0,
                filter: 'blur(0px)'
            }
        }

        const totalCards = plans.length
        if (totalCards === 0) return {}

        // Calculate the position of each card in the circular arrangement
        let position = index - currentIndex

        // Normalize position to be within the range of visible cards
        if (position > totalCards / 2) {
            position -= totalCards
        } else if (position < -totalCards / 2) {
            position += totalCards
        }

        // Center card (position 0)
        if (position === 0) {
            return {
                transform: 'translateX(0%) scale(1) rotateY(0deg)',
                zIndex: 10,
                opacity: 1,
                filter: 'blur(0px)'
            }
        }

        // Cards to the right (position > 0)
        if (position > 0) {
            if (position === 1) {
                return {
                    transform: 'translateX(85%) scale(0.85) rotateY(-25deg)',
                    zIndex: 8,
                    opacity: 0.8,
                    filter: 'blur(1px)'
                }
            } else if (position === 2) {
                return {
                    transform: 'translateX(140%) scale(0.7) rotateY(-45deg)',
                    zIndex: 6,
                    opacity: 0.6,
                    filter: 'blur(2px)'
                }
            } else {
                return {
                    transform: 'translateX(180%) scale(0.6) rotateY(-60deg)',
                    zIndex: 4,
                    opacity: 0.4,
                    filter: 'blur(3px)'
                }
            }
        }

        // Cards to the left (position < 0)
        if (position === -1) {
            return {
                transform: 'translateX(-85%) scale(0.85) rotateY(25deg)',
                zIndex: 8,
                opacity: 0.8,
                filter: 'blur(1px)'
            }
        } else if (position === -2) {
            return {
                transform: 'translateX(-140%) scale(0.7) rotateY(45deg)',
                zIndex: 6,
                opacity: 0.6,
                filter: 'blur(2px)'
            }
        } else {
            return {
                transform: 'translateX(-180%) scale(0.6) rotateY(60deg)',
                zIndex: 4,
                opacity: 0.4,
                filter: 'blur(3px)'
            }
        }
    }

    // Prevent hydration mismatch by showing simple layout until mounted
    if (!mounted) {
        return (
            <div className="relative w-full max-w-7xl mx-auto px-4">
                <div className="relative h-[600px] flex items-center justify-center">
                    <div className="w-80 h-[500px] rounded-3xl bg-card border border-border shadow-lg animate-pulse" />
                </div>
            </div>
        )
    }

    return (
        <div className="relative w-full max-w-7xl mx-auto px-4">
            {/* Carousel Container */}
            <div
                ref={carouselRef}
                className="relative h-[600px] flex items-center justify-center perspective-1000 overflow-visible"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ perspective: '1000px' }}
                role="region"
                aria-label="Pricing plans carousel"
                aria-live="polite"
            >
                {plans.map((plan, index) => {
                    const cardStyle = getCardStyle(index)
                    const features = plan.features || getDefaultFeatures(plan.durationMonths)

                    return (
                        <div
                            key={plan.id}
                            className={`absolute w-80 h-[500px] cursor-pointer transition-all duration-600 ease-out transform-gpu ${isAnimating ? 'pointer-events-none' : ''
                                }`}
                            style={cardStyle}
                            onClick={() => goToPlan(index)}
                        >
                            {/* 3D Solid Card */}
                            <div className={`
                                relative w-full h-full rounded-3xl p-8 
                                bg-card border border-border shadow-2xl
                                ${plan.isPopular
                                    ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 ring-2 ring-blue-500 shadow-blue-500/25'
                                    : 'bg-card'
                                }
                                hover:shadow-3xl hover:scale-105 transition-all duration-300
                                transform-gpu
                            `}
                                style={{
                                    boxShadow: `
                                    0 25px 50px -12px rgba(0, 0, 0, 0.25),
                                    0 0 0 1px rgba(255, 255, 255, 0.05),
                                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                                `
                                }}>
                                {/* 3D Card Edge Effect */}
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                                {/* Card Shine Effect */}
                                <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                {/* Popular Badge */}
                                {plan.isPopular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 shadow-lg">
                                            <StarIcon className="w-4 h-4" />
                                            <span>Most Popular</span>
                                        </div>
                                    </div>
                                )}

                                {/* Card Content */}
                                <div className="relative z-10 h-full flex flex-col">
                                    {/* Header */}
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold text-foreground mb-2">
                                            {plan.name || plan.durationLabel || `${plan.durationMonths} Month${plan.durationMonths > 1 ? 's' : ''} Plan`}
                                        </h3>
                                        <p className="text-muted-foreground text-sm mb-4">
                                            {plan.description || `Perfect for ${plan.durationMonths === 1 ? 'monthly' : 'long-term'} usage`}
                                        </p>

                                        {/* Price */}
                                        <div className="flex items-baseline justify-center mb-2">
                                            <span className="text-4xl font-bold text-foreground">
                                                {formatCurrency(plan.amount)}
                                            </span>
                                            <span className="text-muted-foreground ml-2 text-sm">
                                                /{plan.durationMonths === 1 ? 'month' : `${plan.durationMonths} months`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="flex-1 space-y-3 mb-6">
                                        {features.slice(0, 5).map((feature, featureIndex) => (
                                            <div key={featureIndex} className="flex items-center space-x-3">
                                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                                    <CheckIcon className="w-3 h-3 text-green-500" />
                                                </div>
                                                <span className="text-foreground text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA Button */}
                                    <Link href="http://localhost:3000/auth/register" className="block">
                                        <Button
                                            variant={plan.isPopular ? "default" : "outline"}
                                            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${plan.isPopular
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                                                : 'border-border hover:bg-accent hover:text-accent-foreground'
                                                }`}
                                        >
                                            Choose Plan
                                        </Button>
                                    </Link>
                                </div>

                                {/* 3D Decorative Elements */}
                                <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-400/20 dark:to-purple-400/20 blur-xl" />
                                <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-gradient-to-br from-pink-400/10 to-blue-400/10 dark:from-pink-400/20 dark:to-blue-400/20 blur-lg" />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevPlan}
                disabled={isAnimating}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 disabled:opacity-50"
            >
                <ChevronLeftIcon className="w-6 h-6" />
            </button>

            <button
                onClick={nextPlan}
                disabled={isAnimating}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 disabled:opacity-50"
            >
                <ChevronRightIcon className="w-6 h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-3 mt-8">
                {plans.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToPlan(index)}
                        disabled={isAnimating}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
                            ? 'bg-primary scale-125 shadow-lg'
                            : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
                            }`}
                    />
                ))}
            </div>

            {/* Swipe Hint */}
            <div className="text-center mt-6">
                <p className="text-muted-foreground text-sm">
                    Swipe or use arrows to explore plans
                </p>
            </div>
        </div>
    )
}